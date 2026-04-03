import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { success, error } from '../utils/apiResponse.js';

export async function getPreferences(req: Request, res: Response) {
  const prefs = await prisma.userPreference.findUnique({
    where: { userId: req.userId },
  });

  if (!prefs) {
    const created = await prisma.userPreference.create({
      data: { userId: req.userId! },
    });
    return success(res, created);
  }

  return success(res, prefs);
}

export async function updatePreferences(req: Request, res: Response) {
  const prefs = await prisma.userPreference.upsert({
    where: { userId: req.userId! },
    update: req.body,
    create: { userId: req.userId!, ...req.body },
  });

  return success(res, prefs, 'Preferences updated! ⚙️');
}

export async function exportData(req: Request, res: Response) {
  const [user, memories, notes, moods, bucketList, specialDates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, nickname: true, birthday: true, loveLanguage: true, createdAt: true },
    }),
    prisma.memory.findMany({
      where: { coupleId: req.coupleId, deletedAt: null },
      include: { photos: { include: { media: true } } },
    }),
    prisma.dailyNote.findMany({
      where: { coupleId: req.coupleId, authorId: req.userId, deletedAt: null },
    }),
    prisma.moodEntry.findMany({
      where: { coupleId: req.coupleId, userId: req.userId },
    }),
    prisma.bucketListItem.findMany({
      where: { coupleId: req.coupleId, deletedAt: null },
    }),
    prisma.specialDate.findMany({
      where: { coupleId: req.coupleId },
    }),
  ]);

  return success(res, {
    exportDate: new Date().toISOString(),
    user,
    memories,
    notes,
    moods,
    bucketList,
    specialDates,
  });
}
