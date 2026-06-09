import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../shared/AppError';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'fields';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  // Unexpected errors
  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Server Error',
  });
};
