import { deserializeStickerEntries } from './stickers';

const LOCAL_NOTES_KEY = 'notie-local-notes';

const demoNotes = [
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
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeNotes(notes) {
  return notes.map((note) => ({
    ...note,
    stickers: deserializeStickerEntries(note.stickers),
  }));
}

export function getDemoNotes() {
  return normalizeNotes(demoNotes.map((note) => ({ ...note })));
}

export function readLocalNotes() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeNotes(parsed) : [];
  } catch {
    return [];
  }
}

export function writeLocalNotes(notes) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
}

export function appendLocalNote(note) {
  const next = [...readLocalNotes(), note].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  writeLocalNotes(next);
}

export function updateLocalNote(noteId, patch) {
  const next = readLocalNotes().map((note) =>
    note.id === noteId
      ? {
          ...note,
          ...patch,
        }
      : note
  );
  writeLocalNotes(next);
}

export function removeLocalNote(noteId) {
  const next = readLocalNotes().filter((note) => note.id !== noteId);
  writeLocalNotes(next);
}

export function getBoardNotesWithFallback() {
  const localNotes = readLocalNotes();
  return localNotes.length ? localNotes : getDemoNotes();
}
