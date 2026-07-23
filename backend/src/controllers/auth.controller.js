const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyGoogleToken } = require('../services/googleAuth');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return secret;
};

const register = async (req, res) => {
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
    getJwtSecret(),
    { expiresIn: '7d' }
  );
  
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
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
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
    getJwtSecret(),
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
};

const googleAuth = async (req, res) => {
  const { idToken, name, email } = req.body;
  let googleProfile;

  if (idToken) {
    try {
      googleProfile = await verifyGoogleToken(idToken);
    } catch (err) {
      return res.status(401).json({ error: `Google authentication failed: ${err.message}` });
    }
  } else if (email && process.env.NODE_ENV === 'development') {
    // Development fallback if idToken is not configured locally
    googleProfile = { email, name: name || email.split('@')[0] };
  } else {
    return res.status(400).json({ error: 'idToken is required for Google authentication' });
  }

  const { email: userEmail, name: userName } = googleProfile;
  
  let user = await User.findOne({ email: userEmail });
  if (!user) {
    user = new User({
      name: userName || userEmail.split('@')[0],
      email: userEmail,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      goal: 'bodybuilding',
      experience: 'beginner'
    });
    await user.save();
  }
  
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    getJwtSecret(),
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
};

const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().select('-password').skip(skip).limit(limit);

  res.json({
    success: true,
    users,
    count: users.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

module.exports = {
  register,
  login,
  googleAuth,
  getProfile,
  getUsers
};
