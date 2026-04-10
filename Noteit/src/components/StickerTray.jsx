import { motion } from 'framer-motion';
import { stickerOptions } from '../utils/stickers';

export default function StickerTray({ value, onToggle }) {
  return (
    <section className="control-block">
      <div className="control-block__label">Stickers</div>
      <div className="sticker-tray" aria-label="Sticker tray">
        {stickerOptions.map((sticker) => {
          const selected = value.some((item) => item.stickerId === sticker.id);

          return (
            <motion.button
              key={sticker.id}
              type="button"
              className={`sticker-chip ${selected ? 'is-active' : ''}`}
              onClick={() => onToggle(sticker.id)}
              whileTap={{ scale: 0.92 }}
              animate={selected ? { scale: [0.82, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.28 }}
              aria-label={`Toggle ${sticker.label}`}
            >
              <img src={sticker.src} alt="" className="sticker-chip__image" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
