import { Router } from 'express';
import authRoutes from './auth.routes.js';
import coupleRoutes from './couple.routes.js';
import memoryRoutes from './memory.routes.js';
import albumRoutes from './album.routes.js';
import noteRoutes from './note.routes.js';
import moodRoutes from './mood.routes.js';
import dateRoutes from './date.routes.js';
import bucketListRoutes from './bucketList.routes.js';
import pingRoutes from './ping.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/couple', coupleRoutes);
router.use('/memories', memoryRoutes);
router.use('/albums', albumRoutes);
router.use('/notes', noteRoutes);
router.use('/mood', moodRoutes);
router.use('/dates', dateRoutes);
router.use('/bucket-list', bucketListRoutes);
router.use('/pings', pingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;
