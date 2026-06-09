import { Response, NextFunction } from 'express';
import { SessionsService } from './sessions.service';
import { ApiResponse } from '../../shared/ApiResponse';
import { AuthenticatedRequest } from '../../middleware/authenticate';

const sessionsService = new SessionsService();

export const scheduleSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const session = await sessionsService.scheduleSession(req.user!.id, req.body);
    return ApiResponse.success(res, session, 'Supervision session scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getSupervisorSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionsService.getSupervisorSessions(req.user!.id);
    return ApiResponse.success(res, sessions, 'Supervision sessions retrieved');
  } catch (error) {
    next(error);
  }
};

export const getStudentSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionsService.getStudentSessions(req.user!.id);
    return ApiResponse.success(res, sessions, 'Supervision sessions retrieved');
  } catch (error) {
    next(error);
  }
};

export const getSessionDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const session = await sessionsService.getSessionDetail(req.params.sessionId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, session, 'Session details retrieved');
  } catch (error) {
    next(error);
  }
};

export const verifyLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await sessionsService.verifyLocation(req.params.sessionId, req.user!.id, req.body);
    return ApiResponse.success(res, result, 'Location verification executed');
  } catch (error) {
    next(error);
  }
};

export const joinSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const session = await sessionsService.joinSession(req.params.sessionId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, session, 'Successfully joined consultation room');
  } catch (error) {
    next(error);
  }
};

export const cancelSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const session = await sessionsService.cancelSession(req.params.sessionId, req.user!.id);
    return ApiResponse.success(res, session, 'Supervision session cancelled successfully');
  } catch (error) {
    next(error);
  }
};
