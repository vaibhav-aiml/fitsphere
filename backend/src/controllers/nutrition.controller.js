const FoodItem = require('../models/FoodItem');
const MealLog = require('../models/MealLog');
const WaterIntake = require('../models/WaterIntake');
const SupplementReminder = require('../models/SupplementReminder');
const Recipe = require('../models/Recipe');
const GroceryList = require('../models/GroceryList');

const seedFoods = async (req, res) => {
  const existingFoods = await FoodItem.countDocuments();
  if (existingFoods > 0) {
    return res.json({ message: 'Foods already seeded', count: existingFoods });
  }
  
  const commonFoods = [
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
    { name: "White Rice", calories: 130, protein: 2.7, carbs: 28, fats: 0.3, servingSize: "100g", unit: "g", category: "lunch", isCommon: true },
    { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, servingSize: "1 large", unit: "piece", category: "breakfast", isCommon: true },
    { name: "Oatmeal", calories: 158, protein: 5.5, carbs: 27, fats: 3.2, servingSize: "40g", unit: "g", category: "breakfast", isCommon: true },
    { name: "Whey Protein", calories: 120, protein: 24, carbs: 3, fats: 1.5, servingSize: "30g", unit: "g", category: "snack", isCommon: true },
    { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.4, servingSize: "1 medium", unit: "piece", category: "snack", isCommon: true },
    { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
    { name: "Salmon", calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
    { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fats: 14.7, servingSize: "100g", unit: "g", category: "snack", isCommon: true },
    { name: "Greek Yogurt", calories: 100, protein: 10, carbs: 6, fats: 0.4, servingSize: "150g", unit: "g", category: "breakfast", isCommon: true },
    { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fats: 0.1, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
    { name: "Almonds", calories: 579, protein: 21, carbs: 22, fats: 49, servingSize: "100g", unit: "g", category: "snack", isCommon: true }
  ];
  
  await FoodItem.insertMany(commonFoods);
  res.json({ success: true, message: `Seeded ${commonFoods.length} common foods` });
};

const getFoods = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const total = await FoodItem.countDocuments();
  const foods = await FoodItem.find().skip(skip).limit(limit);

  res.json({
    success: true,
    foods,
    count: foods.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const createMeal = async (req, res) => {
  const { mealType, foods, notes } = req.body;
  
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
  const processedFoods = [];
  
  for (const food of foods) {
    let foodData = food;
    if (food.foodId) {
      const dbFood = await FoodItem.findById(food.foodId);
      if (dbFood) {
        const multiplier = food.quantity / parseFloat(dbFood.servingSize.split(' ')[0] || 1);
        foodData = {
          name: dbFood.name,
          quantity: food.quantity,
          unit: food.unit || dbFood.unit,
          calories: Math.round(dbFood.calories * multiplier),
          protein: Math.round(dbFood.protein * multiplier * 10) / 10,
          carbs: Math.round(dbFood.carbs * multiplier * 10) / 10,
          fats: Math.round(dbFood.fats * multiplier * 10) / 10
        };
      }
    }
    
    processedFoods.push(foodData);
    totalCalories += foodData.calories || 0;
    totalProtein += foodData.protein || 0;
    totalCarbs += foodData.carbs || 0;
    totalFats += foodData.fats || 0;
  }
  
  const meal = new MealLog({
    userId: req.user._id,
    mealType,
    foods: processedFoods,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    notes
  });
  
  await meal.save();
  res.json({ success: true, meal });
};

const getMeals = async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);
  
  const meals = await MealLog.find({
    userId: req.user._id,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.totalCalories,
    protein: acc.protein + meal.totalProtein,
    carbs: acc.carbs + meal.totalCarbs,
    fats: acc.fats + meal.totalFats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  
  res.json({ success: true, meals, totals });
};

const logWater = async (req, res) => {
  const { amount } = req.body;
  const water = new WaterIntake({ userId: req.user._id, amount });
  await water.save();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTotal = await WaterIntake.aggregate([
    { $match: { userId: req.user._id, date: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  
  res.json({ success: true, water, todayTotal: todayTotal[0]?.total || 0 });
};

const getWater = async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);
  
  const logs = await WaterIntake.find({
    userId: req.user._id,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });
  
  const total = logs.reduce((sum, l) => sum + l.amount, 0);
  res.json({ success: true, logs, total });
};

const getRecipes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const { category } = req.query;
  const query = { $or: [{ isPublic: true }, { createdBy: req.user._id }] };
  if (category) query.category = category;
  
  const total = await Recipe.countDocuments(query);
  const recipes = await Recipe.find(query).skip(skip).limit(limit);
  res.json({
    success: true,
    recipes,
    count: recipes.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const createRecipe = async (req, res) => {
  const recipe = new Recipe({ ...req.body, createdBy: req.user._id });
  await recipe.save();
  res.json({ success: true, recipe });
};

const getGroceryList = async (req, res) => {
  let list = await GroceryList.findOne({ userId: req.user._id });
  if (!list) {
    list = new GroceryList({ userId: req.user._id, items: [] });
    await list.save();
  }
  res.json({ success: true, list });
};

const addGroceryItems = async (req, res) => {
  const { items } = req.body;
  let list = await GroceryList.findOne({ userId: req.user._id });
  
  if (!list) {
    list = new GroceryList({ userId: req.user._id, items: [] });
  }
  
  for (const item of items) {
    const existing = list.items.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existing) {
      existing.quantity = item.quantity;
    } else {
      list.items.push(item);
    }
  }
  list.updatedAt = new Date();
  await list.save();
  
  res.json({ success: true, list });
};

const updateGroceryItem = async (req, res) => {
  const { purchased } = req.body;
  const list = await GroceryList.findOne({ userId: req.user._id });
  if (!list) return res.status(404).json({ error: 'List not found' });
  
  const item = list.items.id(req.params.itemId);
  if (item) item.purchased = purchased;
  await list.save();
  
  res.json({ success: true, list });
};

const getSupplements = async (req, res) => {
  const supplements = await SupplementReminder.find({ userId: req.user._id, isActive: true });
  res.json({ success: true, supplements });
};

const createSupplement = async (req, res) => {
  const supplement = new SupplementReminder({ ...req.body, userId: req.user._id });
  await supplement.save();
  res.json({ success: true, supplement });
};

const updateSupplement = async (req, res) => {
  const { isActive } = req.body;
  const supplement = await SupplementReminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isActive },
    { new: true }
  );
  res.json({ success: true, supplement });
};

module.exports = {
  seedFoods,
  getFoods,
  createMeal,
  getMeals,
  logWater,
  getWater,
  getRecipes,
  createRecipe,
  getGroceryList,
  addGroceryItems,
  updateGroceryItem,
  getSupplements,
  createSupplement,
  updateSupplement
};
