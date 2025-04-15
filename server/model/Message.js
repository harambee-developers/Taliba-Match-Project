const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  conversation_id: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  attachment: { type: String, default: null },
  type: { type: String, enum: ["text", "image", "video", 'file'], default: "text" }, // Optional: For supporting media
  status: { type: String, enum: ["Sent", "Read", "Deleted"], default: "Sent" },
}, {timestamps: true});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
