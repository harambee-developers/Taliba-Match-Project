const express = require('express');
const router = express.Router();
const Match = require('../model/Match')
const User = require('../model/User')
const mongoose = require('mongoose')
const logger = require('../logger');
const authMiddleware = require('../middleware/authMiddleware');
const MATCH_TEMPLATE_ID = "d-9419e4b8cb8c49b39be656cd4f99ac61"
const { sendEmails } = require('../utils/sendEmail')

router.use(express.json())

router.get('/pending/sent/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch matches where the user is the sender
        const sentRequests = await Match.find({
            sender_id: userId,
            match_status: 'pending'
        })
            .populate("receiver");

        if (sentRequests.length === 0) {
            return res.status(404).json({ message: 'No pending sent requests found' });
        }

        res.status(200).json(sentRequests);
    } catch (error) {
        logger.error('Could not fetch sent requests', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/pending/received/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch matches where the user is the receiver
        const receivedRequests = await Match.find({
            receiver_id: userId,
            match_status: 'pending'
        })
            .populate("sender");

        if (receivedRequests.length === 0) {
            return res.status(404).json({ message: 'No pending received requests found' });
        }

        res.status(200).json(receivedRequests);
    } catch (error) {
        logger.error('Could not fetch received requests', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/matches/:userId', async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 0;

    try {
        const matches = await Match.find({
            $or: [{ sender_id: userId }, { receiver_id: userId }],
            match_status: { $in: ['Interested', 'Blocked'] },
        }, {
            sender_id: 1,
            receiver_id: 1,
            updatedAt: 1,
        })
            .sort({ updatedAt: -1 })        // newest first
            .skip(page * 20)
            .limit(20)
            .lean()
            .populate('sender', 'firstName lastName photos')
            .populate('receiver', 'firstName lastName photos');

        if (!matches.length) {
            return res.status(404).json({ message: 'No matches found' });
        }
        res.json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// send match request
router.post('/send-request', authMiddleware, async (req, res) => {
    const { sender_id, receiver_id } = req.body;

    if (!sender_id || !receiver_id) {
        return res.status(400).json({ message: 'sender_id and receiver_id are required' });
    }

    try {
        const sender = await User.findById(sender_id);
        const receiver = await User.findById(receiver_id); // ✅ Add this line

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'Sender or receiver not found' });
        }

        // Prevent duplicate match requests
        const existingMatch = await Match.findOne({ sender_id, receiver_id });
        if (existingMatch) {
            return res.status(409).json({ message: 'Match request already sent' });
        }

        const match = await Match.create({
            sender_id,
            receiver_id,
            match_status: "pending",
            matched_at: Date.now()
        });

        // 📧 Send email notification to receiver
        await sendEmails(
            [
                {
                    email: receiver.email,
                    name: receiver.firstName || 'User',
                    sender_name: sender.firstName || 'Another user'
                }
            ],
            MATCH_TEMPLATE_ID,
            "info@talibah.co.uk"
        );

        res.status(201).json({ message: 'Match request sent successfully', match });
    } catch (error) {
        logger.error('Error sending match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Accept match
router.put('/accept/:matchId', async (req, res) => {
    const { matchId } = req.params;

    try {
        // Find match by ID and update the status to "Interested"
        const match = await Match.findByIdAndUpdate(
            matchId,
            { match_status: 'Interested' },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        res.status(200).json(match);
    } catch (error) {
        logger.error('Error accepting match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject match
router.put('/reject/:matchId', async (req, res) => {
    const { matchId } = req.params;

    try {
        // Find match by ID and update the status to "Rejected"
        const match = await Match.findByIdAndUpdate(
            matchId,
            { match_status: 'Rejected' },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        res.status(200).json(match);
    } catch (error) {
        logger.error('Error rejecting match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET match status between logged-in user and a target user
router.get('/status/:targetId', authMiddleware, async (req, res) => {
    const currentUserId = req.user.id;
    const { targetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(400).json({ message: "Invalid target user ID" });
    }

    try {
        const match = await Match.findOne({
            $or: [
                { sender_id: currentUserId, receiver_id: targetId },
                { sender_id: targetId, receiver_id: currentUserId }
            ]
        });

        if (!match) {
            return res.status(200).json({ match_status: 'none' });
        }

        let status = match.match_status;
        let blocked_by = null;

        if (status === 'Blocked') {
            blocked_by = match.blocked_by?.toString();

            // Determine if current user is blocked
            if (blocked_by && blocked_by !== currentUserId) {
                status = 'YouAreBlocked';
            } else if (blocked_by && blocked_by === currentUserId) {
                status = 'Blocked';
            }
        }

        return res.status(200).json({
            match_status: status,
            blocked_by
        });

    } catch (error) {
        console.error('Error fetching match status:', error);
        return res.status(500).json({ message: 'Failed to fetch match status' });
    }
});


module.exports = router;