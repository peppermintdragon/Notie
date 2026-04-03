import { z } from 'zod';

export const sendNoteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty').max(2000),
  emotionIcon: z.string().min(1),
});

export const noteQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('50'),
  date: z.string().optional(),
});
