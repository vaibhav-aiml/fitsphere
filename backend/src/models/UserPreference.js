const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  dislikedExercises: [{ type: String }],
  preferredEquipment: [{ type: String }],
  jointPainAreas: [{ type: String }],
  preferredTrainingStyle: { type: String, default: '' },
  maxDurationMinutes: { type: Number, default: 60 },
  updatedAt: { type: Date, default: Date.now }
});

userPreferenceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
