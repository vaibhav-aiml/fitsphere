// Feature Flags Service for Controlled SaaS Rollouts
const featureFlags = {
  AI_EXPLANATION: process.env.FF_AI_EXPLANATION !== 'false',
  RECOVERY_SCORE: process.env.FF_RECOVERY_SCORE !== 'false',
  CSV_EXPORT: process.env.FF_CSV_EXPORT !== 'false',
  PROMETHEUS_METRICS: process.env.FF_PROMETHEUS_METRICS !== 'false',
  DETERMINISTIC_CACHE: process.env.FF_DETERMINISTIC_CACHE !== 'false',
  STRICT_PAGINATION: process.env.FF_STRICT_PAGINATION !== 'false',
  EVENT_DRIVEN_AUDIT: process.env.FF_EVENT_DRIVEN_AUDIT !== 'false',
};

function isFeatureEnabled(flagName) {
  return featureFlags[flagName] ?? true;
}

module.exports = {
  featureFlags,
  isFeatureEnabled,
};
