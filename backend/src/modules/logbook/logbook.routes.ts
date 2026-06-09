import { Router } from 'express';
import {
  getWeeks,
  createWeek,
  getWeekDetail,
  deleteWeek,
  getDayDetail,
  updateDay,
  submitDay,
  uploadAttachment,
  deleteAttachment,
  submitReport,
} from './logbook.controller';
import { createWeekSchema, updateDaySchema, submitReportSchema } from './logbook.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { requireCompleteProfile } from '../../middleware/requireCompleteProfile';
import { upload } from '../../middleware/upload';

const router = Router();

// General authentication gate
router.use(authenticate);

// Student actions with complete profile verification
router.get('/weeks', authorize('student'), requireCompleteProfile, getWeeks);
router.post('/weeks', authorize('student'), requireCompleteProfile, validate(createWeekSchema), createWeek);
router.delete('/weeks/:weekId', authorize('student'), requireCompleteProfile, deleteWeek);

router.put('/days/:dayId', authorize('student'), requireCompleteProfile, validate(updateDaySchema), updateDay);
router.post('/days/:dayId/submit', authorize('student'), requireCompleteProfile, validate(updateDaySchema), submitDay);
router.post('/days/:dayId/attachments', authorize('student'), requireCompleteProfile, upload.single('attachment'), uploadAttachment);
router.delete('/attachments/:attachId', authorize('student'), requireCompleteProfile, deleteAttachment);
router.post('/weeks/:weekId/report', authorize('student'), requireCompleteProfile, validate(submitReportSchema), submitReport);

// Shared/Review routes
router.get('/weeks/:weekId', authorize('student', 'supervisor'), getWeekDetail);
router.get('/days/:dayId', authorize('student', 'supervisor'), getDayDetail);

export default router;
