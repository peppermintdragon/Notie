import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  pinColor: 'honey',
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
    pin_color: draft.pinColor,
    stickers: normalizeStickerEntries(draft.stickers),
    ...getBalancedPlacement(readLocalNotes()),
  };
}

export default function WritePage() {
  const navigate = useNavigate();
  const exportRef = useRef(null);
  const [draft, setDraft] = useState(defaultDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pulsePreview, setPulsePreview] = useState(false);
  const [error, setError] = useState('');
  const [saveMode, setSaveMode] = useState(supabase ? 'cloud' : 'local');

  const messageCount = draft.message.length;

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

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await exportNotePng(exportRef.current, 'preview');
      setError('');
    } catch {
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
        <Header subtitle="Pick a paper, add a few stickers, and pin it to the board." />

        <motion.form
          className="write-layout"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="write-layout__controls">
            <StylePicker value={draft.designId} onChange={(designId) => updateDraft({ designId })} />
            <ThemePicker value={draft.themeId} onChange={(themeId) => updateDraft({ themeId })} />
            <PushpinPicker value={draft.pinColor} onChange={(pinColor) => updateDraft({ pinColor })} />
            <StickerTray value={draft.stickers} onToggle={handleToggleSticker} />

            <section className="control-block">
              <label className="control-block__label" htmlFor="name-input">Your Name</label>
              <input
                id="name-input"
                className="text-input"
                maxLength={12}
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value.slice(0, 12) })}
                placeholder="Call me..."
                aria-label="Your Name"
              />
            </section>

            <section className="control-block">
              <label className="control-block__label" htmlFor="message-input">Message</label>
              <textarea
                id="message-input"
                className="text-area"
                maxLength={45}
                value={draft.message}
                onChange={(event) => updateDraft({ message: event.target.value.slice(0, 45) })}
                placeholder="What do you want to say today..."
                aria-label="Message"
              />
              <div className={`character-counter ${messageCount >= 38 ? 'is-warning' : ''}`}>
                {messageCount} / 45
              </div>
            </section>

            {error ? <p className="form-error">{error}</p> : null}
            <p className="form-hint">
              Save mode: {saveMode === 'cloud' ? 'Supabase cloud' : 'Local fallback'}.
            </p>

            <div className="action-row">
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

          <div className="write-layout__preview">
            <NotePreview
              note={draft}
              exportRef={exportRef}
              pulse={pulsePreview}
              editable
              onStickerMove={handleStickerMove}
            />
          </div>
        </motion.form>
      </main>
    </div>
  );
}
