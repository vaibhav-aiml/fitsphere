const mongoose = require('mongoose');

const advancedWorkoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['powerlifting', 'powerbuilding', 'bodybuilding'], required: true },
  duration: { type: Number, default: 10 },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  weeklySchedule: [{
    week: Number,
    days: [{
      dayNumber: Number,
      dayName: String,
      focus: String,
      exercises: [{
        name: String,
        category: { type: String, enum: ['main', 'secondary', 'accessory', 'conditioning'] },
        warmupSets: [{
          percentage: Number,
          reps: Number,
          rpe: Number,
          notes: String
        }],
        workingSets: [{
          percentage: Number,
          reps: Number,
          rpe: Number,
          notes: String
        }],
        targetReps: String,
        restSeconds: Number,
        tempo: String,
        notes: String,
        videoUrl: String,
        formTips: [String]
      }]
    }]
  }],
  weeklyProgression: [{
    week: Number,
    focus: String,
    intensityIncrease: Number,
    volumeIncrease: Number
  }],
  nutrition: {
    calories: String,
    protein: String,
    carbs: String,
    fats: String,
    tips: [String]
  },
  recovery: {
    sleep: String,
    deloadWeeks: [Number],
    mobilityWork: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdvancedWorkoutPlan', advancedWorkoutPlanSchema);
