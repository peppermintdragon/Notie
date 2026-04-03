import { Router } from 'express';
import * as note from '../controllers/note.controller.js';
import { authenticate, requireCouple } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { sendNoteSchema } from '../validators/note.validator.js';

const router = Router();

router.use(authenticate, requireCouple);

router.get('/', note.getNotes);
router.get('/streak', note.getNoteStreak);
router.post('/', validate(sendNoteSchema), note.sendNote);
router.put('/:id/read', note.markNoteRead);
router.delete('/:id', note.deleteNote);

export default router;
