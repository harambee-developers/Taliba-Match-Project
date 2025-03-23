const express = require("express");
const router = express.Router();
const Message = require("../model/Message");
const Conversation = require("../model/Conversation");
const mongoose = require('mongoose')

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

router.post("/new", async (req, res) => {
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

module.exports = router;