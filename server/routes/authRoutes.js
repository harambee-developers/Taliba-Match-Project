const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../model/User");
const cookieParser = require('cookie-parser')
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const router = express();
const rateLimit = require("express-rate-limit");
const logger = require('../logger')

router.use(cookieParser())

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes."
});

if (!process.env.JWT_SECRET_TOKEN || !process.env.JWT_REFRESH_SECRET) {
    logger.error("Missing JWT_SECRET in environment variables.");
    process.exit(1);
}

// Utility function for token generation
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_TOKEN, { expiresIn: "1h" });
};

router.post("/register", async (req, res) => {
    const {
        firstName,
        lastName,
        kunya,
        dob,
        gender,
        email,
        phone,
        location,
        openToHijrah,
        hijrahDestination,
        ethnicity,
        nationality,
        maritalStatus,
        revert,
        yearsRevert,
        salahPattern,
        sect,
        islamicBooks,
        quranMemorization,
        dressingStyle,
        islamicAmbitions,
        children,
        occupation,
        personality,
        dealBreakers,
        height,
        weight,
        photos,
        appearancePreference
    } = req.body;

    try {
 
        const lowerCaseEmail = email.trim().toLowerCase(); // Convert email to lowercase and remove spaces

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash("defaultPassword123", 10);

        const userPhotos = (photos || []).map(p => ({ url: p.url }))

        function generateProfile() {
            return {
                openToHijrah,
                hijrahDestination, revert,
                yearsRevert,
                salahPattern, islamicBooks,
                quranMemorization,
                dressingStyle,
                islamicAmbitions,
                children, personality,
                dealBreakers, height,
                weight, appearancePreference
            }
        }

        const user = new User({
            userName: kunya,
            firstName,
            lastName,
            password: hashedPassword,
            role: "user",
            gender,
            dob,
            email: lowerCaseEmail,
            phone,
            location,
            ethnicity,
            nationality,
            maritalStatus,
            sect,
            occupation,
            profile: generateProfile(),
            photos: userPhotos // 👈 insert here
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post(
    "/login",
    [body("email").notEmpty(), body("password").notEmpty()], loginLimiter,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }
            const token = generateToken({
                userId: user._id,
                username: user.userName,
                gender: user.gender,
                email: user.email,
                role: user.role
            });

            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );

            // Save the refresh token in DB
            user.refreshToken = refreshToken;
            await user.save();

            // Set the token in a secure, httpOnly cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Secure in production
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000 // 7 days when rememberMe is implemented, but 1 hour when not
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ token, redirect: user.role === "admin" ? "/admin/dashboard" : "/" });

        } catch (error) {
            logger.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post('/refresh-token', async (req, res) => {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return res.status(401).json({ message: 'Refresh token missing' });
  
    // 1) Verify the old refresh token first
    let payload;
    try {
      payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      logger.error('Refresh token verify failed', err);
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
  
    const userId = payload.userId;
    const newRefreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const newAccessToken = jwt.sign(
      { userId, /* optionally only include minimal claims */ },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: '1h' }
    );
  
    try {
      // 2) Atomically check oldToken and replace with the new one
      const user = await User.findOneAndUpdate(
        { _id: userId, refreshToken: oldToken },
        { $set: { refreshToken: newRefreshToken } },
        { projection: { _id: 1 }, new: true }
      );
  
      if (!user) {
        // Either user doesn’t exist or token mismatch
        return res.status(403).json({ message: 'Invalid refresh token' });
      }
  
      // 3) Send cookies
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
      };
      res.cookie('token', newAccessToken, { ...cookieOpts, maxAge: 60 * 60 * 1000 });
      res.cookie('refreshToken', newRefreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
  
      return res.json({ token: newAccessToken });
    } catch (err) {
      logger.error('Error updating refresh token in DB:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

router.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
        } catch (err) {
        logger.warn("Error clearing refresh token:", err);
        }
  }

    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
});

router.get("/verify-token", (req, res) => {
    const token = req.cookies.token; // Get the token directly from cookies

    if (!token) {
        return res.status(401).json({ message: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        res.json({
            valid: true,
            userId: decoded.userId,
            username: decoded.username,
            gender: decoded.gender,
            email: decoded.email,
            role: decoded.role
        });
    } catch (error) {
        logger.error("Token verification error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;
