const mongoose = require('mongoose');

const activeWorkoutSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  activityType: {
    type: String,
    enum: [
      'running',
      'outdoor_walking',
      'cycling',
      'trekking',
      'indoor_treadmill',
      'badminton',
      'basketball',
      'hiit',
      'jump_rope'
    ],
    required: true
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: Date.now },
  durationSeconds: { type: Number, required: true, min: 0 },
  stepsCount: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  distanceKm: { type: Number, default: null },
  avgPaceMinPerKm: { type: Number, default: null },
  avgCadenceSpm: { type: Number, default: 0 },
  elevationGainMeters: { type: Number, default: null },
  maxSpeedKmh: { type: Number, default: null },
  telemetryData: [{
    timestamp: { type: Number },
    steps: { type: Number },
    calories: { type: Number },
    speed: { type: Number, default: null },
    distance: { type: Number, default: null },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  }],
  isManuallyEdited: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['completed', 'cancelled'],
    default: 'completed'
  }
}, { timestamps: true });

activeWorkoutSessionSchema.index({ userId: 1, startTime: -1 });

module.exports = mongoose.model('ActiveWorkoutSession', activeWorkoutSessionSchema);
