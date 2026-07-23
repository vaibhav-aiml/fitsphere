const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const authMiddleware = require('../middleware/auth');

router.post('/seed-badges', authMiddleware, achievementController.seedBadges);
router.get('/user-level', authMiddleware, achievementController.getUserLevel);
router.get('/user-badges', authMiddleware, achievementController.getUserBadges);
router.post('/check-achievements', authMiddleware, achievementController.checkAchievements);
router.get('/monthly-challenges', authMiddleware, achievementController.getMonthlyChallenges);
router.post('/update-challenge-progress', authMiddleware, achievementController.updateChallengeProgress);

module.exports = router;
