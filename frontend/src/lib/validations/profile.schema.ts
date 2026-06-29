import { z } from 'zod';

export const profileSchema = z.object({
  matricNumber: z.string().min(5, 'Matric number must be at least 5 characters'),
  department: z.string().min(2, 'Department is required'),
  faculty: z.string().min(2, 'Faculty is required'),
  programme: z.string().min(2, 'Programme is required'),
  level: z.enum(['100', '200', '300', '400', '500']),
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),

  organizationAddress: z.string().min(10, 'Organization address must be at least 10 characters'),
  trainingStartDate: z.string().min(1, 'Start date is required'),
  trainingEndDate: z.string().min(1, 'End date is required'),
  industrySupervisorName: z.string().min(3, 'Industry supervisor name must be at least 3 characters'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
