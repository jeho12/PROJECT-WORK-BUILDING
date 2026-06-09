import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';

const usersService = new UsersService();

export const updateOwnProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await usersService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.getAllUsers();
    return ApiResponse.success(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};
