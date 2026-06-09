import { Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { getPaginationParams } from '../../shared/pagination';

const adminService = new AdminService();

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    return ApiResponse.success(res, stats, 'Dashboard statistics fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createSupervisor = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const supervisor = await adminService.createSupervisor(req.body);
    return ApiResponse.success(res, supervisor, 'Supervisor account onboarded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const listSupervisors = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const { supervisors, total } = await adminService.listSupervisors(page, limit);
    return ApiResponse.paginated(res, supervisors, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const assignStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { student_id, supervisor_id } = req.body;
    const assignment = await adminService.assignStudent(student_id, supervisor_id);
    return ApiResponse.success(res, assignment, 'Student successfully assigned to supervisor');
  } catch (error) {
    next(error);
  }
};

export const listAssignments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await adminService.listAssignments();
    return ApiResponse.success(res, assignments, 'Allocations list retrieved');
  } catch (error) {
    next(error);
  }
};

export const listStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = getPaginationParams(req.query);
    const department = req.query.department as string | undefined;
    const faculty = req.query.faculty as string | undefined;
    const { students, total } = await adminService.listStudents(page, limit, department, faculty);
    return ApiResponse.paginated(res, students, total, page, limit);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.listUsers();
    return ApiResponse.success(res, users, 'System user directory retrieved');
  } catch (error) {
    next(error);
  }
};

export const toggleUserActive = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.toggleUserActive(req.params.userId);
    return ApiResponse.success(res, user, 'User status successfully toggled');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.deleteUser(req.params.userId);
    return ApiResponse.success(res, result, 'User deactivated successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await adminService.getAnalytics();
    return ApiResponse.success(res, analytics, 'Analytics data retrieved');
  } catch (error) {
    next(error);
  }
};
