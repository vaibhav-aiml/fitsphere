const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');

process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.NODE_ENV = 'test';

jest.mock('../src/models/User', () => {
  const mockModel = function(data) {
    Object.assign(this, data);
    this._id = 'mockUserId123';
    this.save = jest.fn().mockResolvedValue(this);
  };
  mockModel.findOne = jest.fn();
  mockModel.findById = jest.fn();
  mockModel.countDocuments = jest.fn();
  mockModel.find = jest.fn();
  return mockModel;
});

jest.mock('../src/config/db', () => jest.fn());

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    it('should successfully register a new user', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          goal: 'bodybuilding',
          experience: 'beginner'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('john@example.com');
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'password123',
          goal: 'bodybuilding'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('should return 400 on validation failure for invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'Invalid',
          email: 'invalid-email',
          password: '123',
          goal: 'invalid-goal'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with valid credentials', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);

      User.findOne.mockResolvedValue({
        _id: 'mockUserId123',
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        goal: 'bodybuilding',
        experience: 'beginner'
      });

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'john@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toMatch(/invalid/i);
    });
  });

  describe('GET /api/profile', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toBe('No token provided');
    });
  });
});
