const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatchSchema = new Schema({
  user1_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user2_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  match_status: {
    type: String,
    enum: ['Interested', 'Rejected', 'Blocked', 'pending'],
    default: 'pending'
  },
  matched_at: { type: Date, default: Date.now },
});

MatchSchema.virtual("user1", {
  ref: "User", // Name of the User model
  localField: "user1_id", // Local field in the Match model
  foreignField: "_id", // Foreign field for the first user (user1_id)
  justOne: true, // We want both users to be populated
});

MatchSchema.virtual("user2", {
  ref: "User", // Name of the User model
  localField: "user2_id", // Local field in the Match model
  foreignField: "_id", // Foreign field for the second user (user2_id)
  justOne: true, // Single user for the second one
});

// Enable virtuals in JSON and Object output
MatchSchema.set("toJSON", { virtuals: true });
MatchSchema.set("toObject", { virtuals: true });

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
