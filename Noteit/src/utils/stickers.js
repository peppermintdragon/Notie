import sticker1 from '../assets/stickers/sticker-1.png';
import sticker2 from '../assets/stickers/sticker-2.png';
import sticker3 from '../assets/stickers/sticker-3.png';
import sticker4 from '../assets/stickers/sticker-4.png';
import sticker5 from '../assets/stickers/sticker-5.png';

export const stickerOptions = [
  { id: 'sticker-1', src: sticker1, label: 'Sweet treat' },
  { id: 'sticker-2', src: sticker2, label: 'Twinkle star' },
  { id: 'sticker-3', src: sticker3, label: 'Twinkle trio' },
  { id: 'sticker-4', src: sticker4, label: 'Small steps' },
  { id: 'sticker-5', src: sticker5, label: 'Sunny snack' },
];

export const stickerMap = Object.fromEntries(stickerOptions.map((sticker) => [sticker.id, sticker]));

export const pushpinOptions = [
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

function parseDecorEntries(entries) {
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

export function addStickerInstance(stickers, stickerId) {
  const nextIndex = Array.isArray(stickers) ? stickers.length : 0;
  return [...normalizeStickerEntries(stickers), makeStickerInstance(stickerId, nextIndex)];
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
      if (sticker.type === 'pin') return null;

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

export function getPushpinColor(entries, fallback = 'honey') {
  const parsed = parseDecorEntries(entries);
  const meta = parsed.find((entry) => entry && typeof entry === 'object' && entry.type === 'pin');
  return pushpinMap[meta?.color] ? meta.color : fallback;
}

export function serializeStickerEntries(stickers, pinColor = 'honey') {
  const serialized = normalizeStickerEntries(stickers).map((sticker) => JSON.stringify(sticker));

  if (pinColor && pushpinMap[pinColor]) {
    serialized.push(JSON.stringify({ type: 'pin', color: pinColor }));
  }

  return serialized;
}

export function deserializeStickerEntries(stickers) {
  return normalizeStickerEntries(parseDecorEntries(stickers));
}
