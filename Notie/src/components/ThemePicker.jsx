import { motion } from 'framer-motion';
import { colorThemes } from '../utils/colorThemes';

export default function ThemePicker({ value, onChange }) {
  return (
    <section className="control-block">
      <div className="control-block__label">純色</div>
      <div className="swatch-row" aria-label="Theme picker">
        {colorThemes.map((theme) => (
          <motion.button
            key={theme.id}
            type="button"
            className={`swatch ${value === theme.id ? 'is-active' : ''}`}
            style={{ '--swatch-color': theme.surface, '--swatch-border': theme.border }}
            aria-label={`Select ${theme.label}`}
            onClick={() => onChange(theme.id)}
            whileTap={{ scale: 0.94 }}
          />
        ))}
      </div>
    </section>
  );
}
