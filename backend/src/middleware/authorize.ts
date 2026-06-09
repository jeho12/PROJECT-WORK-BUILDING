import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';
import { AppError } from '../shared/AppError';

export const authorize = (...roles: ('student' | 'supervisor' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
};
