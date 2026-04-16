import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StylePicker from '../components/StylePicker';
import ThemePicker from '../components/ThemePicker';
import StickerTray from '../components/StickerTray';
import NotePreview from '../components/NotePreview';

const steps = [
  { id: 1, label: 'Choose a shape', title: 'Pick a shape that feels like you.' },
  { id: 2, label: 'Pick a color', title: 'Choose your vibe.' },
  { id: 3, label: 'Add stickers', title: 'Sprinkle some personality.' },
  { id: 4, label: 'Write your message', title: 'Say something nice.' },
  { id: 5, label: 'Share & celebrate', title: 'Your note is ready!' },
];

const defaultDraft = {
  designId: 'toast-rounded-square',
  themeId: 'cream',
  stickers: [],
  name: localStorage.getItem('notie-name') || '',
  message: '',
};

export default function NoteMaker() {
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState(defaultDraft);

  const updateDraft = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (typeof patch.name === 'string') {
      localStorage.setItem('notie-name', patch.name);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard__step">
            <h1 className="wizard__title">{steps[0].title}</h1>
            <p className="wizard__subtitle">Select the decorative paper cut-out first. The rest of the note stays classic Notie.</p>
            <StylePicker value={draft.designId} onChange={(designId) => updateDraft({ designId })} />
          </div>
        );
      case 2:
        return (
          <div className="wizard__step">
            <h1 className="wizard__title">{steps[1].title}</h1>
            <ThemePicker value={draft.themeId} onChange={(themeId) => updateDraft({ themeId })} />
          </div>
        );
      case 3:
        return (
          <div className="wizard__step">
            <h1 className="wizard__title">{steps[2].title}</h1>
            <StickerTray value={draft.stickers} onChange={(stickers) => updateDraft({ stickers })} />
          </div>
        );
      case 4:
        return (
          <div className="wizard__step">
            <h1 className="wizard__title">{steps[3].title}</h1>
            <div className="wizard__write-section">
              <section>
                <label htmlFor="name-input" className="wizard__label">Your Name</label>
                <input
                  id="name-input"
                  className="text-input"
                  maxLength={12}
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value.slice(0, 12) })}
                  placeholder="Enter name"
                />
              </section>
              <section>
                <label htmlFor="message-input" className="wizard__label">Your Message</label>
                <textarea
                  id="message-input"
                  className="text-area"
                  maxLength={25}
                  value={draft.message}
                  onChange={(e) => updateDraft({ message: e.target.value.slice(0, 25) })}
                  placeholder="Say something..."
                />
                <div className="character-counter">{draft.message.length} / 25</div>
              </section>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="wizard__step">
            <h1 className="wizard__title">{steps[4].title}</h1>
            <p className="wizard__subtitle">Your beautiful note is complete. Share it with someone special!</p>
            <NotePreview note={draft} />
            <div className="wizard__share-buttons">
              <button className="primary-button">📸 Share on Social</button>
              <button className="primary-button">💾 Save Note</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#f5f0ea'
    }}>
      {/* Zone 1: Progress Bar */}
      <div style={{ flexShrink: 0, padding: '16px 24px', borderBottom: '1px solid rgba(200, 153, 90, 0.2)' }}>
        <div className="wizard__progress">
          <p className="wizard__step-label">STEP {currentStep} OF {steps.length}</p>
          <div className="wizard__progress-dots">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`wizard__dot ${idx + 1 <= currentStep ? 'wizard__dot--active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Zone 2: Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '600px' }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zone 3: Button Bar (Fixed) */}
      <div className="wizard__button-bar">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="secondary-button"
          style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className="primary-button"
          style={{ opacity: currentStep === steps.length ? 0.5 : 1 }}
        >
          Next →
        </button>
      </div>

      {/* Credit Footer */}
      <div className="wizard__credit-bar">
        Made with love by Selena Loong | <a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a> | © 2026 Selena Loong. All rights reserved.
      </div>
    </div>
  );
}
