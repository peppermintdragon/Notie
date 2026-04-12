import { forwardRef, useEffect, useRef, useState } from 'react';
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

function getPaperEdgeStyle(note, board) {
  if (!board) return {};

  const seed = getSeed(note.id || note.message || note.name);
  const topLeft = 12 + (seed % 7);
  const topRight = 18 + (seed % 9);
  const bottomRight = 14 + (seed % 8);
  const bottomLeft = 20 + (seed % 6);

  return {
    '--note-radius': `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`,
    '--note-inner-radius': `${Math.max(8, topLeft - 2)}px ${Math.max(10, topRight - 3)}px ${Math.max(9, bottomRight - 2)}px ${Math.max(12, bottomLeft - 3)}px`,
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
    onStickerRemove,
    onStickerDrop,
    interactive = false,
    className = '',
    style,
  },
  ref
) {
  const localRef = useRef(null);
  const dragState = useRef(null);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
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
    ...getPaperEdgeStyle(note, board),
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

  useEffect(() => {
    if (!selectedStickerId) return undefined;

    const handlePointerDownOutside = (event) => {
      if (!localRef.current?.contains(event.target)) {
        setSelectedStickerId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [selectedStickerId]);

  useEffect(() => {
    if (!stickers.some((sticker) => sticker.id === selectedStickerId)) {
      setSelectedStickerId(null);
    }
  }, [stickers, selectedStickerId]);

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
      moved: false,
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

    if (
      Math.abs(event.clientX - dragState.current.startX) > 3 ||
      Math.abs(event.clientY - dragState.current.startY) > 3
    ) {
      dragState.current.moved = true;
      setSelectedStickerId(dragState.current.stickerId);
    }

    onStickerMove(dragState.current.stickerId, {
      x: clamp(nextX, 8, 86),
      y: clamp(nextY, 10, 88),
    });
  };

  const stopStickerDrag = () => {
    dragState.current = null;
  };

  const handleStickerSelect = (event, stickerId) => {
    event.stopPropagation();

    if (dragState.current?.stickerId === stickerId && dragState.current.moved) {
      return;
    }

    setSelectedStickerId((current) => (current === stickerId ? null : stickerId));
  };

  const handleStickerResize = (event, sticker, delta) => {
    event.stopPropagation();
    if (!onStickerMove) return;

    onStickerMove(sticker.id, {
      scale: clamp(Number(sticker.scale ?? 1) + delta, 0.35, 1.2),
    });
  };

  const handleStickerRemove = (event, stickerId) => {
    event.stopPropagation();
    setSelectedStickerId(null);
    onStickerRemove?.(stickerId);
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
      <div
        className="note-card__inner"
        onClick={
          editable
            ? (event) => {
                event.stopPropagation();
                setSelectedStickerId(null);
              }
            : undefined
        }
      >
        <div className="note-stickers">
          {stickers.map((sticker) => {
            const assetSticker = stickerMap[sticker.stickerId];
            if (!assetSticker) return null;
            const isSelected = selectedStickerId === sticker.id;
            const sizeLevel = Math.max(1, Math.min(5, Math.round((sticker.scale / 1.2) * 5)));

            return (
              <div
                key={sticker.id}
                className="note-sticker-wrap"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                }}
              >
                {editable && isSelected ? (
                  <div
                    className="sticker-toolbar"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(event) => handleStickerResize(event, sticker, -0.1)}
                      aria-label={`Shrink ${assetSticker.label}`}
                    >
                      -
                    </button>
                    <div className="sticker-toolbar__dots" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={`${sticker.id}-dot-${index}`}
                          className={index < sizeLevel ? 'is-active' : ''}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(event) => handleStickerResize(event, sticker, 0.1)}
                      aria-label={`Grow ${assetSticker.label}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="sticker-toolbar__remove"
                      onClick={(event) => handleStickerRemove(event, sticker.id)}
                      aria-label={`Remove ${assetSticker.label}`}
                    >
                      x
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  className={`note-sticker note-sticker--image ${editable ? 'is-draggable' : ''} ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                  }}
                  onClick={(event) => handleStickerSelect(event, sticker.id)}
                  onPointerDown={(event) => handleStickerPointerDown(event, sticker)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopStickerDrag}
                  onPointerCancel={stopStickerDrag}
                  aria-label={editable ? `Move ${assetSticker.label}` : assetSticker.label}
                >
                  <img src={assetSticker.src} alt="" className="note-sticker__image" />
                </button>
              </div>
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
