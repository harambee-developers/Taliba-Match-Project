const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the embedded schema for profile details
const ProfileSchema = new Schema({
  // Personal Details
  language: { type: [String] }, // Array of strings for multiple languages

  // About Yourself
  age: { type: Number },
  bio: { type: String },
  personality: { type: String },
  dealBreakers: { type: String },
  hobbies: { type: [String] },

  // Your Faith
  madhab: { type: String, enum: ['hanafi', 'maliki', 'shafi', 'hanbali', 'thahiri', 'other', ''] },
  salahPattern: { type: String, enum: ['prays_mosque', 'prays_5_times', 'prays_most', 'prays_occasional', ''] },
  quranMemorization: { type: String, enum: ['hafidh', '10_plus', '5_to_10', '2_to_5', '1_or_less', ''] },
  dressingStyle: { type: String, enum: ['niqab', 'jilbab', 'headscarf', 'somtimeshijab', 'no', ''] },
  openToPolygamy: { type: String, enum: ['yes', 'no', 'maybe', ''] },
  islamicAmbitions: { type: String },
  islamicBooks: { type: String },

  // Life Situation
  children: { type: String, enum: ['yes', 'no', ''] },
  openToHijrah: { type: String, enum: ['yes', 'no', ''] },
  hijrahDestination: { type: String },
  revert: { type: String, enum: ['yes', 'no', ''] },
  yearsRevert: { type: Number },

  // Appearance
  height: { type: Number, min: 100, max: 250 }, // in cm
  weight: { type: Number, min: 30, max: 200 }, // in kg
  appearancePreference: { type: String },

  // Miscellaneous (Legacy/Unused Fields)
  family_background: { type: String },
  additional_info: { type: String },

  public_profile: { type: Boolean, default: true },// Default to public
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
  userName: { type: String, required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  dob: { type: Date },
  education: { type: String },
  gender: { type: String, enum: ['Male', 'Female'] },
  sect: { type: String, enum: ['sunni', 'salafi', 'shia', 'idontknow', 'other', ''] },
  occupation: { type: String },
  ethnicity: { type: String },
  maritalStatus: { type: String, enum: ['yes', 'no', ''] },
  location: { type: String },
  nationality: { type: String },
  ethnicity: { type: String },
  phone: { type: String },
  created_at: { type: Date, default: Date.now },
  profile: ProfileSchema,
  preferences: PreferencesSchema,
  photos: [PhotoSchema],
  isOnline: { type: Boolean, default: false }, // Track if the user is online or offline
  lastSeen: { type: Date, default: null }, // Timestamp for last seen when offline
  socketId: { type: String, default: null }, // Store the socket ID to track the user
  refreshToken: { type: String, default: null }
});

// Optionally, you can define a method for updating status based on socket activity
UserSchema.methods.setOnlineStatus = function (status, socketId) {
  this.isOnline = status;
  this.socketId = socketId || null; // if status is offline, socketId can be null
  this.lastSeen = status ? null : new Date(); // Set lastSeen only when offline
  return this.save();
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
