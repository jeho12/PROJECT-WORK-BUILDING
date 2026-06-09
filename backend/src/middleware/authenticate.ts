import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../shared/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'supervisor' | 'admin';
    is_active: boolean;
  };
  validated?: any;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired token', 401);
    }

    if (!decoded || !decoded.sub) {
      throw new AppError('Invalid token payload', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, role: true, is_active: true }
    });

    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user as any;
    next();
  } catch (err) {
    next(err);
  }
};
