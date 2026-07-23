const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseName: { type: String, required: true },
  weight: { type: Number, required: true },
  reps: { type: Number, required: true },
  sets: { type: Number, required: true },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

workoutLogSchema.index({ userId: 1, date: -1 });
workoutLogSchema.index({ userId: 1, exerciseName: 1 });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
