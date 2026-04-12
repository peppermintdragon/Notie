const BOARD_PADDING_X = 42;
const BOARD_PADDING_Y = 44;
const SECTION_GAP = 74;
const SECTION_WIDTH = 1320;
const SECTION_HEIGHT = 620;
const NOTES_PER_SECTION = 8;
const MESSY_ANCHORS = [
  { x: 0.1, y: 0.08 },
  { x: 0.32, y: 0.04 },
  { x: 0.57, y: 0.11 },
  { x: 0.76, y: 0.08 },
  { x: 0.04, y: 0.52 },
  { x: 0.29, y: 0.58 },
  { x: 0.53, y: 0.5 },
  { x: 0.79, y: 0.57 },
];

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
  const sectionStart = BOARD_PADDING_X + sectionIndex * (SECTION_WIDTH + SECTION_GAP);
  const seed = createSeed(`${note.id || note.created_at || index}-${index}-${totalNotes}`);
  const anchor = MESSY_ANCHORS[slot % MESSY_ANCHORS.length];

  const randomX = seededRandom(seed + 1);
  const randomY = seededRandom(seed + 2);
  const randomRotate = seededRandom(seed + 3);
  const randomScale = seededRandom(seed + 4);
  const randomLayer = seededRandom(seed + 5);
  const randomTilt = seededRandom(seed + 6);
  const randomOverlap = seededRandom(seed + 7);

  const x = sectionStart + SECTION_WIDTH * anchor.x + (randomX - 0.5) * 130;
  const y = BOARD_PADDING_Y + SECTION_HEIGHT * anchor.y + (randomY - 0.5) * 92;
  const tiltDirection = randomRotate > 0.5 ? 1 : -1;
  const rotation = tiltDirection * (0.6 + randomTilt * 4.4);
  const scale = 0.94 + randomScale * 0.12;
  const zIndex = sectionIndex * 30 + Math.floor(randomLayer * 10) + slot + 10;
  const overlapNudge = (randomOverlap - 0.5) * 24;

  return {
    x: clamp(x + overlapNudge, sectionStart + 8, Math.min(sectionStart + SECTION_WIDTH - 250, boardWidth - 240)),
    y: clamp(y - overlapNudge * 0.25, BOARD_PADDING_Y + 8, boardHeight - 260),
    rotation,
    scale,
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
