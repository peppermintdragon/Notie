import { Router } from 'express';
import * as ping from '../controllers/ping.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireCouple);

router.post('/', ping.sendPing);
router.get('/recent', ping.getRecentPings);

export default router;
