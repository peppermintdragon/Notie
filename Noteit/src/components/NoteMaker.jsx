import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import NoteCard from './NoteCard';
import { supabase } from '../lib/supabase';
import { getBalancedPlacement } from '../utils/boardPlacement';
import { appendLocalNote, readLocalNotes } from '../utils/localNotes';
import { getSupabaseIssueMessage } from '../utils/supabaseStatus';
import {
  DEFAULT_NOTE_STYLE,
  noteMakerColorMap,
  noteMakerColors,
  noteMakerPatterns,
  noteMakerShapes,
  patternPacks,
} from '../utils/noteMakerConfig';
import {
  addStickerInstance,
  normalizeStickerEntries,
  serializeStickerEntries,
  stickerMap,
  stickerPacks,
} from '../utils/stickers';

const wizardSteps = [
  { id: 'shape', label: 'Shape picker' },
  { id: 'style', label: 'Color & pattern' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'write', label: 'Write' },
  { id: 'share', label: 'Share' },
];

const defaultState = {
  shapeId: DEFAULT_NOTE_STYLE.shapeId,
  colorId: DEFAULT_NOTE_STYLE.colorId,
  patternId: DEFAULT_NOTE_STYLE.patternId,
  stickers: [],
  text: '',
  name: typeof window === 'undefined' ? '' : window.localStorage.getItem('notie-name') || '',
  pinColor: 'honey',
};

function makePreviewNote(noteState) {
  return {
    id: 'note-maker-preview',
    name: noteState.name || '',
    message: noteState.text || '',
    design_id: 'blank-paper',
    theme_id: 'cream',
    pin_color: noteState.pinColor,
    stickers: noteState.stickers,
    customStyle: {
      shapeId: noteState.shapeId,
      colorId: noteState.colorId,
      patternId: noteState.patternId,
    },
  };
}

function downloadDataUrl(dataUrl, fileName) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function getShareLink(origin, noteId) {
  return `${origin}/note/${noteId}`;
}

export default function NoteMaker() {
  const navigate = useNavigate();
  const shareRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [noteState, setNoteState] = useState(defaultState);
  const [activePatternPack, setActivePatternPack] = useState(patternPacks[0].id);
  const [activeStickerPack, setActiveStickerPack] = useState(stickerPacks[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState(supabase ? 'cloud' : 'local');
  const [savedNoteId, setSavedNoteId] = useState('');
  const [savedFrom, setSavedFrom] = useState('');
  const [copyState, setCopyState] = useState('Copy link');
  const [error, setError] = useState('');

  const currentStep = wizardSteps[stepIndex];
  const previewNote = useMemo(() => makePreviewNote(noteState), [noteState]);
  const availablePatterns = patternPacks.find((pack) => pack.id === activePatternPack)?.items || noteMakerPatterns;
  const availableStickers = stickerPacks.find((pack) => pack.id === activeStickerPack)?.items || [];
  const noteOrigin = typeof window === 'undefined' ? 'https://notiepost.vercel.app' : window.location.origin;

  const updateState = (patch) => {
    setNoteState((current) => {
      const next = { ...current, ...patch };
      if (typeof patch.name === 'string' && typeof window !== 'undefined') {
        window.localStorage.setItem('notie-name', patch.name);
      }
      return next;
    });
  };

  const canGoNext =
    currentStep.id !== 'write' ||
    noteState.text.trim().length > 0;

  const persistNote = async () => {
    if (savedNoteId) {
      return { id: savedNoteId, source: savedFrom || status };
    }

    const payload = {
      name: noteState.name.trim() || 'Anonymous',
      message: noteState.text.trim(),
      design_id: 'blank-paper',
      theme_id: 'cream',
      pin_color: noteState.pinColor,
      custom_style: {
        shapeId: noteState.shapeId,
        colorId: noteState.colorId,
        patternId: noteState.patternId,
      },
      stickers: serializeStickerEntries(
        noteState.stickers,
        noteState.pinColor,
        {
          shapeId: noteState.shapeId,
          colorId: noteState.colorId,
          patternId: noteState.patternId,
        }
      ),
    };

    if (!payload.message) {
      throw new Error('Write a little note before sharing it.');
    }

    setIsSaving(true);
    try {
      if (!supabase) {
        const localNote = {
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          ...payload,
          ...getBalancedPlacement(readLocalNotes()),
        };
        appendLocalNote(localNote);
        setStatus('local');
        setSavedNoteId(localNote.id);
        setSavedFrom('local');
        return { id: localNote.id, source: 'local' };
      }

      const { data: existingRows, error: countError } = await supabase
        .from('notes')
        .select('pos_x, pos_y');

      if (countError) throw countError;

      const placement = getBalancedPlacement(existingRows || []);
      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({
          name: payload.name,
          message: payload.message,
          design_id: payload.design_id,
          theme_id: payload.theme_id,
          stickers: payload.stickers,
          ...placement,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      setStatus('cloud');
      setSavedNoteId(data.id);
      setSavedFrom('cloud');
      return { id: data.id, source: 'cloud' };
    } catch (saveError) {
      const localNote = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
        ...getBalancedPlacement(readLocalNotes()),
      };
      appendLocalNote(localNote);
      setStatus('local');
      setSavedNoteId(localNote.id);
      setSavedFrom('local');
      setError(`${getSupabaseIssueMessage(saveError)} Saved locally for now.`);
      return { id: localNote.id, source: 'local' };
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!canGoNext) return;
    if (stepIndex === wizardSteps.length - 1) return;

    if (currentStep.id === 'write') {
      await persistNote();
    }

    setStepIndex((current) => Math.min(current + 1, wizardSteps.length - 1));
  };

  const handleBack = () => {
    setError('');
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleStickerToggle = (stickerId) => {
    const current = normalizeStickerEntries(noteState.stickers);
    const exists = current.some((sticker) => sticker.stickerId === stickerId);

    if (exists) {
      updateState({
        stickers: current.filter((sticker) => sticker.stickerId !== stickerId),
      });
      return;
    }

    if (current.length >= 5) return;
    updateState({ stickers: addStickerInstance(current, stickerId) });
  };

  const handleStickerMove = (stickerId, patch) => {
    updateState({
      stickers: normalizeStickerEntries(noteState.stickers).map((sticker) =>
        sticker.id === stickerId ? { ...sticker, ...patch } : sticker
      ),
    });
  };

  const handleStickerRemove = (stickerId) => {
    updateState({
      stickers: normalizeStickerEntries(noteState.stickers).filter((sticker) => sticker.id !== stickerId),
    });
  };

  const handleSaveImage = async () => {
    if (!shareRef.current || isExporting) return;

    setIsExporting(true);
    setError('');
    try {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: null,
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
      });
      downloadDataUrl(canvas.toDataURL('image/png'), `notie-${savedNoteId || 'note'}.png`);
    } catch (exportError) {
      console.error('NoteMaker image export failed.', exportError);
      setError('Could not save the note image just now.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const saved = await persistNote();
    const shareLink = getShareLink(noteOrigin, saved.id);

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyState('Copied!');
      window.setTimeout(() => setCopyState('Copy link'), 1800);
    } catch {
      setCopyState('Copy failed');
      window.setTimeout(() => setCopyState('Copy link'), 1800);
    }
  };

  const handleWhatsAppShare = async () => {
    const saved = await persistNote();
    const shareLink = getShareLink(noteOrigin, saved.id);
    const text = `${noteState.text.trim()}\nMade with Notie ✦ ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handlePinToBoard = async () => {
    await persistNote();
    navigate('/board');
  };

  const handleReset = () => {
    setError('');
    setSavedNoteId('');
    setSavedFrom('');
    setCopyState('Copy link');
    setNoteState({
      ...defaultState,
      name: typeof window === 'undefined' ? '' : window.localStorage.getItem('notie-name') || '',
    });
    setActivePatternPack(patternPacks[0].id);
    setActiveStickerPack(stickerPacks[0].id);
    setStepIndex(0);
  };

  return (
    <div className="note-maker">
      <div className="note-maker__progress">
        {wizardSteps.map((step, index) => (
          <span
            key={step.id}
            className={`note-maker__dot ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-done' : ''}`}
          />
        ))}
      </div>

      <div className="note-maker__step-meta">
        <span>{`Step ${stepIndex + 1} of ${wizardSteps.length}`}</span>
        <strong>{currentStep.label}</strong>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={currentStep.id}
          className="note-maker__panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.34, ease: [0.34, 1.2, 0.64, 1] }}
        >
          {currentStep.id === 'shape' ? (
            <div className="note-maker__content note-maker__content--poster">
              <div className="note-maker__hero">
                <p className="note-maker__eyebrow">Choose the note feeling first</p>
                <h1>Pick a shape that feels like you.</h1>
                <p>
                  These are your base note silhouettes. They stay with the note all the way to the board.
                </p>
              </div>

              <div className="note-maker__shape-grid">
                {noteMakerShapes.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    className={`note-maker__shape-card ${noteState.shapeId === shape.id ? 'is-active' : ''}`}
                    onClick={() => updateState({ shapeId: shape.id })}
                  >
                    <div className="note-maker__shape-art">
                      <img src={shape.asset} alt={shape.label} />
                    </div>
                    <span>{shape.label}</span>
                  </button>
                ))}
              </div>

              <div className="note-maker__shape-preview">
                <NoteCard preview note={previewNote} interactive={false} className="note-maker__preview-note" />
              </div>
            </div>
          ) : null}

          {currentStep.id === 'style' ? (
            <div className="note-maker__content">
              <div className="note-maker__hero note-maker__hero--center">
                <p className="note-maker__eyebrow">Color + pattern</p>
                <h1>Dress the paper your way.</h1>
                <p>Keep it soft and plain, or make it sweet and patterned. Your mini preview updates live.</p>
              </div>

              <div className="note-maker__style-stage">
                <NoteCard preview note={previewNote} interactive={false} className="note-maker__preview-note" />
              </div>

              <div className="note-maker__swatch-block">
                <div className="note-maker__swatch-row">
                  {noteMakerColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`note-maker__color-dot ${noteState.colorId === color.id ? 'is-active' : ''}`}
                      style={{ '--swatch-fill': color.fill }}
                      onClick={() => updateState({ colorId: color.id })}
                      aria-label={color.label}
                    />
                  ))}
                </div>

                <div className="note-maker__pack-tabs">
                  {patternPacks.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      className={`note-maker__pack-tab ${activePatternPack === pack.id ? 'is-active' : ''}`}
                      onClick={() => setActivePatternPack(pack.id)}
                    >
                      {pack.label}
                    </button>
                  ))}
                </div>

                <div className="note-maker__pattern-grid">
                  {availablePatterns.map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      className={`note-maker__pattern-card ${noteState.patternId === pattern.id ? 'is-active' : ''}`}
                      onClick={() => updateState({ patternId: pattern.id })}
                    >
                      <span
                        className="note-maker__pattern-card-art"
                        style={{
                          '--pattern-fill': noteMakerColorMap[noteState.colorId]?.fill,
                          '--pattern-image':
                            pattern.type === 'asset'
                              ? `url("${pattern.asset}")`
                              : pattern.backgroundImage,
                          '--pattern-size': pattern.backgroundSize || 'cover',
                          backgroundImage:
                            pattern.type === 'asset'
                              ? `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), url("${pattern.asset}")`
                              : `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), ${pattern.backgroundImage}`,
                          backgroundSize: `auto, ${pattern.backgroundSize || (pattern.type === 'asset' ? 'cover' : 'auto')}`,
                        }}
                      />
                      <strong>{pattern.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {currentStep.id === 'stickers' ? (
            <div className="note-maker__content">
              <div className="note-maker__hero note-maker__hero--center">
                <p className="note-maker__eyebrow">Sticker packs</p>
                <h1>Pick a few little extras.</h1>
                <p>Choose up to five. We are already splitting these into packs, so future drops will fit right in.</p>
              </div>

              <div className="note-maker__tray">
                {normalizeStickerEntries(noteState.stickers).length ? (
                  normalizeStickerEntries(noteState.stickers).map((sticker) => {
                    const item = stickerMap[sticker.stickerId];
                    if (!item) return null;
                    return (
                      <button
                        key={sticker.id}
                        type="button"
                        className="note-maker__tray-chip"
                        onClick={() => handleStickerToggle(sticker.stickerId)}
                      >
                        {item.kind === 'emoji' ? <span>{item.emoji}</span> : <img src={item.src} alt={item.label} />}
                      </button>
                    );
                  })
                ) : (
                  <span className="note-maker__tray-empty">Your sticker tray is still empty.</span>
                )}
              </div>

              <div className="note-maker__style-stage note-maker__style-stage--stickers">
                <NoteCard preview note={previewNote} interactive={false} className="note-maker__preview-note" />
              </div>

              <div className="note-maker__pack-tabs">
                {stickerPacks.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    className={`note-maker__pack-tab ${activeStickerPack === pack.id ? 'is-active' : ''}`}
                    onClick={() => setActiveStickerPack(pack.id)}
                  >
                    {pack.label}
                  </button>
                ))}
              </div>

              <div className="note-maker__sticker-grid">
                {availableStickers.map((sticker) => {
                  const selected = normalizeStickerEntries(noteState.stickers).some(
                    (entry) => entry.stickerId === sticker.id
                  );

                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      className={`note-maker__sticker-card ${selected ? 'is-active' : ''}`}
                      onClick={() => handleStickerToggle(sticker.id)}
                    >
                      {sticker.kind === 'emoji' ? (
                        <span className="note-maker__sticker-emoji">{sticker.emoji}</span>
                      ) : (
                        <img src={sticker.src} alt={sticker.label} />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="note-maker__hint">More packs coming soon 🛍</p>
            </div>
          ) : null}

          {currentStep.id === 'write' ? (
            <div className="note-maker__content note-maker__content--write">
              <div className="note-maker__hero note-maker__hero--center">
                <p className="note-maker__eyebrow">Hero moment</p>
                <h1>Write directly onto your note.</h1>
                <p>This is the special part. It should feel like you are writing on paper, not filling a form.</p>
              </div>

              <div className="note-maker__cork-stage">
                <div className="note-maker__editor-note">
                  <NoteCard
                    preview
                    note={previewNote}
                    editable
                    hideCopy
                    className="note-maker__preview-note note-maker__preview-note--hero"
                    onStickerMove={handleStickerMove}
                    onStickerRemove={handleStickerRemove}
                  />

                  <div className="note-maker__editor-overlay">
                    <textarea
                      className="note-maker__textarea"
                      value={noteState.text}
                      onChange={(event) => updateState({ text: event.target.value.slice(0, 100) })}
                      placeholder="Write a little thought, a tiny confession, or something sweet..."
                      maxLength={100}
                    />

                    <div className="note-maker__editor-footer">
                      <label className="note-maker__name-field">
                        <span>Signed by</span>
                        <input
                          value={noteState.name}
                          onChange={(event) => updateState({ name: event.target.value })}
                          placeholder="Call me..."
                          maxLength={24}
                        />
                      </label>
                      <span className="note-maker__counter">{noteState.text.length} / 100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {currentStep.id === 'share' ? (
            <div className="note-maker__content note-maker__content--share">
              <div className="note-maker__hero note-maker__hero--center">
                <p className="note-maker__eyebrow">Share it</p>
                <h1>Your note is ready to fly.</h1>
                <p>Pin it to your board, send it to someone, or save a little snapshot.</p>
              </div>

              <div className="note-maker__share-board">
                <div className="note-maker__share-cork" ref={shareRef}>
                  <div className="note-maker__thud-ring" aria-hidden="true" />
                  <NoteCard
                    preview
                    note={{
                      ...previewNote,
                      id: savedNoteId || 'note-maker-final',
                    }}
                    interactive={false}
                    className="note-maker__share-note"
                    style={{ '--note-maker-rot': `${-2 + (savedNoteId.length % 5)}deg` }}
                  />
                </div>
              </div>

              <div className="note-maker__share-actions">
                <button type="button" className="note-maker__action" onClick={handleWhatsAppShare}>
                  Send to someone
                </button>
                <button type="button" className="note-maker__action" onClick={handleCopyLink}>
                  {copyState}
                </button>
                <button type="button" className="note-maker__action" onClick={handleSaveImage} disabled={isExporting}>
                  {isExporting ? 'Saving image...' : 'Save as image'}
                </button>
              </div>

              <div className="note-maker__share-cta">
                <button
                  type="button"
                  className="note-maker__button note-maker__button--primary"
                  disabled={isSaving}
                  onClick={handlePinToBoard}
                >
                  {isSaving ? 'Pinning...' : 'Pin to my board'}
                </button>
                <button type="button" className="note-maker__button note-maker__button--ghost" onClick={handleReset}>
                  Make another one ✦
                </button>
              </div>
            </div>
          ) : null}
        </motion.section>
      </AnimatePresence>

      {error ? <p className="note-maker__error">{error}</p> : null}

      {currentStep.id !== 'share' ? (
        <div className="note-maker__footer">
          <button type="button" className="note-maker__button note-maker__button--ghost" onClick={handleBack} disabled={stepIndex === 0}>
            Back
          </button>
          <button
            type="button"
            className="note-maker__button note-maker__button--primary"
            onClick={handleNext}
            disabled={!canGoNext || isSaving}
          >
            {currentStep.id === 'write' ? 'Make it shareable →' : 'Next →'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
