import { deserializeStickerEntries } from './stickers';
import { getCustomNoteStyle } from './customNoteStyle';

function getLocalNotesKey(boardKey = 'public') {
  return `notie-local-notes-${boardKey}`;
}

const demoNotesByBoard = {
  public: [
  {
    id: 'demo-1',
    created_at: '2026-04-09T08:00:00.000Z',
    name: 'SELENA',
    message: 'Today feels warm',
    design_id: 'cute-garden',
    theme_id: 'cream',
    stickers: [{ id: 's1', stickerId: 'sticker-5', x: 72, y: 20, scale: 0.95, rotation: 8 }],
    pos_x: 8,
    pos_y: 12,
    rotation: -16,
  },
  {
    id: 'demo-2',
    created_at: '2026-04-09T08:01:00.000Z',
    name: 'JOJO',
    message: 'Hello there',
    design_id: 'cute-blush',
    theme_id: 'lavender',
    stickers: [{ id: 's2', stickerId: 'sticker-2', x: 67, y: 71, scale: 0.84, rotation: 4 }],
    pos_x: 28,
    pos_y: 8,
    rotation: 18,
  },
  {
    id: 'demo-3',
    created_at: '2026-04-09T08:02:00.000Z',
    name: 'Anonymous',
    message: 'Small steps',
    design_id: 'cute-twinkle',
    theme_id: 'warm-gray',
    stickers: [
      { id: 's3', stickerId: 'sticker-4', x: 18, y: 24, scale: 0.88, rotation: -8 },
      { id: 's4', stickerId: 'sticker-3', x: 75, y: 76, scale: 0.86, rotation: 7 },
    ],
    pos_x: 46,
    pos_y: 24,
    rotation: -22,
  },
  {
    id: 'demo-4',
    created_at: '2026-04-09T08:03:00.000Z',
    name: 'MIA',
    message: 'Bloom slowly',
    design_id: 'cute-smile',
    theme_id: 'warm-gray',
    stickers: [{ id: 's5', stickerId: 'sticker-1', x: 18, y: 18, scale: 0.88, rotation: -10 }],
    pos_x: 70,
    pos_y: 18,
    rotation: 14,
  },
  ],
  occasion: [
    {
      id: 'occasion-demo-1',
      created_at: '2026-04-09T08:00:00.000Z',
      name: 'AVA',
      message: 'Wishing you both a soft and happy forever.',
      design_id: 'blank-paper',
      theme_id: 'champagne',
      stickers: [],
      pos_x: 12,
      pos_y: 12,
      rotation: -11,
    },
    {
      id: 'occasion-demo-2',
      created_at: '2026-04-09T08:01:00.000Z',
      name: 'MILO',
      message: 'May this day feel gentle, bright, and unforgettable.',
      design_id: 'cute-blush',
      theme_id: 'rosewater',
      stickers: [],
      pos_x: 34,
      pos_y: 10,
      rotation: 10,
    },
  ],
  friends: [
    {
      id: 'friends-demo-1',
      created_at: '2026-04-09T08:00:00.000Z',
      name: 'NOVA',
      message: 'You survived today. That deserves a sticker.',
      design_id: 'cute-garden',
      theme_id: 'mint',
      stickers: [{ id: 'fs1', stickerId: 'sticker-4', x: 75, y: 18, scale: 0.92, rotation: 9 }],
      pos_x: 10,
      pos_y: 12,
      rotation: -14,
    },
    {
      id: 'friends-demo-2',
      created_at: '2026-04-09T08:01:00.000Z',
      name: 'BEA',
      message: 'Emergency reminder: drink water and text back.',
      design_id: 'cute-smile',
      theme_id: 'dusty-blue',
      stickers: [{ id: 'fs2', stickerId: 'sticker-1', x: 20, y: 20, scale: 0.9, rotation: -8 }],
      pos_x: 36,
      pos_y: 16,
      rotation: 13,
    },
  ],
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeNotes(notes) {
  return notes.map((note) => ({
    ...note,
    custom_style: getCustomNoteStyle(note.stickers, note.custom_style || note.customStyle),
    stickers: deserializeStickerEntries(note.stickers),
  }));
}

export function getDemoNotes(boardKey = 'public') {
  const notes = demoNotesByBoard[boardKey] || demoNotesByBoard.public;
  return normalizeNotes(notes.map((note) => ({ ...note, board_type: boardKey })));
}

export function readLocalNotes(boardKey = 'public') {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(getLocalNotesKey(boardKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeNotes(parsed) : [];
  } catch {
    return [];
  }
}

export function writeLocalNotes(notes, boardKey = 'public') {
  if (!canUseStorage()) return;
  window.localStorage.setItem(getLocalNotesKey(boardKey), JSON.stringify(notes));
}

export function appendLocalNote(note, boardKey = 'public') {
  const next = [...readLocalNotes(boardKey), note].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  writeLocalNotes(next, boardKey);
}

export function updateLocalNote(noteId, patch, boardKey = 'public') {
  const next = readLocalNotes(boardKey).map((note) =>
    note.id === noteId
      ? {
          ...note,
          ...patch,
        }
      : note
  );
  writeLocalNotes(next, boardKey);
}

export function removeLocalNote(noteId, boardKey = 'public') {
  const next = readLocalNotes(boardKey).filter((note) => note.id !== noteId);
  writeLocalNotes(next, boardKey);
}

export function getBoardNotesWithFallback(boardKey = 'public') {
  const localNotes = readLocalNotes(boardKey);
  return localNotes.length ? localNotes : getDemoNotes(boardKey);
}
