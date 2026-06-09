import { Router } from 'express';
import {
  getDashboardStats,
  createSupervisor,
  listSupervisors,
  assignStudent,
  listAssignments,
  listStudents,
  listUsers,
  toggleUserActive,
  deleteUser,
  getAnalytics,
} from './admin.controller';
import { createSupervisorSchema, assignStudentSchema } from './admin.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Admin auth gate
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/supervisors', validate(createSupervisorSchema), createSupervisor);
router.get('/supervisors', listSupervisors);
router.post('/assignments', validate(assignStudentSchema), assignStudent);
router.get('/assignments', listAssignments);
router.get('/students', listStudents);
router.get('/users', listUsers);
router.patch('/users/:userId/toggle-active', toggleUserActive);
router.delete('/users/:userId', deleteUser);
router.get('/analytics', getAnalytics);

export default router;
