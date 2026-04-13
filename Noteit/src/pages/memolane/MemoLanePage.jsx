import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MemoLanePage() {
  return (
    <div className="app-bg app-bg--private">
      <main className="notie-shell private-shell">
        <motion.section
          className="private-placeholder"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <p className="private-header__eyebrow">MemoLane</p>
          <h1>Event board is getting its own lane.</h1>
          <p>
            We opened the folder and route for it already. Next pass, we can shape it into the public-facing event
            memory wall without disturbing your current Notie flow.
          </p>
          <div className="private-header__actions">
            <Link className="secondary-button" to="/private">
              Open Private Board
            </Link>
            <Link className="primary-button" to="/">
              Back to Notie
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
