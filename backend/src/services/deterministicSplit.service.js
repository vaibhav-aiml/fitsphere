/**
 * Deterministically selects the optimal workout split structure based on user inputs.
 */
function getDeterministicSplit(daysPerWeek, goal, experience) {
  const days = parseInt(daysPerWeek, 10) || 4;
  const g = (goal || 'hypertrophy').toLowerCase();

  if (days >= 6) {
    return {
      splitName: 'Push Pull Legs (PPL) x2',
      pattern: ['Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs (Quads/Hamstrings/Calves)', 'Push', 'Pull', 'Legs']
    };
  }

  if (days === 5) {
    return {
      splitName: 'Upper / Lower + Weak Point Focus',
      pattern: ['Upper Body Power', 'Lower Body Power', 'Push Focus', 'Pull Focus', 'Legs & Core']
    };
  }

  if (days === 4) {
    return {
      splitName: 'Upper / Lower Split',
      pattern: ['Upper Body A', 'Lower Body A', 'Upper Body B', 'Lower Body B']
    };
  }

  if (days === 3) {
    return {
      splitName: 'Full Body 3x Weekly',
      pattern: ['Full Body A (Squat Focus)', 'Full Body B (Bench Focus)', 'Full Body C (Deadlift Focus)']
    };
  }

  return {
    splitName: 'Full Body Express',
    pattern: ['Full Body Workout A', 'Full Body Workout B']
  };
}

module.exports = {
  getDeterministicSplit,
};
