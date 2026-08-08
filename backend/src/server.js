const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const { validateEnvOnStartup } = require('./config/env.config');

dotenv.config();

// Validate Environment Configuration Fail-Fast
if (process.env.NODE_ENV !== 'test') {
  validateEnvOnStartup();
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

app.use(express.json({ limit: '1mb' }));

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
app.use('/api', require('./routes/workoutPlanner.routes'));
app.use('/api', require('./routes/activeSession.routes'));

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Graceful Shutdown & Process Signal Handling
function shutdownGracefully(signal) {
  console.log(`\n🛑 Signal [${signal}] received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('  └─ HTTP Server closed.');
      try {
        await mongoose.connection.close(false);
        console.log('  └─ MongoDB Connection pool closed.');
        process.exit(0);
      } catch (err) {
        console.error('  └─ Error during DB disconnect:', err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
process.on('SIGINT', () => shutdownGracefully('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message, err.stack);
});

module.exports = app;