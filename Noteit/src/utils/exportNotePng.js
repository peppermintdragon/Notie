import html2canvas from 'html2canvas';

const EXPORT_SIZE = 400;
const CAVEAT_SOURCE = 'url(https://fonts.gstatic.com/s/caveat/v17/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9eIWpZQ.woff2)';
const EXPORT_ATTR = 'data-export-note-root';

let caveatReady;

async function ensureCaveatFont() {
  if (!('fonts' in document)) return;
  if (!caveatReady) {
    caveatReady = (async () => {
      try {
        const alreadyLoaded = Array.from(document.fonts).some((font) => font.family.includes('Caveat'));
        if (!alreadyLoaded && 'FontFace' in window) {
          const font = new FontFace('Caveat', CAVEAT_SOURCE, {
            style: 'normal',
            weight: '700',
          });

          await font.load();
          document.fonts.add(font);
        }
      } catch (error) {
        console.warn('PNG export font preload failed, falling back to existing fonts.', error);
      }

      await document.fonts.ready;
    })();
  }

  await caveatReady;
}

function buildExportStage(node) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${EXPORT_SIZE}px`;
  wrapper.style.height = `${EXPORT_SIZE}px`;
  wrapper.style.padding = '0';
  wrapper.style.margin = '0';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.opacity = '1';
  wrapper.style.zIndex = '-1';
  wrapper.style.background = 'transparent';

  const clone = node.cloneNode(true);
  clone.setAttribute(EXPORT_ATTR, 'true');
  clone.style.width = `${EXPORT_SIZE}px`;
  clone.style.height = `${EXPORT_SIZE}px`;
  clone.style.minWidth = `${EXPORT_SIZE}px`;
  clone.style.minHeight = `${EXPORT_SIZE}px`;
  clone.style.maxWidth = `${EXPORT_SIZE}px`;
  clone.style.maxHeight = `${EXPORT_SIZE}px`;
  clone.style.margin = '0';
  clone.style.transform = 'none';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    wrapper,
    clone,
    cleanup() {
      wrapper.remove();
    },
  };
}

function copyComputedStyles(sourceNode, targetNode) {
  if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) return;

  const computedStyle = window.getComputedStyle(sourceNode);
  Array.from(computedStyle).forEach((propertyName) => {
    const value = computedStyle.getPropertyValue(propertyName);
    const priority = computedStyle.getPropertyPriority(propertyName);
    targetNode.style.setProperty(propertyName, value, priority);
  });

  const sourceChildren = Array.from(sourceNode.children);
  const targetChildren = Array.from(targetNode.children);

  sourceChildren.forEach((sourceChild, index) => {
    copyComputedStyles(sourceChild, targetChildren[index]);
  });
}

function applyExportOverrides(root) {
  if (!(root instanceof HTMLElement)) return;

  root.style.transform = 'none';
  root.style.margin = '0';
  root.style.left = '0';
  root.style.top = '0';

  root.querySelectorAll('*').forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    element.style.animation = 'none';
    element.style.transition = 'none';
    element.style.caretColor = 'transparent';
  });
}

function materializePinStem(sourceRoot, targetRoot) {
  const sourcePins = sourceRoot.querySelectorAll('.note-card__pin');
  const targetPins = targetRoot.querySelectorAll('.note-card__pin');

  sourcePins.forEach((sourcePin, index) => {
    const targetPin = targetPins[index];
    if (!(sourcePin instanceof HTMLElement) || !(targetPin instanceof HTMLElement)) return;

    const pseudo = window.getComputedStyle(sourcePin, '::after');
    const stem = document.createElement('span');
    stem.setAttribute('aria-hidden', 'true');
    stem.style.position = 'absolute';
    stem.style.left = pseudo.left || '50%';
    stem.style.top = pseudo.top || '78%';
    stem.style.width = pseudo.width || '3px';
    stem.style.height = pseudo.height || '20px';
    stem.style.borderRadius = pseudo.borderRadius || '999px';
    stem.style.background = pseudo.background || 'linear-gradient(180deg, #fef7ed, #7b5d3f)';
    stem.style.transform = pseudo.transform || 'translateX(-50%)';
    stem.style.pointerEvents = 'none';
    targetPin.appendChild(stem);
  });
}

function scrubClonedDocument(clonedDocument, sourceRoot) {
  clonedDocument.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());

  const safeFontStyle = clonedDocument.createElement('style');
  safeFontStyle.textContent = `
    @font-face {
      font-family: "Caveat";
      src: ${CAVEAT_SOURCE} format("woff2");
      font-style: normal;
      font-weight: 700;
      font-display: swap;
    }
  `;
  clonedDocument.head.appendChild(safeFontStyle);

  const clonedRoot = clonedDocument.querySelector(`[${EXPORT_ATTR}="true"]`);
  if (!(clonedRoot instanceof HTMLElement)) return null;

  copyComputedStyles(sourceRoot, clonedRoot);
  applyExportOverrides(clonedRoot);
  materializePinStem(sourceRoot, clonedRoot);

  return clonedRoot;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('PNG export returned an empty file.'));
    }, 'image/png');
  });
}

function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function exportNotePng(node, noteId) {
  if (!node) {
    throw new Error('Could not find the note preview to export.');
  }

  await ensureCaveatFont();
  const exportStage = buildExportStage(node);

  try {
    await new Promise((resolve) => window.requestAnimationFrame(resolve));

    const canvas = await html2canvas(exportStage.clone, {
      backgroundColor: null,
      scale: 2,
      width: EXPORT_SIZE,
      height: EXPORT_SIZE,
      useCORS: true,
      logging: false,
      removeContainer: true,
      onclone: (clonedDocument) => {
        scrubClonedDocument(clonedDocument, exportStage.clone);
      },
    });

    const filename = `notie-${noteId || 'note'}.png`;

    try {
      const blob = await canvasToBlob(canvas);
      const objectUrl = window.URL.createObjectURL(blob);
      triggerDownload(objectUrl, filename);
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1500);
    } catch (blobError) {
      console.warn('Blob export failed, falling back to data URL download.', blobError);
      const dataUrl = canvas.toDataURL('image/png');
      triggerDownload(dataUrl, filename);
    }

    return true;
  } catch (error) {
    console.error('PNG export failed.', error);
    throw error;
  } finally {
    exportStage.cleanup();
  }
}

export { EXPORT_SIZE };
