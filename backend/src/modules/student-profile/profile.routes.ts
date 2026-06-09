import { Router } from 'express';
import { getProfile, updateProfile, uploadPassport, setLocation } from './profile.controller';
import { updateProfileSchema, setLocationSchema } from './profile.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { upload } from '../../middleware/upload';

const router = Router();

router.get('/', authenticate, authorize('student'), getProfile);
router.post('/', authenticate, authorize('student'), validate(updateProfileSchema), updateProfile);
router.post('/passport', authenticate, authorize('student'), upload.single('passport'), uploadPassport);
router.post('/location', authenticate, authorize('student'), validate(setLocationSchema), setLocation);

export default router;
