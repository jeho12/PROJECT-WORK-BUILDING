import { Router } from 'express';
import { generateReview, getStudentReviews, getReview, generateWeeklySummary } from './ai.controller';
import { generateReviewSchema } from './ai.schema';
import { weeklySummarySchema } from './weekly-summary.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { aiLimiter } from '../../middleware/rateLimiter';

const router = Router();

// General auth gate
router.use(authenticate);

router.post('/generate-review', authorize('supervisor'), aiLimiter, validate(generateReviewSchema), generateReview);
router.get('/reviews/:studentId', authorize('supervisor'), getStudentReviews);
router.get('/reviews/detail/:reviewId', authorize('student', 'supervisor'), getReview);
router.post('/weeks/:weekId/summary', authorize('supervisor'), aiLimiter, validate(weeklySummarySchema), generateWeeklySummary);

export default router;
