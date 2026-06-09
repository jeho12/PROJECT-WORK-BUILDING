import { Response, NextFunction } from 'express';
import { LogbookService } from './logbook.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { AppError } from '../../shared/AppError';

const logbookService = new LogbookService();

export const getWeeks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const weeks = await logbookService.getWeeks(req.user!.id);
    return ApiResponse.success(res, weeks, 'Weeks retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createWeek = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const week = await logbookService.createWeek(req.user!.id, req.body);
    return ApiResponse.success(res, week, 'Logbook week generated successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getWeekDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const week = await logbookService.getWeekDetail(req.params.weekId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, week, 'Week details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteWeek = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await logbookService.deleteWeek(req.params.weekId, req.user!.id);
    return ApiResponse.success(res, result, 'Week deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getDayDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const day = await logbookService.getDayDetail(req.params.dayId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, day, 'Day details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateDay = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const day = await logbookService.updateDay(req.params.dayId, req.user!.id, req.body);
    return ApiResponse.success(res, day, 'Day entry saved successfully');
  } catch (error) {
    next(error);
  }
};

export const submitDay = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const day = await logbookService.submitDay(req.params.dayId, req.user!.id, req.body);
    return ApiResponse.success(res, day, 'Day entry submitted and permanently locked successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No attachment file uploaded', 400);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = await logbookService.uploadAttachment(req.params.dayId, req.user!.id, {
      url: fileUrl,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });

    return ApiResponse.success(res, attachment, 'Attachment uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await logbookService.deleteAttachment(req.params.attachId, req.user!.id);
    return ApiResponse.success(res, result, 'Attachment deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const submitReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const report = await logbookService.submitWeeklyReport(req.params.weekId, req.user!.id, req.body);
    return ApiResponse.success(res, report, 'Weekly report submitted for review successfully');
  } catch (error) {
    next(error);
  }
};
