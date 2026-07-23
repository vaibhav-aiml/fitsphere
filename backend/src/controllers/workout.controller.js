const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutLog = require('../models/WorkoutLog');
const BodyWeight = require('../models/BodyWeight');
const AdvancedWorkoutPlan = require('../models/AdvancedWorkoutPlan');
const { processWorkoutLogAchievements } = require('../services/achievementService');

// Workout Plans
const seedPlans = async (req, res) => {
  const existingPlans = await WorkoutPlan.countDocuments();
  if (existingPlans > 0) {
    return res.json({ message: 'Plans already seeded', count: existingPlans });
  }
  
  const samplePlans = [
    {
      name: "Beginner Bodybuilding",
      goal: "bodybuilding",
      experienceLevel: "beginner",
      description: "Perfect for beginners wanting to build muscle mass",
      durationWeeks: 8,
      weeklySchedule: [],
      tips: ["Stay consistent", "Track your progress", "Eat enough protein"]
    }
  ];
  
  await WorkoutPlan.insertMany(samplePlans);
  res.json({ success: true, message: 'Workout plans seeded successfully!', count: samplePlans.length });
};

const getWorkoutPlans = async (req, res) => {
  const userGoal = req.user.goal;
  const userExperience = req.user.experience;
  
  const plans = await WorkoutPlan.find({
    goal: userGoal,
    experienceLevel: userExperience
  });
  
  res.json({
    success: true,
    goal: userGoal,
    experience: userExperience,
    plans,
    count: plans.length
  });
};

const getAllWorkoutPlans = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await WorkoutPlan.countDocuments();
  const plans = await WorkoutPlan.find().skip(skip).limit(limit);

  res.json({
    success: true,
    plans,
    count: plans.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const getWorkoutPlanById = async (req, res) => {
  const plan = await WorkoutPlan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  res.json({ success: true, plan });
};

const getRecommendations = async (req, res) => {
  const plans = await WorkoutPlan.find({
    goal: req.user.goal,
    experienceLevel: req.user.experience
  });
  
  res.json({
    success: true,
    message: `Recommended ${req.user.goal} workouts for ${req.user.experience}`,
    recommendations: plans,
    userInfo: {
      name: req.user.name,
      goal: req.user.goal,
      experience: req.user.experience
    }
  });
};

// Workout Logs & Progress Tracking
const createWorkoutLog = async (req, res) => {
  const { exerciseName, weight, reps, sets, notes } = req.body;
  
  const workoutLog = new WorkoutLog({
    userId: req.user._id,
    exerciseName,
    weight,
    reps,
    sets,
    notes
  });
  
  await workoutLog.save();
  
  // Direct in-process achievement & streak check (replaces setTimeout + axios self-call)
  processWorkoutLogAchievements(req.user._id);

  res.json({ success: true, message: 'Workout logged successfully!', log: workoutLog });
};

const getWorkoutLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const { exercise } = req.query;

  let query = { userId: req.user._id };
  if (exercise) {
    query.exerciseName = exercise;
  }
  
  const total = await WorkoutLog.countDocuments(query);
  const logs = await WorkoutLog.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({
    success: true,
    logs,
    count: logs.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const getExerciseProgress = async (req, res) => {
  const { exerciseName } = req.params;
  
  const logs = await WorkoutLog.find({
    userId: req.user._id,
    exerciseName
  }).sort({ date: 1 });
  
  const progressData = logs.map(log => ({
    date: log.date,
    weight: log.weight,
    reps: log.reps,
    oneRepMax: log.weight * (1 + log.reps / 30),
    volume: log.weight * log.reps * log.sets
  }));
  
  res.json({ success: true, exercise: exerciseName, progress: progressData });
};

const createBodyWeight = async (req, res) => {
  const { weight } = req.body;
  
  const bodyWeight = new BodyWeight({
    userId: req.user._id,
    weight
  });
  
  await bodyWeight.save();
  res.json({ success: true, message: 'Body weight logged!', data: bodyWeight });
};

const getBodyWeight = async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const weights = await BodyWeight.find({ userId: req.user._id })
    .sort({ date: -1 })
    .limit(limit);
  
  res.json({ success: true, weights });
};

const getStats = async (req, res) => {
  const totalWorkouts = await WorkoutLog.countDocuments({ userId: req.user._id });
  
  const totalVolume = await WorkoutLog.aggregate([
    { $match: { userId: req.user._id } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$weight", "$reps", "$sets"] } } } }
  ]);
  
  const exercises = await WorkoutLog.distinct('exerciseName', { userId: req.user._id });
  
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const workoutsThisWeek = await WorkoutLog.countDocuments({
    userId: req.user._id,
    date: { $gte: lastWeek }
  });
  
  res.json({
    success: true,
    stats: {
      totalWorkouts,
      totalVolume: totalVolume[0]?.total || 0,
      uniqueExercises: exercises.length,
      workoutsThisWeek
    }
  });
};

// Analytics
const get1RMAnalytics = async (req, res) => {
  const { exerciseName } = req.params;
  
  const logs = await WorkoutLog.find({
    userId: req.user._id,
    exerciseName
  }).sort({ date: 1 });
  
  const progression = logs.map(log => ({
    date: log.date,
    weight: log.weight,
    reps: log.reps,
    oneRM: Math.round(log.weight * (1 + log.reps / 30)),
    volume: log.weight * log.reps * log.sets
  }));
  
  res.json({ success: true, exercise: exerciseName, progression });
};

const getVolumeAnalytics = async (req, res) => {
  const logs = await WorkoutLog.find({ userId: req.user._id }).sort({ date: 1 });
  
  const volumeByDate = {};
  logs.forEach(log => {
    const date = log.date.toISOString().split('T')[0];
    const volume = log.weight * log.reps * log.sets;
    volumeByDate[date] = (volumeByDate[date] || 0) + volume;
  });
  
  const volumeData = Object.entries(volumeByDate).map(([date, volume]) => ({
    date,
    volume
  }));
  
  const totalVolume = volumeData.reduce((sum, d) => sum + d.volume, 0);
  
  res.json({
    success: true, 
    volumeData,
    totalVolume,
    totalWorkouts: logs.length
  });
};

const getCaloriesAnalytics = async (req, res) => {
  const logs = await WorkoutLog.find({ userId: req.user._id });
  
  const metValues = {
    'Squat': 6.0, 'Deadlift': 6.0, 'Bench Press': 5.0,
    'Leg Press': 5.0, 'Pull Ups': 6.0, 'Push Ups': 5.0,
    'Running': 8.0, 'Walking': 3.5, 'default': 5.0
  };
  
  const weight = 70;
  
  const caloriesData = logs.map(log => {
    const met = metValues[log.exerciseName] || metValues.default;
    const durationHours = (log.sets * 60 + (log.sets - 1) * 60) / 3600;
    const calories = Math.round(met * weight * durationHours);
    
    return {
      date: log.date,
      exerciseName: log.exerciseName,
      calories,
      volume: log.weight * log.reps * log.sets
    };
  });
  
  const totalCalories = caloriesData.reduce((sum, d) => sum + d.calories, 0);
  
  res.json({
    success: true, 
    caloriesData,
    totalCalories,
    workoutsWithCalories: caloriesData.length
  });
};

const getSummaryAnalytics = async (req, res) => {
  const logs = await WorkoutLog.find({ userId: req.user._id });
  
  const totalVolume = logs.reduce((sum, log) => sum + (log.weight * log.reps * log.sets), 0);
  const uniqueExercises = [...new Set(logs.map(l => l.exerciseName))];
  
  const bestLifts = {};
  logs.forEach(log => {
    const oneRM = Math.round(log.weight * (1 + log.reps / 30));
    if (!bestLifts[log.exerciseName] || oneRM > bestLifts[log.exerciseName]) {
      bestLifts[log.exerciseName] = oneRM;
    }
  });
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentWorkouts = logs.filter(l => l.date >= thirtyDaysAgo).length;
  
  res.json({
    success: true,
    summary: {
      totalWorkouts: logs.length,
      totalVolume,
      uniqueExercises: uniqueExercises.length,
      recentWorkouts,
      bestLifts,
      averageWorkoutVolume: logs.length > 0 ? Math.round(totalVolume / logs.length) : 0
    }
  });
};

// Advanced Workout Plans
const clearAdvancedPlans = async (req, res) => {
  const result = await AdvancedWorkoutPlan.deleteMany({});
  res.json({ success: true, message: `Deleted ${result.deletedCount} advanced plans` });
};

const seedAdvancedPlans = async (req, res) => {
  const existingPlans = await AdvancedWorkoutPlan.countDocuments();
  if (existingPlans > 0) {
    await AdvancedWorkoutPlan.deleteMany({});
  }
  
  const advancedPlans = [
    {
      name: "10-Week Powerlifting Peak",
      type: "powerlifting",
      duration: 10,
      description: "Complete powerlifting program for Squat, Bench, Deadlift",
      difficulty: "intermediate",
      weeklySchedule: [],
      weeklyProgression: [],
      nutrition: { calories: "Maintenance + 300-500", protein: "2.2g per kg", carbs: "4-6g per kg", fats: "0.8-1g per kg", tips: ["Stay hydrated", "Eat enough protein"] },
      recovery: { sleep: "7-9 hours", deloadWeeks: [5], mobilityWork: ["Stretch daily"] }
    },
    {
      name: "10-Week Powerbuilding",
      type: "powerbuilding",
      duration: 10,
      description: "Strength + Hypertrophy combined",
      difficulty: "intermediate",
      weeklySchedule: [],
      weeklyProgression: [],
      nutrition: { calories: "Maintenance + 500-700", protein: "2.2g per kg", carbs: "5-7g per kg", fats: "0.8-1g per kg", tips: ["Pre-workout carbs", "Post-workout protein"] },
      recovery: { sleep: "8+ hours", deloadWeeks: [5], mobilityWork: ["Dynamic warmup", "Foam rolling"] }
    },
    {
      name: "10-Week Bodybuilding Mass",
      type: "bodybuilding",
      duration: 10,
      description: "High volume hypertrophy program",
      difficulty: "intermediate",
      weeklySchedule: [],
      weeklyProgression: [],
      nutrition: { calories: "Maintenance + 500", protein: "2.2-2.5g per kg", carbs: "5-8g per kg", fats: "0.8-1g per kg", tips: ["6-7 meals per day", "Time carbs around workout"] },
      recovery: { sleep: "8+ hours mandatory", deloadWeeks: [5], mobilityWork: ["Full body stretching", "Massage therapy"] }
    }
  ];
  
  await AdvancedWorkoutPlan.insertMany(advancedPlans);
  res.json({ success: true, message: 'Advanced workout plans seeded!', count: advancedPlans.length });
};

const getAdvancedPlans = async (req, res) => {
  const plans = await AdvancedWorkoutPlan.find();
  res.json({ success: true, plans });
};

const getAdvancedPlanByType = async (req, res) => {
  const { type } = req.params;
  const plan = await AdvancedWorkoutPlan.findOne({ type });
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  res.json({ success: true, plan });
};

module.exports = {
  seedPlans,
  getWorkoutPlans,
  getAllWorkoutPlans,
  getWorkoutPlanById,
  getRecommendations,
  createWorkoutLog,
  getWorkoutLogs,
  getExerciseProgress,
  createBodyWeight,
  getBodyWeight,
  getStats,
  get1RMAnalytics,
  getVolumeAnalytics,
  getCaloriesAnalytics,
  getSummaryAnalytics,
  clearAdvancedPlans,
  seedAdvancedPlans,
  getAdvancedPlans,
  getAdvancedPlanByType
};
