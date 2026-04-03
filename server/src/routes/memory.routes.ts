import { Router } from 'express';
import * as memory from '../controllers/memory.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { createMemorySchema, updateMemorySchema } from '../validators/memory.validator.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/', memory.getMemories);
router.get('/on-this-day', memory.getOnThisDay);
router.get('/:id', memory.getMemory);
router.post('/', upload.array('photos', 10), memory.createMemory);
router.put('/:id', validate(updateMemorySchema), memory.updateMemory);
router.delete('/:id', memory.deleteMemory);

export default router;
