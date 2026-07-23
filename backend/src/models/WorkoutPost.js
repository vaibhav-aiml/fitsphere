const mongoose = require('mongoose');

const workoutPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  createdAt: { type: Date, default: Date.now }
});

workoutPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WorkoutPost', workoutPostSchema);
