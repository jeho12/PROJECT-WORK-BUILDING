import { z } from 'zod';

export const sessionSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  title: z.string().min(5, 'Session title must be at least 5 characters'),
  description: z.string().min(10, 'Session description must be at least 10 characters'),
  scheduledAt: z.string().min(1, 'Scheduled date and time is required'),
  duration: z.coerce.number().min(15, 'Minimum duration is 15 minutes'),
});

export type SessionInput = z.infer<typeof sessionSchema>;
