const express = require("express");
const User = require("../model/User");
const Match = require("../model/Match");
const cookieParser = require("cookie-parser");
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
router.get("/search", async (req, res) => {
  try {

    const { ageRange, location, ethnicity } = req.query;
    console.log('Search params:', { ageRange, location, ethnicity });
    
    let query = { role: "user" };
    
    if (location) {
      query.location = location;
    }
    
    if (ethnicity) {
      query.ethnicity = ethnicity;
    }

    console.log('MongoDB query:', query);

    const senderId = req.user?.id || req.query.senderId;
    
    const users = await User.find(query)
      .select('userName dob location nationality photos profile gender firstName lastName')
      .lean() // Convert to plain JavaScript objects
      .exec();

    console.log('Found users:', users.length);
    console.log(req.query)
    
    if (!users) {
      console.log('No users found');
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
      console.log('Filtering by age range:', minAge, '-', maxAge);
      filteredProfiles = profiles.filter(profile => 
        profile.age && profile.age >= minAge && profile.age <= maxAge
      );
    }

    console.log('Filtered profiles:', filteredProfiles.length);
    res.json(filteredProfiles.slice(0, 20)); // Limit to 20 results after filtering

  } catch (error) {
    console.error('Search error details:', {
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
    console.error("Error fetching profile:", error);
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
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/user/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

// Protected Route
router.put("/profile", authMiddleware, async (req, res) => {
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

    const userId = req.user.userId;

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
    console.error("Error updating profile:", error);
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
    if (!avatar.match(/^icon_(man|woman)[1-5]?\.svg$/)) {
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
    console.error("Error updating avatar:", error);
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
    const fileUrl = `/uploads/${req.file.filename}`;

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
    console.error("Error uploading profile image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router