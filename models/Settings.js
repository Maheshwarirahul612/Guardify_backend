const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  isDarkMode: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  profilePrivate: { type: Boolean, default: false },
  autoUpdate: { type: Boolean, default: true },
  securityAlert: { type: String, enum: ['email', 'sms'], default: 'email' },
  accentColor: { type: String, default: 'indigo' },
  profilePic: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
