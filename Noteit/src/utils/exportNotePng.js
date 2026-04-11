import { themeMap } from './colorThemes';
import { noteDesignMap } from './noteDesigns';
import { containsCjk, getNoteFontSize } from './noteTypography';
import {
  getPushpinColor,
  normalizeStickerEntries,
  pushpinMap,
  stickerMap,
} from './stickers';

const EXPORT_SIZE = 800;
const CAVEAT_SOURCE = 'url(https://fonts.gstatic.com/s/caveat/v17/WnznHAc5bAfYB2QRah7pcpNvOx-pjcB9eIWpZQ.woff2)';

let caveatReady;
const imageCache = new Map();

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function wrapMessageLines(ctx, text, maxWidth, hasCjk) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return [''];

  if (hasCjk) {
    const lines = [];
    let current = '';

    normalized.split('').forEach((char) => {
      const candidate = `${current}${char}`;
      if (current && ctx.measureText(candidate).width > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current = candidate;
      }
    });

    if (current) lines.push(current);
    return lines;
  }

  const words = normalized.split(' ');
  const lines = [];
  let current = words.shift() || '';

  words.forEach((word) => {
    const candidate = `${current} ${word}`;
    if (ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function getMessageLayout(ctx, message, stickers) {
  const hasCjk = containsCjk(message);
  const family = hasCjk
    ? '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif'
    : '"Caveat", "Segoe Print", cursive';

  const requestedFontSize = getNoteFontSize(message, stickers);
  const maxWidth = EXPORT_SIZE * 0.56;
  const maxHeight = EXPORT_SIZE * 0.34;
  const minFontSize = hasCjk ? 24 : 26;
  let fontSize = hasCjk ? Math.max(requestedFontSize * 2.2, 30) : Math.max(requestedFontSize * 2.45, 32);
  let lines = [];
  let lineHeight = 1.1;

  while (fontSize >= minFontSize) {
    lineHeight = hasCjk ? 1.26 : 1.14;
    ctx.font = `600 ${fontSize}px ${family}`;
    lines = wrapMessageLines(ctx, message, maxWidth, hasCjk);
    const totalHeight = lines.length * fontSize * lineHeight;

    if (lines.length <= 7 && totalHeight <= maxHeight) {
      return {
        hasCjk,
        family,
        fontSize,
        lineHeight,
        lines,
        maxWidth,
      };
    }

    fontSize -= hasCjk ? 2 : 3;
  }

  ctx.font = `600 ${minFontSize}px ${family}`;
  return {
    hasCjk,
    family,
    fontSize: minFontSize,
    lineHeight,
    lines: wrapMessageLines(ctx, message, maxWidth, hasCjk).slice(0, 5),
    maxWidth,
  };
}

function drawBlankPaper(ctx, theme) {
  const outerX = 120;
  const outerY = 110;
  const outerSize = 560;
  const innerX = 150;
  const innerY = 145;
  const innerWidth = 500;
  const innerHeight = 500;

  const paperGradient = ctx.createLinearGradient(0, outerY, 0, outerY + outerSize);
  paperGradient.addColorStop(0, theme.surface);
  paperGradient.addColorStop(1, theme.inner);

  ctx.save();
  ctx.shadowColor = theme.shadow;
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 20;
  roundRectPath(ctx, outerX, outerY, outerSize, outerSize, 26);
  ctx.fillStyle = paperGradient;
  ctx.fill();
  ctx.restore();

  roundRectPath(ctx, innerX, innerY, innerWidth, innerHeight, 28);
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  roundRectPath(ctx, innerX, innerY, innerWidth, innerHeight, 28);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(innerX, innerY, innerWidth, innerHeight);

  ctx.strokeStyle = 'rgba(114, 102, 90, 0.22)';
  ctx.lineWidth = 2;
  for (let y = innerY + 104; y < innerY + innerHeight - 24; y += 60) {
    ctx.beginPath();
    ctx.moveTo(innerX + 54, y);
    ctx.lineTo(innerX + innerWidth - 54, y);
    ctx.stroke();
  }
  ctx.restore();
}

async function loadImage(src) {
  if (!src) return null;
  if (imageCache.has(src)) return imageCache.get(src);

  const imagePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image for PNG export: ${src}`));
    image.src = src;
  });

  imageCache.set(src, imagePromise);
  return imagePromise;
}

function drawPushpin(ctx, pin) {
  if (!pin) return;

  const cx = EXPORT_SIZE / 2;
  const cy = 96;

  ctx.save();
  ctx.shadowColor = pin.shadow;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = pin.color;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx - 5, cy - 5, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = pin.edge;
  ctx.stroke();

  const stemGradient = ctx.createLinearGradient(cx, cy + 16, cx, cy + 56);
  stemGradient.addColorStop(0, '#fef7ed');
  stemGradient.addColorStop(1, '#6f5841');
  ctx.beginPath();
  ctx.roundRect(cx - 2, cy + 16, 4, 38, 999);
  ctx.fillStyle = stemGradient;
  ctx.fill();
}

function drawMessage(ctx, message, stickers) {
  const layout = getMessageLayout(ctx, message, stickers);
  const baseX = EXPORT_SIZE / 2;
  const totalHeight = layout.lines.length * layout.fontSize * layout.lineHeight;
  const startY = 332 - totalHeight / 2 + layout.fontSize / 2;

  ctx.fillStyle = '#4c2331';
  ctx.textAlign = layout.hasCjk ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${layout.fontSize}px ${layout.family}`;

  layout.lines.forEach((line, index) => {
    const y = startY + index * layout.fontSize * layout.lineHeight;
    const x = layout.hasCjk ? 220 : baseX;
    ctx.fillText(line, x, y, layout.maxWidth);
  });
}

function drawName(ctx, name) {
  ctx.save();
  ctx.fillStyle = 'rgba(72, 37, 55, 0.62)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 26px "Syncopate", "Trebuchet MS", sans-serif';
  ctx.fillText(name.toUpperCase(), EXPORT_SIZE / 2, 622, 420);
  ctx.restore();
}

function drawSparkle(ctx, stickers, message) {
  if ((stickers?.length || 0) > 0 || message.trim().length > 15) return;

  ctx.save();
  ctx.fillStyle = 'rgba(201, 151, 74, 0.34)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 34px "Lato", sans-serif';
  ctx.fillText('✦', 618, 192);
  ctx.restore();
}

async function drawStickers(ctx, stickers) {
  for (const sticker of stickers) {
    const assetSticker = stickerMap[sticker.stickerId];
    if (!assetSticker) continue;

    const image = await loadImage(assetSticker.src);
    const size = 108 * sticker.scale;
    const x = (sticker.x / 100) * EXPORT_SIZE;
    const y = (sticker.y / 100) * EXPORT_SIZE;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

function normalizeExportNote(note) {
  const designId = note.design_id || note.designId || 'blank-paper';
  const themeId = note.theme_id || note.themeId || 'cream';
  const message = note.message?.trim() || 'Write a little note...';
  const name = (note.name?.trim() || 'Anonymous').slice(0, 24);
  const stickers = normalizeStickerEntries(note.stickers || []);
  const pinColorId = note.pin_color || note.pinColor || getPushpinColor(note.stickers || []);

  return {
    design: noteDesignMap[designId] || noteDesignMap['blank-paper'],
    theme: themeMap[themeId] || themeMap.cream,
    message,
    name,
    stickers,
    pin: pinColorId && pinColorId !== 'none' ? pushpinMap[pinColorId] : null,
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

export async function exportNotePng(note, noteId = 'note') {
  if (!note) {
    throw new Error('Could not find the note preview to export.');
  }

  await ensureCaveatFont();

  const normalized = normalizeExportNote(note);
  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create PNG canvas.');
  }

  ctx.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  if (normalized.design.isBlank) {
    drawBlankPaper(ctx, normalized.theme);
  } else if (normalized.design.asset) {
    const paperImage = await loadImage(normalized.design.asset);
    ctx.drawImage(paperImage, 92, 92, 616, 616);
  }

  drawPushpin(ctx, normalized.pin);
  drawSparkle(ctx, normalized.stickers, normalized.message);
  drawMessage(ctx, normalized.message, normalized.stickers);
  drawName(ctx, normalized.name);
  await drawStickers(ctx, normalized.stickers);

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
}

export { EXPORT_SIZE };
