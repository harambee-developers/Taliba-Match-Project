const express = require("express");
const User = require("../model/User");
const Match = require("../model/Match");
const Subscription = require("../model/Subscription");
const Message = require("../model/Message");
const cookieParser = require("cookie-parser");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../logger')
const mongoose = require('mongoose')

router.use(express.json())

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

router.use(cookieParser())

// Public routes
router.get("/search", authMiddleware, async (req, res) => {
  try {

    const { ageRange, location, ethnicity } = req.query;
    logger.info('Search params:', { ageRange, location, ethnicity });

    let query = { role: "user" };

    if (location) {
      query.location = location;
    }

    if (ethnicity) {
      query.ethnicity = ethnicity;
    }

    logger.info('MongoDB query:', query);

    // Force senderId to come from the logged-in user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const senderId = req.user.id;

    if (!senderId) {
      return res.status(400).json({
        message: "Missing senderId. Either authenticate or provide ?senderId=<yourId>"
      });
    }

    // Optional: verify it’s a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid senderId format" });
    }

    const users = await User.find(query)
      .select('userName dob location nationality photos profile gender firstName lastName')
      .lean() // Convert to plain JavaScript objects
      .exec();

    logger.info('Found users:', users.length);
    logger.info(req.query)

    if (!users) {
      logger.warn('No users found');
      return res.json([]);
    }

    const pendingRequests = await Match.find({
      sender_id: senderId,
      match_status: "pending"
    }).select("receiver_id");

    const pendingReceiverIds = new Set(pendingRequests.map(m => m.receiver_id.toString()));

    const profiles = users.map(user => {
      try {
        const age = user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
        const hasPendingRequest = pendingReceiverIds.has(user._id.toString());
        return {
          id: user._id,
          name: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          age,
          location: user.location || 'Not specified',
          nationality: user.nationality || 'Not specified',
          image: user.photos && user.photos.length > 0 ? user.photos[0].url : null,
          gender: user.gender,
          hasPendingRequest
        };
      } catch (err) {
        console.error('Error processing user:', user._id, err);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from errors

    let filteredProfiles = profiles;

    // Filter by age range after calculating ages
    if (ageRange && ageRange !== '') {
      const [minAge, maxAge] = ageRange.split("-").map(Number);
      logger.info('Filtering by age range:', minAge, '-', maxAge);
      filteredProfiles = profiles.filter(profile =>
        profile.age && profile.age >= minAge && profile.age <= maxAge
      );
    }

    logger.info('Filtered profiles:', filteredProfiles.length);
    res.json(filteredProfiles.slice(0, 20)); // Limit to 20 results after filtering

  } catch (error) {
    logger.error('Search error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      .select('-password -__v -email -phone -dob') // Exclude sensitive information
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
        // entire profile object—but we’ll project only the needed subfields
        profile: 1,
      })
      .lean()
      .populate({
        path: 'subscription',
        options: {
          sort: { current_period_end: -1, updatedAt: -1 },
          limit: 1,                // if you only want the latest subscription
        },
        select: 'status_type current_period_start current_period_end customer_id',
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
        customerId: sub.customer_id
      }
        : null
    };

    return res.json(resp);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/delete/:id', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const userId = req.params.id
    // 1) Delete the User document
    const userResult = await User.deleteOne({ _id: userId }, { session });
    if (userResult.deletedCount === 0) {
      throw new Error('User not found');
    }

    // 2) Delete related docs in other collections
    await Promise.all([
      Subscription.deleteMany({ user_id: userId }, { session }),
      Message.deleteMany({ $or: [{ from: userId }, { to: userId }] }, { session }),
      Match.deleteMany({ $or: [{ userA: userId }, { userB: userId }] }, { session }),
      Notification.deleteMany({ user: userId }, { session }),
      // … any other collections …
    ]);

    // 3) Commit
    await session.commitTransaction();
    session.endSession();

    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Account and related data deleted.' });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: 'Could not delete account.' });
  }
})

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
      ethnicity,
      nationality,
      occupation,
      location,
      maritalStatus,
      sect,

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
router.post("/profile/avatar", authMiddleware, async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user.userId;

    if (!avatar) {
      return res.status(400).json({ message: "Avatar selection is required" });
    }

    // Check if avatar is a valid option based on naming convention
    if (!avatar.match(/^icon_(man|woman)[1-6]?\.svg$/)) {
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
router.post("/profile/upload", authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const userId = req.user.userId;
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

module.exports = router