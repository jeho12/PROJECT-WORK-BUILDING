import { Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { getPaginationParams } from '../../shared/pagination';

const attendanceService = new AttendanceService();

export const checkIn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const log = await attendanceService.checkIn(req.user!.id, req.body, ipAddress);
    return ApiResponse.success(res, log, 'Successfully checked in with GPS verification', 201);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const log = await attendanceService.checkOut(req.user!.id, req.body);
    return ApiResponse.success(res, log, 'Successfully checked out with GPS verification');
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = await attendanceService.getTodayStatus(req.user!.id);
    return ApiResponse.success(res, status, 'Today attendance status fetched');
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const { logs, total } = await attendanceService.getHistory(req.user!.id, page, limit);
    return ApiResponse.paginated(res, logs, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await attendanceService.getStats(req.user!.id);
    return ApiResponse.success(res, stats, 'Attendance statistics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await attendanceService.getStudentAttendance(req.user!.id, req.params.studentId);
    return ApiResponse.success(res, logs, 'Student attendance logs retrieved successfully');
  } catch (error) {
    next(error);
  }
};
