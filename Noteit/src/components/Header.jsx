import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Header({ board = false, subtitle }) {
  return (
    <motion.header
      className="notie-shell__header"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="brand-stack">
        <div className="brand-mark">
          <span className="brand-mark__dot" />
          <span className="brand-mark__text">Notie app</span>
        </div>
        {subtitle ? <p className="brand-subtitle">{subtitle}</p> : null}
        <p className="brand-credit">A playful wall by peppermintdragon.</p>
      </div>

      <Link className="pill-link" to={board ? '/' : '/board'}>
        {board ? 'Write Note' : 'View Board'}
      </Link>
    </motion.header>
  );
}
