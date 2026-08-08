const ActiveWorkoutSession = require('../models/ActiveWorkoutSession');

const VALID_ACTIVITIES = [
  'running',
  'outdoor_walking',
  'cycling',
  'trekking',
  'indoor_treadmill',
  'badminton',
  'basketball',
  'hiit',
  'jump_rope'
];

/**
 * Create a new active workout tracking session
 */
const createActiveSession = async (req, res) => {
  try {
    const {
      activityType,
      startTime,
      endTime,
      durationSeconds,
      stepsCount,
      caloriesBurned,
      distanceKm,
      avgPaceMinPerKm,
      avgCadenceSpm,
      elevationGainMeters,
      maxSpeedKmh,
      telemetryData,
      isManuallyEdited,
      notes,
      status
    } = req.body;

    if (!activityType || !VALID_ACTIVITIES.includes(activityType)) {
      return res.status(400).json({ error: 'Valid activityType is required' });
    }

    if (durationSeconds === undefined || typeof durationSeconds !== 'number' || durationSeconds <= 0) {
      return res.status(400).json({ error: 'durationSeconds must be a positive number' });
    }

    if (
      (stepsCount !== undefined && stepsCount < 0) ||
      (caloriesBurned !== undefined && caloriesBurned < 0) ||
      (distanceKm !== null && distanceKm !== undefined && distanceKm < 0) ||
      (avgCadenceSpm !== undefined && avgCadenceSpm < 0)
    ) {
      return res.status(400).json({ error: 'Numeric fields cannot be negative' });
    }

    const session = new ActiveWorkoutSession({
      userId: req.user._id,
      activityType,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(),
      durationSeconds: Math.round(durationSeconds),
      stepsCount: stepsCount || 0,
      caloriesBurned: caloriesBurned || 0,
      distanceKm: distanceKm !== undefined ? distanceKm : null,
      avgPaceMinPerKm: avgPaceMinPerKm !== undefined ? avgPaceMinPerKm : null,
      avgCadenceSpm: avgCadenceSpm || 0,
      elevationGainMeters: elevationGainMeters !== undefined ? elevationGainMeters : null,
      maxSpeedKmh: maxSpeedKmh !== undefined ? maxSpeedKmh : null,
      telemetryData: Array.isArray(telemetryData) ? telemetryData : [],
      isManuallyEdited: Boolean(isManuallyEdited),
      notes: notes || '',
      status: status && ['completed', 'cancelled'].includes(status) ? status : 'completed'
    });

    await session.save();

    return res.status(201).json({
      success: true,
      message: 'Active workout session saved successfully',
      session
    });
  } catch (error) {
    console.error('Error creating active session:', error);
    return res.status(500).json({ error: 'Failed to save active workout session' });
  }
};

/**
 * Get user active workout sessions with pagination & filtering
 */
const getActiveSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (req.query.activityType && VALID_ACTIVITIES.includes(req.query.activityType)) {
      query.activityType = req.query.activityType;
    }

    if (req.query.startDate || req.query.endDate) {
      query.startTime = {};
      if (req.query.startDate) query.startTime.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.startTime.$lte = new Date(req.query.endDate);
    }

    const total = await ActiveWorkoutSession.countDocuments(query);
    const sessions = await ActiveWorkoutSession.find(query)
      .select('-telemetryData') // exclude heavy telemetry data in list view
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      sessions,
      count: sessions.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch active workout sessions' });
  }
};

/**
 * Get single session by ID including full telemetryData
 */
const getSessionById = async (req, res) => {
  try {
    const session = await ActiveWorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to this session' });
    }

    return res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error fetching session by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch workout session' });
  }
};

/**
 * Aggregate summary statistics for user live workout tracking sessions
 */
const getActiveSessionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await ActiveWorkoutSession.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalSteps: { $sum: '$stepsCount' },
          totalCalories: { $sum: '$caloriesBurned' },
          totalDistanceKm: { $sum: { $ifNull: ['$distanceKm', 0] } },
          totalDurationSeconds: { $sum: '$durationSeconds' }
        }
      }
    ]);

    const byActivity = await ActiveWorkoutSession.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          steps: { $sum: '$stepsCount' },
          calories: { $sum: '$caloriesBurned' },
          distanceKm: { $sum: { $ifNull: ['$distanceKm', 0] } },
          durationSeconds: { $sum: '$durationSeconds' }
        }
      }
    ]);

    const summary = stats[0] || {
      totalSessions: 0,
      totalSteps: 0,
      totalCalories: 0,
      totalDistanceKm: 0,
      totalDurationSeconds: 0
    };

    return res.json({
      success: true,
      stats: {
        ...summary,
        byActivityType: byActivity.reduce((acc, curr) => {
          acc[curr._id] = {
            count: curr.count,
            steps: curr.steps,
            calories: curr.calories,
            distanceKm: Math.round(curr.distanceKm * 100) / 100,
            durationSeconds: curr.durationSeconds
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching active session stats:', error);
    return res.status(500).json({ error: 'Failed to fetch session statistics' });
  }
};

/**
 * Delete a session by ID
 */
const deleteActiveSession = async (req, res) => {
  try {
    const session = await ActiveWorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied to delete this session' });
    }

    await ActiveWorkoutSession.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Active workout session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting active session:', error);
    return res.status(500).json({ error: 'Failed to delete workout session' });
  }
};

module.exports = {
  createActiveSession,
  getActiveSessions,
  getSessionById,
  getActiveSessionStats,
  deleteActiveSession
};
