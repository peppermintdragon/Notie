import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { success } from '../utils/apiResponse.js';

export async function getNotifications(req: Request, res: Response) {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId: req.userId } }),
    prisma.notification.count({ where: { userId: req.userId, readAt: null } }),
  ]);

  return success(res, {
    notifications: notifications.map((n: typeof notifications[number]) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      readAt: n.readAt?.toISOString(),
      createdAt: n.createdAt.toISOString(),
    })),
    total,
    unreadCount,
    page,
    pageSize,
  });
}

export async function markRead(req: Request, res: Response) {
  await prisma.notification.update({
    where: { id: req.params.id as string, userId: req.userId },
    data: { readAt: new Date() },
  });

  return success(res, null);
}

export async function markAllRead(req: Request, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.userId, readAt: null },
    data: { readAt: new Date() },
  });

  return success(res, null, 'All notifications marked as read');
}
