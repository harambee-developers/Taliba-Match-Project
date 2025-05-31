// models/Report.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReportSchema = new Schema({
  reporter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reported_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason:       { type: String, default: '' },
  created_at:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
