const express = require("express");
const User = require("../model/User");
const Match = require("../model/Match");
const Subscription = require("../model/Subscription");
const Message = require("../model/Message");
const Report = require("../model/Report");
const Notifications = require("../model/Notifications");
const cookieParser = require("cookie-parser");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../logger')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

router.use(express.json())
router.use(cookieParser())

// Setup the storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Use current timestamp to ensure unique filenames
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

// Set up multer with the storage engine
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const {
      ageRange,
      location,
      ethnicity,
      revert,
      salahPattern,
      occupation,
      maritalStatus,
      sect,
      quranMemorization,
      hasChildren
    } = req.query;

    logger.info("Search params:", req.query);

    // 1) Ensure authenticated user
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const senderId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid senderId format" });
    }

    // 2) Base query + profile filters
    const query = { role: "user" };
    if (location?.length)     query["location.country"] = { $in: location };
    if (ethnicity?.length)    query.ethnicity          = { $in: ethnicity };
    if (revert)               query["profile.revert"]  = revert;
    if (salahPattern)         query["profile.salahPattern"] = salahPattern;
    if (occupation)           query.occupation         = occupation;
    if (maritalStatus)        query.maritalStatus      = maritalStatus;
    if (sect)                 query.sect               = sect;
    if (quranMemorization)    query["profile.quranMemorization"] = quranMemorization;
    if (hasChildren)          query["profile.children"] = hasChildren;

    // 3) Exclude any user already pending/interested/blocked
    const matches = await Match.find({
      $or: [
        { sender_id: senderId },
        { receiver_id: senderId }
      ],
      match_status: { $in: ["pending", "Interested", "Blocked"] }
    })
    .select("sender_id receiver_id")
    .lean();

    const excludeIds = new Set();
    matches.forEach(m => {
      if (m.sender_id.toString() !== senderId)   excludeIds.add(m.sender_id.toString());
      if (m.receiver_id.toString() !== senderId) excludeIds.add(m.receiver_id.toString());
    });
    if (excludeIds.size) {
      query._id = { $nin: Array.from(excludeIds) };
    }

    // 4) Pagination parameters
    const pageSize = parseInt(req.query.limit, 10) || 50;
    const skip     = parseInt(req.query.skip,  10) || 0;

    // 5) Fetch one extra to compute `hasMore`
    const rawUsers = await User.find(query)
      .select("userName dob location nationality photos profile gender firstName lastName occupation sect maritalStatus")
      .skip(skip)
      .limit(pageSize + 1)
      .lean();

    const hasMore = rawUsers.length > pageSize;
    const usersPage = rawUsers.slice(0, pageSize);

    logger.info(`Fetched ${usersPage.length} users, hasMore=${hasMore}`);

    // 6) Load current user's location for distance calc
    const currentUser = await User.findById(senderId).select("location").lean();
    const currentLoc = currentUser?.location;

    // 7) Map to your "profile" shape
    const profiles = usersPage.map(u => {
      const age = u.dob
        ? Math.floor((Date.now() - new Date(u.dob)) / (365.25*24*60*60*1000))
        : null;

      let distance = null;
      if (currentLoc && u.location?.country && u.location?.city) {
        if (currentLoc.country === u.location.country) {
          distance = (currentLoc.city === u.location.city) ? 0 : 50;
        } else {
          distance = 100;
        }
      }

      return {
        id:            u._id,
        name:          u.userName,
        firstName:     u.firstName,
        lastName:      u.lastName,
        age,
        location:      u.location || "Not specified",
        nationality:   u.nationality || "Not specified",
        image:         u.photos?.[0]?.url || null,
        gender:        u.gender,
        distance,
        revert:        u.profile?.revert           || "Not specified",
        salahPattern:  u.profile?.salahPattern     || "Not specified",
        occupation:    u.occupation                || "Not specified",
        maritalStatus: u.maritalStatus             || "Not specified",
        sect:          u.sect                      || "Not specified",
        quranMemorization: u.profile?.quranMemorization || "Not specified",
        hasChildren:   u.profile?.children         || "Not specified"
      };
    });

    // 8) Apply age‐range filter in JS (if requested)
    let finalList = profiles;
    if (ageRange) {
      finalList = finalList.filter(p => {
        if (!p.age) return false;
        const [minAge, maxAge] = ageRange.split("-").map(Number);
        return p.age >= minAge && (maxAge ? p.age <= maxAge : true);
      });
    }

    // 9) Sort by distance (nulls last)
    finalList.sort((a,b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    // 10) Respond
    res.json({
      results: finalList,
      hasMore
    });

  } catch (err) {
    logger.error("Search error details:", {
      message: err.message,
      stack:   err.stack,
      name:    err.name
    });
    res.status(500).json({
      message: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Protected route for viewing profiles
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id)
      .select('-password -__v -email -phone -dob -refreshToken -resetToken -resetTokenExpiration -socketId -isOnline -lastSeen -created_at') // Exclude sensitive information
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Error fetching profile:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    res.status(500).json({
      message: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const user = await User.find({});
    res.json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /user/:id
 * Returns only the fields needed to populate profile cards.
 */
router.get('/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id)
      .select({
        _id: 1,
        userName: 1,
        firstName: 1,
        lastName: 1,
        gender: 1,
        dob: 1,
        email: 1,
        phone: 1,
        ethnicity: 1,
        nationality: 1,
        occupation: 1,
        location: 1,
        sect: 1,
        maritalStatus: 1,
        photos: 1,
        profile: 1,
      })
      .lean()
      .populate({
        path: 'subscription',
        options: {
          sort: { current_period_end: -1, updatedAt: -1 },
          limit: 1,                // if you only want the latest subscription
        },
        select: 'status_type current_period_start current_period_end customer_id subscription_type',
        // pick only the fields frontend needs
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ← DESCTRUCTURE here, before you build `resp`
    const [sub] = user.subscription || [];

    // Build a response matching exactly your front-end shape:
    const resp = {
      _id: user._id,
      userName: user.userName || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dob: user.dob ? user.dob.toISOString().split('T')[0] : "",
      gender: user.gender || "",
      email: user.email || "",
      phone: user.phone || "",
      ethnicity: user.ethnicity || "",
      nationality: user.nationality || "",
      photos: user.photos || [],
      language: user.profile?.language || [],

      bio: user.profile?.bio || "",
      personality: user.profile?.personality || "",
      dealBreakers: user.profile?.dealBreakers || "",

      sect: user.sect || "",
      madhab: user.profile?.madhab || "",
      salahPattern: user.profile?.salahPattern || "",
      quranMemorization: user.profile?.quranMemorization || "",
      dressingStyle: user.profile?.dressingStyle || "",
      openToPolygamy: user.profile?.openToPolygamy || "",
      islamicAmbitions: user.profile?.islamicAmbitions || "",
      islamicBooks: user.profile?.islamicBooks || "",

      children: user.profile?.children || "",
      occupation: user.occupation || "",
      location: user.location || "",
      openToHijrah: user.profile?.openToHijrah || "",
      hijrahDestination: user.profile?.hijrahDestination || "",
      maritalStatus: user.maritalStatus || "",
      revert: user.profile?.revert || "",
      weight: user.profile?.weight || "",
      height: user.profile?.height || "",
      appearancePreference: user.profile?.appearancePreference || "",
      // finally: subscription status
      subscription: sub ? {
        status: sub.status_type,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        customerId: sub.customer_id,
        type: sub.subscription_type
      }
        : null
    };

    return res.json(resp);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user account
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify the user is deleting their own account
    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this account." });
    }

    // Delete all matches where the user is either user1 or user2
    await Match.deleteMany({
      $or: [{ user1: userId }, { user2: userId }]
    });

    // Delete all messages where the user is either sender or receiver
    await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    // Delete all notifications for the user
    await Notifications.deleteMany({
      $or: [{ userId: userId }, { senderId: userId }]
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({ message: "Error deleting account." });
  }
});

// Protected Route
router.put("/profile/:userId", async (req, res) => {
  try {
    const {
      // Personal Details
      firstName,
      lastName,
      dob,
      email,
      phone,
      ethnicity,
      nationality,
      language,
      gender,

      // About Yourself
      bio,
      personality,
      dealBreakers,

      // Your Faith
      sect,
      madhab,
      salahPattern,
      quranMemorization,
      dressingStyle,
      openToPolygamy,
      islamicAmbitions,
      islamicBooks,

      // Life Situation
      children,
      occupation,
      location,
      openToHijrah,
      hijrahDestination,
      maritalStatus,
      revert,
      divorced,
      numberOfChildren,

      // Appearance
      weight,
      height,
      appearancePreference
    } = req.body;

    const userId = req.params.userId;

    const updateData = {
      // Root level fields
      firstName,
      lastName,
      dob,
      email,
      phone,
      ethnicity: ethnicity || [], // Ensure ethnicity is always an array
      nationality,
      occupation,
      location,
      maritalStatus,
      sect,
      gender,

      // Profile object fields
      'profile.language': language,
      'profile.bio': bio,
      'profile.personality': personality,
      'profile.dealBreakers': dealBreakers,
      'profile.madhab': madhab,
      'profile.salahPattern': salahPattern,
      'profile.quranMemorization': quranMemorization,
      'profile.dressingStyle': dressingStyle,
      'profile.openToPolygamy': openToPolygamy,
      'profile.islamicAmbitions': islamicAmbitions,
      'profile.islamicBooks': islamicBooks,
      'profile.children': children,
      'profile.openToHijrah': openToHijrah,
      'profile.hijrahDestination': hijrahDestination,
      'profile.revert': revert,
      'profile.divorced': divorced,
      'profile.numberOfChildren': numberOfChildren,
      'profile.weight': weight,
      'profile.height': height,
      'profile.appearancePreference': appearancePreference
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    logger.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add avatar from predefined options
router.post("/profile/avatar/:userId", authMiddleware, async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.params.userId;

    if (!avatar) {
      return res.status(400).json({ message: "Avatar selection is required" });
    }

    // Check if avatar is a valid option based on naming convention
    if (!avatar.match(/^icon_(man|woman)[1-6]?\.png$/)) {
      return res.status(400).json({ message: "Invalid avatar selection" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a photo object for the avatar
    const photoInfo = {
      url: avatar,
      created_at: new Date()
    };

    // If user already has photos, update the first one or add a new one
    if (user.photos && user.photos.length > 0) {
      user.photos[0] = photoInfo;
    } else {
      user.photos = [photoInfo];
    }

    await user.save();
    res.json({ message: "Avatar updated successfully", url: avatar });
  } catch (error) {
    logger.error("Error updating avatar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload custom profile image
router.post("/profile/upload/:userId", authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the URL for the uploaded file
    const fileUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;;

    // Create a photo object for the custom image
    const photoInfo = {
      url: fileUrl,
      created_at: new Date()
    };

    // If user already has photos, update the first one or add a new one
    if (user.photos && user.photos.length > 0) {
      user.photos[0] = photoInfo;
    } else {
      user.photos = [photoInfo];
    }

    await user.save();
    res.json({ message: "Profile image uploaded successfully", url: fileUrl });
  } catch (error) {
    logger.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// /unblock/:targetId
router.post('/unblock/:targetId', authMiddleware, async (req, res) => {
  const unblockerId = req.user.id;
  const { targetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: "Invalid target user ID" });
  }

  try {
    const match = await Match.findOne({
      $or: [
        { sender_id: unblockerId, receiver_id: targetId },
        { sender_id: targetId, receiver_id: unblockerId }
      ],
      match_status: 'Blocked',
      blocked_by: unblockerId // <-- ✅ Ensures only the blocker can unblock
    });

    if (!match) {
      return res.status(404).json({ message: "No blocked relationship found, or you're not the blocker." });
    }

    match.match_status = 'Interested'; // or 'pending' if that's more appropriate
    match.blocked_by = null; // <-- ✅ Clear blocked_by on unblock
    match.matched_at = Date.now();
    await match.save();

    return res.json({ message: "User has been unblocked", match });
  } catch (err) {
    return res.status(500).json({ message: "Could not unblock user" });
  }
});

// BLOCK USER
// POST /user/block/:targetId
router.post('/block/:targetId', authMiddleware, async (req, res) => {
  const blockerId = req.user.id;
  const { targetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: "Invalid target user ID" });
  }

  try {
    // find an existing match where current user is the sender
    const match = await Match.findOne({
      $or: [
        { sender_id: blockerId, receiver_id: targetId },
        { sender_id: targetId, receiver_id: blockerId }
      ],
      match_status: 'Interested',
      blocked_by: null
    });

    if (!match) {
      return res.status(404).json({
        message: "No existing match found to block. You must have an active match first."
      });
    }

    // update status & timestamp
    match.match_status = 'Blocked';
    match.blocked_by = blockerId; // <-- ✅ Add this line
    match.matched_at = Date.now();
    await match.save();

    return res.json({
      message: "User has been blocked",
      match
    });
  } catch (err) {
    console.error("Block error:", err);
    return res.status(500).json({ message: "Could not block user" });
  }
});

// REPORT USER
// POST /user/report/:targetId
// accepts { reason: string } in body
router.post('/report/:targetId', authMiddleware, async (req, res) => {
  const reporterId = req.user.id;
  const { targetId } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: "Invalid target user ID" });
  }

  try {
    // create a new report
    const report = new Report({
      reporter_id: reporterId,
      reported_id: targetId,
      reason: reason || ''
    });
    await report.save();
    return res.json({ message: "User reported", report });
  } catch (err) {
    console.error("Report error:", err);
    return res.status(500).json({ message: "Could not report user" });
  }
});

// Protected Route for changing password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Validate new password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character" 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Export user data
router.get("/export-data", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user data
    const user = await User.findById(userId)
      .select('-password -refreshToken -resetToken -resetTokenExpiration -socketId')
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch related data - commented out for now
    /*
    const [matches, messages, subscriptions] = await Promise.all([
      Match.find({
        $or: [{ sender_id: userId }, { receiver_id: userId }]
      }).lean(),
      Message.find({
        $or: [{ from: userId }, { to: userId }]
      }).lean(),
      Subscription.find({ user_id: userId }).lean()
    ]);
    */

    // Compile all data - only user data for now
    const userData = {
      user: user
      // matches: matches,
      // messages: messages,
      // subscriptions: subscriptions
    };

    // Set headers for JSON file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=user-data.json');
    
    // Send the data
    res.json(userData);
  } catch (error) {
    logger.error("Error exporting user data:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
});

// Update kunya
router.put("/kunya/:userId", authMiddleware, async (req, res) => {
  try {
    const { userName } = req.body;
    const userId = req.params.userId;

    logger.info("Updating kunya:", { userId, userName });

    if (!userName) {
      return res.status(400).json({ message: "Kunya is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { userName: userName } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("Kunya updated successfully:", { userId, newUserName: user.userName });
    
    // Send a consistent response format
    return res.status(200).json({
      success: true,
      message: "Kunya updated successfully",
      user: {
        _id: user._id,
        userName: user.userName
      }
    });
  } catch (error) {
    logger.error("Error updating kunya:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

// Feedback/Support endpoint
router.post('/support/feedback', async (req, res) => {
  try {
    const { email, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }
    const userEmail = email || 'anonymous@talibah.co.uk';
    const subject = 'New Feedback/Support Message from Talibah User';
    const textContent = `From: ${userEmail}\n\n${message}`;
    const htmlContent = `<p><strong>From:</strong> ${userEmail}</p><p>${message.replace(/\n/g, '<br>')}</p>`;
    await sendEmail('info@talibah.co.uk', subject, textContent, htmlContent);
    res.status(200).json({ message: 'Feedback sent successfully.' });
  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ message: 'Failed to send feedback.' });
  }
});

// Verify password for account deletion
router.post("/verify-password", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.status(200).json({ message: "Password verified successfully." });
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router