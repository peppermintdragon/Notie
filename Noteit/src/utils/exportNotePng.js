import { toPng } from 'html-to-image';

export async function exportNotePng(node, noteId) {
  if (!node) return;

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: 'transparent',
  });

  const link = document.createElement('a');
  link.download = `notie-${noteId}.png`;
  link.href = dataUrl;
  link.click();
}
