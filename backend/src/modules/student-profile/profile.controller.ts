import { Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { AppError } from '../../shared/AppError';

const profileService = new ProfileService();

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    return ApiResponse.success(res, profile, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadPassport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No passport file uploaded', 400);
    }
    // Set a relative URL path that Express static folder will resolve
    const relativePath = `/uploads/${req.file.filename}`;
    const profile = await profileService.updatePassport(req.user!.id, relativePath);
    return ApiResponse.success(res, profile, 'Passport photo uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const setLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await profileService.setLocation(req.user!.id, req.body);
    return ApiResponse.success(res, profile, 'Organization location configured successfully');
  } catch (error) {
    next(error);
  }
};
