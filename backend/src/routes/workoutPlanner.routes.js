const express = require('express');
const router = express.Router();
const controller = require('../controllers/workoutPlanner.controller');
const authMiddleware = require('../middleware/auth');
const { aiLimiter, adminLimiter } = require('../middleware/rateLimiter');

// Helper to register routes under both unversioned and versioned (/api/v1/) endpoints
function registerRoute(method, path, ...middlewares) {
  const versionedPath = path.replace('/ai-planner', '/v1/ai-planner');
  router[method](path, ...middlewares);
  router[method](versionedPath, ...middlewares);
}

// Health & Operational Metrics
registerRoute('get', '/ai-planner/health', controller.getPublicHealth);
registerRoute('get', '/ai-planner/admin/metrics', authMiddleware, adminLimiter, controller.getAdminMetrics);

// Plan Generation & Progress-Streamed Pipeline
registerRoute('post', '/ai-planner/generate-stream', authMiddleware, aiLimiter, controller.generatePlanStream);

// Single Day & Exercise Regeneration
registerRoute('post', '/ai-planner/plans/:id/regenerate-day', authMiddleware, aiLimiter, controller.regenerateDay);
registerRoute('post', '/ai-planner/plans/:id/regenerate-exercise', authMiddleware, aiLimiter, controller.regenerateExercise);

// Coaching Explanations & Weekly Check-In
registerRoute('post', '/ai-planner/plans/:id/explain', authMiddleware, aiLimiter, controller.explainPlan);
registerRoute('post', '/ai-planner/plans/:id/weekly-checkin', authMiddleware, controller.weeklyCheckIn);

// Suggestions Workflow
registerRoute('post', '/ai-planner/plans/:id/suggestions/:sugId/accept', authMiddleware, controller.acceptSuggestion);
registerRoute('post', '/ai-planner/plans/:id/suggestions/:sugId/reject', authMiddleware, controller.rejectSuggestion);

// Version Rollback & Status Management
registerRoute('post', '/ai-planner/plans/:id/rollback', authMiddleware, controller.rollbackVersion);
registerRoute('put', '/ai-planner/plans/:id/active', authMiddleware, controller.setActivePlan);

// User Memory Preferences
registerRoute('get', '/ai-planner/user-preferences', authMiddleware, controller.getUserPreferences);
registerRoute('put', '/ai-planner/user-preferences', authMiddleware, controller.updateUserPreferences);

// Recommendations & Exports
registerRoute('get', '/ai-planner/recommendations', authMiddleware, controller.getRecommendedPlans);
registerRoute('get', '/ai-planner/plans/:id/export', authMiddleware, controller.exportPlan);

// CRUD
registerRoute('get', '/ai-planner/plans', authMiddleware, controller.getUserPlans);
registerRoute('get', '/ai-planner/plans/:id', authMiddleware, controller.getPlanById);
registerRoute('put', '/ai-planner/plans/:id', authMiddleware, controller.updatePlan);
registerRoute('delete', '/ai-planner/plans/:id', authMiddleware, controller.deletePlan);
registerRoute('post', '/ai-planner/plans/:id/duplicate', authMiddleware, controller.duplicatePlan);

module.exports = router;
