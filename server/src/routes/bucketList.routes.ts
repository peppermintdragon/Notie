import { Router } from 'express';
import * as bucket from '../controllers/bucketList.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBucketItemSchema, updateBucketItemSchema } from '../validators/bucketList.validator.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/', bucket.getBucketList);
router.post('/', validate(createBucketItemSchema), bucket.createBucketItem);
router.put('/:id', validate(updateBucketItemSchema), bucket.updateBucketItem);
router.patch('/:id/toggle', bucket.toggleBucketItem);
router.delete('/:id', bucket.deleteBucketItem);

export default router;
