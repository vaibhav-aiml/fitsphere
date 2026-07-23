const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const WorkoutLog = require('../src/models/WorkoutLog');

process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.NODE_ENV = 'test';

jest.mock('../src/models/User');
jest.mock('../src/models/WorkoutLog');
jest.mock('../src/config/db', () => jest.fn());
jest.mock('../src/services/achievementService', () => ({
  processWorkoutLogAchievements: jest.fn()
}));

describe('Workout Logging Endpoints', () => {
  let validToken;
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    goal: 'bodybuilding',
    experience: 'beginner'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    validToken = jwt.sign(
      { userId: mockUser._id, email: mockUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
  });

  describe('POST /api/workout-logs', () => {
    it('should log a workout successfully', async () => {
      WorkoutLog.prototype.save = jest.fn().mockResolvedValue({
        _id: 'logId123',
        userId: mockUser._id,
        exerciseName: 'Bench Press',
        weight: 100,
        reps: 10,
        sets: 4,
        notes: 'Felt strong'
      });

      const res = await request(app)
        .post('/api/workout-logs')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          exerciseName: 'Bench Press',
          weight: 100,
          reps: 10,
          sets: 4,
          notes: 'Felt strong'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/logged successfully/i);
    });
  });

  describe('GET /api/workout-logs', () => {
    it('should fetch workout logs with pagination', async () => {
      const mockLogs = [
        { exerciseName: 'Squat', weight: 140, reps: 5, sets: 5, date: new Date() }
      ];

      WorkoutLog.countDocuments.mockResolvedValue(1);
      WorkoutLog.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockLogs)
          })
        })
      });

      const res = await request(app)
        .get('/api/workout-logs?page=1&limit=10')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.logs).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });
  });
});
