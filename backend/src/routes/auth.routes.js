const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('goal').isIn(['powerlifting', 'bodybuilding', 'fatloss']).withMessage('Goal must be powerlifting, bodybuilding, or fatloss'),
  body('experience').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid experience level'),
  validate
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/auth/google', authLimiter, authController.googleAuth);
router.get('/profile', authMiddleware, authController.getProfile);
router.get('/users', authMiddleware, authController.getUsers);

module.exports = router;
