import shapeLabel from '../../NotesDesign/Customize/Customize/Shape/Shape_Label.svg';
import shapeWave from '../../NotesDesign/Customize/Customize/Shape/Shape_Wave.svg';
import shapeDaisy from '../../NotesDesign/Customize/Customize/Shape/Shape_Daisy.svg';
import shapeBloom from '../../NotesDesign/Customize/Customize/Shape/Shape_DaisyFlower.svg';
import shapeTulip from '../../NotesDesign/Customize/Customize/Shape/Shape_Tulip.svg';
import shapeStar from '../../NotesDesign/Customize/Customize/Shape/Shape_OctagonStar.svg';

import patternBlueWave from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_BlueWave.jpg';
import patternCheckedDots from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_Checkeddots.jpg';
import patternGeometric from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_Geometric1.jpg';
import patternLove from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_Love.jpg';
import patternLovePink from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_LovePink.jpg';
import patternStars from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_StarsPattern.jpg';
import patternStripes from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_Stripes.jpg';
import patternStripesTwo from '../../NotesDesign/Customize/Customize/PatternBG/PickPattern_Stripes2.jpg';

export const noteMakerShapes = [
  { id: 'classic', label: 'Classic', asset: shapeLabel, previewRatio: '1 / 1', boardScale: 1 },
  { id: 'wave', label: 'Wave', asset: shapeWave, previewRatio: '1.18 / 1', boardScale: 1.02 },
  { id: 'daisy', label: 'Daisy', asset: shapeDaisy, previewRatio: '1 / 1', boardScale: 1.06 },
  { id: 'bloom', label: 'Bloom', asset: shapeBloom, previewRatio: '1 / 1', boardScale: 1.06 },
  { id: 'tulip', label: 'Tulip', asset: shapeTulip, previewRatio: '0.94 / 1.08', boardScale: 1.04 },
  { id: 'star', label: 'Star', asset: shapeStar, previewRatio: '1 / 1', boardScale: 1.08 },
];

export const noteMakerShapeMap = Object.fromEntries(noteMakerShapes.map((shape) => [shape.id, shape]));

export const noteMakerColors = [
  { id: 'butter', label: 'Butter', fill: '#f8e79a', accent: '#8c6a2a', shadow: 'rgba(185, 151, 68, 0.24)' },
  { id: 'blush', label: 'Blush', fill: '#f3ccd7', accent: '#8f5d68', shadow: 'rgba(188, 128, 147, 0.22)' },
  { id: 'sage', label: 'Sage', fill: '#d6e6bf', accent: '#5f7552', shadow: 'rgba(126, 154, 99, 0.2)' },
  { id: 'sky', label: 'Sky', fill: '#cfe6f7', accent: '#537190', shadow: 'rgba(104, 142, 178, 0.2)' },
  { id: 'peach', label: 'Peach', fill: '#f6d6bc', accent: '#9d6843', shadow: 'rgba(171, 121, 74, 0.22)' },
  { id: 'lavender', label: 'Lavender', fill: '#e2d8f7', accent: '#6d5a8f', shadow: 'rgba(132, 106, 176, 0.22)' },
  { id: 'mint', label: 'Mint', fill: '#d3efe6', accent: '#4c7f74', shadow: 'rgba(97, 161, 146, 0.2)' },
  { id: 'cream', label: 'Cream', fill: '#fff8ea', accent: '#8b6739', shadow: 'rgba(170, 132, 88, 0.18)' },
];

export const noteMakerColorMap = Object.fromEntries(noteMakerColors.map((color) => [color.id, color]));

export const patternPacks = [
  {
    id: 'core-patterns',
    label: 'Core',
    items: [
      {
        id: 'plain',
        label: 'Plain',
        type: 'css',
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
      },
      {
        id: 'lines',
        label: 'Lines',
        type: 'css',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0, transparent 24px, rgba(201,153,90,0.16) 24px, rgba(201,153,90,0.16) 25px)',
      },
      {
        id: 'dots',
        label: 'Dots',
        type: 'css',
        backgroundImage:
          'radial-gradient(circle at 1.5px 1.5px, rgba(130, 98, 62, 0.14) 1.3px, transparent 0)',
        backgroundSize: '14px 14px',
      },
      {
        id: 'grid',
        label: 'Grid',
        type: 'css',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent 0, transparent 21px, rgba(117, 161, 191, 0.14) 21px, rgba(117, 161, 191, 0.14) 22px), repeating-linear-gradient(90deg, transparent 0, transparent 21px, rgba(117, 161, 191, 0.14) 21px, rgba(117, 161, 191, 0.14) 22px)',
      },
      {
        id: 'waves',
        label: 'Waves',
        type: 'asset',
        asset: patternBlueWave,
      },
    ],
  },
  {
    id: 'sweet-patterns',
    label: 'Sweet',
    items: [
      { id: 'love', label: 'Love', type: 'asset', asset: patternLove },
      { id: 'love-pink', label: 'Love Pink', type: 'asset', asset: patternLovePink },
      { id: 'stars', label: 'Stars', type: 'asset', asset: patternStars },
      { id: 'checked-dots', label: 'Checked dots', type: 'asset', asset: patternCheckedDots },
    ],
  },
  {
    id: 'graphic-patterns',
    label: 'Graphic',
    items: [
      { id: 'geo', label: 'Geo', type: 'asset', asset: patternGeometric },
      { id: 'stripes', label: 'Stripes', type: 'asset', asset: patternStripes },
      { id: 'stripes-2', label: 'Stripes 2', type: 'asset', asset: patternStripesTwo },
    ],
  },
];

export const noteMakerPatterns = patternPacks.flatMap((pack) =>
  pack.items.map((pattern) => ({
    ...pattern,
    packId: pack.id,
    packLabel: pack.label,
  }))
);

export const noteMakerPatternMap = Object.fromEntries(noteMakerPatterns.map((pattern) => [pattern.id, pattern]));

export const DEFAULT_NOTE_STYLE = {
  shapeId: 'classic',
  colorId: 'butter',
  patternId: 'plain',
};
