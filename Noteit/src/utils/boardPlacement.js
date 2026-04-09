const boardZones = [
  { x: 10, y: 10 }, { x: 34, y: 9 }, { x: 58, y: 11 }, { x: 80, y: 8 },
  { x: 18, y: 33 }, { x: 42, y: 30 }, { x: 66, y: 35 }, { x: 84, y: 31 },
  { x: 11, y: 59 }, { x: 33, y: 55 }, { x: 58, y: 60 }, { x: 79, y: 56 },
  { x: 20, y: 81 }, { x: 45, y: 82 }, { x: 70, y: 80 },
];

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function getBalancedPlacement(existingNotes = []) {
  const occupied = existingNotes.map((note) => ({ x: note.pos_x, y: note.pos_y }));

  let best = boardZones[existingNotes.length % boardZones.length];
  let bestScore = -Infinity;

  boardZones.forEach((zone, index) => {
    const nearest = occupied.length
      ? Math.min(...occupied.map((point) => distance(zone, point)))
      : 100;
    const rhythmBias = 8 - Math.abs((existingNotes.length % boardZones.length) - index);
    const score = nearest + rhythmBias;

    if (score > bestScore) {
      best = zone;
      bestScore = score;
    }
  });

  const seed = existingNotes.length + 1;
  const xJitter = ((seed * 13) % 7) - 3;
  const yJitter = ((seed * 11) % 7) - 3;
  const rotation = (((seed * 17) % 9) - 4) * 0.9;

  return {
    pos_x: Math.max(6, Math.min(86, best.x + xJitter)),
    pos_y: Math.max(6, Math.min(84, best.y + yJitter)),
    rotation,
  };
}
