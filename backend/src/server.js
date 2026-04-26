const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Connecting to MongoDB...');

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fitsphere')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// ============ USER SCHEMA ============
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  goal: { type: String, enum: ['powerlifting', 'bodybuilding', 'fatloss'], required: true },
  experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ============ WORKOUT PLAN SCHEMA ============
const workoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  goal: { type: String, enum: ['powerlifting', 'bodybuilding', 'fatloss'], required: true },
  experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  description: { type: String, required: true },
  durationWeeks: { type: Number, required: true },
  weeklySchedule: [{
    day: Number,
    dayName: String,
    focus: String,
    exercises: [{
      name: String,
      sets: Number,
      reps: String,
      restSeconds: Number,
      notes: String
    }]
  }],
  tips: [String],
  createdAt: { type: Date, default: Date.now }
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

// ============ WORKOUT LOG SCHEMA ============
const workoutLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseName: { type: String, required: true },
  weight: { type: Number, required: true },
  reps: { type: Number, required: true },
  sets: { type: Number, required: true },
  notes: { type: String },
  date: { type: Date, default: Date.now }
});

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

// ============ BODY WEIGHT SCHEMA ============
const bodyWeightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const BodyWeight = mongoose.model('BodyWeight', bodyWeightSchema);

// ============ ADVANCED WORKOUT PLAN SCHEMA ============
const advancedWorkoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['powerlifting', 'powerbuilding', 'bodybuilding'], required: true },
  duration: { type: Number, default: 10 },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  weeklySchedule: [{
    week: Number,
    days: [{
      dayNumber: Number,
      dayName: String,
      focus: String,
      exercises: [{
        name: String,
        category: { type: String, enum: ['main', 'secondary', 'accessory', 'conditioning'] },
        warmupSets: [{
          percentage: Number,
          reps: Number,
          rpe: Number,
          notes: String
        }],
        workingSets: [{
          percentage: Number,
          reps: Number,
          rpe: Number,
          notes: String
        }],
        targetReps: String,
        restSeconds: Number,
        tempo: String,
        notes: String,
        videoUrl: String,
        formTips: [String]
      }]
    }]
  }],
  weeklyProgression: [{
    week: Number,
    focus: String,
    intensityIncrease: Number,
    volumeIncrease: Number
  }],
  nutrition: {
    calories: String,
    protein: String,
    carbs: String,
    fats: String,
    tips: [String]
  },
  recovery: {
    sleep: String,
    deloadWeeks: [Number],
    mobilityWork: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

const AdvancedWorkoutPlan = mongoose.model('AdvancedWorkoutPlan', advancedWorkoutPlanSchema);

// ============ JWT MIDDLEWARE ============
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============ PUBLIC ENDPOINTS ============

app.get('/', (req, res) => {
  res.json({ message: 'FitSphere API Running!' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test successful', timestamp: new Date() });
});

app.post('/api/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    
    const { name, email, password, goal, experience } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      goal,
      experience
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('User created successfully:', user.email);
    
    res.json({ 
      success: true, 
      message: 'User created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        experience: user.experience
      }
    });
  } catch(error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        experience: user.experience
      }
    });
  } catch(error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GOOGLE AUTH ENDPOINT ============
app.post('/api/auth/google', async (req, res) => {
  try {
    const { name, email, image } = req.body;
    
    console.log('Google auth request for:', email);
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email: email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        goal: 'bodybuilding',
        experience: 'beginner'
      });
      await user.save();
      console.log('New user created via Google:', email);
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        experience: user.experience
      }
    });
  } catch(error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ PROTECTED ENDPOINTS ============

app.get('/api/profile', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users, count: users.length });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WORKOUT PLAN ENDPOINTS ============

app.post('/api/seed-plans', authMiddleware, async (req, res) => {
  try {
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workout-plans', authMiddleware, async (req, res) => {
  try {
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
      plans: plans,
      count: plans.length
    });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/all-workout-plans', authMiddleware, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find();
    res.json({ success: true, plans, count: plans.length });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workout-plans/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ success: true, plan });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recommendations', authMiddleware, async (req, res) => {
  try {
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROGRESS TRACKING ENDPOINTS ============

app.post('/api/workout-logs', authMiddleware, async (req, res) => {
  try {
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
    // After saving workout log, trigger achievement check
setTimeout(async () => {
  try {
    await axios.post(`http://localhost:5000/api/check-achievements`, {}, {
      headers: { Authorization: req.headers.authorization }
    });
    await axios.post(`http://localhost:5000/api/update-challenge-progress`, {}, {
      headers: { Authorization: req.headers.authorization }
    });
  } catch(e) { console.log('Achievement check error:', e.message); }
}, 100);
    res.json({ success: true, message: 'Workout logged successfully!', log: workoutLog });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workout-logs', authMiddleware, async (req, res) => {
  try {
    const { exercise, limit = 50 } = req.query;
    let query = { userId: req.user._id };
    
    if (exercise) {
      query.exerciseName = exercise;
    }
    
    const logs = await WorkoutLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, logs, count: logs.length });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/progress/:exerciseName', authMiddleware, async (req, res) => {
  try {
    const { exerciseName } = req.params;
    
    const logs = await WorkoutLog.find({
      userId: req.user._id,
      exerciseName: exerciseName
    }).sort({ date: 1 });
    
    const progressData = logs.map(log => ({
      date: log.date,
      weight: log.weight,
      reps: log.reps,
      oneRepMax: log.weight * (1 + log.reps / 30),
      volume: log.weight * log.reps * log.sets
    }));
    
    res.json({ success: true, exercise: exerciseName, progress: progressData });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/body-weight', authMiddleware, async (req, res) => {
  try {
    const { weight } = req.body;
    
    const bodyWeight = new BodyWeight({
      userId: req.user._id,
      weight
    });
    
    await bodyWeight.save();
    res.json({ success: true, message: 'Body weight logged!', data: bodyWeight });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/body-weight', authMiddleware, async (req, res) => {
  try {
    const weights = await BodyWeight.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    
    res.json({ success: true, weights });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADVANCED ANALYTICS ENDPOINTS ============

app.get('/api/analytics/1rm/:exerciseName', authMiddleware, async (req, res) => {
  try {
    const { exerciseName } = req.params;
    
    const logs = await WorkoutLog.find({
      userId: req.user._id,
      exerciseName: exerciseName
    }).sort({ date: 1 });
    
    const progression = logs.map(log => ({
      date: log.date,
      weight: log.weight,
      reps: log.reps,
      oneRM: Math.round(log.weight * (1 + log.reps / 30)),
      volume: log.weight * log.reps * log.sets
    }));
    
    res.json({ success: true, exercise: exerciseName, progression });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/volume', authMiddleware, async (req, res) => {
  try {
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/calories', authMiddleware, async (req, res) => {
  try {
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
        calories: calories,
        volume: log.weight * log.reps * log.sets
      };
    });
    
    const totalCalories = caloriesData.reduce((sum, d) => sum + d.calories, 0);
    
    res.json({ 
      success: true, 
      caloriesData: caloriesData,
      totalCalories: totalCalories,
      workoutsWithCalories: caloriesData.length
    });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/summary', authMiddleware, async (req, res) => {
  try {
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
        totalVolume: totalVolume,
        uniqueExercises: uniqueExercises.length,
        recentWorkouts: recentWorkouts,
        bestLifts: bestLifts,
        averageWorkoutVolume: logs.length > 0 ? Math.round(totalVolume / logs.length) : 0
      }
    });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADVANCED WORKOUT PLANS ENDPOINTS ============

app.delete('/api/clear-advanced-plans', authMiddleware, async (req, res) => {
  try {
    const result = await AdvancedWorkoutPlan.deleteMany({});
    res.json({ success: true, message: `Deleted ${result.deletedCount} advanced plans` });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seed-advanced-plans', authMiddleware, async (req, res) => {
  try {
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/advanced-plans', authMiddleware, async (req, res) => {
  try {
    const plans = await AdvancedWorkoutPlan.find();
    res.json({ success: true, plans });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/advanced-plans/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const plan = await AdvancedWorkoutPlan.findOne({ type });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ success: true, plan });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SOCIAL FEATURES ============

const workoutPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  privacy: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  createdAt: { type: Date, default: Date.now }
});

const WorkoutPost = mongoose.model('WorkoutPost', workoutPostSchema);

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { content, privacy } = req.body;
    const post = new WorkoutPost({ userId: req.user._id, content, privacy: privacy || 'public' });
    await post.save();
    res.json({ success: true, post });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/feed', authMiddleware, async (req, res) => {
  try {
    const posts = await WorkoutPost.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, posts });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:postId/like', authMiddleware, async (req, res) => {
  try {
    const post = await WorkoutPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json({ success: true, likesCount: post.likes.length });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/share-workout', authMiddleware, async (req, res) => {
  try {
    const { workoutId } = req.body;
    const workout = await WorkoutLog.findById(workoutId);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    
    const shareMessage = `💪 Just crushed my workout! ${workout.exerciseName}: ${workout.weight}kg x ${workout.reps} reps x ${workout.sets} sets! #FitSphere #Fitness`;
    const post = new WorkoutPost({ userId: req.user._id, content: shareMessage, privacy: 'public' });
    await post.save();
    res.json({ success: true, shareText: shareMessage, post });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AI COACH ENDPOINTS ============

app.post('/api/ai/advice', authMiddleware, async (req, res) => {
  try {
    const { question } = req.body;
    const recentWorkouts = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(10);
    let recentVolume = 0;
    recentWorkouts.forEach(w => { recentVolume += w.weight * w.reps * w.sets; });
    
    let response = "💪 I'm your AI Coach! Ask me about plateau, form, weight progression, or recovery!";
    const q = question.toLowerCase();
    
    if (q.includes('plateau')) response = "🎯 PLATEAU HELP: Change rep ranges (15-20 reps), add variations, take a deload week (50% weight), increase protein to 2.2g/kg, get 7-8 hours sleep.";
    else if (q.includes('form')) response = "🧠 FORM TIPS: Control the negative (2-3 sec), focus on mind-muscle connection, keep core braced, use full range of motion.";
    else if (q.includes('weight')) response = "⚡ WEIGHT PROGRESSION: Add 2.5-5kg when you hit all target reps for 2 sessions. If you miss reps, stay at same weight.";
    else if (q.includes('recovery')) response = "😴 RECOVERY TIPS: Sleep 7-9 hours, eat protein within 30 min post-workout, drink 3-4L water daily, take 1-2 rest days per week.";
    else if (q.includes('motivation')) response = "🔥 STAY MOTIVATED: Set small weekly goals, share workouts on Social Feed, celebrate small wins, find a workout buddy!";
    
    res.json({ success: true, response, userContext: { recentWorkouts: recentWorkouts.length, recentVolume } });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/form-feedback', authMiddleware, async (req, res) => {
  try {
    const { notes, exerciseName } = req.body;
    let feedback = "✅ Good form awareness! Keep focusing on quality reps.";
    let tips = ["Watch demo videos", "Control the eccentric", "Breathe properly"];
    
    const n = notes.toLowerCase();
    if (n.includes('back') && n.includes('pain')) { feedback = "⚠️ Lower Back Pain Detected!"; tips = ["Brace your core", "Keep spine neutral", "Reduce weight"]; }
    else if (n.includes('knee') && n.includes('pain')) { feedback = "⚠️ Knee Pain Detected!"; tips = ["Knees track over toes", "Don't let knees cave in", "Try box squats"]; }
    else if (n.includes('shoulder') && n.includes('pain')) { feedback = "⚠️ Shoulder Pain Detected!"; tips = ["Keep elbows at 45°", "Add face pulls", "Strengthen rear delts"]; }
    
    res.json({ success: true, feedback, tips, exercise: exerciseName });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ai/detect-plateau', authMiddleware, async (req, res) => {
  try {
    const workouts = await WorkoutLog.find({ userId: req.user._id }).sort({ date: -1 }).limit(20);
    if (workouts.length < 3) {
      return res.json({ success: true, plateauDetected: false, message: `📊 Not enough data yet! (${workouts.length} workouts logged)`, suggestions: ["Log more workouts", "Track consistently"] });
    }
    
    const exerciseGroups = {};
    workouts.forEach(w => {
      if (!exerciseGroups[w.exerciseName]) exerciseGroups[w.exerciseName] = [];
      exerciseGroups[w.exerciseName].push({ date: w.date, oneRM: w.weight * (1 + w.reps / 30) });
    });
    
    let plateauDetected = false, message = "", suggestions = [];
    for (const [exName, exWorkouts] of Object.entries(exerciseGroups)) {
      if (exWorkouts.length >= 3) {
        const sorted = exWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const last3 = sorted.slice(-3);
        const first3 = sorted.slice(0, 3);
        const avgLast3 = last3.reduce((s, w) => s + w.oneRM, 0) / last3.length;
        const avgFirst3 = first3.reduce((s, w) => s + w.oneRM, 0) / first3.length;
        const improvement = ((avgLast3 - avgFirst3) / avgFirst3) * 100;
        
        if (improvement < 2 && improvement > -2) {
          plateauDetected = true;
          message = `⚠️ PLATEAU DETECTED in ${exName}!`;
          suggestions = ["Change rep ranges", "Add exercise variations", "Take a deload week", "Increase calories by 200-300"];
          break;
        } else if (improvement < 5) {
          message = `📈 Slow progress in ${exName} (${improvement.toFixed(1)}% improvement)`;
          suggestions = ["Add 2.5kg to sets", "Get 1-2 more reps", "Ensure proper recovery"];
        } else {
          message = `🎉 Great progress in ${exName}! ${improvement.toFixed(1)}% improvement!`;
          suggestions = ["Continue progressive overload", "You're on the right track!"];
        }
      }
    }
    
    if (!plateauDetected && !message) message = "📊 No plateaus detected! Keep up the great work! 💪";
    res.json({ success: true, plateauDetected, message, suggestions });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ai/weight-recommendation', authMiddleware, async (req, res) => {
  try {
    const { exerciseName } = req.query;
    const workouts = await WorkoutLog.find({ userId: req.user._id, exerciseName }).sort({ date: -1 }).limit(5);
    
    if (workouts.length === 0) {
      return res.json({ success: true, recommendedWeight: null, message: "No previous workouts. Start with light weight!" });
    }
    
    const lastWorkout = workouts[0];
    let recommendedWeight = lastWorkout.weight;
    let adjustmentReason = "";
    
    if (lastWorkout.reps >= 12) { recommendedWeight = Math.round(lastWorkout.weight * 1.05); adjustmentReason = "You crushed it! Time to increase weight."; }
    else if (lastWorkout.reps <= 6) { recommendedWeight = lastWorkout.weight; adjustmentReason = "Stay at this weight and focus on form."; }
    else { recommendedWeight = lastWorkout.weight; adjustmentReason = "Try to get more reps before increasing weight."; }
    
    res.json({ success: true, exercise: exerciseName, lastWorkout: { weight: lastWorkout.weight, reps: lastWorkout.reps }, recommendedWeight, adjustmentReason });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});
// ============ NUTRITION TRACKER SCHEMAS ============

// Food Item Schema
const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
  servingSize: { type: String, required: true },
  unit: { type: String, default: 'g' },
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage'] },
  isCommon: { type: Boolean, default: false }
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

// Meal Log Schema
const mealLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foods: [{
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    name: String,
    quantity: Number,
    unit: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  }],
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFats: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  notes: String
});

const MealLog = mongoose.model('MealLog', mealLogSchema);

// Water Intake Schema
const waterIntakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // in ml
  date: { type: Date, default: Date.now }
});

const WaterIntake = mongoose.model('WaterIntake', waterIntakeSchema);

// Supplement Reminder Schema
const supplementReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  timeOfDay: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], required: true },
  time: { type: String }, // HH:MM format
  daysOfWeek: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const SupplementReminder = mongoose.model('SupplementReminder', supplementReminderSchema);

// Recipe Schema
const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ingredients: [{
    name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  }],
  instructions: [String],
  prepTime: Number, // minutes
  cookTime: Number, // minutes
  servings: Number,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  imageUrl: String,
  category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'protein', 'post-workout'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Grocery List Schema
const groceryListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    name: String,
    quantity: String,
    purchased: { type: Boolean, default: false },
    category: { type: String, enum: ['produce', 'meat', 'dairy', 'grains', 'snacks', 'other'] }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GroceryList = mongoose.model('GroceryList', groceryListSchema);

// ============ NUTRITION TRACKER ENDPOINTS ============

// Seed common foods
app.post('/api/seed-foods', authMiddleware, async (req, res) => {
  try {
    const existingFoods = await FoodItem.countDocuments();
    if (existingFoods > 0) {
      return res.json({ message: 'Foods already seeded', count: existingFoods });
    }
    
    const commonFoods = [
      { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
      { name: "White Rice", calories: 130, protein: 2.7, carbs: 28, fats: 0.3, servingSize: "100g", unit: "g", category: "lunch", isCommon: true },
      { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3, servingSize: "1 large", unit: "piece", category: "breakfast", isCommon: true },
      { name: "Oatmeal", calories: 158, protein: 5.5, carbs: 27, fats: 3.2, servingSize: "40g", unit: "g", category: "breakfast", isCommon: true },
      { name: "Whey Protein", calories: 120, protein: 24, carbs: 3, fats: 1.5, servingSize: "30g", unit: "g", category: "snack", isCommon: true },
      { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.4, servingSize: "1 medium", unit: "piece", category: "snack", isCommon: true },
      { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
      { name: "Salmon", calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
      { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fats: 14.7, servingSize: "100g", unit: "g", category: "snack", isCommon: true },
      { name: "Greek Yogurt", calories: 100, protein: 10, carbs: 6, fats: 0.4, servingSize: "150g", unit: "g", category: "breakfast", isCommon: true },
      { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fats: 0.1, servingSize: "100g", unit: "g", category: "dinner", isCommon: true },
      { name: "Almonds", calories: 579, protein: 21, carbs: 22, fats: 49, servingSize: "100g", unit: "g", category: "snack", isCommon: true }
    ];
    
    await FoodItem.insertMany(commonFoods);
    res.json({ success: true, message: `Seeded ${commonFoods.length} common foods` });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Log a meal
app.post('/api/meals', authMiddleware, async (req, res) => {
  try {
    const { mealType, foods, notes } = req.body;
    
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    const processedFoods = [];
    
    for (const food of foods) {
      let foodData = food;
      if (food.foodId) {
        const dbFood = await FoodItem.findById(food.foodId);
        if (dbFood) {
          const multiplier = food.quantity / parseFloat(dbFood.servingSize.split(' ')[0] || 1);
          foodData = {
            name: dbFood.name,
            quantity: food.quantity,
            unit: food.unit || dbFood.unit,
            calories: Math.round(dbFood.calories * multiplier),
            protein: Math.round(dbFood.protein * multiplier * 10) / 10,
            carbs: Math.round(dbFood.carbs * multiplier * 10) / 10,
            fats: Math.round(dbFood.fats * multiplier * 10) / 10
          };
        }
      }
      
      processedFoods.push(foodData);
      totalCalories += foodData.calories || 0;
      totalProtein += foodData.protein || 0;
      totalCarbs += foodData.carbs || 0;
      totalFats += foodData.fats || 0;
    }
    
    const meal = new MealLog({
      userId: req.user._id,
      mealType,
      foods: processedFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      notes
    });
    
    await meal.save();
    res.json({ success: true, meal });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get meals for a date
app.get('/api/meals', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const meals = await MealLog.find({
      userId: req.user._id,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });
    
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fats: acc.fats + meal.totalFats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    
    res.json({ success: true, meals, totals });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Water intake tracking
app.post('/api/water', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const water = new WaterIntake({ userId: req.user._id, amount });
    await water.save();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTotal = await WaterIntake.aggregate([
      { $match: { userId: req.user._id, date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    res.json({ success: true, water, todayTotal: todayTotal[0]?.total || 0 });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get water intake
app.get('/api/water', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const logs = await WaterIntake.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    const total = logs.reduce((sum, l) => sum + l.amount, 0);
    res.json({ success: true, logs, total });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recipes
app.get('/api/recipes', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { $or: [{ isPublic: true }, { createdBy: req.user._id }] };
    if (category) query.category = category;
    
    const recipes = await Recipe.find(query).limit(50);
    res.json({ success: true, recipes });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Create recipe
app.post('/api/recipes', authMiddleware, async (req, res) => {
  try {
    const recipe = new Recipe({ ...req.body, createdBy: req.user._id });
    await recipe.save();
    res.json({ success: true, recipe });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get grocery list
app.get('/api/grocery-list', authMiddleware, async (req, res) => {
  try {
    let list = await GroceryList.findOne({ userId: req.user._id });
    if (!list) {
      list = new GroceryList({ userId: req.user._id, items: [] });
      await list.save();
    }
    res.json({ success: true, list });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to grocery list
app.post('/api/grocery-list', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    let list = await GroceryList.findOne({ userId: req.user._id });
    
    if (!list) {
      list = new GroceryList({ userId: req.user._id, items: [] });
    }
    
    for (const item of items) {
      const existing = list.items.find(i => i.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        existing.quantity = item.quantity;
      } else {
        list.items.push(item);
      }
    }
    list.updatedAt = new Date();
    await list.save();
    
    res.json({ success: true, list });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Update grocery item
app.put('/api/grocery-list/:itemId', authMiddleware, async (req, res) => {
  try {
    const { purchased } = req.body;
    const list = await GroceryList.findOne({ userId: req.user._id });
    if (!list) return res.status(404).json({ error: 'List not found' });
    
    const item = list.items.id(req.params.itemId);
    if (item) item.purchased = purchased;
    await list.save();
    
    res.json({ success: true, list });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Supplement reminders
app.get('/api/supplements', authMiddleware, async (req, res) => {
  try {
    const supplements = await SupplementReminder.find({ userId: req.user._id, isActive: true });
    res.json({ success: true, supplements });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/supplements', authMiddleware, async (req, res) => {
  try {
    const supplement = new SupplementReminder({ ...req.body, userId: req.user._id });
    await supplement.save();
    res.json({ success: true, supplement });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});
// Get all foods
app.get('/api/foods', authMiddleware, async (req, res) => {
  try {
    const foods = await FoodItem.find();
    res.json({ success: true, foods });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/supplements/:id', authMiddleware, async (req, res) => {
  try {
    const { isActive } = req.body;
    const supplement = await SupplementReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive },
      { new: true }
    );
    res.json({ success: true, supplement });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ACHIEVEMENT SYSTEM SCHEMAS ============

// Badge Schema
const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['strength', 'consistency', 'volume', 'milestone', 'challenge'], required: true },
  requirement: {
    type: { type: String, enum: ['workout_count', 'strength_pr', 'volume_total', 'streak_days', 'exercise_mastery'] },
    target: Number,
    exerciseName: String
  },
  points: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

const Badge = mongoose.model('Badge', badgeSchema);

// User Badge Schema
const userBadgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now }
});

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

// User Level Schema
const userLevelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastWorkoutDate: { type: Date },
  totalWorkouts: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserLevel = mongoose.model('UserLevel', userLevelSchema);

// Monthly Challenge Schema
const monthlyChallengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  type: { type: String, enum: ['workouts', 'volume', 'streak', 'exercise_count'], required: true },
  target: { type: Number, required: true },
  reward: {
    badgeName: String,
    xpBonus: { type: Number, default: 500 },
    description: String
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const MonthlyChallenge = mongoose.model('MonthlyChallenge', monthlyChallengeSchema);

// User Challenge Progress Schema
const userChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'MonthlyChallenge', required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);

// ============ ACHIEVEMENT SYSTEM ENDPOINTS ============

// Seed badges
app.post('/api/seed-badges', authMiddleware, async (req, res) => {
  try {
    const existingBadges = await Badge.countDocuments();
    if (existingBadges > 0) {
      return res.json({ message: 'Badges already seeded', count: existingBadges });
    }
    
    const badges = [
      // Consistency Badges
      { name: "First Workout", description: "Completed your first workout!", icon: "🎉", category: "milestone", requirement: { type: "workout_count", target: 1 }, points: 50 },
      { name: "10 Workouts", description: "Completed 10 workouts", icon: "💪", category: "consistency", requirement: { type: "workout_count", target: 10 }, points: 100 },
      { name: "50 Workouts", description: "50 workouts completed!", icon: "🏆", category: "consistency", requirement: { type: "workout_count", target: 50 }, points: 250 },
      { name: "100 Workouts", description: "Century club! 100 workouts", icon: "⭐", category: "consistency", requirement: { type: "workout_count", target: 100 }, points: 500 },
      
      // Streak Badges
      { name: "3 Day Streak", description: "Worked out 3 days in a row", icon: "🔥", category: "consistency", requirement: { type: "streak_days", target: 3 }, points: 75 },
      { name: "7 Day Streak", description: "One week of consistency!", icon: "⚡", category: "consistency", requirement: { type: "streak_days", target: 7 }, points: 150 },
      { name: "14 Day Streak", description: "Two weeks strong!", icon: "🌟", category: "consistency", requirement: { type: "streak_days", target: 14 }, points: 300 },
      { name: "30 Day Streak", description: "Month-long dedication!", icon: "🏅", category: "consistency", requirement: { type: "streak_days", target: 30 }, points: 600 },
      
      // Strength Badges
      { name: "100kg Bench", description: "Bench pressed 100kg!", icon: "🏋️", category: "strength", requirement: { type: "strength_pr", target: 100, exerciseName: "Bench Press" }, points: 200 },
      { name: "140kg Squat", description: "Squatted 140kg!", icon: "🦵", category: "strength", requirement: { type: "strength_pr", target: 140, exerciseName: "Squat" }, points: 200 },
      { name: "180kg Deadlift", description: "Deadlifted 180kg!", icon: "💪", category: "strength", requirement: { type: "strength_pr", target: 180, exerciseName: "Deadlift" }, points: 200 },
      
      // Volume Badges
      { name: "10,000kg Club", description: "Lifted 10,000kg total!", icon: "📊", category: "volume", requirement: { type: "volume_total", target: 10000 }, points: 150 },
      { name: "50,000kg Club", description: "Halfway to 100k!", icon: "🚀", category: "volume", requirement: { type: "volume_total", target: 50000 }, points: 350 },
      { name: "100,000kg Club", description: "100,000kg lifted!", icon: "👑", category: "volume", requirement: { type: "volume_total", target: 100000 }, points: 700 }
    ];
    
    await Badge.insertMany(badges);
    res.json({ success: true, message: `Seeded ${badges.length} badges` });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user level and stats
app.get('/api/user-level', authMiddleware, async (req, res) => {
  try {
    let userLevel = await UserLevel.findOne({ userId: req.user._id });
    if (!userLevel) {
      userLevel = new UserLevel({ userId: req.user._id });
      await userLevel.save();
    }
    
    // Calculate XP needed for next level
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user badges
app.get('/api/user-badges', authMiddleware, async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ userId: req.user._id }).populate('badgeId');
    res.json({ success: true, badges: userBadges.map(ub => ub.badgeId) });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Check and award achievements (call this after logging a workout)
app.post('/api/check-achievements', authMiddleware, async (req, res) => {
  try {
    // Get or create user level
    let userLevel = await UserLevel.findOne({ userId: req.user._id });
    if (!userLevel) {
      userLevel = new UserLevel({ userId: req.user._id });
      await userLevel.save();
    }
    
    // Update workout count
    const workoutCount = await WorkoutLog.countDocuments({ userId: req.user._id });
    userLevel.totalWorkouts = workoutCount;
    
    // Update total volume
    const volumeResult = await WorkoutLog.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$weight", "$reps", "$sets"] } } } }
    ]);
    const totalVolume = volumeResult[0]?.total || 0;
    userLevel.totalVolume = totalVolume;
    
    // Update streak
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
    
    // Add XP (10 XP per workout)
    const xpGain = 10;
    userLevel.xp += xpGain;
    userLevel.totalXp += xpGain;
    
    // Level up
    let leveledUp = false;
    while (userLevel.xp >= userLevel.level * 1000) {
      userLevel.xp -= userLevel.level * 1000;
      userLevel.level += 1;
      leveledUp = true;
    }
    
    await userLevel.save();
    
    // Check and award badges
    const allBadges = await Badge.find();
    const earnedBadges = await UserBadge.find({ userId: req.user._id }).distinct('badgeId');
    const newBadges = [];
    
    for (const badge of allBadges) {
      if (earnedBadges.includes(badge._id)) continue;
      
      let earned = false;
      
      if (badge.requirement.type === 'workout_count' && workoutCount >= badge.requirement.target) {
        earned = true;
      } else if (badge.requirement.type === 'strength_pr' && badge.requirement.exerciseName) {
        const exerciseLogs = await WorkoutLog.find({ 
          userId: req.user._id, 
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
        await UserBadge.create({ userId: req.user._id, badgeId: badge._id });
        newBadges.push(badge);
        // Bonus XP for badge
        userLevel.xp += badge.points;
        userLevel.totalXp += badge.points;
      }
    }
    
    if (newBadges.length > 0) {
      await userLevel.save();
    }
    
    res.json({ 
      success: true, 
      leveledUp, 
      newBadges, 
      newLevel: userLevel.level,
      xpGain,
      currentStreak: userLevel.streakDays
    });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly challenges
app.get('/api/monthly-challenges', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    let challenges = await MonthlyChallenge.find({ 
      month: currentMonth, 
      year: currentYear,
      isActive: true 
    });
    
    if (challenges.length === 0) {
      // Create default monthly challenge
      const defaultChallenge = new MonthlyChallenge({
        name: `${now.toLocaleString('default', { month: 'long' })} Challenge`,
        description: `Complete ${15} workouts this month!`,
        month: currentMonth,
        year: currentYear,
        type: 'workouts',
        target: 15,
        reward: { badgeName: `${now.toLocaleString('default', { month: 'long' })} Warrior`, xpBonus: 500, description: "Monthly challenge champion" }
      });
      await defaultChallenge.save();
      challenges = [defaultChallenge];
    }
    
    // Get user progress
    const userProgress = await UserChallenge.findOne({ 
      userId: req.user._id, 
      challengeId: challenges[0]._id 
    });
    
    // Get current workout count for the month
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
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Update challenge progress (call after workout)
app.post('/api/update-challenge-progress', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const challenge = await MonthlyChallenge.findOne({ month: currentMonth, year: currentYear });
    if (!challenge) return res.json({ success: true });
    
    let userChallenge = await UserChallenge.findOne({ 
      userId: req.user._id, 
      challengeId: challenge._id 
    });
    
    if (!userChallenge) {
      userChallenge = new UserChallenge({ userId: req.user._id, challengeId: challenge._id });
    }
    
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const monthlyWorkouts = await WorkoutLog.countDocuments({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    userChallenge.progress = monthlyWorkouts;
    
    if (!userChallenge.completed && monthlyWorkouts >= challenge.target) {
      userChallenge.completed = true;
      userChallenge.completedAt = new Date();
      
      // Award bonus XP
      const userLevel = await UserLevel.findOne({ userId: req.user._id });
      if (userLevel) {
        userLevel.xp += challenge.reward.xpBonus;
        userLevel.totalXp += challenge.reward.xpBonus;
        await userLevel.save();
      }
    }
    
    await userChallenge.save();
    res.json({ success: true, progress: userChallenge.progress, completed: userChallenge.completed });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Available endpoints:
   POST   /api/register        - Create new account
   POST   /api/login           - Login to account
   GET    /api/profile         - Get your profile
   POST   /api/workout-logs    - Log a workout
   GET    /api/workout-logs    - Get workout history
   GET    /api/recommendations - Get workout plans
   GET    /api/analytics/volume - Volume tracking
   GET    /api/analytics/1rm/:exercise - 1RM progression
   POST   /api/posts           - Create social post
   GET    /api/feed            - Get social feed
   POST   /api/ai/advice       - AI Coach advice
   POST   /api/ai/form-feedback - Form feedback
   GET    /api/ai/detect-plateau - Plateau detection
   GET    /api/ai/weight-recommendation - Weight recommendations
   POST   /api/seed-advanced-plans - Seed 10-week plans
   GET    /api/advanced-plans  - Get advanced workout plans`);
});