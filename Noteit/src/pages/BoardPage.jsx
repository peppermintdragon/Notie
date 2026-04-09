import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { supabase } from '../lib/supabase';
import { useRealtimeNotes } from '../hooks/useRealtimeNotes';

function mergeById(notes, incoming) {
  const items = Array.isArray(incoming) ? incoming : [incoming];
  const map = new Map(notes.map((note) => [note.id, note]));

  items.forEach((note) => {
    map.set(note.id, note);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export default function BoardPage() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const boardRef = useRef(null);
  const dragState = useRef({ active: false, startX: 0, startY: 0, left: 0, top: 0 });

  useEffect(() => {
    async function loadNotes() {
      if (!supabase) {
        setError('Supabase is not configured yet.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setNotes(data || []);
      }

      setLoading(false);
    }

    loadNotes();
  }, []);

  useRealtimeNotes((newNote) => {
    setNotes((current) => mergeById(current, newNote));
  });

  const handlePointerDown = (event) => {
    if (!boardRef.current) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      left: boardRef.current.scrollLeft,
      top: boardRef.current.scrollTop,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragState.current.active || !boardRef.current) return;

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;
    boardRef.current.scrollLeft = dragState.current.left - deltaX;
    boardRef.current.scrollTop = dragState.current.top - deltaY;
  };

  const stopDragging = () => {
    dragState.current.active = false;
  };

  return (
    <div className="app-bg app-bg--board">
      <main className="notie-shell notie-shell--board">
        <Header board subtitle="a cozy shared corkboard with soft springy notes and instant realtime updates." />

        <motion.section
          className="board-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {error ? <p className="form-error">{error}</p> : null}
          {loading ? <div className="board-status">Loading board...</div> : null}

          <div
            ref={boardRef}
            className="board-scroll"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerLeave={stopDragging}
          >
            <div className="board-surface">
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  className="board-note"
                  style={{ left: `${note.pos_x}%`, top: `${note.pos_y}%` }}
                  initial={{ opacity: 0, scale: 0.82, y: 26 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 210,
                    damping: 18,
                    delay: index * 0.02,
                  }}
                >
                  <NoteCard
                    note={note}
                    board
                    interactive
                    onClick={() => setSelectedNote(note)}
                  />
                </motion.div>
              ))}

              {!loading && !notes.length ? (
                <div className="board-status board-status--empty">
                  No notes yet. Post the first one from the write page.
                </div>
              ) : null}
            </div>
          </div>
        </motion.section>
      </main>

      <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} />
    </div>
  );
}
