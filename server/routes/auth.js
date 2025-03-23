const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../model/User");
const cookieParser = require('cookie-parser')
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const router = express();
const rateLimit = require("express-rate-limit");

router.use(cookieParser())

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes."
  });

if (!process.env.JWT_SECRET_TOKEN) {
    console.error("Missing JWT_SECRET in environment variables.");
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
        dealBreakers
    } = req.body;

    try {

        const lowerCaseEmail = email.trim().toLowerCase(); // Convert email to lowercase and remove spaces

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash("defaultPassword123", 10);

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
                dealBreakers
            }
        }

        const user = new User({
            userName: kunya,
            firstName,
            lastName,
            password: hashedPassword,
            role: "user",
            dob,
            email: lowerCaseEmail,
            phone,
            location,
            ethnicity,
            nationality,
            maritalStatus,
            sect,
            occupation,
            profile: generateProfile()
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
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
                email: user.email,
                role: user.role
            });

            // Set the token in a secure, httpOnly cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Secure in production
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000 // 7 days when rememberMe is implemented, but 1 hour when not
            });

            res.json({ token, redirect: user.role === "admin" ? "/admin/dashboard" : "/" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
});

router.get("/verify-token", async (req, res) => {
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
            email: decoded.email,
            role: decoded.role
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;
