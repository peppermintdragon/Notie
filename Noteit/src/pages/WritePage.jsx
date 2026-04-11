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
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
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
              <div className="onboarding-preview__badge">Live Preview</div>
              <div className="onboarding-preview__copy">
                <h3>Every tap updates the note instantly.</h3>
                <p>Move the stickers, test the paper, then pin it when it feels right.</p>
              </div>
              <div className="onboarding-preview__stage">
                <NotePreview
                  note={draft}
                  exportRef={exportRef}
                  pulse={pulsePreview}
                  editable
                  onStickerMove={handleStickerMove}
                />
              </div>
            </div>
          </div>
        </motion.form>
      </main>
    </div>
  );
}
