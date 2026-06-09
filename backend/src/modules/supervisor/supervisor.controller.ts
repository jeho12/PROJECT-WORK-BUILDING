import { Response, NextFunction } from 'express';
import { SupervisorService } from './supervisor.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';

const supervisorService = new SupervisorService();

export const getAssignedStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const students = await supervisorService.getAssignedStudents(req.user!.id);
    return ApiResponse.success(res, students, 'Assigned students retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getStudentDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const student = await supervisorService.getStudentDetail(req.user!.id, req.params.studentId);
    return ApiResponse.success(res, student, 'Student details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getStudentWeeks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const weeks = await supervisorService.getStudentWeeks(req.user!.id, req.params.studentId);
    return ApiResponse.success(res, weeks, 'Student logbook weeks retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getStudentWeekDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const week = await supervisorService.getStudentWeekDetail(
      req.user!.id,
      req.params.studentId,
      req.params.weekId
    );
    return ApiResponse.success(res, week, 'Student weekly logs fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const reviewWeek = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const report = await supervisorService.reviewWeek(req.user!.id, req.params.weekId, req.body);
    return ApiResponse.success(res, report, 'Logbook week review updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await supervisorService.getDashboardStats(req.user!.id);
    return ApiResponse.success(res, stats, 'Supervisor dashboard statistics fetched');
  } catch (error) {
    next(error);
  }
};
