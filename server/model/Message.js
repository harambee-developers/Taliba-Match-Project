const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  sent_at: { type: Date, default: Date.now },
  status: { type: String, enum: ["Sent", "Read", "Deleted"], default: "Sent" },
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
