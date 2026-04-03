import { z } from 'zod';

export const createSpecialDateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  date: z.string(),
  type: z.enum(['ANNIVERSARY', 'BIRTHDAY', 'FIRST_DATE', 'CUSTOM']).default('CUSTOM'),
  isRecurring: z.boolean().default(true),
});

export const updateSpecialDateSchema = createSpecialDateSchema.partial();
