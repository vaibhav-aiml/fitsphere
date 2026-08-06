const FoodItem = require('../models/FoodItem');
const MealLog = require('../models/MealLog');
const WaterIntake = require('../models/WaterIntake');
const SupplementReminder = require('../models/SupplementReminder');
const Recipe = require('../models/Recipe');
const GroceryList = require('../models/GroceryList');
const aiProvider = require('../services/aiProvider');
const { extractJsonObject } = require('../services/workoutPlanPipeline.service');

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
  
  for (const food of (foods || [])) {
    let foodData = food;
    if (food.foodId) {
      const dbFood = await FoodItem.findById(food.foodId);
      if (dbFood) {
        const multiplier = (food.quantity || 100) / parseFloat(dbFood.servingSize.split(' ')[0] || 1);
        foodData = {
          name: dbFood.name,
          quantity: food.quantity || 100,
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
  const recipes = await Recipe.find().limit(20);
  res.json({ success: true, recipes });
};

const createRecipe = async (req, res) => {
  const recipe = new Recipe({ ...req.body, createdBy: req.user._id });
  await recipe.save();
  res.json({ success: true, recipe });
};

const getGroceryList = async (req, res) => {
  let list = await GroceryList.findOne({ userId: req.user._id });
  if (!list) {
    list = await GroceryList.create({ userId: req.user._id, items: [] });
  }
  res.json({ success: true, list });
};

const addGroceryItems = async (req, res) => {
  const { items } = req.body;
  let list = await GroceryList.findOne({ userId: req.user._id });
  if (!list) {
    list = new GroceryList({ userId: req.user._id, items: [] });
  }
  
  list.items.push(...items);
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

/**
 * -------------------------------------------------------------
 * AI NUTRITION & DIET GENERATION ENDPOINTS
 * -------------------------------------------------------------
 */

const generateAiDietPlan = async (req, res) => {
  try {
    const {
      age = 25,
      gender = 'male',
      weightKg = 75,
      heightCm = 175,
      goal = 'hypertrophy',
      activityLevel = 'moderate',
      dietaryPreference = 'balanced',
      allergies = 'none'
    } = req.body;

    const prompt = `
Generate a science-backed, personalized daily diet plan and macro breakdown with the following details:
- Age: ${age}, Gender: ${gender}
- Weight: ${weightKg} kg, Height: ${heightCm} cm
- Primary Goal: ${goal} (e.g. hypertrophy, fatloss, strength, maintenance)
- Activity Level: ${activityLevel}
- Dietary Preference: ${dietaryPreference}
- Allergies/Avoid: ${allergies}

Output ONLY a valid JSON object matching this exact schema:
{
  "tdee": 2600,
  "bmr": 1750,
  "targets": {
    "calories": 2500,
    "protein": 180,
    "carbs": 260,
    "fats": 70
  },
  "rationale": "High protein split for progressive overload recovery and muscle synthesis.",
  "meals": [
    {
      "mealType": "breakfast",
      "title": "Anabolic Oats & Eggs",
      "calories": 650,
      "protein": 45,
      "carbs": 70,
      "fats": 18,
      "foods": [
        { "name": "Oatmeal", "quantity": "80g", "calories": 300, "protein": 10, "carbs": 54, "fats": 5 },
        { "name": "Whole Eggs", "quantity": "3 large", "calories": 210, "protein": 18, "carbs": 1, "fats": 15 },
        { "name": "Whey Protein", "quantity": "30g", "calories": 120, "protein": 24, "carbs": 2, "fats": 1 }
      ],
      "instructions": "Cook oats with water, mix protein powder, serve with eggs."
    },
    {
      "mealType": "lunch",
      "title": "Grilled Chicken & Brown Rice Bowl",
      "calories": 750,
      "protein": 55,
      "carbs": 80,
      "fats": 16,
      "foods": [
        { "name": "Chicken Breast", "quantity": "200g", "calories": 330, "protein": 62, "carbs": 0, "fats": 7 },
        { "name": "Brown Rice", "quantity": "200g", "calories": 230, "protein": 5, "carbs": 46, "fats": 2 },
        { "name": "Steamed Broccoli", "quantity": "150g", "calories": 50, "protein": 4, "carbs": 10, "fats": 0 },
        { "name": "Olive Oil", "quantity": "1 tbsp", "calories": 120, "protein": 0, "carbs": 0, "fats": 14 }
      ],
      "instructions": "Grill chicken breast with olive oil, serve over rice and steamed broccoli."
    },
    {
      "mealType": "dinner",
      "title": "Salmon & Roasted Sweet Potato",
      "calories": 680,
      "protein": 48,
      "carbs": 65,
      "fats": 22,
      "foods": [
        { "name": "Atlantic Salmon", "quantity": "200g", "calories": 400, "protein": 40, "carbs": 0, "fats": 24 },
        { "name": "Sweet Potato", "quantity": "250g", "calories": 210, "protein": 4, "carbs": 48, "fats": 0 },
        { "name": "Asparagus Spears", "quantity": "100g", "calories": 25, "protein": 3, "carbs": 4, "fats": 0 }
      ],
      "instructions": "Bake salmon at 200°C for 15 mins. Roast diced sweet potato with sea salt."
    },
    {
      "mealType": "snack",
      "title": "Greek Yogurt & Almond Power Bowl",
      "calories": 420,
      "protein": 32,
      "carbs": 45,
      "fats": 14,
      "foods": [
        { "name": "Greek Yogurt 0%", "quantity": "250g", "calories": 150, "protein": 25, "carbs": 9, "fats": 0 },
        { "name": "Blueberries", "quantity": "100g", "calories": 60, "protein": 1, "carbs": 14, "fats": 0 },
        { "name": "Raw Almonds", "quantity": "25g", "calories": 140, "protein": 5, "carbs": 5, "fats": 12 },
        { "name": "Honey", "quantity": "1 tbsp", "calories": 60, "protein": 0, "carbs": 17, "fats": 0 }
      ],
      "instructions": "Layer Greek yogurt with fresh blueberries, chopped almonds, and honey."
    }
  ]
}
`;

    const result = await aiProvider.generate([
      { role: 'system', content: 'You are an expert sports nutritionist and AI diet planner. Output JSON ONLY.' },
      { role: 'user', content: prompt }
    ]);

    let parsed = extractJsonObject(result.text);
    res.json({ success: true, plan: parsed });
  } catch (error) {
    res.status(500).json({ success: false, code: 'AI_DIET_PLAN_FAILED', message: 'Failed to generate AI diet plan' });
  }
};

const analyzeMealAi = async (req, res) => {
  try {
    const { mealText, mealType = 'lunch' } = req.body;
    if (!mealText || !mealText.trim()) {
      return res.status(400).json({ success: false, message: 'Meal description text is required' });
    }

    const prompt = `
Analyze the user's meal description and estimate accurate calories and macronutrients:
Meal Description: "${mealText}"
Meal Type: ${mealType}

Output ONLY a single valid JSON object matching this schema:
{
  "mealTitle": "Descriptive meal name, e.g. Chicken Rice & Avocado Bowl",
  "totalCalories": 650,
  "totalProtein": 48,
  "totalCarbs": 60,
  "totalFats": 16,
  "foods": [
    { "name": "Chicken Breast", "quantity": "180g", "calories": 290, "protein": 55, "carbs": 0, "fats": 6 },
    { "name": "Cooked Brown Rice", "quantity": "150g", "calories": 200, "protein": 4, "carbs": 44, "fats": 1 }
  ]
}
`;

    const result = await aiProvider.generate([
      { role: 'system', content: 'You are an expert nutritional analyst AI. Output valid JSON only.' },
      { role: 'user', content: prompt }
    ]);

    let parsed = extractJsonObject(result.text);
    res.json({ success: true, analysis: parsed });
  } catch (error) {
    res.status(500).json({ success: false, code: 'AI_MEAL_ANALYSIS_FAILED', message: 'Failed to analyze meal text' });
  }
};

const askAiNutritionist = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const promptMessages = [
      { role: 'system', content: 'You are FitSphere AI Nutritionist, an evidence-based sports dietitian specializing in athletic performance, hypertrophy, fat loss, and supplement science. Keep responses concise, structured with Markdown bullet points, and practical.' },
      { role: 'user', content: question }
    ];

    const result = await aiProvider.generate(promptMessages);
    res.json({ success: true, answer: result.text });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI Nutritionist temporarily unavailable' });
  }
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
  updateSupplement,
  generateAiDietPlan,
  analyzeMealAi,
  askAiNutritionist,
};
