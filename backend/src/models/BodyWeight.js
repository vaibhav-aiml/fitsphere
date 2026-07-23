const mongoose = require('mongoose');

const bodyWeightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

bodyWeightSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('BodyWeight', bodyWeightSchema);
