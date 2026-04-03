import { Router } from 'express';
import * as memory from '../controllers/memory.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAlbumSchema } from '../validators/memory.validator.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/', memory.getAlbums);
router.post('/', validate(createAlbumSchema), memory.createAlbum);
router.delete('/:id', memory.deleteAlbum);

export default router;
