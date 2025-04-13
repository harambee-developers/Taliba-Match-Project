// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../model/Notifications');

// GET /api/notifications/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Optionally: ensure the authenticated user matches userId or has proper permissions
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }); // Most recent notifications first
    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error fetching notifications" });
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
    await Notifications.updateMany(
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
