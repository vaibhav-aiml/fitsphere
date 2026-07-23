const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');
const authMiddleware = require('../middleware/auth');

router.post('/seed-foods', authMiddleware, nutritionController.seedFoods);
router.get('/foods', authMiddleware, nutritionController.getFoods);
router.post('/meals', authMiddleware, nutritionController.createMeal);
router.get('/meals', authMiddleware, nutritionController.getMeals);
router.post('/water', authMiddleware, nutritionController.logWater);
router.get('/water', authMiddleware, nutritionController.getWater);
router.get('/recipes', authMiddleware, nutritionController.getRecipes);
router.post('/recipes', authMiddleware, nutritionController.createRecipe);
router.get('/grocery-list', authMiddleware, nutritionController.getGroceryList);
router.post('/grocery-list', authMiddleware, nutritionController.addGroceryItems);
router.put('/grocery-list/:itemId', authMiddleware, nutritionController.updateGroceryItem);
router.get('/supplements', authMiddleware, nutritionController.getSupplements);
router.post('/supplements', authMiddleware, nutritionController.createSupplement);
router.put('/supplements/:id', authMiddleware, nutritionController.updateSupplement);

module.exports = router;
