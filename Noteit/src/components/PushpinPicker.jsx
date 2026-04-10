import { motion } from 'framer-motion';
import { pushpinOptions } from '../utils/stickers';

export default function PushpinPicker({ value, onChange }) {
  return (
    <section className="control-block">
      <div className="control-block__label">Pushpin</div>
      <div className="swatch-row" aria-label="Pushpin color">
        {pushpinOptions.map((pin) => (
          <motion.button
            key={pin.id}
            type="button"
            className={`pushpin-chip ${value === pin.id ? 'is-active' : ''}`}
            style={pin.id === 'none' ? undefined : {
              '--pin-color': pin.color,
              '--pin-edge': pin.edge,
              '--pin-shadow': pin.shadow,
            }}
            aria-label={`Select ${pin.label} pushpin`}
            onClick={() => onChange(pin.id)}
            whileTap={{ scale: 0.92 }}
          >
            <span className={`pushpin-chip__head ${pin.id === 'none' ? 'is-none' : ''}`} />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
