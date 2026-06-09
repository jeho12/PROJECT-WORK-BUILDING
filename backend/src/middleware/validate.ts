import { Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AuthenticatedRequest } from './authenticate';

export const validate = (schema: ZodSchema) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Assign validated parts back to request
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.params !== undefined) req.params = result.data.params;
  if (result.data.query !== undefined) req.query = result.data.query;
  req.validated = result.data;
  
  next();
};
