import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import profileRoutes from './modules/student-profile/profile.routes';
import logbookRoutes from './modules/logbook/logbook.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import supervisorRoutes from './modules/supervisor/supervisor.routes';
import aiRoutes from './modules/ai/ai.routes';
import sessionsRoutes from './modules/sessions/sessions.routes';
import adminRoutes from './modules/admin/admin.routes';

const rootRouter = Router();

rootRouter.use('/auth', authRoutes);
rootRouter.use('/users', usersRoutes);
rootRouter.use('/profile', profileRoutes);
rootRouter.use('/logbook', logbookRoutes);
rootRouter.use('/attendance', attendanceRoutes);
rootRouter.use('/supervisor', supervisorRoutes);
rootRouter.use('/ai', aiRoutes);
rootRouter.use('/sessions', sessionsRoutes);
rootRouter.use('/admin', adminRoutes);

export { rootRouter };
