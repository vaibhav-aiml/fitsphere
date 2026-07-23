const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const authMiddleware = require('../middleware/auth');

router.post('/posts', authMiddleware, socialController.createPost);
router.get('/feed', authMiddleware, socialController.getFeed);
router.post('/posts/:postId/like', authMiddleware, socialController.toggleLikePost);
router.post('/share-workout', authMiddleware, socialController.shareWorkout);

module.exports = router;
