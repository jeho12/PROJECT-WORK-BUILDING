import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { logger } from '../../config/logger';

const authService = new AuthService();

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  logger.info("Request incomming to registration endpoint...");
  try {
    const user = await authService.register(req.body);

    return ApiResponse.success(res, user, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  
  try {
    logger.info("Request incomming to login endpoint...");
    const data = await authService.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string
    });
    return ApiResponse.success(res, data, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return ApiResponse.success(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.changePassword(req.user!.id, req.body);
    return ApiResponse.success(res, result, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.id);
    return ApiResponse.success(res, user, 'User profile fetched');
  } catch (error) {
    next(error);
  }
};
