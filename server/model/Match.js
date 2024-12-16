const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatchSchema = new Schema({
    user1_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    match_status: { 
      type: String, 
      enum: ['Interested', 'Rejected', 'Blocked'], 
      default: 'Interested' 
    },
    matched_at: { type: Date, default: Date.now },
  });
  
  const Match = mongoose.model('Match', MatchSchema);
  
module.exports = Match;
  