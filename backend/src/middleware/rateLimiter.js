const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 2000 : 1000, // Higher limits in dev mode for React Strict Mode / hot reload
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 20, // Limit each IP per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login/registration attempts from this IP. Please try again after 15 minutes.' }
});

module.exports = {
  globalLimiter,
  authLimiter
};
