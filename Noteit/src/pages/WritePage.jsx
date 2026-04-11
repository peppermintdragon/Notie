import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from '../components/NoteCard';
import { exportNotePng } from '../utils/exportNotePng';
import { getBalancedPlacement } from '../utils/boardPlacement';
import { supabase } from '../lib/supabase';
import { appendLocalNote, readLocalNotes } from '../utils/localNotes';
import { noteDesignMap } from '../utils/noteDesigns';
import { getSupabaseIssueMessage } from '../utils/supabaseStatus';
import {
  addStickerInstance,
  addStickerInstanceAt,
  normalizeStickerEntries,
  serializeStickerEntries,
  updateStickerEntry,
  pushpinOptions,
  stickerOptions,
} from '../utils/stickers';

const defaultDraft = {
  name: localStorage.getItem('notie-name') || '',
  message: '',
  designId: 'blank-paper',
  themeId: 'cream',
  pinColor: 'none',
  stickers: [],
};

const paperChoices = [
  { id: 'lined', label: 'Lined', designId: 'blank-paper', themeId: 'cream', swatchClass: 'is-lined' },
  { id: 'grid', label: 'Grid', designId: 'cute-twinkle', themeId: 'cream', swatchClass: 'is-grid' },
  { id: 'floral', label: 'Floral', designId: 'cute-blush', themeId: 'rosewater', swatchClass: 'is-floral' },
  { id: 'scallop', label: 'Scallop', designId: 'cute-garden', themeId: 'sage-mist', swatchClass: 'is-scallop' },
  { id: 'kraft', label: 'Kraft', designId: 'cute-smile', themeId: 'champagne', swatchClass: 'is-kraft' },
  { id: 'paper-1', label: 'Paper 1', designId: 'paper-note-1', themeId: 'cream', swatchClass: 'has-art' },
  { id: 'paper-2', label: 'Paper 2', designId: 'paper-note-2', themeId: 'cream', swatchClass: 'has-art' },
  { id: 'paper-3', label: 'Paper 3', designId: 'paper-note-3', themeId: 'cream', swatchClass: 'has-art' },
  { id: 'paper-4', label: 'Paper 4', designId: 'paper-note-4', themeId: 'cream', swatchClass: 'has-art' },
  { id: 'paper-5', label: 'Paper 5', designId: 'paper-note-5', themeId: 'cream', swatchClass: 'has-art' },
  { id: 'paper-6', label: 'Paper 6', designId: 'paper-note-6', themeId: 'cream', swatchClass: 'has-art' },
  { id: 'paper-7', label: 'Paper 7', designId: 'paper-note-7', themeId: 'cream', swatchClass: 'has-art' },
];

const visiblePinChoices = pushpinOptions.filter((pin) => pin.id !== 'none').slice(0, 5);

const steps = [
  {
    id: 'intro',
    title: 'Write the first spark.',
    subtitle: 'Write a memo pad or sticky note. Make a special memory.',
  },
  {
    id: 'write',
    label: 'STEP 1 OF 4',
    title: 'Write the first spark.',
    subtitle: 'Start with a thought, a tiny confession, or a sweet little line.',
  },
  {
    id: 'paper',
    label: 'STEP 2 OF 4',
    title: 'Pick your favourite paper.',
    subtitle: 'Switch paper styles left and right, or tap a swatch to change it instantly.',
  },
  {
    id: 'stickers',
    label: 'STEP 3 OF 4',
    title: 'Add your favourite stickers.',
    subtitle: 'Drag stickers onto the note above. Or tap to add on mobile.',
  },
  {
    id: 'finish',
    label: 'STEP 4 OF 4',
    title: 'You are done! Pinned! 🎉',
    subtitle: 'Here is the final note, exactly how it will appear on the board.',
  },
];

function buildLocalNote(draft, name, message) {
  return {
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
    name,
    message,
    design_id: draft.designId,
    theme_id: draft.themeId,
    pin_color: draft.pinColor === 'none' ? null : draft.pinColor,
    stickers: normalizeStickerEntries(draft.stickers),
    ...getBalancedPlacement(readLocalNotes()),
  };
}

function getStepDirection(index) {
  return index % 2 === 0 ? 1 : -1;
}

export default function WritePage() {
  const navigate = useNavigate();
  const exportRef = useRef(null);
  const [draft, setDraft] = useState(defaultDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [saveMode, setSaveMode] = useState(supabase ? 'cloud' : 'local');

  const activeStep = steps[stepIndex];
  const stepDirection = getStepDirection(stepIndex);
  const displayName = draft.name.trim() || 'Anonymous';
  const messageCount = draft.message.length;
  const currentPaperIndex = Math.max(
    0,
    paperChoices.findIndex(
      (paper) => paper.designId === draft.designId && paper.themeId === draft.themeId
    )
  );

  const confettiBits = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: `confetti-${index}`,
        left: `${12 + ((index * 17) % 76)}%`,
        delay: `${index * 0.025}s`,
        rotate: `${-24 + (index % 8) * 7}deg`,
      })),
    []
  );

  const updateDraft = (patch) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      if (typeof patch.name === 'string') {
        localStorage.setItem('notie-name', patch.name);
      }
      return next;
    });
  };

  const selectPaper = (paper) => {
    updateDraft({ designId: paper.designId, themeId: paper.themeId });
  };

  const cyclePaper = (direction) => {
    const nextPaper =
      paperChoices[(currentPaperIndex + direction + paperChoices.length) % paperChoices.length];
    selectPaper(nextPaper);
  };

  const handleStickerMove = (stickerId, patch) => {
    updateDraft({
      stickers: updateStickerEntry(draft.stickers, stickerId, patch),
    });
  };

  const handleStickerDrop = (stickerId, position) => {
    updateDraft({
      stickers: addStickerInstanceAt(draft.stickers, stickerId, position.x, position.y),
    });
  };

  const handleStickerAdd = (stickerId) => {
    updateDraft({
      stickers: addStickerInstance(draft.stickers, stickerId),
    });
  };

  const saveNote = async () => {
    const message = draft.message.trim();
    const name = draft.name.trim() || 'Anonymous';

    if (!message) {
      setError('Write a short note first.');
      return false;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (!supabase) {
        appendLocalNote(buildLocalNote(draft, name, message));
        setSaveMode('local');
        return true;
      }

      const { data: existingRows, error: countError } = await supabase
        .from('notes')
        .select('pos_x, pos_y', { count: 'exact' });

      if (countError) throw countError;

      const placement = getBalancedPlacement(existingRows || []);
      const { error: insertError } = await supabase.from('notes').insert({
        name,
        message,
        design_id: draft.designId,
        theme_id: draft.themeId,
        stickers: serializeStickerEntries(draft.stickers, draft.pinColor),
        ...placement,
      });

      if (insertError) throw insertError;

      setSaveMode('cloud');
      return true;
    } catch (submitError) {
      appendLocalNote(buildLocalNote(draft, name, message));
      setSaveMode('local');
      setError(`${getSupabaseIssueMessage(submitError)} Saved locally for now.`);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = () => {
    if (activeStep.id === 'write' && !draft.message.trim()) return;
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setError('');
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handlePinStep = () => {
    setError('');
    setStepIndex(4);
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await exportNotePng(draft, 'preview');
      setError('');
    } catch (exportError) {
      console.error('Write page PNG export failed.', exportError);
      setError('Could not download PNG right now. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCheckBoard = async () => {
    const saved = await saveNote();
    if (saved) {
      navigate('/board');
    }
  };

  const renderNote = (extraClass = '') => (
    <NoteCard
      ref={exportRef}
      preview
      editable={activeStep.id === 'stickers'}
      onStickerMove={handleStickerMove}
      onStickerDrop={handleStickerDrop}
      note={{
        ...draft,
        id: 'preview',
        name: displayName,
        message: draft.message.trim() || 'What do you want to say today...',
        theme_id: draft.themeId,
        design_id: draft.designId,
      }}
      style={{
        width: 'min(76vw, 460px)',
        aspectRatio: '1 / 1',
        minHeight: 'unset',
      }}
      className={extraClass}
    />
  );

  return (
    <div className="guided-onboarding">
      {activeStep.id !== 'intro' ? (
        <button type="button" className="guided-onboarding__skip" onClick={() => navigate('/board')}>
          Skip
        </button>
      ) : null}

      <AnimatePresence mode="wait">
        {activeStep.id === 'intro' ? (
          <motion.section
            key="intro"
            className="guided-step guided-step--intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="guided-step__inner guided-step__inner--intro">
              <div className="guided-hero-note">
                <span className="guided-hero-note__tape guided-hero-note__tape--left" />
                <span className="guided-hero-note__tape guided-hero-note__tape--right" />
                <div className="guided-hero-note__title">Notie</div>
                <div className="guided-hero-note__smile">:)</div>
              </div>

              <div className="guided-hero-copy">
                <h1>Write the first spark.</h1>
                <p>Write a memo pad or sticky note. Make a special memory.</p>
                <p>Start with a thought, a tiny confession, or a sweet little line.</p>
              </div>

              <div className="guided-hero-actions">
                <button type="button" className="guided-button guided-button--primary" onClick={goToNextStep}>
                  Let&apos;s Start!
                </button>
                <button type="button" className="guided-link" onClick={() => navigate('/board')}>
                  See public board
                </button>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key={activeStep.id}
            className="guided-step"
            initial={{ opacity: 0, y: 22 * stepDirection }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 * stepDirection }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="guided-step__inner">
              <div className="guided-step__label">{activeStep.label}</div>
              <h2 className="guided-step__title">{activeStep.title}</h2>
              <p className="guided-step__subtitle">{activeStep.subtitle}</p>

              {activeStep.id === 'write' ? (
                <>
                  <div className="guided-write-note">
                    <span className="guided-write-note__tape" />
                    <textarea
                      className="guided-write-note__textarea"
                      maxLength={100}
                      value={draft.message}
                      onChange={(event) => updateDraft({ message: event.target.value.slice(0, 100) })}
                      placeholder="What do you want to say today..."
                      aria-label="Message"
                    />
                    <div className="guided-write-note__footer">
                      <label className="guided-write-note__name">
                        <span>SIGNED BY</span>
                        <input
                          maxLength={12}
                          value={draft.name}
                          onChange={(event) => updateDraft({ name: event.target.value.slice(0, 12) })}
                          placeholder="Call me..."
                          aria-label="Your name"
                        />
                      </label>
                      <span className="guided-write-note__count">{messageCount} / 100</span>
                    </div>
                  </div>

                  <div className="guided-step__actions">
                    <button
                      type="button"
                      className="guided-button guided-button--primary"
                      onClick={goToNextStep}
                      disabled={!draft.message.trim()}
                    >
                      Next →
                    </button>
                  </div>
                </>
              ) : null}

              {activeStep.id === 'paper' ? (
                <>
                  <div className="guided-carousel">
                    <button type="button" className="guided-carousel__arrow" onClick={() => cyclePaper(-1)} aria-label="Previous paper">
                      ‹
                    </button>
                    <div className="guided-carousel__stage">{renderNote()}</div>
                    <button type="button" className="guided-carousel__arrow" onClick={() => cyclePaper(1)} aria-label="Next paper">
                      ›
                    </button>
                  </div>

                  <div className="guided-paper-swatches">
                    {paperChoices.map((paper) => (
                      <button
                        key={paper.id}
                        type="button"
                        className={`guided-paper-swatch ${paper.swatchClass} ${currentPaperIndex === paperChoices.findIndex((item) => item.id === paper.id) ? 'is-active' : ''}`}
                        onClick={() => selectPaper(paper)}
                        aria-label={`Choose ${paper.label} paper`}
                        style={
                          noteDesignMap[paper.designId]?.asset
                            ? { backgroundImage: `url("${noteDesignMap[paper.designId].asset}")` }
                            : undefined
                        }
                      >
                        <span>{paper.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="guided-subchoice">
                    <div className="guided-subchoice__label">Pick your pin!</div>
                    <div className="guided-pin-row">
                      {visiblePinChoices.map((pin) => (
                        <button
                          key={pin.id}
                          type="button"
                          className={`guided-pin-dot ${draft.pinColor === pin.id ? 'is-active' : ''}`}
                          onClick={() => updateDraft({ pinColor: pin.id })}
                          aria-label={`Choose ${pin.label} pin`}
                          style={{ '--pin-gradient': pin.color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="guided-step__actions">
                    <button type="button" className="guided-button guided-button--ghost" onClick={goToPreviousStep}>
                      Back
                    </button>
                    <button type="button" className="guided-button guided-button--primary" onClick={goToNextStep}>
                      Next →
                    </button>
                  </div>
                </>
              ) : null}

              {activeStep.id === 'stickers' ? (
                <>
                  <div className="guided-note-stage">{renderNote('guided-note-stage__note')}</div>

                  <div className="guided-sticker-tray" aria-label="Sticker tray">
                    {stickerOptions.map((sticker) => (
                      <motion.button
                        key={sticker.id}
                        type="button"
                        draggable
                        className="guided-sticker-pill"
                        onClick={() => handleStickerAdd(sticker.id)}
                        onDragStart={(event) => {
                          event.dataTransfer.setData('text/notie-sticker', sticker.id);
                          event.dataTransfer.effectAllowed = 'copy';
                        }}
                        whileTap={{ scale: 0.94 }}
                      >
                        <img src={sticker.src} alt="" />
                      </motion.button>
                    ))}
                  </div>

                  <div className="guided-hint">
                    <span>Drag stickers onto the note above.</span>
                    <span>Or tap to add.</span>
                  </div>

                  <div className="guided-step__actions">
                    <button type="button" className="guided-button guided-button--ghost" onClick={goToPreviousStep}>
                      Back
                    </button>
                    <button type="button" className="guided-button guided-button--primary" onClick={handlePinStep}>
                      Pin it! →
                    </button>
                  </div>
                </>
              ) : null}

              {activeStep.id === 'finish' ? (
                <>
                  <div className="guided-finish">
                    <div className="guided-finish__confetti" aria-hidden="true">
                      {confettiBits.map((bit) => (
                        <span
                          key={bit.id}
                          className="guided-finish__piece"
                          style={{
                            left: bit.left,
                            '--confetti-delay': bit.delay,
                            '--confetti-rotate': bit.rotate,
                          }}
                        />
                      ))}
                    </div>
                    {renderNote('guided-finish__note')}
                  </div>

                  {error ? <p className="form-error">{error}</p> : null}

                  <div className="guided-step__actions guided-step__actions--final">
                    <button
                      type="button"
                      className="guided-button guided-button--ghost"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Generating...' : 'Download PNG'}
                    </button>
                    <button
                      type="button"
                      className="guided-button guided-button--primary"
                      onClick={handleCheckBoard}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Pinning...' : 'Check it out! →'}
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <div className="guided-progress-dots" aria-label="Progress">
              {steps.slice(1).map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`guided-progress-dots__dot ${index + 1 === stepIndex ? 'is-active' : ''}`}
                  onClick={() => setStepIndex(index + 1)}
                  aria-label={`Go to ${step.title}`}
                />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
