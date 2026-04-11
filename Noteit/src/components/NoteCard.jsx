import { forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { themeMap } from '../utils/colorThemes';
import { noteDesignMap, noteDesigns } from '../utils/noteDesigns';
import { getNoteMessageStyle } from '../utils/noteTypography';
import { getPushpinColor, normalizeStickerEntries, pushpinMap, stickerMap } from '../utils/stickers';

const MotionDiv = motion.div;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSeed(value) {
  return String(value || 'note').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
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
    onStickerDrop,
    interactive = false,
    className = '',
    style,
  },
  ref
) {
  const localRef = useRef(null);
  const dragState = useRef(null);
  const theme = themeMap[note.theme_id || note.themeId] || themeMap.cream;
  const design = noteDesignMap[note.design_id || note.designId] || noteDesigns[0];
  const stickers = normalizeStickerEntries(note.stickers || []);
  const pinColorId = note.pin_color || note.pinColor || getPushpinColor(note.stickers || []);
  const pin = pinColorId ? pushpinMap[pinColorId] : null;
  const message = note.message?.trim() || 'Write a little note...';
  const displayName = note.name?.trim() || 'Anonymous';
  const noteSize = preview ? 460 : design.boardWidth;

  const cardStyle = {
    '--note-surface': theme.surface,
    '--note-inner': theme.inner,
    '--note-border': theme.border,
    '--note-accent': theme.accent,
    '--note-shadow': theme.shadow,
    '--note-art': design.asset ? `url("${design.asset}")` : 'none',
    '--pin-color': pin?.color || 'transparent',
    '--pin-edge': pin?.edge || 'transparent',
    '--pin-shadow': pin?.shadow || 'transparent',
    width: preview ? 'min(76vw, 300px)' : `${design.boardWidth}px`,
    minHeight: preview ? '310px' : `${design.boardHeight}px`,
    ...style,
  };

  const messageStyle = {
    ...getNoteMessageStyle({
      message,
      stickers,
      preview,
      board,
      noteSize,
    }),
    ...getHandwritingStyle(note, preview),
  };

  const showSparkle = message.trim().length <= 15 && stickers.length === 0;

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

  const handleExternalStickerDrop = (event) => {
    if (!editable || !localRef.current || !onStickerDrop) return;

    const stickerId = event.dataTransfer?.getData('text/notie-sticker');
    if (!stickerId) return;

    event.preventDefault();
    event.stopPropagation();

    const bounds = localRef.current.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 8, 86);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 10, 88);

    onStickerDrop(stickerId, { x, y });
  };

  return (
    <MotionDiv
      ref={setRefs}
      className={`note-card ${design.isBlank ? 'note-card--blank' : 'note-card--art'} ${design.contentClass} ${preview ? 'is-preview' : ''} ${interactive ? 'is-interactive' : ''} ${editable ? 'is-editable' : ''} ${board ? 'is-board' : ''} ${className}`}
      style={cardStyle}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerUp={stopStickerDrag}
      onPointerCancel={stopStickerDrag}
      onDragOver={editable ? (event) => event.preventDefault() : undefined}
      onDrop={editable ? handleExternalStickerDrop : undefined}
      initial={preview ? { opacity: 0.94, scale: 0.98, y: 6 } : false}
      animate={preview ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={preview ? { type: 'spring', stiffness: 220, damping: 18 } : undefined}
      whileHover={interactive ? { y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 260, damping: 16 } } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      layout
    >
      {pin ? <span className="note-card__pin" aria-hidden="true" /> : null}
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
          {showSparkle ? <span className="note-card__sparkle" aria-hidden="true">✦</span> : null}
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
