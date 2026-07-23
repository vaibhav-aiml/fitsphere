const mongoose = require('mongoose');

const groceryListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: String,
    quantity: String,
    purchased: { type: Boolean, default: false },
    category: { type: String, enum: ['produce', 'meat', 'dairy', 'grains', 'snacks', 'other'] }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroceryList', groceryListSchema);
