import { Router } from 'express';
import * as notif from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notif.getNotifications);
router.put('/:id/read', notif.markRead);
router.put('/read-all', notif.markAllRead);

export default router;
