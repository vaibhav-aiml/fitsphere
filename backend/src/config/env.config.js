/**
 * Startup Environment Variable Validation Service
 * Ensures application fails fast on startup if critical secrets or variables are missing.
 */
function validateEnvOnStartup() {
  const requiredVars = [
    { name: 'PORT', defaultVal: '5000' },
    { name: 'GROQ_API_KEY', secret: true },
    { name: 'JWT_SECRET', secret: true },
  ];

  const missing = [];

  requiredVars.forEach(v => {
    if (!process.env[v.name] && !v.defaultVal) {
      missing.push(v.name);
    } else if (!process.env[v.name] && v.defaultVal) {
      process.env[v.name] = v.defaultVal;
    }
  });

  if (missing.length > 0) {
    console.error(`❌ FATAL: Missing mandatory environment variables: ${missing.join(', ')}`);
    console.error('Please configure your backend/.env file before starting the application.');
    process.exit(1);
  }

  console.log('✅ Environment configuration validated successfully.');
}

module.exports = {
  validateEnvOnStartup,
};
