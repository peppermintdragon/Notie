export function containsCjk(text = '') {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(text);
}

export function getNoteFontSize(text = '', stickers = []) {
  const len = text.trim().length;
  const hasStickers = Array.isArray(stickers) && stickers.length > 0;

  if (len <= 8) return hasStickers ? 28 : 32;
  if (len <= 15) return hasStickers ? 26 : 28;
  if (len <= 25) return hasStickers ? 22 : 24;
  if (len <= 40) return 19;
  if (len <= 60) return 16;
  if (len <= 80) return 14;
  return 12;
}

export function getBoardNoteFontSize(text = '', noteSize = 190, stickers = []) {
  const base = getNoteFontSize(text, stickers);
  const scale = Math.min(noteSize, 190) / 190;
  return Math.max(13, Math.round(base * scale));
}

export function getNoteMessageStyle({
  message = '',
  stickers = [],
  preview = false,
  board = false,
  noteSize = 190,
} = {}) {
  const hasCjk = containsCjk(message);
  const fontFamily = hasCjk
    ? 'var(--font-cjk-handwriting)'
    : 'var(--font-handwriting)';

  const fontSize = board
    ? getBoardNoteFontSize(message, noteSize, stickers)
    : getNoteFontSize(message, stickers);

  let lineHeight = hasCjk ? 1.34 : 1.28;
  if (fontSize >= 28) lineHeight = hasCjk ? 1.2 : 1.12;
  else if (fontSize >= 22) lineHeight = hasCjk ? 1.24 : 1.16;
  else if (fontSize <= 14) lineHeight = hasCjk ? 1.42 : 1.34;

  return {
    fontSize: `${preview || board ? fontSize : fontSize + 1}px`,
    lineHeight,
    fontFamily,
  };
}

