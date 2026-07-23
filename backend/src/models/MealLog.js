const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foods: [{
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    name: String,
    quantity: Number,
    unit: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  }],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFats: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  notes: String
});

mealLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
