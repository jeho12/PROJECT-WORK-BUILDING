import { Router } from 'express';
import { updateOwnProfile, listUsers } from './users.controller';
import { updateUserSchema } from './users.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.put('/me', authenticate, validate(updateUserSchema), updateOwnProfile);
router.get('/', authenticate, authorize('admin'), listUsers);

export default router;
