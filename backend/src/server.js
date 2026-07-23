const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// Startup Environment Fail-Fast Verification
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`❌ FATAL: Missing mandatory environment variable(s): ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

const app = express();

// Security Middlewares
app.use(helmet());

// Restrict CORS to explicit allowed origins via env
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy restricts access from origin ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json());

// Global Rate Limiting
app.use(globalLimiter);

// Connect Database
connectDB();

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ message: 'FitSphere API Running!' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test successful', timestamp: new Date() });
});

// Domain Routes
app.use('/api', require('./routes/auth.routes'));
app.use('/api', require('./routes/workout.routes'));
app.use('/api', require('./routes/nutrition.routes'));
app.use('/api', require('./routes/social.routes'));
app.use('/api', require('./routes/achievement.routes'));
app.use('/api', require('./routes/aiCoach.routes'));

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;