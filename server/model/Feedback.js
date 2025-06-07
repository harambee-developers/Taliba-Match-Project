const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  submitted_at: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
