export const noteDesigns = [
  {
    id: 'toast-rounded-square',
    label: 'Toast rounded square',
    boardWidth: 220,
    boardHeight: 228,
    shapeClass: 'design-toast',
    decoration: 'none',
  },
  {
    id: 'soft-circle',
    label: 'Soft circle',
    boardWidth: 220,
    boardHeight: 220,
    shapeClass: 'design-soft-circle',
    decoration: 'pin',
  },
  {
    id: 'pin-memo-square',
    label: 'Pin memo square',
    boardWidth: 212,
    boardHeight: 224,
    shapeClass: 'design-pin-memo',
    decoration: 'pin',
  },
  {
    id: 'tape-memo-rounded',
    label: 'Tape memo rounded',
    boardWidth: 224,
    boardHeight: 232,
    shapeClass: 'design-tape-memo',
    decoration: 'tape',
  },
  {
    id: 'dessert-note',
    label: 'Dessert note',
    boardWidth: 224,
    boardHeight: 228,
    shapeClass: 'design-dessert-note',
    decoration: 'sprinkle',
  },
  {
    id: 'sleepy-pastel-note',
    label: 'Sleepy pastel note',
    boardWidth: 224,
    boardHeight: 220,
    shapeClass: 'design-sleepy-pastel',
    decoration: 'sleepy',
  },
];

export const noteDesignMap = Object.fromEntries(noteDesigns.map((design) => [design.id, design]));
