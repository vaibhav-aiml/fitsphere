/**
 * Calculates a composite Recovery Score (0-100) based on user metrics & recent workout logs.
 */
function calculateRecoveryScore({ avgSleepHours = 7.5, avgRpe = 8, completionRate = 90, skippedCount = 0 }) {
  let score = 85; // Base score

  // Sleep adjustment (+/- 15 points)
  if (avgSleepHours >= 8) score += 10;
  else if (avgSleepHours >= 7) score += 5;
  else if (avgSleepHours < 6) score -= 15;
  else if (avgSleepHours < 7) score -= 8;

  // RPE adjustment
  if (avgRpe > 9) score -= 10;
  else if (avgRpe <= 7.5) score += 5;

  // Completion rate & skipped workouts
  if (completionRate > 90) score += 5;
  if (skippedCount > 3) score -= 10;

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let status = 'Optimal';
  if (finalScore < 60) status = 'Severe Fatigue';
  else if (finalScore < 75) status = 'Moderate Fatigue';

  return {
    score: finalScore,
    status,
    avgSleepHours,
    avgRpe,
    recommendation: finalScore < 65 ? 'Consider a planned deload week or reducing accessory set volume.' : 'Recovery is on target! Keep pushing progressive overload.'
  };
}

module.exports = {
  calculateRecoveryScore,
};
