import { Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';

const aiService = new AIService();

export const generateReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { student_id, month, year } = req.body;
    const review = await aiService.generateReview(req.user!.id, student_id, month, year);
    return ApiResponse.success(res, review, 'AI review generated successfully');
  } catch (error) {
    next(error);
  }
};

export const getStudentReviews = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await aiService.getStudentReviews(req.user!.id, req.params.studentId);
    return ApiResponse.success(res, reviews, 'Student reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const review = await aiService.getReview(req.user!.id, req.user!.role, req.params.reviewId);
    return ApiResponse.success(res, review, 'AI review retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const generateWeeklySummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const review = await aiService.generateWeeklySummary(req.user!.id, req.params.weekId);
    return ApiResponse.success(res, review, 'Weekly AI summary generated successfully');
  } catch (error) {
    next(error);
  }
};
