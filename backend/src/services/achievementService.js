const UserLevel = require('../models/UserLevel');
const WorkoutLog = require('../models/WorkoutLog');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const MonthlyChallenge = require('../models/MonthlyChallenge');
const UserChallenge = require('../models/UserChallenge');

/**
 * In-process achievement & streak update logic after a workout is logged.
 * Replaces the setTimeout + axios HTTP self-call pattern.
 */
const checkAchievementsInternal = async (userId) => {
  let userLevel = await UserLevel.findOne({ userId });
  if (!userLevel) {
    userLevel = new UserLevel({ userId });
    await userLevel.save();
  }
  
  const workoutCount = await WorkoutLog.countDocuments({ userId });
  userLevel.totalWorkouts = workoutCount;
  
  const volumeResult = await WorkoutLog.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$weight", "$reps", "$sets"] } } } }
  ]);
  const totalVolume = volumeResult[0]?.total || 0;
  userLevel.totalVolume = totalVolume;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (userLevel.lastWorkoutDate) {
    const lastDate = new Date(userLevel.lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      userLevel.streakDays += 1;
    } else if (diffDays > 1) {
      userLevel.streakDays = 1;
    }
  } else {
    userLevel.streakDays = 1;
  }
  
  if (userLevel.streakDays > userLevel.longestStreak) {
    userLevel.longestStreak = userLevel.streakDays;
  }
  userLevel.lastWorkoutDate = today;
  
  const xpGain = 10;
  userLevel.xp += xpGain;
  userLevel.totalXp += xpGain;
  
  let leveledUp = false;
  while (userLevel.xp >= userLevel.level * 1000) {
    userLevel.xp -= userLevel.level * 1000;
    userLevel.level += 1;
    leveledUp = true;
  }
  
  await userLevel.save();
  
  const allBadges = await Badge.find();
  const earnedBadges = await UserBadge.find({ userId }).distinct('badgeId');
  const newBadges = [];
  
  for (const badge of allBadges) {
    if (earnedBadges.some(id => id.toString() === badge._id.toString())) continue;
    
    let earned = false;
    if (badge.requirement.type === 'workout_count' && workoutCount >= badge.requirement.target) {
      earned = true;
    } else if (badge.requirement.type === 'strength_pr' && badge.requirement.exerciseName) {
      const exerciseLogs = await WorkoutLog.find({ 
        userId, 
        exerciseName: badge.requirement.exerciseName 
      }).sort({ weight: -1 }).limit(1);
      const maxWeight = exerciseLogs[0]?.weight || 0;
      if (maxWeight >= badge.requirement.target) earned = true;
    } else if (badge.requirement.type === 'volume_total' && totalVolume >= badge.requirement.target) {
      earned = true;
    } else if (badge.requirement.type === 'streak_days' && userLevel.streakDays >= badge.requirement.target) {
      earned = true;
    }
    
    if (earned) {
      await UserBadge.create({ userId, badgeId: badge._id });
      newBadges.push(badge);
      userLevel.xp += badge.points;
      userLevel.totalXp += badge.points;
    }
  }
  
  if (newBadges.length > 0) {
    await userLevel.save();
  }
  
  return { leveledUp, newBadges, newLevel: userLevel.level, xpGain, currentStreak: userLevel.streakDays };
};

const updateChallengeProgressInternal = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const challenge = await MonthlyChallenge.findOne({ month: currentMonth, year: currentYear });
  if (!challenge) return { success: true };
  
  let userChallenge = await UserChallenge.findOne({ userId, challengeId: challenge._id });
  if (!userChallenge) {
    userChallenge = new UserChallenge({ userId, challengeId: challenge._id });
  }
  
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0);
  const monthlyWorkouts = await WorkoutLog.countDocuments({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  
  userChallenge.progress = monthlyWorkouts;
  
  if (!userChallenge.completed && monthlyWorkouts >= challenge.target) {
    userChallenge.completed = true;
    userChallenge.completedAt = new Date();
    
    const userLevel = await UserLevel.findOne({ userId });
    if (userLevel) {
      userLevel.xp += challenge.reward.xpBonus;
      userLevel.totalXp += challenge.reward.xpBonus;
      await userLevel.save();
    }
  }
  
  await userChallenge.save();
  return { progress: userChallenge.progress, completed: userChallenge.completed };
};

const processWorkoutLogAchievements = async (userId) => {
  try {
    await checkAchievementsInternal(userId);
    await updateChallengeProgressInternal(userId);
  } catch (err) {
    console.error('In-process achievement processing error:', err.message);
  }
};

module.exports = {
  checkAchievementsInternal,
  updateChallengeProgressInternal,
  processWorkoutLogAchievements
};
