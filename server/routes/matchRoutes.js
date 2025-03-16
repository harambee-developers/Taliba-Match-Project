const express = require('express');
const router = express.Router();
const Match = require('../model/Match')

router.get('/pending/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const pendingRequests = await Match.find({
            $or: [{ user1_id: userId }, { user2_id: userId }],
            match_status: 'pending'
        })
        .populate("user1")
        .populate("user2"); // Populate the 'users' virtual field

        if (pendingRequests.length === 0) {
            return res.status(404).json({ message: 'No pending requests found' });
        }

        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error('Could not fetch pending requests', error);
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
        console.error('Error accepting match:', error);
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
        console.error('Error rejecting match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;