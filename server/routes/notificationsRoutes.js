// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../model/Notifications');
const logger = require('../logger')

/**
 * GET /api/notifications/:userId
 * Query:
 *   - before: ISO timestamp to page older notifications
 *   - limit:  number of notifications to fetch (default 20, max 50)
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { before, limit = 20 } = req.query;
  const pageSize = Math.min(parseInt(limit, 10) || 20, 50);

  try {
    // Build the query filter
    const filter = { userId };
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate)) {
        filter.createdAt = { $lt: beforeDate };
      }
    }

    const notifications = await Notification.find(filter, {
      // Project only the fields your client needs:
      _id: 1,
      text: 1,
      type: 1,
      isRead: 1,
      createdAt: 1,
    })
      .sort({ createdAt: -1 }) // newest first
      .limit(pageSize)
      .lean();

    // Return in descending order (newest first)
    return res.json({ notifications });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error fetching notifications' });
  }
});


// PATCH /api/notifications/read/:id
router.patch("/read/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ error: "Notification not found" });

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/notifications/mark-all-read/:userId
router.patch("/mark-all-read/:userId", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
