import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    matric_number: z.string().min(3, 'Matric number must be at least 3 characters long'),
    department: z.string().min(2, 'Department is required'),
    faculty: z.string().min(2, 'Faculty is required'),
    programme: z.string().optional().nullable(),
    level: z.string().min(1, 'Level is required'),
    school_email: z.string().email('Invalid school email address').optional().nullable(),
    organization_name: z.string().min(2, 'Organization name is required').optional().nullable(),
    organization_address: z.string().min(2, 'Organization address is required').optional().nullable(),
    organization_latitude: z.coerce.number().optional().nullable(),
    organization_longitude: z.coerce.number().optional().nullable(),
    industry_supervisor_name: z.string().optional().nullable(),
    training_start_date: z.string().transform((str) => new Date(str)).optional().nullable(),
    training_end_date: z.string().transform((str) => new Date(str)).optional().nullable(),
  }),
});

export const setLocationSchema = z.object({
  body: z.object({
    organization_latitude: z.coerce.number({ required_error: 'Latitude is required' }),
    organization_longitude: z.coerce.number({ required_error: 'Longitude is required' }),
    organization_address: z.string().min(1, 'Address is required'),
  }),
});
