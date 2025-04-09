const express = require("express");
const router = express.Router();
const Message = require("../model/Message");
const Conversation = require("../model/Conversation");
const mongoose = require('mongoose');
const User = require("../model/User");
const multer = require('multer')
const path = require('path')

// Setup the storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use __dirname to get the path of the current directory (routes/) and then go one level up
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads');  // Go one level up from 'routes'
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use current timestamp to ensure unique filenames
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Set up multer with the storage engine
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10 MB limit);

// 🔹 GET all conversations for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId
        const conversations = await Conversation.find({ participants: userObjectId }).populate("participants", "userName email");
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch specific conversation details
router.get("/:conversationId/details", async (req, res) => {
    try {
        const { conversationId } = req.params;

        // ✅ Find the conversation by _id and populate participant details
        const conversation = await Conversation.findById(conversationId)
            .populate("participants", "userName email firstName lastName");

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch messages for a specific conversation
router.get("/:conversationId/messages", async (req, res) => {
    try {
        const { conversationId } = req.params
        const messages = await Message.find({ conversation_id: conversationId }).sort("sent_at");
        res.status(200).json({ messages });

    } catch (error) {
        res.status(500).json({ error: "Error fetching messages" });
    }
});

router.post("/new-conversation", async (req, res) => {
    try {
        const { user1, user2 } = req.body;

        // Check if a conversation already exists between the users
        let conversation = await Conversation.findOne({
            participants: { $all: [user1, user2] }
        });

        if (!conversation) {
            // If no conversation exists, create a new one
            conversation = new Conversation({
                participants: [user1, user2],
                last_message: "",
            });

            await conversation.save();
        }

        res.status(201).json({ conversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Error creating conversation" });
    }
});

router.get("/fetch-status/:receiverId", async (req, res) => {
    try {
        const { receiverId } = req.params;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required!" });
        }

        // Find user by ID and select only isOnline and lastSeen fields
        const user = await User.findById(receiverId).select("isOnline lastSeen");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ isOnline: user.isOnline, lastSeen: user.lastSeen });
    } catch (error) {
        console.error("Error fetching user status:", error);
        res.status(500).json({ error: "Error fetching user status" });
    }
});

router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file.filename) {
        return res.status(400).json({ message: "filename is missing!" });
    }
    // Save the file to storage, build the message object, etc.
    const fileUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
    // Get mimetype, e.g., 'image/png', 'video/mp4'
    const mimeType = req.file.mimetype;
    // Determine file type based on mimetype
    let type = "file";
    if (mimeType.startsWith("image")) {
        type = "image";
    } else if (mimeType.startsWith("video")) {
        type = "video";
    }
    const message = await Message.create({
        text: "attachment", // or any caption if provided
        sender_id: req.body.senderId,
        receiver_id: req.body.receiverId,
        conversation_id: req.body.conversationId,
        attachment: fileUrl,
        type: type,
        createdAt: new Date().toISOString(),
    });
    await message.save()
    // Save the message to your DB here...
    res.json({ message });
});



module.exports = router;