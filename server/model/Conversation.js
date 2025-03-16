const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    last_message: { type: String, default: "" }, // Stores actual text, not ObjectId
  },
  { timestamps: true } // Automatically handles createdAt & updatedAt
);

module.exports = mongoose.model("Conversation", ConversationSchema);