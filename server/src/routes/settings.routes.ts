import { Router } from 'express';
import * as settings from '../controllers/settings.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/preferences', settings.getPreferences);
router.put('/preferences', settings.updatePreferences);
router.get('/export', requireCouple, settings.exportData);

export default router;
