import { Router } from 'express';
import {
  getAssignedStudents,
  getStudentDetail,
  getStudentWeeks,
  getStudentWeekDetail,
  reviewWeek,
  getDashboardStats,
} from './supervisor.controller';
import { reviewWeekSchema } from './supervisor.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Supervisor auth gate
router.use(authenticate);
router.use(authorize('supervisor'));

router.get('/students', getAssignedStudents);
router.get('/students/:studentId', getStudentDetail);
router.get('/students/:studentId/weeks', getStudentWeeks);
router.get('/students/:studentId/weeks/:weekId', getStudentWeekDetail);
router.post('/weeks/:weekId/review', validate(reviewWeekSchema), reviewWeek);
router.get('/dashboard/stats', getDashboardStats);

export default router;
