let logger;
try {
  logger = require('pino')();
} catch (e) {
  logger = console;
}

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  // Structured logging internally
  if (logger.error) {
    logger.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      statusCode
    }, 'Unhandled error occurred');
  } else {
    console.error('Unhandled Error:', err);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    error: isProduction && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
