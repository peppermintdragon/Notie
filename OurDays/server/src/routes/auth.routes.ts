import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.middleware.js';
import { avatarUpload } from '../middleware/upload.middleware.js';
import {
  registerSchema, loginSchema, forgotPasswordSchema,
  refreshTokenSchema, onboardingStep1Schema, onboardingStep3Schema,
  changePasswordSchema, updateProfileSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Public
router.post('/register', authLimiter, validate(registerSchema), auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/refresh', validate(refreshTokenSchema), auth.refreshTokenHandler);
router.post('/forgot-password', strictLimiter, validate(forgotPasswordSchema), auth.forgotPassword);

// Authenticated
router.get('/me', authenticate, auth.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), auth.updateProfile);
router.post('/avatar', authenticate, avatarUpload.single('avatar'), auth.uploadAvatar);
router.post('/logout', authenticate, auth.logout);
router.put('/change-password', authenticate, validate(changePasswordSchema), auth.changePassword);
router.delete('/account', authenticate, auth.deleteAccount);

// Onboarding
router.put('/onboarding/step1', authenticate, validate(onboardingStep1Schema), auth.onboardingStep1);
router.post('/onboarding/create-couple', authenticate, auth.createCouple);
router.post('/onboarding/join-couple', authenticate, auth.joinCouple);
router.put('/onboarding/step3', authenticate, validate(onboardingStep3Schema), auth.onboardingStep3);
router.post('/onboarding/complete', authenticate, auth.completeOnboarding);

export default router;
