import html2canvas from 'html2canvas';

const EXPORT_SIZE = 400;
const CAVEAT_SOURCE = 'url(https://fonts.gstatic.com/s/caveat/v17/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9eIWpZQ.woff2)';

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
