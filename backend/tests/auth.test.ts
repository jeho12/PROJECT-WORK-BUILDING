import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';

// Mock Prisma client singleton
jest.mock('../src/config/database', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      studentProfile: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

// Mock Mailer service
jest.mock('../src/config/mailer', () => {
  return {
    emailService: {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendWeeklyReportNotification: jest.fn().mockResolvedValue(undefined),
      sendSessionNotification: jest.fn().mockResolvedValue(undefined),
      sendLoginNotification: jest.fn().mockResolvedValue(undefined),
    },
  };
});

describe('Authentication Endpoints Mocked Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new student', async () => {
      // Mock unique email check passing (findUnique returns null)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock transaction return value
      const mockUser = {
        id: 'user123',
        name: 'Jane Doe',
        email: 'janedoe@anchor.edu.ng',
        role: 'student',
      };
      (prisma.$transaction as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'janedoe@anchor.edu.ng',
          password: 'Password123!',
          role: 'student',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('janedoe@anchor.edu.ng');
    });

    it('should throw an error if validation fails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'bad-email',
          password: '123',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return a token for valid credentials', async () => {
      // Mock user retrieve
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Password123!', 12);
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        name: 'Jane Doe',
        email: 'janedoe@anchor.edu.ng',
        password: hashedPassword,
        role: 'student',
        is_active: true,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'janedoe@anchor.edu.ng',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('janedoe@anchor.edu.ng');
    });

    it('should return 401 for incorrect credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@anchor.edu.ng',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
