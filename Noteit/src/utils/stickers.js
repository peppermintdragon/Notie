import sticker1 from '../assets/stickers/sticker-1.png';
import sticker2 from '../assets/stickers/sticker-2.png';
import sticker3 from '../assets/stickers/sticker-3.png';
import sticker4 from '../assets/stickers/sticker-4.png';
import sticker5 from '../assets/stickers/sticker-5.png';
import customAnimal1 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (1).png';
import customAnimal2 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (2).png';
import customAnimal3 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (3).png';
import customAnimal4 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (4).png';
import customAnimal5 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (5).png';
import customAnimal6 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (6).png';
import customAnimal7 from '../../NotesDesign/Customize/Customize/StickerPack/4x/animal (7).png';
import positiveWords1 from '../../NotesDesign/Customize/Customize/StickerPack/4x/PositiveWords1.png';
import positiveWords2 from '../../NotesDesign/Customize/Customize/StickerPack/4x/PositiveWords2.png';
import positiveWords3 from '../../NotesDesign/Customize/Customize/StickerPack/4x/PositiveWords3.png';
import positiveWords4 from '../../NotesDesign/Customize/Customize/StickerPack/4x/PositiveWords4.png';
import { createCustomNoteStyleEntry } from './customNoteStyle';

export const stickerPacks = [
  {
    id: 'starter-pack',
    label: 'Starter',
    items: [
      { id: 'sticker-1', src: sticker1, label: 'Sweet treat', kind: 'image' },
      { id: 'sticker-2', src: sticker2, label: 'Twinkle star', kind: 'image' },
      { id: 'sticker-3', src: sticker3, label: 'Twinkle trio', kind: 'image' },
      { id: 'sticker-4', src: sticker4, label: 'Small steps', kind: 'image' },
      { id: 'sticker-5', src: sticker5, label: 'Sunny snack', kind: 'image' },
    ],
  },
  {
    id: 'creature-pack',
    label: 'Creature pack',
    items: [
      { id: 'creature-1', src: customAnimal1, label: 'Creature 1', kind: 'image' },
      { id: 'creature-2', src: customAnimal2, label: 'Creature 2', kind: 'image' },
      { id: 'creature-3', src: customAnimal3, label: 'Creature 3', kind: 'image' },
      { id: 'creature-4', src: customAnimal4, label: 'Creature 4', kind: 'image' },
      { id: 'creature-5', src: customAnimal5, label: 'Creature 5', kind: 'image' },
      { id: 'creature-6', src: customAnimal6, label: 'Creature 6', kind: 'image' },
      { id: 'creature-7', src: customAnimal7, label: 'Creature 7', kind: 'image' },
    ],
  },
  {
    id: 'word-pack',
    label: 'Word pack',
    items: [
      { id: 'word-1', src: positiveWords1, label: 'Bright words 1', kind: 'image' },
      { id: 'word-2', src: positiveWords2, label: 'Bright words 2', kind: 'image' },
      { id: 'word-3', src: positiveWords3, label: 'Bright words 3', kind: 'image' },
      { id: 'word-4', src: positiveWords4, label: 'Bright words 4', kind: 'image' },
    ],
  },
  {
    id: 'emoji-pack',
    label: 'Emoji pack',
    items: [
      { id: 'emoji-flower', label: 'Flower', kind: 'emoji', emoji: '🌸' },
      { id: 'emoji-coffee', label: 'Coffee', kind: 'emoji', emoji: '☕' },
      { id: 'emoji-moon', label: 'Moon', kind: 'emoji', emoji: '🌙' },
      { id: 'emoji-sparkles', label: 'Sparkles', kind: 'emoji', emoji: '✨' },
      { id: 'emoji-cat', label: 'Cat', kind: 'emoji', emoji: '🐱' },
      { id: 'emoji-rabbit', label: 'Rabbit', kind: 'emoji', emoji: '🐰' },
      { id: 'emoji-strawberry', label: 'Strawberry', kind: 'emoji', emoji: '🍓' },
      { id: 'emoji-ribbon', label: 'Ribbon', kind: 'emoji', emoji: '🎀' },
      { id: 'emoji-star', label: 'Star', kind: 'emoji', emoji: '⭐' },
    ],
  },
];

export const stickerOptions = stickerPacks.flatMap((pack) =>
  pack.items.map((sticker) => ({
    ...sticker,
    packId: pack.id,
    packLabel: pack.label,
  }))
);

export const stickerMap = Object.fromEntries(stickerOptions.map((sticker) => [sticker.id, sticker]));

export const pushpinOptions = [
  { id: 'none', label: 'None', color: 'transparent', edge: 'transparent', shadow: 'transparent' },
  { id: 'honey', label: 'Honey', color: '#d8ad4f', edge: '#9c6d1f', shadow: 'rgba(112, 73, 20, 0.28)' },
  { id: 'berry', label: 'Berry', color: '#d97987', edge: '#964654', shadow: 'rgba(123, 52, 64, 0.28)' },
  { id: 'sage', label: 'Sage', color: '#9ab48a', edge: '#5f7c4f', shadow: 'rgba(79, 102, 61, 0.26)' },
  { id: 'sky', label: 'Sky', color: '#8fb5da', edge: '#4a6d96', shadow: 'rgba(64, 94, 132, 0.28)' },
  { id: 'plum', label: 'Plum', color: '#b596d9', edge: '#705293', shadow: 'rgba(92, 65, 122, 0.28)' },
];

export const pushpinMap = Object.fromEntries(pushpinOptions.map((pin) => [pin.id, pin]));

const defaultStickerSlots = [
  { x: 18, y: 20, scale: 1, rotation: -8 },
  { x: 66, y: 24, scale: 1, rotation: 7 },
  { x: 22, y: 70, scale: 0.94, rotation: -6 },
  { x: 68, y: 68, scale: 0.96, rotation: 6 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function parseDecorEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries
    .map((entry) => {
      if (typeof entry !== 'string') return entry;

      try {
        return JSON.parse(entry);
      } catch {
        return entry;
      }
    })
    .filter(Boolean);
}

function makeStickerInstance(stickerId, index = 0) {
  const slot = defaultStickerSlots[index % defaultStickerSlots.length];

  return {
    id: `placed-${Date.now()}-${index}`,
    stickerId,
    x: slot.x,
    y: slot.y,
    scale: slot.scale,
    rotation: slot.rotation,
  };
}

function makeStickerInstanceAt(stickerId, x, y, index = 0) {
  const slot = defaultStickerSlots[index % defaultStickerSlots.length];

  return {
    id: `placed-${Date.now()}-${index}`,
    stickerId,
    x: clamp(Number(x ?? slot.x), 6, 86),
    y: clamp(Number(y ?? slot.y), 8, 84),
    scale: slot.scale,
    rotation: slot.rotation,
  };
}

export function addStickerInstance(stickers, stickerId) {
  const nextIndex = Array.isArray(stickers) ? stickers.length : 0;
  return [...normalizeStickerEntries(stickers), makeStickerInstance(stickerId, nextIndex)];
}

export function addStickerInstanceAt(stickers, stickerId, x, y) {
  const nextIndex = Array.isArray(stickers) ? stickers.length : 0;
  return [...normalizeStickerEntries(stickers), makeStickerInstanceAt(stickerId, x, y, nextIndex)];
}

export function updateStickerEntry(stickers, stickerId, patch) {
  return normalizeStickerEntries(stickers).map((sticker) =>
    sticker.id === stickerId
      ? {
          ...sticker,
          ...patch,
          x: clamp((patch.x ?? sticker.x), 6, 86),
          y: clamp((patch.y ?? sticker.y), 8, 84),
        }
      : sticker
  );
}

export function removeStickerByAsset(stickers, stickerAssetId) {
  return normalizeStickerEntries(stickers).filter((sticker) => sticker.stickerId !== stickerAssetId);
}

export function normalizeStickerEntries(stickers) {
  if (!Array.isArray(stickers)) return [];

  return parseDecorEntries(stickers)
    .map((sticker, index) => {
      if (typeof sticker === 'string') {
        return makeStickerInstance(sticker, index);
      }

      if (!sticker || typeof sticker !== 'object') return null;
      if (sticker.type) return null;

      return {
        id: sticker.id || `placed-${index}`,
        stickerId: sticker.stickerId || sticker.id || `sticker-${index + 1}`,
        x: clamp(Number(sticker.x ?? 24), 6, 86),
        y: clamp(Number(sticker.y ?? 24), 8, 84),
        scale: Number(sticker.scale ?? 1),
        rotation: Number(sticker.rotation ?? 0),
      };
    })
    .filter(Boolean);
}

export function getPushpinColor(entries, fallback = null) {
  const parsed = parseDecorEntries(entries);
  const meta = parsed.find((entry) => entry && typeof entry === 'object' && entry.type === 'pin');
  return pushpinMap[meta?.color] ? meta.color : fallback;
}

export function serializeStickerEntries(stickers, pinColor = null, customStyle = null) {
  const serialized = normalizeStickerEntries(stickers).map((sticker) => JSON.stringify(sticker));

  if (customStyle) {
    serialized.push(JSON.stringify(createCustomNoteStyleEntry(customStyle)));
  }

  if (pinColor && pinColor !== 'none' && pushpinMap[pinColor]) {
    serialized.push(JSON.stringify({ type: 'pin', color: pinColor }));
  }

  return serialized;
}

export function deserializeStickerEntries(stickers) {
  return normalizeStickerEntries(parseDecorEntries(stickers));
}
