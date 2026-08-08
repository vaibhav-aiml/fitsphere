const express = require('express');
const router = express.Router();
const activeSessionController = require('../controllers/activeSession.controller');
const authMiddleware = require('../middleware/auth');

// Protected Active Workout Tracking Session Routes
router.post('/active-sessions', authMiddleware, activeSessionController.createActiveSession);
router.get('/active-sessions', authMiddleware, activeSessionController.getActiveSessions);
router.get('/active-sessions/stats', authMiddleware, activeSessionController.getActiveSessionStats);
router.get('/active-sessions/:id', authMiddleware, activeSessionController.getSessionById);
router.delete('/active-sessions/:id', authMiddleware, activeSessionController.deleteActiveSession);

module.exports = router;
