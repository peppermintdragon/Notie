import { motion } from 'framer-motion';

const stickerOptions = ['🧁', '🍰', '🍒', '🍵', '☕', '🌸', '🍃', '✨', '🐱', '💤'];

export default function StickerTray({ value, onChange }) {
  const toggleSticker = (emoji) => {
    const hasSticker = value.includes(emoji);

    if (hasSticker) {
      onChange(value.filter((item) => item !== emoji));
      return;
    }

    if (value.length >= 3) return;
    onChange([...value, emoji]);
  };

  return (
    <section className="control-block">
      <div className="control-block__label">貼紙</div>
      <div className="sticker-tray" aria-label="Sticker tray">
        {stickerOptions.map((emoji) => {
          const selected = value.includes(emoji);

          return (
            <motion.button
              key={emoji}
              type="button"
              className={`sticker-chip ${selected ? 'is-active' : ''}`}
              onClick={() => toggleSticker(emoji)}
              whileTap={{ scale: 0.92 }}
              animate={selected ? { scale: [0.82, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.28 }}
              aria-label={`Toggle sticker ${emoji}`}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
