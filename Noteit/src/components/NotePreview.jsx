import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard';

export default function NotePreview({ note, exportRef, pulse }) {
  const animationKey = `${note.designId}-${note.themeId}`;

  return (
    <section className="preview-block">
      <div className="control-block__label">預覽</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          className="preview-stage"
          ref={exportRef}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={pulse ? { opacity: 1, scale: [1, 1.04, 1], y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <NoteCard
            preview
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
