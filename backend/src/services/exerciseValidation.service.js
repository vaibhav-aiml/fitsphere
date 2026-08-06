// Master Enriched Exercise Library for Validation, Fuzzy Mapping & Analytics
const MASTER_EXERCISE_DATABASE = [
  { name: 'Barbell Bench Press', category: 'Chest', movementPattern: 'Horizontal Push', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Front Delts'], equipment: 'Barbell' },
  { name: 'Incline Dumbbell Press', category: 'Chest', movementPattern: 'Incline Push', primaryMuscle: 'Upper Chest', secondaryMuscles: ['Front Delts', 'Triceps'], equipment: 'Dumbbells' },
  { name: 'Dumbbell Flyes', category: 'Chest', movementPattern: 'Chest Fly', primaryMuscle: 'Chest', secondaryMuscles: ['Front Delts'], equipment: 'Dumbbells' },
  { name: 'Chest Dips', category: 'Chest', movementPattern: 'Vertical Push', primaryMuscle: 'Lower Chest', secondaryMuscles: ['Triceps'], equipment: 'Bodyweight' },
  { name: 'Push-ups', category: 'Chest', movementPattern: 'Horizontal Push', primaryMuscle: 'Chest', secondaryMuscles: ['Triceps', 'Core'], equipment: 'Bodyweight' },
  
  { name: 'Barbell Squat', category: 'Legs', movementPattern: 'Squat', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes', 'Lower Back'], equipment: 'Barbell' },
  { name: 'Leg Press', category: 'Legs', movementPattern: 'Squat', primaryMuscle: 'Quads', secondaryMuscles: ['Glutes'], equipment: 'Machine' },
  { name: 'Romanian Deadlift', category: 'Legs', movementPattern: 'Hinge', primaryMuscle: 'Hamstrings', secondaryMuscles: ['Glutes', 'Lower Back'], equipment: 'Barbell' },
  { name: 'Leg Extensions', category: 'Legs', movementPattern: 'Leg Extension', primaryMuscle: 'Quads', secondaryMuscles: [], equipment: 'Machine' },
  { name: 'Hamstring Curls', category: 'Legs', movementPattern: 'Leg Curl', primaryMuscle: 'Hamstrings', secondaryMuscles: [], equipment: 'Machine' },
  { name: 'Calf Raises', category: 'Legs', movementPattern: 'Calf Raise', primaryMuscle: 'Calves', secondaryMuscles: [], equipment: 'Machine' },
  
  { name: 'Barbell Deadlift', category: 'Back', movementPattern: 'Hinge', primaryMuscle: 'Posterior Chain', secondaryMuscles: ['Hamstrings', 'Lats', 'Traps'], equipment: 'Barbell' },
  { name: 'Pull-ups', category: 'Back', movementPattern: 'Vertical Pull', primaryMuscle: 'Lats', secondaryMuscles: ['Biceps', 'Rear Delts'], equipment: 'Bodyweight' },
  { name: 'Lat Pulldown', category: 'Back', movementPattern: 'Vertical Pull', primaryMuscle: 'Lats', secondaryMuscles: ['Biceps'], equipment: 'Cable' },
  { name: 'Bent-Over Barbell Row', category: 'Back', movementPattern: 'Horizontal Pull', primaryMuscle: 'Upper Back', secondaryMuscles: ['Lats', 'Biceps'], equipment: 'Barbell' },
  { name: 'Seated Cable Row', category: 'Back', movementPattern: 'Horizontal Pull', primaryMuscle: 'Upper Back', secondaryMuscles: ['Lats', 'Biceps'], equipment: 'Cable' },
  
  { name: 'Overhead Press', category: 'Shoulders', movementPattern: 'Vertical Push', primaryMuscle: 'Front Delts', secondaryMuscles: ['Triceps'], equipment: 'Barbell' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', movementPattern: 'Vertical Push', primaryMuscle: 'Front Delts', secondaryMuscles: ['Triceps'], equipment: 'Dumbbells' },
  { name: 'Lateral Raises', category: 'Shoulders', movementPattern: 'Lateral Raise', primaryMuscle: 'Side Delts', secondaryMuscles: [], equipment: 'Dumbbells' },
  { name: 'Rear Delt Flyes', category: 'Shoulders', movementPattern: 'Rear Fly', primaryMuscle: 'Rear Delts', secondaryMuscles: ['Traps'], equipment: 'Dumbbells' },
  { name: 'Face Pulls', category: 'Shoulders', movementPattern: 'Face Pull', primaryMuscle: 'Rear Delts', secondaryMuscles: ['Rotator Cuff'], equipment: 'Cable' },
  
  { name: 'Barbell Bicep Curl', category: 'Arms', movementPattern: 'Bicep Curl', primaryMuscle: 'Biceps', secondaryMuscles: ['Forearms'], equipment: 'Barbell' },
  { name: 'Hammer Curls', category: 'Arms', movementPattern: 'Bicep Curl', primaryMuscle: 'Brachialis', secondaryMuscles: ['Biceps'], equipment: 'Dumbbells' },
  { name: 'Tricep Rope Pushdown', category: 'Arms', movementPattern: 'Tricep Extension', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Cable' },
  { name: 'Skullcrushers', category: 'Arms', movementPattern: 'Tricep Extension', primaryMuscle: 'Triceps', secondaryMuscles: [], equipment: 'Barbell' },
];

const STANDARD_EXERCISES = MASTER_EXERCISE_DATABASE.map(e => e.name);

// In-Memory Explanation Cache
const explanationCache = new Map();

/**
 * Validates and maps exercise names against the master exercise database with metadata.
 */
function validateAndMapExercise(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    const fallback = MASTER_EXERCISE_DATABASE[0];
    return { name: fallback.name, metadata: fallback, mapped: true };
  }

  const cleanName = rawName.trim();
  const lower = cleanName.toLowerCase();

  const exact = MASTER_EXERCISE_DATABASE.find(ex => ex.name.toLowerCase() === lower);
  if (exact) return { name: exact.name, metadata: exact, mapped: false };

  for (const ex of MASTER_EXERCISE_DATABASE) {
    const exLower = ex.name.toLowerCase();
    const words = lower.split(/\s+/);
    if (words.some(w => w.length > 3 && exLower.includes(w))) {
      return { name: ex.name, metadata: ex, mapped: true, original: cleanName };
    }
  }

  const defaultMeta = {
    name: cleanName,
    category: 'General',
    movementPattern: 'Compound',
    primaryMuscle: 'General',
    secondaryMuscles: [],
    equipment: 'Free Weight'
  };

  return { name: cleanName, metadata: defaultMeta, mapped: false };
}

/**
 * Generates a cached deterministic biomechanical explanation for an exercise.
 */
function generateDeterministicExplanation(exerciseName, goal) {
  const cacheKey = `${exerciseName.toLowerCase()}:${goal || 'hypertrophy'}`;
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey);
  }

  const mapping = validateAndMapExercise(exerciseName);
  const meta = mapping.metadata;

  const explanation = `### 💡 Biomechanical Analysis: ${meta.name}
- **Primary Target**: ${meta.primaryMuscle}
- **Secondary Synergists**: ${meta.secondaryMuscles.join(', ') || 'Stabilizers'}
- **Movement Pattern**: ${meta.movementPattern}
- **Equipment Type**: ${meta.equipment}
- **Coaching Justification**: Highly efficient ${meta.movementPattern.toLowerCase()} selection for ${goal || 'hypertrophy'}. Provides high mechanical tension with excellent progressive overload potential.`;

  explanationCache.set(cacheKey, explanation);
  return explanation;
}

module.exports = {
  MASTER_EXERCISE_DATABASE,
  STANDARD_EXERCISES,
  validateAndMapExercise,
  generateDeterministicExplanation,
};
