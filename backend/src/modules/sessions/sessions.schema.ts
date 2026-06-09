import { z } from 'zod';

export const scheduleSessionSchema = z.object({
  body: z.object({
    student_id: z.string({ required_error: 'Student ID is required' }),
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    description: z.string().optional(),
    scheduled_at: z.string().transform((str) => new Date(str)),
    duration_minutes: z.coerce.number().default(30),
  }),
});

export const verifyLocationSchema = z.object({
  body: z.object({
    latitude: z.coerce.number({ required_error: 'Latitude is required' }),
    longitude: z.coerce.number({ required_error: 'Longitude is required' }),
  }),
});
