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
          <span className="brand-mark__text">notie</span>
        </div>
        {subtitle ? <p className="brand-subtitle">{subtitle}</p> : null}
      </div>

      <Link className="pill-link" to={board ? '/' : '/board'}>
        {board ? '✏️ 寫便條' : '📌 看黑板'}
      </Link>
    </motion.header>
  );
}
