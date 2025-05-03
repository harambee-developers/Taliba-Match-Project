const express = require('express');
const router = express.Router();
const Match = require('../model/Match')
const User = require('../model/User')
const logger = require('../logger');
const authMiddleware = require('../middleware/authMiddleware');

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
            match_status: 'Interested',
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
    const { sender_id, receiver_id } = req.body

    if (!sender_id || !receiver_id) {
        return res.status(400).json({ message: 'sender_id and receiver_id are required' });
    }
    try {

        const sender = await User.findById(sender_id);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Prevent duplicate match requests
        const existingMatch = await Match.findOne({
            sender_id,
            receiver_id,
        });
        if (existingMatch) {
            return res.status(409).json({ message: 'Match request already sent' });
        }

        // If the sender is NOT subscribed, enforce a 4-request cap
        if (sender.subscription?.status !== 'active') {
            const sentCount = await Match.countDocuments({ sender_id });
            if (sentCount >= 3) {
                return res.status(403).json({
                    message: 'You have reached the 3-request limit for Basic users. Upgrade to get unlimited requests.'
                });
            }
        }

        const match = await Match.create({
            sender_id,
            receiver_id,
            match_status: "pending",
            matched_at: Date.now()
        });

        res.status(201).json({ message: 'Match request sent successfully', match });
    } catch (error) {
        logger.error('Error sending match:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/remaining-requests/:userId', async (req, res) => {
    try {
        const sender = await User.findById(req.params.userId);
        if (!sender) return res.status(404).json({ message: 'User not found' });

        // If subscribed, unlimited
        if (sender.subscription?.status === 'active') {
            return res.json({ remaining: Infinity });
        }

        // Basic: cap 4
        const sentCount = await Match.countDocuments({ sender_id: sender.id });
        const remaining = Math.max(0, 3 - sentCount);
        return res.json({ remaining });

    } catch (err) {
        console.error(err);
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

module.exports = router;