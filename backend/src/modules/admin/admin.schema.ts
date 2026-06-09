import { z } from 'zod';

export const createSupervisorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const assignStudentSchema = z.object({
  body: z.object({
    student_id: z.string({ required_error: 'Student ID is required' }),
    supervisor_id: z.string().nullable().optional(),
  }),
});
