// model/Notification.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The recipient's user ID
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation"},
  text: { type: String, required: true },
  type: { type: String, default: "message" }, // Could be "message", "match", etc.
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notifications", NotificationSchema);
