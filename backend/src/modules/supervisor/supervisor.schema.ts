import { z } from 'zod';

export const reviewWeekSchema = z.object({
  body: z.object({
    review_status: z.enum(['approved', 'rejected'], { required_error: 'Review status is required' }),
    supervisor_comment: z.string().min(5, 'Comment must be at least 5 characters long'),
    supervisor_name: z.string().min(2, 'Supervisor name is required'),
    supervisor_rank: z.string().min(2, 'Supervisor rank is required'),
  }),
});
