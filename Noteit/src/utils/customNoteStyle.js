import {
  DEFAULT_NOTE_STYLE,
  noteMakerColorMap,
  noteMakerPatternMap,
  noteMakerShapeMap,
} from './noteMakerConfig';
import { parseDecorEntries } from './stickers';

export const CUSTOM_NOTE_STYLE_TYPE = 'note-style';

export function normalizeCustomNoteStyle(style = {}) {
  return {
    shapeId: noteMakerShapeMap[style.shapeId] ? style.shapeId : DEFAULT_NOTE_STYLE.shapeId,
    colorId: noteMakerColorMap[style.colorId] ? style.colorId : DEFAULT_NOTE_STYLE.colorId,
    patternId: noteMakerPatternMap[style.patternId] ? style.patternId : DEFAULT_NOTE_STYLE.patternId,
  };
}

export function getCustomNoteStyle(entries, fallback = null) {
  if (fallback && typeof fallback === 'object') {
    return normalizeCustomNoteStyle(fallback);
  }

  const parsed = parseDecorEntries(entries);
  const meta = parsed.find((entry) => entry && typeof entry === 'object' && entry.type === CUSTOM_NOTE_STYLE_TYPE);

  if (!meta) return null;
  return normalizeCustomNoteStyle(meta.value || meta.style || meta);
}

export function createCustomNoteStyleEntry(style) {
  return {
    type: CUSTOM_NOTE_STYLE_TYPE,
    value: normalizeCustomNoteStyle(style),
  };
}
