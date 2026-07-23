const mongoose = require('mongoose');

const monthlyChallengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  type: { type: String, enum: ['workouts', 'volume', 'streak', 'exercise_count'], required: true },
  target: { type: Number, required: true },
  reward: {
    badgeName: String,
    xpBonus: { type: Number, default: 500 },
    description: String
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MonthlyChallenge', monthlyChallengeSchema);
