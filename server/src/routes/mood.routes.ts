import { Router } from 'express';
import * as mood from '../controllers/mood.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { setMoodSchema } from '../validators/mood.validator.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/today', mood.getTodayMoods);
router.get('/calendar', mood.getMoodCalendar);
router.get('/insights', mood.getMoodInsights);
router.post('/', validate(setMoodSchema), mood.setMood);

export default router;
