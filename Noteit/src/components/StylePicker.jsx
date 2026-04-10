import { motion } from 'framer-motion';
import { noteDesigns } from '../utils/noteDesigns';

export default function StylePicker({ value, onChange }) {
  return (
    <section className="control-block">
      <div className="control-block__label">Note Shape</div>
      <div className="style-picker" aria-label="Note shape">
        {noteDesigns.map((design) => (
          <motion.button
            key={design.id}
            type="button"
            className={`style-chip ${value === design.id ? 'is-active' : ''}`}
            onClick={() => onChange(design.id)}
            whileTap={{ scale: 0.97 }}
          >
            <span
              className={`style-chip__mini ${design.isBlank ? 'is-blank' : ''}`}
              style={design.asset ? { backgroundImage: `url("${design.asset}")` } : undefined}
            />
            <span>{design.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
