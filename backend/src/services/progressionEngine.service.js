/**
 * Deterministic Progression Engine
 * Applies exact numerical progression rules to workout plans based on log data & plateaus.
 */
function calculateOverloadAdjustment({ exerciseName, currentWeight, currentReps, targetRepsUpper, completedAllSets, plateauDetected }) {
  if (plateauDetected) {
    return {
      action: 'deload',
      recommendedWeight: Math.round(currentWeight * 0.85),
      note: `Plateau detected on ${exerciseName}. Reduce weight to ${Math.round(currentWeight * 0.85)}kg for a 1-week deload block.`,
    };
  }

  if (completedAllSets && currentReps >= targetRepsUpper) {
    const increment = currentWeight >= 100 ? 5 : 2.5;
    return {
      action: 'increase_weight',
      recommendedWeight: currentWeight + increment,
      note: `Crushed all target reps on ${exerciseName}! Increase weight from ${currentWeight}kg to ${currentWeight + increment}kg.`,
    };
  }

  return {
    action: 'maintain',
    recommendedWeight: currentWeight,
    note: `Maintain ${currentWeight}kg on ${exerciseName} until upper rep range is completed cleanly.`,
  };
}

module.exports = {
  calculateOverloadAdjustment,
};
