const express = require('express');
const router = express.Router();
const Match = require('../model/Match')

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
        console.error('Could not fetch sent requests', error);
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
        console.error('Could not fetch received requests', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch accepted matches for User2
router.get('/matches/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Get all matches where the current user is either user1 or user2 and the status is 'accepted'
        const matches = await Match.find({
            $or: [{ sender_id: userId }, { receiver_id: userId }],
            match_status: 'Interested',
        })
        .populate("sender")
        .populate("receiver");

        if (matches.length === 0) {
            return res.status(404).json({ message: 'No matches found' });
        }

        res.status(200).json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
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