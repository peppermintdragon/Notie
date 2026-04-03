import { z } from 'zod';

export const createBucketItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['TRAVEL', 'FOOD', 'EXPERIENCE', 'MOVIES', 'ADVENTURE', 'LEARNING', 'FITNESS', 'OTHER']).default('OTHER'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
});

export const updateBucketItemSchema = createBucketItemSchema.partial();

export const bucketListQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(['all', 'completed', 'pending']).default('all'),
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('50'),
});
