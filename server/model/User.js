const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the embedded schema for profile details
const ProfileSchema = new Schema({
  height: { type: Number },
  age: { type: Number },
  hobbies: { type: [String] },
  languages: { type: [String] },
  family_background: { type: String },
  revert: { type: String, enum: ['yes', 'no', ''] },
  yearsRevert: { type: Number },
  additional_info: { type: String },
  salahPattern: { type: String },
  islamicAmbitions: { type: String },
  islamicBooks: { type: String },
  openToHijrah: { type: String, enum: ['yes', 'no', ''] },
  hijrahDestination: { type: String },
  dealBreakers: { type: String },
  children: { type: String, enum: ['yes', 'no', ''] },
  dressingStyle: { type: String },
  quranMemorization: { type: String },
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
  userName: { type: String, required: true, index: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  dob: { type: Date },
  gender: { type: String },
  sect: { type: String },
  education: { type: String },
  occupation: { type: String },
  maritalStatus: { type: String, enum: ['yes', 'no', ''] },
  location: { type: String },
  nationality: { type: String },
  phone: { type: String },
  created_at: { type: Date, default: Date.now },
  profile: ProfileSchema,
  preferences: PreferencesSchema,
  photos: [PhotoSchema],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
