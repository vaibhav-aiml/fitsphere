const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['strength', 'consistency', 'volume', 'milestone', 'challenge'], required: true },
  requirement: {
    type: { type: String, enum: ['workout_count', 'strength_pr', 'volume_total', 'streak_days', 'exercise_mastery'] },
    target: Number,
    exerciseName: String
  },
  points: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Badge', badgeSchema);
