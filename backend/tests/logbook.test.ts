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
      logbookWeek: {
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      logbookDay: {
        findUnique: jest.fn(),
        update: jest.fn(),
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

describe('Logbook Endpoints Mocked Unit Tests', () => {
  let studentToken: string;

  beforeAll(() => {
    // Generate valid jwt token for authenticating testing requests
    studentToken = jwt.sign({ sub: 'student123', role: 'student' }, env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/logbook/weeks', () => {
    it('should block if student profile is not complete', async () => {
      // Mock user retrieve
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student123',
        role: 'student',
        is_active: true,
      });

      // Mock incomplete profile
      (prisma.studentProfile.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'student123',
        profile_complete: false,
      });

      const response = await request(app)
        .post('/api/logbook/weeks')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          week_start_date: '2026-06-08',
          week_end_date: '2026-06-12',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Complete your student profile');
    });

    it('should successfully create a new week if profile is complete and no overlaps', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student123',
        role: 'student',
        is_active: true,
      });

      // Mock complete profile
      (prisma.studentProfile.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'student123',
        profile_complete: true,
      });

      // Mock no overlaps
      (prisma.logbookWeek.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.logbookWeek.count as jest.Mock).mockResolvedValue(0);
      
      const mockCreatedWeek = {
        id: 'week1',
        week_number: 1,
        week_start_date: new Date('2026-06-08'),
        week_end_date: new Date('2026-06-12'),
      };
      (prisma.logbookWeek.create as jest.Mock).mockResolvedValue(mockCreatedWeek);

      const response = await request(app)
        .post('/api/logbook/weeks')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          week_start_date: '2026-06-08',
          week_end_date: '2026-06-12',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('week1');
    });
  });

  describe('POST /api/logbook/days/:dayId/submit', () => {
    it('should block modification of locked days', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'student123',
        role: 'student',
        is_active: true,
      });

      (prisma.studentProfile.findUnique as jest.Mock).mockResolvedValue({
        user_id: 'student123',
        profile_complete: true,
      });

      // Mock locked day entry
      (prisma.logbookDay.findUnique as jest.Mock).mockResolvedValue({
        id: 'day123',
        locked: true,
        logbook_week: {
          user_id: 'student123',
        },
      });

      const response = await request(app)
        .post('/api/logbook/days/day123/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          time_in: '08:00',
          time_out: '17:00',
          activity: 'This is a long description of student activities for day entries to pass character checks.',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already been submitted');
    });
  });
});
