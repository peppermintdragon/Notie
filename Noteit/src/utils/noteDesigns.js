import note1 from '../assets/notes/note-1.svg';
import note2 from '../assets/notes/note-2.svg';
import note3 from '../assets/notes/note-3.svg';
import note4 from '../assets/notes/note-4.svg';
import paper1 from '../../NotesDesign/Papernote/Papernote1 (1).svg';
import paper2 from '../../NotesDesign/Papernote/Papernote2.svg';
import paper3 from '../../NotesDesign/Papernote/Papernote3.svg';
import paper4 from '../../NotesDesign/Papernote/Papernote4.svg';
import paper5 from '../../NotesDesign/Papernote/Papernote5.svg';
import paper6 from '../../NotesDesign/Papernote/Papernote6.svg';
import paper7 from '../../NotesDesign/Papernote/Papernote7.svg';

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
  {
    id: 'paper-note-1',
    label: 'Paper 1',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper1,
    contentClass: 'content-paper-1',
  },
  {
    id: 'paper-note-2',
    label: 'Paper 2',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper2,
    contentClass: 'content-paper-2',
  },
  {
    id: 'paper-note-3',
    label: 'Paper 3',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper3,
    contentClass: 'content-paper-3',
  },
  {
    id: 'paper-note-4',
    label: 'Paper 4',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper4,
    contentClass: 'content-paper-4',
  },
  {
    id: 'paper-note-5',
    label: 'Paper 5',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper5,
    contentClass: 'content-paper-5',
  },
  {
    id: 'paper-note-6',
    label: 'Paper 6',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper6,
    contentClass: 'content-paper-6',
  },
  {
    id: 'paper-note-7',
    label: 'Paper 7',
    boardWidth: 236,
    boardHeight: 236,
    asset: paper7,
    contentClass: 'content-paper-7',
  },
];

export const noteDesignMap = Object.fromEntries(noteDesigns.map((design) => [design.id, design]));
