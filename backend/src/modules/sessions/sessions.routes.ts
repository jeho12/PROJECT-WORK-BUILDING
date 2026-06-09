import { Router } from 'express';
import {
  scheduleSession,
  getSupervisorSessions,
  getStudentSessions,
  getSessionDetail,
  verifyLocation,
  joinSession,
  cancelSession,
} from './sessions.controller';
import { scheduleSessionSchema, verifyLocationSchema } from './sessions.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// General auth gate
router.use(authenticate);

// Supervisor scheduling
router.post('/', authorize('supervisor'), validate(scheduleSessionSchema), scheduleSession);
router.get('/', authorize('supervisor'), getSupervisorSessions);
router.patch('/:sessionId/cancel', authorize('supervisor'), cancelSession);

// Student checking
router.get('/student', authorize('student'), getStudentSessions);
router.post('/:sessionId/verify-location', authorize('student'), validate(verifyLocationSchema), verifyLocation);

// Shared joining
router.get('/:sessionId', authorize('student', 'supervisor'), getSessionDetail);
router.patch('/:sessionId/join', authorize('student', 'supervisor'), joinSession);

export default router;
