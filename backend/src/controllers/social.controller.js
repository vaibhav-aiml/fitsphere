const WorkoutPost = require('../models/WorkoutPost');
const WorkoutLog = require('../models/WorkoutLog');

const createPost = async (req, res) => {
  const { content, privacy } = req.body;
  const post = new WorkoutPost({ userId: req.user._id, content, privacy: privacy || 'public' });
  await post.save();
  res.json({ success: true, post });
};

const getFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await WorkoutPost.countDocuments({ privacy: { $ne: 'private' } });
  const posts = await WorkoutPost.find({ privacy: { $ne: 'private' } })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    posts,
    count: posts.length,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
};

const toggleLikePost = async (req, res) => {
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
};

const shareWorkout = async (req, res) => {
  const { workoutId } = req.body;
  const workout = await WorkoutLog.findById(workoutId);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });
  
  const shareMessage = `💪 Just crushed my workout! ${workout.exerciseName}: ${workout.weight}kg x ${workout.reps} reps x ${workout.sets} sets! #FitSphere #Fitness`;
  const post = new WorkoutPost({ userId: req.user._id, content: shareMessage, privacy: 'public' });
  await post.save();
  res.json({ success: true, shareText: shareMessage, post });
};

module.exports = {
  createPost,
  getFeed,
  toggleLikePost,
  shareWorkout
};
