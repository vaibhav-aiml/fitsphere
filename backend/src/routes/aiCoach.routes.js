const express = require('express');
const router = express.Router();
const aiCoachController = require('../controllers/aiCoach.controller');
const authMiddleware = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/ai/advice', authMiddleware, aiLimiter, aiCoachController.getAdvice);
router.post('/ai/advice/stream', authMiddleware, aiLimiter, aiCoachController.getAdviceStream);
router.get('/ai/chat-history', authMiddleware, aiLimiter, aiCoachController.getChatHistory);
router.delete('/ai/chat-history', authMiddleware, aiLimiter, aiCoachController.clearChatHistory);

router.post('/ai/form-feedback', authMiddleware, aiCoachController.getFormFeedback);
router.get('/ai/detect-plateau', authMiddleware, aiCoachController.detectPlateau);
router.get('/ai/weight-recommendation', authMiddleware, aiCoachController.getWeightRecommendation);

module.exports = router;
