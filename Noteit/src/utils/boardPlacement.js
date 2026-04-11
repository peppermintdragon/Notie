const BOARD_PADDING_X = 42;
const BOARD_PADDING_Y = 44;
const SECTION_GAP = 74;
const SECTION_WIDTH = 1320;
const SECTION_HEIGHT = 620;
const SECTION_ROWS = 2;
const SECTION_COLUMNS = 4;
const NOTES_PER_SECTION = SECTION_ROWS * SECTION_COLUMNS;

function createSeed(value) {
  return String(value || 'note')
    .split('')
    .reduce((total, char, index) => total + char.charCodeAt(0) * (index + 1), 0);
}

function seededRandom(seed) {
  const next = Math.sin(seed) * 10000;
  return next - Math.floor(next);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getSectionCount(noteCount) {
  return Math.max(1, Math.ceil(Math.max(noteCount, 1) / NOTES_PER_SECTION));
}

export function getBoardWidth(noteCount) {
  const sectionCount = getSectionCount(noteCount);
  return BOARD_PADDING_X * 2 + sectionCount * SECTION_WIDTH + Math.max(0, sectionCount - 1) * SECTION_GAP;
}

export function getBoardHeight() {
  return SECTION_HEIGHT + BOARD_PADDING_Y * 2;
}

export function getBoardSections(noteCount) {
  const sectionCount = getSectionCount(noteCount);

  return Array.from({ length: sectionCount }, (_, index) => {
    const x = BOARD_PADDING_X + index * (SECTION_WIDTH + SECTION_GAP);
    return {
      id: `section-${index + 1}`,
      index,
      x,
      width: SECTION_WIDTH,
      noteCount: NOTES_PER_SECTION,
    };
  });
}

export function generateBoardLayout(note, index, totalNotes, boardWidth = getBoardWidth(totalNotes), boardHeight = getBoardHeight()) {
  const sectionIndex = Math.floor(index / NOTES_PER_SECTION);
  const slot = index % NOTES_PER_SECTION;
  const col = slot % SECTION_COLUMNS;
  const row = Math.floor(slot / SECTION_COLUMNS);
  const sectionStart = BOARD_PADDING_X + sectionIndex * (SECTION_WIDTH + SECTION_GAP);
  const cellW = SECTION_WIDTH / SECTION_COLUMNS;
  const cellH = SECTION_HEIGHT / SECTION_ROWS;
  const seed = createSeed(`${note.id || note.created_at || index}-${index}-${totalNotes}`);

  const randomX = seededRandom(seed + 1);
  const randomY = seededRandom(seed + 2);
  const randomRotate = seededRandom(seed + 3);
  const randomScale = seededRandom(seed + 4);
  const randomLayer = seededRandom(seed + 5);
  const randomTilt = seededRandom(seed + 6);

  const x = sectionStart + col * cellW + cellW * 0.06 + randomX * cellW * 0.28;
  const y = BOARD_PADDING_Y + row * cellH + cellH * 0.08 + randomY * cellH * 0.24;
  const tiltDirection = randomRotate > 0.5 ? 1 : -1;
  const rotation = tiltDirection * (8 + randomTilt * 16);
  const scale = 0.91 + randomScale * 0.15;
  const zIndex = sectionIndex * 20 + row * 3 + Math.floor(randomLayer * 6) + 10;

  return {
    x: clamp(x, sectionStart + 12, Math.min(sectionStart + SECTION_WIDTH - 280, boardWidth - 260)),
    y: clamp(y, BOARD_PADDING_Y + 12, boardHeight - 290),
    rotation,
    scale,
    row,
    sectionIndex,
    zIndex,
  };
}

export function getBalancedPlacement(existingNotes = []) {
  const nextIndex = existingNotes.length;
  const totalNotes = nextIndex + 1;
  const boardWidth = getBoardWidth(totalNotes);
  const boardHeight = getBoardHeight();
  const layout = generateBoardLayout({ id: `draft-${totalNotes}` }, nextIndex, totalNotes, boardWidth, boardHeight);

  return {
    pos_x: Number(((layout.x / boardWidth) * 100).toFixed(2)),
    pos_y: Number(((layout.y / boardHeight) * 100).toFixed(2)),
    rotation: Number(layout.rotation.toFixed(2)),
  };
}
