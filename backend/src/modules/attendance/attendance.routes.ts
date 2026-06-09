import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getHistory,
  getStats,
  getStudentAttendance,
} from './attendance.controller';
import { checkInSchema, checkOutSchema } from './attendance.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { requireCompleteProfile } from '../../middleware/requireCompleteProfile';

const router = Router();

// General authentication gate
router.use(authenticate);

// Student geolocation attendance punches (protected by profile completeness)
router.post('/check-in', authorize('student'), requireCompleteProfile, validate(checkInSchema), checkIn);
router.post('/check-out', authorize('student'), requireCompleteProfile, validate(checkOutSchema), checkOut);
router.get('/today', authorize('student'), requireCompleteProfile, getTodayStatus);
router.get('/history', authorize('student'), requireCompleteProfile, getHistory);
router.get('/stats', authorize('student'), requireCompleteProfile, getStats);

// Supervisor check on assigned student logs
router.get('/student/:studentId', authorize('supervisor'), getStudentAttendance);

export default router;
