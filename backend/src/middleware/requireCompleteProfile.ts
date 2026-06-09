import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from './authenticate';
import { AppError } from '../shared/AppError';

export const requireCompleteProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    // Admins and supervisors bypass profile checks
    if (req.user.role !== 'student') {
      return next();
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id },
    });

    if (!profile || !profile.profile_complete) {
      throw new AppError('Complete your student profile with organization details first', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
