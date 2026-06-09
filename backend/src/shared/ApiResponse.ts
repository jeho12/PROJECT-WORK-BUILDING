import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', status = 200) {
    return res.status(status).json({ success: true, message, data });
  }

  static error(res: Response, message: string, status = 400, errors?: unknown) {
    return res.status(status).json({ success: false, message, errors: errors ?? null });
  }

  static paginated<T>(res: Response, data: T[], total: number, page: number, limit: number) {
    return res.status(200).json({
      success: true,
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  }
}
