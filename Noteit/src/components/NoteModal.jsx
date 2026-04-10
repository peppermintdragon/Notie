import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard';
import { exportNotePng } from '../utils/exportNotePng';

export default function NoteModal({ note, onClose, onDelete }) {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleExport = async () => {
    if (!note || isExporting) return;

    setIsExporting(true);
    try {
      await exportNotePng(exportRef.current, note.id);
      setExportError('');
    } catch (error) {
      console.error('Modal PNG export failed.', error);
      setExportError(error?.message || 'Could not download PNG right now. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !onDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(note);
    } finally {
      setIsDeleting(false);
    }
  };

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
                <button type="button" className="icon-button" onClick={onClose} aria-label="Close note">
                  ×
                </button>
              </div>

            <div className="modal-card__preview">
              <NoteCard ref={exportRef} note={note} preview />
            </div>

            <div className="modal-card__footer">
              {exportError ? <p className="modal-card__error">{exportError}</p> : null}
              <button
                type="button"
                className="primary-button"
                onClick={handleExport}
                disabled={isExporting}
                >
                  {isExporting ? 'Generating...' : 'Download PNG'}
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Removing...' : 'Remove Note'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
