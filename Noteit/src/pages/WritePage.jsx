import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import PushpinPicker from '../components/PushpinPicker';
import StylePicker from '../components/StylePicker';
import ThemePicker from '../components/ThemePicker';
import StickerTray from '../components/StickerTray';
import NotePreview from '../components/NotePreview';
import { exportNotePng } from '../utils/exportNotePng';
import { getBalancedPlacement } from '../utils/boardPlacement';
import { supabase } from '../lib/supabase';
import { appendLocalNote, readLocalNotes } from '../utils/localNotes';
import { getSupabaseIssueMessage } from '../utils/supabaseStatus';
import {
  addStickerInstance,
  normalizeStickerEntries,
  removeStickerByAsset,
  serializeStickerEntries,
  updateStickerEntry,
} from '../utils/stickers';

const defaultDraft = {
  name: localStorage.getItem('notie-name') || '',
  message: '',
  designId: 'blank-paper',
  themeId: 'cream',
  pinColor: 'none',
  stickers: [],
};

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

export default function WritePage() {
  const navigate = useNavigate();
  const exportRef = useRef(null);
  const [draft, setDraft] = useState(defaultDraft);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pulsePreview, setPulsePreview] = useState(false);
  const [error, setError] = useState('');
  const [saveMode, setSaveMode] = useState(supabase ? 'cloud' : 'local');

  const floatingNotes = useMemo(() => ([
    { id: 'a', x: '7%', y: '12%', width: 92, height: 118, rotation: -10, delay: '0s', duration: '9s', tone: 'cream' },
    { id: 'b', x: '83%', y: '16%', width: 88, height: 112, rotation: 9, delay: '1.2s', duration: '8.5s', tone: 'rose' },
    { id: 'c', x: '14%', y: '74%', width: 104, height: 128, rotation: 8, delay: '0.8s', duration: '10s', tone: 'mint' },
    { id: 'd', x: '76%', y: '79%', width: 86, height: 108, rotation: -8, delay: '1.6s', duration: '9.2s', tone: 'sky' },
  ]), []);

  const messageCount = draft.message.length;
  const selectedStickerCount = draft.stickers.length;
  const displayName = draft.name.trim() || 'Anonymous';

  const updateDraft = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);

    if (typeof patch.name === 'string') {
      localStorage.setItem('notie-name', patch.name);
    }
  };

  const handleToggleSticker = (stickerId) => {
    const alreadyOnNote = draft.stickers.some((sticker) => sticker.stickerId === stickerId);

    updateDraft({
      stickers: alreadyOnNote
        ? removeStickerByAsset(draft.stickers, stickerId)
        : addStickerInstance(draft.stickers, stickerId),
    });
  };

  const handleStickerMove = (stickerId, patch) => {
    updateDraft({
      stickers: updateStickerEntry(draft.stickers, stickerId, patch),
    });
  };

  const steps = useMemo(() => [
    {
      id: 'write',
      eyebrow: 'Step 01',
      title: 'Write the first spark.',
      subtitle: 'Start with the thought, a tiny confession, or a sweet little line.',
      ready: draft.message.trim().length > 0,
    },
    {
      id: 'style',
      eyebrow: 'Step 02',
      title: 'Pick the paper mood.',
      subtitle: 'Choose the note shape and color before it lands on the board.',
      ready: true,
    },
    {
      id: 'decorate',
      eyebrow: 'Step 03',
      title: 'Decorate it a little.',
      subtitle: 'Add a pushpin and a few stickers so it feels like yours.',
      ready: true,
    },
    {
      id: 'finish',
      eyebrow: 'Step 04',
      title: 'Preview and pin it.',
      subtitle: 'Download it if you want, or send it straight to the corkboard.',
      ready: draft.message.trim().length > 0,
    },
  ], [draft.message]);

  const activeStep = steps[stepIndex];
  const stepDirection = stepIndex % 2 === 0 ? 1 : -1;

  const goNext = () => {
    if (!activeStep.ready) return;
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = draft.message.trim();
    const name = draft.name.trim() || 'Anonymous';

    if (!message) {
      setError('Write a short note first.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setPulsePreview(true);

    try {
      if (!supabase) {
        appendLocalNote(buildLocalNote(draft, name, message));
        setSaveMode('local');
        setTimeout(() => navigate('/board'), 260);
        return;
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
      setTimeout(() => navigate('/board'), 260);
    } catch (submitError) {
      appendLocalNote(buildLocalNote(draft, name, message));
      setSaveMode('local');
      setError(`${getSupabaseIssueMessage(submitError)} Saved locally for now.`);
      setTimeout(() => navigate('/board'), 260);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-bg app-bg--write">
      <main className="notie-shell">
        <Header subtitle="A guided little ritual for making your first note." />

        <motion.form
          className="write-layout write-layout--onboarding"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="onboarding-atmosphere" aria-hidden="true">
            {floatingNotes.map((note) => (
              <span
                key={note.id}
                className={`onboarding-atmosphere__note onboarding-atmosphere__note--${note.tone}`}
                style={{
                  left: note.x,
                  top: note.y,
                  width: `${note.width}px`,
                  height: `${note.height}px`,
                  '--note-rotation': `${note.rotation}deg`,
                  '--float-delay': note.delay,
                  '--float-duration': note.duration,
                }}
              />
            ))}
          </div>

          <div className="write-layout__controls write-layout__controls--onboarding">
            <div className="onboarding-progress" aria-label="Onboarding progress">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`onboarding-progress__dot ${index === stepIndex ? 'is-active' : ''} ${index < stepIndex ? 'is-done' : ''}`}
                  onClick={() => setStepIndex(index)}
                  aria-label={`Go to ${step.title}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.section
                key={activeStep.id}
                className="onboarding-card"
                initial={{ opacity: 0, x: 38 * stepDirection, y: 16, scale: 0.98, rotate: 1.2 * stepDirection }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -28 * stepDirection, y: -10, scale: 0.99, rotate: -0.8 * stepDirection }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="onboarding-card__eyebrow">{activeStep.eyebrow}</p>
                <h2 className="onboarding-card__title">{activeStep.title}</h2>
                <p className="onboarding-card__subtitle">{activeStep.subtitle}</p>

                {activeStep.id === 'write' ? (
                  <div className="onboarding-card__body">
                    <section className="onboarding-notepad">
                      <span className="onboarding-notepad__tape" aria-hidden="true" />
                      <label className="sr-only" htmlFor="message-input">Message</label>
                      <textarea
                        id="message-input"
                        className="onboarding-notepad__textarea"
                        maxLength={100}
                        value={draft.message}
                        onChange={(event) => updateDraft({ message: event.target.value.slice(0, 100) })}
                        placeholder="What do you want to say today..."
                        aria-label="Message"
                      />
                      <div className="onboarding-notepad__footer">
                        <label className="onboarding-name" htmlFor="name-input">
                          <span className="onboarding-name__label">Signed by</span>
                          <input
                            id="name-input"
                            className="onboarding-name__input"
                            maxLength={12}
                            value={draft.name}
                            onChange={(event) => updateDraft({ name: event.target.value.slice(0, 12) })}
                            placeholder="Call me..."
                            aria-label="Your Name"
                          />
                        </label>
                        <div className={`character-counter ${messageCount >= 84 ? 'is-warning' : ''}`}>
                          {messageCount} / 100
                        </div>
                      </div>
                    </section>
                  </div>
                ) : null}

                {activeStep.id === 'style' ? (
                  <div className="onboarding-card__body">
                    <StylePicker value={draft.designId} onChange={(designId) => updateDraft({ designId })} label="Choose a paper" />
                    <ThemePicker value={draft.themeId} onChange={(themeId) => updateDraft({ themeId })} label="Choose a color" />
                  </div>
                ) : null}

                {activeStep.id === 'decorate' ? (
                  <div className="onboarding-card__body">
                    <PushpinPicker value={draft.pinColor} onChange={(pinColor) => updateDraft({ pinColor })} />
                    <StickerTray value={draft.stickers} onToggle={handleToggleSticker} />
                    <div className="onboarding-sticker-summary" aria-live="polite">
                      {draft.stickers.length ? (
                        draft.stickers.map((sticker, index) => (
                          <motion.span
                            key={`${sticker.stickerId}-${index}`}
                            className="onboarding-sticker-summary__chip"
                            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.04 }}
                          >
                            {sticker.stickerId.replace(/-/g, ' ')}
                          </motion.span>
                        ))
                      ) : (
                        <span className="onboarding-sticker-summary__empty">No stickers yet</span>
                      )}
                    </div>
                    <p className="onboarding-card__hint">
                      {selectedStickerCount ? `${selectedStickerCount} sticker${selectedStickerCount > 1 ? 's' : ''} on your note.` : 'Tap a sticker to place it on the note.'}
                    </p>
                  </div>
                ) : null}

                {activeStep.id === 'finish' ? (
                  <div className="onboarding-card__body onboarding-card__body--review">
                    <div className="onboarding-review">
                      <div>
                        <div className="onboarding-review__label">Mode</div>
                        <div className="onboarding-review__value">{saveMode === 'cloud' ? 'Supabase cloud' : 'Local fallback'}</div>
                      </div>
                      <div>
                        <div className="onboarding-review__label">Paper</div>
                        <div className="onboarding-review__value">{draft.designId}</div>
                      </div>
                      <div>
                        <div className="onboarding-review__label">Signed</div>
                        <div className="onboarding-review__value">{displayName}</div>
                      </div>
                    </div>

                    <div className="action-row action-row--stacked">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleExport}
                        disabled={isExporting}
                      >
                        {isExporting ? 'Generating...' : 'Download PNG'}
                      </button>
                      <motion.button
                        type="submit"
                        className="primary-button"
                        disabled={isSubmitting}
                        whileHover={{ y: -2, boxShadow: '0 16px 28px rgba(120, 87, 47, 0.25)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmitting ? 'Pinning...' : 'Pin To Board'}
                      </motion.button>
                    </div>
                  </div>
                ) : null}

                {error ? <p className="form-error">{error}</p> : null}

                <div className="onboarding-card__actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={goBack}
                    disabled={stepIndex === 0}
                  >
                    Back
                  </button>
                  {stepIndex < steps.length - 1 ? (
                    <motion.button
                      type="button"
                      className="primary-button"
                      disabled={!activeStep.ready}
                      onClick={goNext}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                    </motion.button>
                  ) : null}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>

          <div className="write-layout__preview write-layout__preview--onboarding">
            <div className="onboarding-preview">
              <motion.div
                className="onboarding-preview__badge"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                Live Preview
              </motion.div>
              <div className="onboarding-preview__copy">
                <h3>Every tap updates the note instantly.</h3>
                <p>Move the stickers, test the paper, then pin it when it feels right.</p>
              </div>
              <motion.div
                className="onboarding-preview__stage"
                key={activeStep.id}
                initial={{ opacity: 0.72, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <NotePreview
                  note={draft}
                  exportRef={exportRef}
                  pulse={pulsePreview}
                  editable
                  onStickerMove={handleStickerMove}
                />
              </motion.div>
            </div>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
