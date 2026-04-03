import { z } from 'zod';

export const setMoodSchema = z.object({
  mood: z.enum(['HAPPY', 'LOVED', 'TIRED', 'ANXIOUS', 'EXCITED', 'SAD', 'GRATEFUL', 'SILLY']),
});

export const moodCalendarQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
});
