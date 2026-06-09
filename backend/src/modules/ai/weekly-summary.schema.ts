import { z } from 'zod';

export const weeklySummarySchema = z.object({
  params: z.object({
    weekId: z.string({ required_error: 'Week ID is required' }),
  }),
});
