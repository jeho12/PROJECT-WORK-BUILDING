import { z } from 'zod';

export const dailyEntrySchema = z.object({
  timeIn: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  timeOut: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  activity: z.string().min(50, 'Activity must be at least 50 characters long'),
});

export type DailyEntryInput = z.infer<typeof dailyEntrySchema>;

export const weeklyReportSchema = z.object({
  projectsWorkedOn: z.string().min(5, 'Please specify project names'),
  sectionOrDepartment: z.string().min(2, 'Department/Section is required'),
  workDoneSummary: z.string().min(20, 'Please write a brief summary of work done (min 20 chars)'),
  studentComment: z.string().optional(),
});

export type WeeklyReportInput = z.infer<typeof weeklyReportSchema>;
