const mongoose = require('mongoose');

const supplementReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  timeOfDay: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
  time: { type: String }, // HH:MM format
  daysOfWeek: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupplementReminder', supplementReminderSchema);
