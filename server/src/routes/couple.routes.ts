import { Router } from 'express';
import * as couple from '../controllers/couple.controller.js';
import { disconnectCouple } from '../controllers/auth.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/', couple.getCoupleProfile);
router.put('/', couple.updateCoupleProfile);
router.get('/stats', couple.getCoupleStats);
router.post('/cover-photo', upload.single('photo'), couple.uploadCoverPhoto);
router.delete('/disconnect', disconnectCouple);

export default router;
