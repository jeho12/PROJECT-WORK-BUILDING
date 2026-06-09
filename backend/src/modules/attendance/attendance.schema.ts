import { z } from 'zod';

export const checkInSchema = z.object({
  body: z.object({
    latitude: z.coerce.number({ required_error: 'Latitude is required' }),
    longitude: z.coerce.number({ required_error: 'Longitude is required' }),
    address: z.string().min(1, 'Address is required'),
    logbook_day_id: z.string({ required_error: 'Logbook day ID is required' }),
    device_info: z.string().optional(),
  }),
});

export const checkOutSchema = z.object({
  body: z.object({
    latitude: z.coerce.number({ required_error: 'Latitude is required' }),
    longitude: z.coerce.number({ required_error: 'Longitude is required' }),
    address: z.string().min(1, 'Address is required'),
    device_info: z.string().optional(),
  }),
});
