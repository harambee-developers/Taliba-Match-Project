const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("../model/User");

const router = express();

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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const defaultPassword = "defaultPassword123";

        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

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
            dob,
            email,
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
        console.log(user)
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
