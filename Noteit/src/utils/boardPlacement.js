const DEFAULT_BOARD_WIDTH = 1400;
const DEFAULT_BOARD_HEIGHT = 560;
const BOARD_ROWS = 3;

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

export function getBoardWidth(noteCount) {
  const cols = Math.max(4, Math.ceil(Math.max(noteCount, 1) / BOARD_ROWS));
  return Math.max(1400, cols * 250);
}

export function getBoardHeight() {
  return DEFAULT_BOARD_HEIGHT;
}

export function generateBoardLayout(note, index, totalNotes, boardWidth = DEFAULT_BOARD_WIDTH, boardHeight = DEFAULT_BOARD_HEIGHT) {
  const cols = Math.max(4, Math.min(10, Math.ceil(totalNotes / BOARD_ROWS)));
  const cellW = boardWidth / cols;
  const cellH = Math.max(150, (boardHeight - 80) / BOARD_ROWS);
  const col = index % cols;
  const row = Math.floor(index / cols) % BOARD_ROWS;
  const seed = createSeed(`${note.id || note.created_at || index}-${index}-${totalNotes}`);

  const randomX = seededRandom(seed + 1);
  const randomY = seededRandom(seed + 2);
  const randomRotate = seededRandom(seed + 3);
  const randomScale = seededRandom(seed + 4);
  const randomLayer = seededRandom(seed + 5);
  const randomTilt = seededRandom(seed + 6);

  const x = col * cellW + cellW * 0.02 + randomX * cellW * 0.56;
  const y = row * cellH + cellH * 0.08 + randomY * cellH * 0.48 + 28;
  const tiltDirection = randomRotate > 0.5 ? 1 : -1;
  const rotation = tiltDirection * (10 + randomTilt * 14);
  const scale = 0.92 + randomScale * 0.16;
  const zIndex = row * 2 + Math.floor(randomLayer * 4) + 10;

  return {
    x: clamp(x, 24, boardWidth - 260),
    y: clamp(y, 28, boardHeight - 260),
    rotation,
    scale,
    row,
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
