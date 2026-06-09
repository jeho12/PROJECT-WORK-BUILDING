import { Router } from 'express';
import { register, login, logout, changePassword, getMe } from './auth.controller';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
