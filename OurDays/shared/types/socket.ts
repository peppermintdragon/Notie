import type { DailyNoteItem, NotificationItem } from './api';
import type { MoodType } from './enums';

// ─── Client → Server Events ─────────────────────────────────

export interface ClientToServerEvents {
  'note:send': (data: { content: string; emotionIcon: string }) => void;
  'note:typing': (data: { isTyping: boolean }) => void;
  'note:read': (data: { noteId: string }) => void;
  'ping:send': () => void;
  'mood:set': (data: { mood: MoodType }) => void;
}

// ─── Server → Client Events ─────────────────────────────────

export interface ServerToClientEvents {
  'note:received': (note: DailyNoteItem) => void;
  'note:partner-typing': (data: { isTyping: boolean }) => void;
  'note:read-receipt': (data: { noteId: string; readAt: string }) => void;
  'ping:received': (data: { senderId: string; senderName: string; createdAt: string }) => void;
  'mood:partner-updated': (data: { mood: MoodType; date: string }) => void;
  'mood:match': (data: { mood: MoodType; date: string }) => void;
  'notification:new': (notification: NotificationItem) => void;
  'partner:online': (data: { isOnline: boolean }) => void;
}
