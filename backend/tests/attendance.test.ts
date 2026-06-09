import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

// Mock Prisma client singleton
jest.mock('../src/config/database', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
      },
      studentProfile: {
        findUnique: jest.fn(),
      },
      attendanceLog: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
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

describe('Attendance Endpoints Mocked Unit Tests', () => {
  let studentToken: string;

  beforeAll(() => {
    studentToken = jwt.sign({ sub: 'student123', role: 'student' }, env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/attendance/check-in', () => {
    it('should block if student profile location is missing', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student123',
        role: 'student',
        is_active: true,
      });

      (prisma.studentProfile.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'student123',
        profile_complete: true,
        // Missing coordinates
        organization_latitude: null,
        organization_longitude: null,
      });

      const response = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          latitude: 6.5244,
          longitude: 3.3792,
          address: 'Anchor University, Lagos',
          logbook_day_id: 'day123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Complete your profile with organization location');
    });

    it('should successfully log check-in if within range', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student123',
        role: 'student',
        is_active: true,
      });

      (prisma.studentProfile.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'student123',
        profile_complete: true,
        // Match coordinates
        organization_latitude: 6.5244,
        organization_longitude: 3.3792,
      });

      (prisma.attendanceLog.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.attendanceLog.findUnique as jest.Mock).mockResolvedValue(null);

      const mockLog = {
        id: 'log123',
        user_id: 'student123',
        check_in_time: new Date(),
      };
      (prisma.attendanceLog.create as jest.Mock).mockResolvedValue(mockLog);

      const response = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          latitude: 6.5244,
          longitude: 3.3792,
          address: 'Anchor University, Lagos',
          logbook_day_id: 'day123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('log123');
    });
  });
});
