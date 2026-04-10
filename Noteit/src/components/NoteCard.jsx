import { forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { themeMap } from '../utils/colorThemes';
import { noteDesignMap, noteDesigns } from '../utils/noteDesigns';
import { getPushpinColor, normalizeStickerEntries, pushpinMap, stickerMap } from '../utils/stickers';

const MotionDiv = motion.div;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSeed(value) {
  return String(value || 'note').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function containsCjk(text) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(text);
}

function getMessageStyle(message, preview) {
  const length = message.trim().length;
  const hasCjk = containsCjk(message);
  const base = hasCjk
    ? (preview ? 1.18 : 1.06)
    : (preview ? 1.52 : 1.4);

  if (length <= 8) return { fontSize: `${base + 0.4}rem`, lineHeight: 1.02 };
  if (length <= 14) return { fontSize: `${base + 0.18}rem`, lineHeight: 1.06 };
  if (length <= 20) return { fontSize: `${base}rem`, lineHeight: 1.08 };
  if (length <= 32) return { fontSize: `${base - 0.12}rem`, lineHeight: 1.12 };
  return { fontSize: `${base - 0.22}rem`, lineHeight: 1.16 };
}

function getHandwritingStyle(note, preview) {
  const seed = getSeed(note.id || note.message || note.name);
  const alignments = ['left', 'center', 'left'];
  const textAlign = alignments[seed % alignments.length];

  return {
    textAlign,
    alignSelf: textAlign === 'center' ? 'center' : 'stretch',
  };
}

const NoteCard = forwardRef(function NoteCard(
  {
    note,
    preview = false,
    board = false,
    editable = false,
    onClick,
    onStickerMove,
    interactive = false,
    style,
  },
  ref
) {
  const localRef = useRef(null);
  const dragState = useRef(null);
  const theme = themeMap[note.theme_id || note.themeId] || themeMap.cream;
  const design = noteDesignMap[note.design_id || note.designId] || noteDesigns[0];
  const stickers = normalizeStickerEntries(note.stickers || []);
  const pinColorId = note.pin_color || note.pinColor || getPushpinColor(note.stickers || [], 'honey');
  const pin = pushpinMap[pinColorId] || pushpinMap.honey;
  const message = note.message?.trim() || 'Write a little note...';
  const displayName = note.name?.trim() || 'Anonymous';

  const cardStyle = {
    '--note-surface': theme.surface,
    '--note-inner': theme.inner,
    '--note-border': theme.border,
    '--note-accent': theme.accent,
    '--note-shadow': theme.shadow,
    '--note-art': design.asset ? `url("${design.asset}")` : 'none',
    '--pin-color': pin.color,
    '--pin-edge': pin.edge,
    '--pin-shadow': pin.shadow,
    width: preview ? 'min(76vw, 300px)' : `${design.boardWidth}px`,
    minHeight: preview ? '310px' : `${design.boardHeight}px`,
    ...style,
  };

  const messageStyle = {
    ...getMessageStyle(message, preview),
    ...getHandwritingStyle(note, preview),
  };

  const setRefs = (node) => {
    localRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleStickerPointerDown = (event, sticker) => {
    if (!editable || !localRef.current) return;

    event.stopPropagation();
    event.preventDefault();
    dragState.current = {
      stickerId: sticker.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: sticker.x,
      originY: sticker.y,
      bounds: localRef.current.getBoundingClientRect(),
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!editable || !dragState.current || !onStickerMove) return;

    const nextX =
      dragState.current.originX +
      ((event.clientX - dragState.current.startX) / dragState.current.bounds.width) * 100;
    const nextY =
      dragState.current.originY +
      ((event.clientY - dragState.current.startY) / dragState.current.bounds.height) * 100;

    onStickerMove(dragState.current.stickerId, {
      x: clamp(nextX, 8, 86),
      y: clamp(nextY, 10, 88),
    });
  };

  const stopStickerDrag = () => {
    dragState.current = null;
  };

  return (
    <MotionDiv
      ref={setRefs}
      className={`note-card ${design.isBlank ? 'note-card--blank' : 'note-card--art'} ${design.contentClass} ${preview ? 'is-preview' : ''} ${interactive ? 'is-interactive' : ''} ${editable ? 'is-editable' : ''} ${board ? 'is-board' : ''}`}
      style={cardStyle}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerUp={stopStickerDrag}
      onPointerCancel={stopStickerDrag}
      initial={preview ? { opacity: 0.94, scale: 0.98, y: 6 } : false}
      animate={preview ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={preview ? { type: 'spring', stiffness: 220, damping: 18 } : undefined}
      whileHover={interactive ? { y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 260, damping: 16 } } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      layout
    >
      <span className="note-card__pin" aria-hidden="true" />
      <div className="note-card__inner">
        <div className="note-stickers">
          {stickers.map((sticker) => {
            const assetSticker = stickerMap[sticker.stickerId];
            if (!assetSticker) return null;

            return (
              <button
                key={sticker.id}
                type="button"
                className={`note-sticker note-sticker--image ${editable ? 'is-draggable' : ''}`}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                }}
                onPointerDown={(event) => handleStickerPointerDown(event, sticker)}
                onPointerMove={handlePointerMove}
                onPointerUp={stopStickerDrag}
                onPointerCancel={stopStickerDrag}
                aria-label={editable ? `Move ${assetSticker.label}` : assetSticker.label}
              >
                <img src={assetSticker.src} alt="" className="note-sticker__image" />
              </button>
            );
          })}
        </div>

        <div className="note-card__copy">
          <div className="note-card__message" style={messageStyle}>
            {message}
          </div>

          <div className="note-card__footer">
            <span className="note-card__name">{displayName}</span>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
});

export default NoteCard;
