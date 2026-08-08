const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const ActiveWorkoutSession = require('../src/models/ActiveWorkoutSession');

process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.NODE_ENV = 'test';

jest.mock('../src/models/User');
jest.mock('../src/models/ActiveWorkoutSession');
jest.mock('../src/config/db', () => jest.fn());

describe('Active Workout Session Endpoints', () => {
  let validToken;
  let otherUserToken;
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com'
  };

  const otherUser = {
    _id: '607f1f77bcf86cd799439022',
    name: 'Other User',
    email: 'other@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    validToken = jwt.sign(
      { userId: mockUser._id, email: mockUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    otherUserToken = jwt.sign(
      { userId: otherUser._id, email: otherUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    ActiveWorkoutSession.mockImplementation((data) => {
      return {
        ...data,
        _id: 'session123',
        save: jest.fn().mockImplementation(function() { return Promise.resolve(this); })
      };
    });

    User.findById.mockImplementation((id) => {
      const targetUser = id === otherUser._id ? otherUser : mockUser;
      return {
        select: jest.fn().mockResolvedValue(targetUser)
      };
    });
  });

  describe('POST /api/active-sessions', () => {
    it('should create an active session successfully with steps, calories, telemetry and isManuallyEdited flag', async () => {
      const res = await request(app)
        .post('/api/active-sessions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          activityType: 'running',
          durationSeconds: 1800,
          stepsCount: 3500,
          caloriesBurned: 240,
          distanceKm: 3.2,
          isManuallyEdited: true,
          telemetryData: [
            { timestamp: 10, steps: 20, calories: 1.5, speed: 10, distance: 0.02 }
          ]
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.session).toBeDefined();
      expect(res.body.session.activityType).toBe('running');
      expect(res.body.session.stepsCount).toBe(3500);
      expect(res.body.session.isManuallyEdited).toBe(true);
    });

    it('should reject requests with missing activityType or invalid durationSeconds', async () => {
      const res = await request(app)
        .post('/api/active-sessions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          durationSeconds: 0
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject invalid activityType enum values', async () => {
      const res = await request(app)
        .post('/api/active-sessions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          activityType: 'space_walking',
          durationSeconds: 300
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/valid activityType/i);
    });

    it('should reject negative numeric values', async () => {
      const res = await request(app)
        .post('/api/active-sessions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          activityType: 'running',
          durationSeconds: 300,
          stepsCount: -10
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/cannot be negative/i);
    });
  });

  describe('GET /api/active-sessions', () => {
    it('should return paginated and filtered active sessions', async () => {
      const mockSessions = [
        { _id: 'session1', activityType: 'running', stepsCount: 2000 }
      ];

      ActiveWorkoutSession.countDocuments.mockResolvedValue(1);
      ActiveWorkoutSession.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockSessions)
            })
          })
        })
      });

      const res = await request(app)
        .get('/api/active-sessions?page=1&limit=10&activityType=running')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.sessions).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/active-sessions/stats', () => {
    it('should return aggregate stats for requesting user', async () => {
      ActiveWorkoutSession.aggregate
        .mockResolvedValueOnce([
          {
            _id: null,
            totalSessions: 5,
            totalSteps: 15000,
            totalCalories: 1200,
            totalDistanceKm: 12.5,
            totalDurationSeconds: 7200
          }
        ])
        .mockResolvedValueOnce([
          {
            _id: 'running',
            count: 3,
            steps: 10000,
            calories: 800,
            distanceKm: 10,
            durationSeconds: 4800
          }
        ]);

      const res = await request(app)
        .get('/api/active-sessions/stats')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalSessions).toBe(5);
      expect(res.body.stats.byActivityType.running).toBeDefined();
    });
  });

  describe('GET & DELETE /api/active-sessions/:id ownership enforcement', () => {
    it('should prevent a user from reading another user session', async () => {
      const mockOtherSession = {
        _id: 'sessionOther',
        userId: otherUser._id,
        activityType: 'running'
      };

      ActiveWorkoutSession.findById.mockResolvedValue(mockOtherSession);

      const res = await request(app)
        .get('/api/active-sessions/sessionOther')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.error).toMatch(/Access denied/i);
    });

    it('should prevent a user from deleting another user session', async () => {
      const mockOtherSession = {
        _id: 'sessionOther',
        userId: otherUser._id,
        activityType: 'running'
      };

      ActiveWorkoutSession.findById.mockResolvedValue(mockOtherSession);

      const res = await request(app)
        .delete('/api/active-sessions/sessionOther')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.error).toMatch(/Access denied/i);
    });
  });
});
