const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ingredients: [{
    name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  }],
  instructions: [String],
  prepTime: Number, // minutes
  cookTime: Number, // minutes
  servings: Number,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  imageUrl: String,
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'protein', 'post-workout'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);
