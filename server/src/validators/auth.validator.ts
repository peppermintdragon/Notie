import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const onboardingStep1Schema = z.object({
  name: z.string().min(1).max(100),
  nickname: z.string().max(50).optional(),
  birthday: z.string().optional(),
  loveLanguage: z.enum([
    'WORDS_OF_AFFIRMATION', 'ACTS_OF_SERVICE', 'RECEIVING_GIFTS',
    'QUALITY_TIME', 'PHYSICAL_TOUCH',
  ]).optional(),
});

export const onboardingStep3Schema = z.object({
  relationshipStartDate: z.string(),
  howWeMet: z.string().max(500).optional(),
  coupleNickname: z.string().max(100).optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nickname: z.string().max(50).optional(),
  birthday: z.string().optional(),
  loveLanguage: z.enum([
    'WORDS_OF_AFFIRMATION', 'ACTS_OF_SERVICE', 'RECEIVING_GIFTS',
    'QUALITY_TIME', 'PHYSICAL_TOUCH',
  ]).optional(),
  timezone: z.string().optional(),
});
