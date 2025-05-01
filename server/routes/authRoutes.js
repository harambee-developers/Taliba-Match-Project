const bcrypt = require("bcryptjs");
const crypto = require('crypto')
const express = require("express");
const User = require("../model/User");
const cookieParser = require('cookie-parser')
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const router = express();
const rateLimit = require("express-rate-limit");
const logger = require('../logger')
const sendEmail = require('../utils/sendEmail')

router.use(cookieParser())
router.use(express.json())

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
        madhab,
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
                hijrahDestination,
                revert,
                yearsRevert,
                salahPattern,
                madhab,
                islamicBooks,
                quranMemorization,
                dressingStyle,
                islamicAmbitions,
                children,
                personality,
                dealBreakers,
                height,
                weight,
                appearancePreference
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

            // Check if using default password
            const isDefaultPassword = password === "defaultPassword123";
            let resetToken = null;

            if (isDefaultPassword) {
                resetToken = crypto.randomBytes(32).toString("hex");
                user.resetToken = resetToken;
                user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            }

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

            res.json({
                token, isDefaultPassword, resetToken,
                redirect: user.role === "admin" ? "/admin/dashboard" : "/"
            });

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
            // Either user doesn't exist or token mismatch
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

/**
 * Endpoint to handle password reset requests.
 * Generates a reset token, saves it with an expiration on the user model,
 * and sends an email with the reset link.
 */
router.post("/reset-password", async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: "Invalid email address" })
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            // To prevent email enumeration, always send the same response
            return res
                .status(200)
                .json({ message: "If an account with that email exists, a reset email has been sent." });
        }
        // Generate a secure random token and set an expiration (e.g., 1 hour from now)
        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpiration = Date.now() + 3600000; // 1 hour in milliseconds

        // Save the token and its expiration on the user document.
        // Make sure your User schema has fields for resetToken and resetTokenExpiration.
        user.resetToken = token;
        user.resetTokenExpiration = tokenExpiration;
        await user.save();

        // Construct the reset password link (update the URL to match your frontend route)
        const resetLink = `${process.env.FRONT_END}/change-password/${token}`;

        // Define the email content
        const subject = "Reset Your Password";
        const textContent = `You requested a password reset. Please click the link to reset your password: ${resetLink}`;
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #dddddd;
    }
    .header h2 {
      margin: 0;
      color: #007BFF;
    }
    .content {
      margin: 20px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 5px;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777777;
      border-top: 1px solid #dddddd;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Reset Your Password</h2>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>You recently requested to reset your password. Click the button below to proceed:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
      <p>Thank you,<br>The Talibah match team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Talibah. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

        // Send the reset email
        await sendEmail(email, subject, textContent, htmlContent);

        // Always respond with a success message to prevent email enumeration
        res.status(200).json({ message: "If an account with that email exists, a reset email has been sent." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }


})

/**
 * POST /api/auth/change-password/:token
 * Endpoint to change the password using a reset token.
 *
 * Request body should include:
 * - newPassword: the new password the user wants to set
 */
router.post("/change-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate request body
    if (!newPassword) {
        return res.status(400).json({ message: "New password is required." });
    }

    try {
        // Find the user by matching the reset token and ensuring it hasn't expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // Hash the new password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password and clear the reset token fields
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
