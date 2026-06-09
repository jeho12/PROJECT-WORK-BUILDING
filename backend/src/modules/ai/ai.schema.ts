import { z } from 'zod';

export const generateReviewSchema = z.object({
  body: z.object({
    student_id: z.string({ required_error: 'Student ID is required' }),
    month: z.coerce.number().min(1).max(12, 'Month must be between 1 and 12'),
    year: z.coerce.number().min(2000).max(2100, 'Year must be a valid four-digit year'),
  }),
});
