const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: { type: String, enum: ['powerlifting', 'bodybuilding', 'fatloss'], required: true },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  description: { type: String, required: true },
  durationWeeks: { type: Number, required: true },
  weeklySchedule: [{
    day: Number,
    dayName: String,
    focus: String,
    exercises: [{
      name: String,
      sets: Number,
      reps: String,
      restSeconds: Number,
      notes: String
    }]
  }],
  tips: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
