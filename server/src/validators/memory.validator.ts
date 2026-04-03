import { z } from 'zod';

export const createMemorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  date: z.string(),
  location: z.string().max(200).optional(),
  moodTag: z.enum(['HAPPY', 'LOVED', 'TIRED', 'ANXIOUS', 'EXCITED', 'SAD', 'GRATEFUL', 'SILLY']).optional(),
  albumId: z.string().uuid().optional(),
});

export const updateMemorySchema = createMemorySchema.partial();

export const createAlbumSchema = z.object({
  name: z.string().min(1, 'Album name is required').max(100),
});

export const memoryQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('20'),
  search: z.string().optional(),
  moodTag: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  albumId: z.string().optional(),
  view: z.enum(['timeline', 'grid', 'list']).default('grid'),
});
