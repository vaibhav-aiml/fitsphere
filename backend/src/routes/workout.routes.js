const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const authMiddleware = require('../middleware/auth');

// Public Workout Plans (Browsing)
router.get('/all-workout-plans', workoutController.getAllWorkoutPlans);
router.get('/workout-plans/:id', workoutController.getWorkoutPlanById);
router.get('/advanced-plans', workoutController.getAdvancedPlans);
router.get('/advanced-plans/:type', workoutController.getAdvancedPlanByType);

// Protected Workout Plans & Admin Seeders
router.post('/seed-plans', authMiddleware, workoutController.seedPlans);
router.get('/workout-plans', authMiddleware, workoutController.getWorkoutPlans);
router.get('/recommendations', authMiddleware, workoutController.getRecommendations);
router.delete('/clear-advanced-plans', authMiddleware, workoutController.clearAdvancedPlans);
router.post('/seed-advanced-plans', authMiddleware, workoutController.seedAdvancedPlans);

// Logs & Progress (Protected)
router.post('/workout-logs', authMiddleware, workoutController.createWorkoutLog);
router.get('/workout-logs', authMiddleware, workoutController.getWorkoutLogs);
router.get('/progress/:exerciseName', authMiddleware, workoutController.getExerciseProgress);
router.post('/body-weight', authMiddleware, workoutController.createBodyWeight);
router.get('/body-weight', authMiddleware, workoutController.getBodyWeight);
router.get('/stats', authMiddleware, workoutController.getStats);

// Analytics (Protected)
router.get('/analytics/1rm/:exerciseName', authMiddleware, workoutController.get1RMAnalytics);
router.get('/analytics/volume', authMiddleware, workoutController.getVolumeAnalytics);
router.get('/analytics/calories', authMiddleware, workoutController.getCaloriesAnalytics);
router.get('/analytics/summary', authMiddleware, workoutController.getSummaryAnalytics);

module.exports = router;
