import { z } from 'zod';

export const createWeekSchema = z.object({
  body: z.object({
    week_start_date: z.string().transform((str) => new Date(str)),
    week_end_date: z.string().transform((str) => new Date(str)),
  }),
});

export const updateDaySchema = z.object({
  body: z.object({
    time_in: z.string().min(1, 'Time-in is required'),
    time_out: z.string().min(1, 'Time-out is required'),
    activity: z.string().min(50, 'Activity description must be at least 50 characters long to demonstrate academic engagement'),
  }),
});

export const submitReportSchema = z.object({
  body: z.object({
    projects: z.string().optional().nullable(),
    section_department: z.string().optional().nullable(),
    student_comment: z.string().optional().nullable(),
    work_done: z.string().optional().nullable(),
  }),
});
