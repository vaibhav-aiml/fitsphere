const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 2000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login/registration attempts from this IP. Please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 300 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a few minutes before asking more questions.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 50 : 10, // Stricter limit for admin metrics
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin metric requests. Rate limit exceeded.' }
});

module.exports = {
  globalLimiter,
  authLimiter,
  aiLimiter,
  adminLimiter,
};
