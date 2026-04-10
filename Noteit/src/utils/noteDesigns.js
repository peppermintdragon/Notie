import note1 from '../assets/notes/note-1.svg';
import note2 from '../assets/notes/note-2.svg';
import note3 from '../assets/notes/note-3.svg';
import note4 from '../assets/notes/note-4.svg';

export const noteDesigns = [
  {
    id: 'blank-paper',
    label: 'Blank',
    boardWidth: 226,
    boardHeight: 226,
    asset: null,
    contentClass: 'content-blank',
    isBlank: true,
  },
  {
    id: 'cute-garden',
    label: 'Garden',
    boardWidth: 236,
    boardHeight: 236,
    asset: note1,
    contentClass: 'content-garden',
  },
  {
    id: 'cute-blush',
    label: 'Blush',
    boardWidth: 236,
    boardHeight: 236,
    asset: note2,
    contentClass: 'content-blush',
  },
  {
    id: 'cute-twinkle',
    label: 'Twinkle',
    boardWidth: 236,
    boardHeight: 236,
    asset: note3,
    contentClass: 'content-twinkle',
  },
  {
    id: 'cute-smile',
    label: 'Smile',
    boardWidth: 236,
    boardHeight: 236,
    asset: note4,
    contentClass: 'content-smile',
  },
];

export const noteDesignMap = Object.fromEntries(noteDesigns.map((design) => [design.id, design]));
