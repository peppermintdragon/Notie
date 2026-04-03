import rateLimit from 'express-rate-limit';

export function createRateLimiter(options?: { windowMs?: number; max?: number }) {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000,
    max: options?.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
  });
}

export const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
export const strictLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
