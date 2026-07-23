const mongoose = require('mongoose');

const waterIntakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // in ml
  date: { type: Date, default: Date.now }
});

waterIntakeSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);
