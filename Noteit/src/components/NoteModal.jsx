import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard';
import { exportNotePng } from '../utils/exportNotePng';

export default function NoteModal({ note, onClose }) {
  const exportRef = useRef(null);

  return (
    <AnimatePresence>
      {note ? (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-shell"
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="modal-card">
              <div className="modal-card__actions">
                <button type="button" className="icon-button" onClick={onClose} aria-label="Close note modal">
                  ✕
                </button>
              </div>

              <div className="modal-card__preview" ref={exportRef}>
                <NoteCard note={note} preview />
              </div>

              <div className="modal-card__footer">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => exportNotePng(exportRef.current, note.id)}
                >
                  ⬇️ Download PNG
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
