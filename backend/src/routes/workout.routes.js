const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workout.controller');
const authMiddleware = require('../middleware/auth');

// Workout Plans
router.post('/seed-plans', authMiddleware, workoutController.seedPlans);
router.get('/workout-plans', authMiddleware, workoutController.getWorkoutPlans);
router.get('/all-workout-plans', authMiddleware, workoutController.getAllWorkoutPlans);
router.get('/workout-plans/:id', authMiddleware, workoutController.getWorkoutPlanById);
router.get('/recommendations', authMiddleware, workoutController.getRecommendations);

// Logs & Progress
router.post('/workout-logs', authMiddleware, workoutController.createWorkoutLog);
router.get('/workout-logs', authMiddleware, workoutController.getWorkoutLogs);
router.get('/progress/:exerciseName', authMiddleware, workoutController.getExerciseProgress);
router.post('/body-weight', authMiddleware, workoutController.createBodyWeight);
router.get('/body-weight', authMiddleware, workoutController.getBodyWeight);
router.get('/stats', authMiddleware, workoutController.getStats);

// Analytics
router.get('/analytics/1rm/:exerciseName', authMiddleware, workoutController.get1RMAnalytics);
router.get('/analytics/volume', authMiddleware, workoutController.getVolumeAnalytics);
router.get('/analytics/calories', authMiddleware, workoutController.getCaloriesAnalytics);
router.get('/analytics/summary', authMiddleware, workoutController.getSummaryAnalytics);

// Advanced Workout Plans
router.delete('/clear-advanced-plans', authMiddleware, workoutController.clearAdvancedPlans);
router.post('/seed-advanced-plans', authMiddleware, workoutController.seedAdvancedPlans);
router.get('/advanced-plans', authMiddleware, workoutController.getAdvancedPlans);
router.get('/advanced-plans/:type', authMiddleware, workoutController.getAdvancedPlanByType);

module.exports = router;
