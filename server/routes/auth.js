const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../model/User");

const router = express();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Assign a default password if none is provided
        const defaultPassword = "defaultPassword123";
        const userPassword = password || defaultPassword;

        // Hash the password
        const hashedPassword = await bcrypt.hash(userPassword, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;