import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import NoteCard from '../components/NoteCard';
import { supabase } from '../lib/supabase';
import { getDemoNotes, readLocalNotes } from '../utils/localNotes';
import { getSupabaseIssueMessage } from '../utils/supabaseStatus';

function findLocalNote(noteId) {
  const localNotes = readLocalNotes('public');
  return localNotes.find((note) => String(note.id) === String(noteId)) || null;
}

export default function SharedNotePage() {
  const { noteId } = useParams();
  const [note, setNote] = useState(() => findLocalNote(noteId));
  const [status, setStatus] = useState(note ? 'ready' : 'loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadNote() {
      const local = findLocalNote(noteId);
      if (local) {
        setNote(local);
        setStatus('ready');
        return;
      }

      if (!supabase) {
        const demo = getDemoNotes('public').find((entry) => String(entry.id) === String(noteId));
        setNote(demo || null);
        setStatus('ready');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError(getSupabaseIssueMessage(fetchError));
        setStatus('ready');
        return;
      }

      setNote(data || null);
      setStatus('ready');
    }

    loadNote();
    return () => {
      active = false;
    };
  }, [noteId]);

  return (
    <main className="shared-note-page">
      <div className="shared-note-page__inner">
        <p className="shared-note-page__eyebrow">Made with Notie ✦</p>
        <h1>A little note, ready to keep.</h1>
        <p className="shared-note-page__body">
          {error || 'A tiny paper thought from the Notie corkboard.'}
        </p>

        {status === 'loading' ? <div className="shared-note-page__empty">Loading your note...</div> : null}

        {status === 'ready' && note ? (
          <div className="shared-note-page__note">
            <NoteCard preview note={note} interactive={false} />
          </div>
        ) : null}

        {status === 'ready' && !note ? (
          <div className="shared-note-page__empty">This note could not be found, but the board is still waiting for you.</div>
        ) : null}

        <div className="shared-note-page__actions">
          <Link to="/" className="note-maker__button note-maker__button--primary">
            Make your own
          </Link>
          <Link to="/board" className="note-maker__button note-maker__button--ghost">
            Visit the corkboard
          </Link>
        </div>
      </div>
    </main>
  );
}
