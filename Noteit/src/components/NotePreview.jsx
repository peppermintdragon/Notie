import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard';

export default function NotePreview({ note, exportRef, pulse, editable = false, onStickerMove, onStickerDrop }) {
  const animationKey = `${note.designId}-${note.themeId}-${note.pinColor}`;

  return (
    <section className="preview-block">
      <div className="control-block__label">Preview</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          className="preview-stage"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={pulse ? { opacity: 1, scale: [1, 1.03, 0.995, 1], y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <NoteCard
            ref={exportRef}
            preview
            editable={editable}
            onStickerMove={onStickerMove}
            onStickerDrop={onStickerDrop}
            note={{
              ...note,
              id: 'preview',
              theme_id: note.themeId,
              design_id: note.designId,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
