import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, requireCouple, getDashboard);

export default router;
