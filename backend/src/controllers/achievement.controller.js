const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const UserLevel = require('../models/UserLevel');
const MonthlyChallenge = require('../models/MonthlyChallenge');
const UserChallenge = require('../models/UserChallenge');
const WorkoutLog = require('../models/WorkoutLog');
const { checkAchievementsInternal, updateChallengeProgressInternal } = require('../services/achievementService');

const seedBadges = async (req, res) => {
  const existingBadges = await Badge.countDocuments();
  if (existingBadges > 0) {
    return res.json({ message: 'Badges already seeded', count: existingBadges });
  }
  
  const badges = [
    { name: "First Workout", description: "Completed your first workout!", icon: "🎉", category: "milestone", requirement: { type: "workout_count", target: 1 }, points: 50 },
    { name: "10 Workouts", description: "Completed 10 workouts", icon: "💪", category: "consistency", requirement: { type: "workout_count", target: 10 }, points: 100 },
    { name: "50 Workouts", description: "50 workouts completed!", icon: "🏆", category: "consistency", requirement: { type: "workout_count", target: 50 }, points: 250 },
    { name: "100 Workouts", description: "Century club! 100 workouts", icon: "⭐", category: "consistency", requirement: { type: "workout_count", target: 100 }, points: 500 },
    { name: "3 Day Streak", description: "Worked out 3 days in a row", icon: "🔥", category: "consistency", requirement: { type: "streak_days", target: 3 }, points: 75 },
    { name: "7 Day Streak", description: "One week of consistency!", icon: "⚡", category: "consistency", requirement: { type: "streak_days", target: 7 }, points: 150 },
    { name: "14 Day Streak", description: "Two weeks strong!", icon: "🌟", category: "consistency", requirement: { type: "streak_days", target: 14 }, points: 300 },
    { name: "30 Day Streak", description: "Month-long dedication!", icon: "🏅", category: "consistency", requirement: { type: "streak_days", target: 30 }, points: 600 },
    { name: "100kg Bench", description: "Bench pressed 100kg!", icon: "🏋️", category: "strength", requirement: { type: "strength_pr", target: 100, exerciseName: "Bench Press" }, points: 200 },
    { name: "140kg Squat", description: "Squatted 140kg!", icon: "🦵", category: "strength", requirement: { type: "strength_pr", target: 140, exerciseName: "Squat" }, points: 200 },
    { name: "180kg Deadlift", description: "Deadlifted 180kg!", icon: "💪", category: "strength", requirement: { type: "strength_pr", target: 180, exerciseName: "Deadlift" }, points: 200 },
    { name: "10,000kg Club", description: "Lifted 10,000kg total!", icon: "📊", category: "volume", requirement: { type: "volume_total", target: 10000 }, points: 150 },
    { name: "50,000kg Club", description: "Halfway to 100k!", icon: "🚀", category: "volume", requirement: { type: "volume_total", target: 50000 }, points: 350 },
    { name: "100,000kg Club", description: "100,000kg lifted!", icon: "👑", category: "volume", requirement: { type: "volume_total", target: 100000 }, points: 700 }
  ];
  
  await Badge.insertMany(badges);
  res.json({ success: true, message: `Seeded ${badges.length} badges` });
};

const getUserLevel = async (req, res) => {
  let userLevel = await UserLevel.findOne({ userId: req.user._id });
  if (!userLevel) {
    userLevel = new UserLevel({ userId: req.user._id });
    await userLevel.save();
  }
  
  const xpForNextLevel = userLevel.level * 1000;
  const xpProgress = (userLevel.xp / xpForNextLevel) * 100;
  
  res.json({ 
    success: true, 
    level: userLevel.level,
    xp: userLevel.xp,
    totalXp: userLevel.totalXp,
    streakDays: userLevel.streakDays,
    longestStreak: userLevel.longestStreak,
    totalWorkouts: userLevel.totalWorkouts,
    xpForNextLevel,
    xpProgress
  });
};

const getUserBadges = async (req, res) => {
  const userBadges = await UserBadge.find({ userId: req.user._id }).populate('badgeId');
  res.json({ success: true, badges: userBadges.map(ub => ub.badgeId) });
};

const checkAchievements = async (req, res) => {
  const result = await checkAchievementsInternal(req.user._id);
  res.json({ success: true, ...result });
};

const getMonthlyChallenges = async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  let challenges = await MonthlyChallenge.find({ 
    month: currentMonth, 
    year: currentYear,
    isActive: true 
  });
  
  if (challenges.length === 0) {
    const defaultChallenge = new MonthlyChallenge({
      name: `${now.toLocaleString('default', { month: 'long' })} Challenge`,
      description: `Complete 15 workouts this month!`,
      month: currentMonth,
      year: currentYear,
      type: 'workouts',
      target: 15,
      reward: { badgeName: `${now.toLocaleString('default', { month: 'long' })} Warrior`, xpBonus: 500, description: "Monthly challenge champion" }
    });
    await defaultChallenge.save();
    challenges = [defaultChallenge];
  }
  
  const userProgress = await UserChallenge.findOne({ 
    userId: req.user._id, 
    challengeId: challenges[0]._id 
  });
  
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  const monthlyWorkouts = await WorkoutLog.countDocuments({
    userId: req.user._id,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  res.json({ 
    success: true, 
    challenges,
    progress: userProgress?.progress || monthlyWorkouts,
    target: challenges[0].target,
    completed: userProgress?.completed || false
  });
};

const updateChallengeProgress = async (req, res) => {
  const result = await updateChallengeProgressInternal(req.user._id);
  res.json({ success: true, ...result });
};

module.exports = {
  seedBadges,
  getUserLevel,
  getUserBadges,
  checkAchievements,
  getMonthlyChallenges,
  updateChallengeProgress
};
