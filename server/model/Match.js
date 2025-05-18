const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatchSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  match_status: {
    type: String,
    enum: ['Interested', 'Rejected', 'Blocked', 'pending'],
    default: 'pending'
  },
  blocked_by: { type: Schema.Types.ObjectId, ref: 'User' },
  matched_at: { type: Date, default: Date.now, index: true },
});

MatchSchema.virtual("sender", {
  ref: "User", // Name of the User model
  localField: "sender_id", // Local field in the Match model
  foreignField: "_id", // Foreign field for the sender (sender_id)
  justOne: true, // Single user for sender
});

MatchSchema.virtual("receiver", {
  ref: "User", // Name of the User model
  localField: "receiver_id", // Local field in the Match model
  foreignField: "_id", // Foreign field for the receiver (receiver_id)
  justOne: true, // Single user for receiver
});

// Enable virtuals in JSON and Object output
MatchSchema.set("toJSON", { virtuals: true });
MatchSchema.set("toObject", { virtuals: true });

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
