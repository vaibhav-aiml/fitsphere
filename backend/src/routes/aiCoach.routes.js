const express = require('express');
const router = express.Router();
const aiCoachController = require('../controllers/aiCoach.controller');
const authMiddleware = require('../middleware/auth');

router.post('/ai/advice', authMiddleware, aiCoachController.getAdvice);
router.post('/ai/form-feedback', authMiddleware, aiCoachController.getFormFeedback);
router.get('/ai/detect-plateau', authMiddleware, aiCoachController.detectPlateau);
router.get('/ai/weight-recommendation', authMiddleware, aiCoachController.getWeightRecommendation);

module.exports = router;
