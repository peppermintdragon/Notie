import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../utils/prisma.js';
import { error } from '../utils/apiResponse.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      coupleId?: string;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
      include: { coupleUsers: { select: { coupleId: true } } },
    });

    if (!user) {
      return error(res, 'User not found', 401);
    }

    req.userId = user.id;
    req.coupleId = user.coupleUsers[0]?.coupleId;
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
}

export async function requireCouple(req: Request, res: Response, next: NextFunction) {
  if (!req.coupleId) {
    return error(res, 'You must be part of a couple to access this resource', 403);
  }
  next();
}
