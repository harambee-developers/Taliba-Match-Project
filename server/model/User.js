const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the embedded schema for profile details
const ProfileSchema = new Schema({
  height: { type: Number },
  weight: { type: Number },
  hobbies: { type: [String] },
  languages: { type: [String] },
  family_background: { type: String },
  additional_info: { type: String },
  public_profile: { type: Boolean, default: true }, // Default to public
});

// Define the embedded schema for user preferences
const PreferencesSchema = new Schema({
  age_range: { type: [Number], validate: arr => arr.length === 2 }, // Array with 2 numbers (min, max)
  height_range: { type: [Number], validate: arr => arr.length === 2 },
  education: { type: String },
  country: { type: String },
  additional_preferences: { type: String },
});

// Define the embedded schema for photos
const PhotoSchema = new Schema({
  photo_id: { type: Schema.Types.ObjectId, auto: true },
  url: { type: String },
  created_at: { type: Date, default: Date.now },
});

// Main user schema
const UserSchema = new Schema({
  username: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  education: { type: String },
  occupation: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    country: { type: String },
  },
  phone: { type: String },
  created_at: { type: Date, default: Date.now },
  profile: ProfileSchema,
  preferences: PreferencesSchema,
  photos: [PhotoSchema],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
