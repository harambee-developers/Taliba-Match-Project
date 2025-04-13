const express = require("express");
const User = require("../model/User");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const cookieParser = require("cookie-parser");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.use(cookieParser())

// Middleware to verify user token
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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
    
    const users = await User.find(query)
      .select('userName dob location nationality photos profile gender')
      .lean() // Convert to plain JavaScript objects
      .exec();

    console.log('Found users:', users.length);
    
    if (!users) {
      console.log('No users found');
      return res.json([]);
    }
    
    const profiles = users.map(user => {
      try {
        const age = user.dob ? Math.floor((new Date() - new Date(user.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
        return {
          id: user._id,
          name: user.userName,
          age,
          location: user.location || 'Not specified',
          nationality: user.nationality || 'Not specified',
          image: user.photos && user.photos.length > 0 ? user.photos[0].url : null,
          gender: user.gender
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
    const { bio, location, nationality, salahPattern, madhab, occupation, islamicStudies } = req.body;
    const userId = req.user.userId;

    const updateData = {
      location,
      nationality,
      occupation,
      sect: madhab, // Map madhab to sect field
      'profile.bio': bio,
      'profile.salahPattern': salahPattern,
      'profile.islamicStudies': islamicStudies,
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

module.exports = router