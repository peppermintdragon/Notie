import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { success, error } from '../utils/apiResponse.js';

export async function sendPing(req: Request, res: Response) {
  // Get partner
  const coupleUsers = await prisma.coupleUser.findMany({
    where: { coupleId: req.coupleId },
    select: { userId: true },
  });

  const partnerId = coupleUsers.find((cu) => cu.userId !== req.userId)?.userId;
  if (!partnerId) {
    return error(res, 'No partner found', 400);
  }

  // Rate limit: max 10 pings per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentPings = await prisma.ping.count({
    where: {
      senderId: req.userId,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentPings >= 10) {
    return error(res, 'Too many pings! Give your partner a moment 😄', 429);
  }

  const ping = await prisma.ping.create({
    data: {
      coupleId: req.coupleId!,
      senderId: req.userId!,
      receiverId: partnerId,
    },
  });

  // Create notification
  const sender = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { name: true },
  });

  await prisma.notification.create({
    data: {
      userId: partnerId,
      type: 'PING',
      title: 'Thinking of You 💕',
      body: `${sender?.name} is thinking of you right now!`,
    },
  });

  return success(res, {
    id: ping.id,
    createdAt: ping.createdAt.toISOString(),
  }, 'Ping sent! Your partner will feel the love 💕', 201);
}

export async function getRecentPings(req: Request, res: Response) {
  const pings = await prisma.ping.findMany({
    where: {
      coupleId: req.coupleId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    include: {
      sender: { select: { id: true, name: true, profilePhoto: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return success(res, pings.map((p) => ({
    id: p.id,
    sender: p.sender,
    createdAt: p.createdAt.toISOString(),
  })));
}
