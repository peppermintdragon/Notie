import { Router } from 'express';
import * as dateCtrl from '../controllers/date.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createSpecialDateSchema, updateSpecialDateSchema } from '../validators/date.validator.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/', dateCtrl.getSpecialDates);
router.get('/milestones', dateCtrl.getMilestones);
router.post('/', validate(createSpecialDateSchema), dateCtrl.createSpecialDate);
router.put('/:id', validate(updateSpecialDateSchema), dateCtrl.updateSpecialDate);
router.delete('/:id', dateCtrl.deleteSpecialDate);

export default router;
