const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  servingSize: { type: String, required: true },
  unit: { type: String, default: 'g' },
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage'] },
  isCommon: { type: Boolean, default: false }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
