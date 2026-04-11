import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { supabase } from '../lib/supabase';
import { useRealtimeNotes } from '../hooks/useRealtimeNotes';
import { getBoardNotesWithFallback, removeLocalNote, updateLocalNote } from '../utils/localNotes';
import { getSupabaseIssueMessage } from '../utils/supabaseStatus';
import { deserializeStickerEntries, getPushpinColor } from '../utils/stickers';
import {
  generateBoardLayout,
  getBoardHeight,
  getBoardWidth,
} from '../utils/boardPlacement';

const BOARD_OVERRIDES_KEY = 'notie-board-overrides';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeNote(note) {
  return {
    ...note,
    name: note.name?.trim() || 'Anonymous',
    pin_color: note.pin_color || getPushpinColor(note.stickers || note.dropped_stickers),
    stickers: deserializeStickerEntries(note.stickers || note.dropped_stickers),
  };
}

function mergeById(notes, incoming) {
  const items = (Array.isArray(incoming) ? incoming : [incoming]).filter(Boolean);
  const map = new Map(notes.map((note) => [note.id, note]));

  items.forEach((note) => {
    map.set(note.id, {
      ...map.get(note.id),
      ...normalizeNote(note),
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isUuid(value) {
  return UUID_PATTERN.test(String(value || ''));
}

function readBoardOverrides() {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(BOARD_OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeBoardOverrides(overrides) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BOARD_OVERRIDES_KEY, JSON.stringify(overrides));
}

export default function BoardPage() {
  const [notes, setNotes] = useState(() => getBoardNotesWithFallback().map(normalizeNote));
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(supabase ? 'cloud' : 'local');
  const [liftedNotes, setLiftedNotes] = useState({});
  const [noteOverrides, setNoteOverrides] = useState(() => readBoardOverrides());
  const [draggingNoteId, setDraggingNoteId] = useState(null);
  const [viewport, setViewport] = useState({ left: 0, right: 1400, width: 1024 });
  const boardRef = useRef(null);
  const surfaceRef = useRef(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const noteDragState = useRef(null);
  const scrollTimer = useRef(null);

  useEffect(() => {
    writeBoardOverrides(noteOverrides);
  }, [noteOverrides]);

  useEffect(() => {
    async function loadNotes() {
      if (!supabase) {
        setError('Supabase is not ready yet, so the board is showing local notes.');
        setStatus('local');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Supabase error:', fetchError.message);
        setError(getSupabaseIssueMessage(fetchError));
        setNotes(getBoardNotesWithFallback().map(normalizeNote));
        setStatus('local');
      } else {
        setNotes((data || []).map(normalizeNote));
        setStatus('cloud');
      }

      setLoading(false);
    }

    loadNotes();
  }, []);

  const boardWidth = useMemo(() => getBoardWidth(notes.length || 1), [notes.length]);
  const boardHeight = useMemo(() => getBoardHeight(), []);

  const layouts = useMemo(() => {
    const total = notes.length || 1;
    const baseLayouts = Object.fromEntries(
      notes.map((note, index) => [
        note.id,
        generateBoardLayout(note, index, total, boardWidth, boardHeight),
      ])
    );

    return Object.fromEntries(
      Object.entries(baseLayouts).map(([noteId, layout]) => [
        noteId,
        {
          ...layout,
          ...(noteOverrides[noteId] || {}),
        },
      ])
    );
  }, [boardHeight, boardWidth, noteOverrides, notes]);

  const syncViewport = useCallback(() => {
    if (!boardRef.current) return;

    const nextLeft = boardRef.current.scrollLeft;
    const nextWidth = boardRef.current.clientWidth || window.innerWidth;
    setViewport({
      left: nextLeft,
      right: nextLeft + nextWidth,
      width: nextWidth,
    });
  }, []);

  useEffect(() => {
    syncViewport();

    const handleResize = () => syncViewport();
    window.addEventListener('resize', handleResize);

    const boardNode = boardRef.current;
    const handleWheelScroll = (event) => {
      if (!boardNode) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      boardNode.scrollLeft += event.deltaY;
      syncViewport();
    };

    boardNode?.addEventListener('wheel', handleWheelScroll, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      boardNode?.removeEventListener('wheel', handleWheelScroll);
      if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    };
  }, [syncViewport]);

  useRealtimeNotes((incomingNote, eventType) => {
    const nextNote = normalizeNote(incomingNote);
    setNotes((current) => mergeById(current, nextNote));

    if (eventType === 'UPDATE') {
      setNoteOverrides((current) => ({
        ...current,
        [nextNote.id]: {
          ...(current[nextNote.id] || {}),
          x: typeof nextNote.pos_x === 'number' ? (nextNote.pos_x / 100) * boardWidth : current[nextNote.id]?.x,
          y: typeof nextNote.pos_y === 'number' ? (nextNote.pos_y / 100) * boardHeight : current[nextNote.id]?.y,
          rotation: typeof nextNote.rotation === 'number' ? nextNote.rotation : current[nextNote.id]?.rotation,
        },
      }));
    }
  }, status === 'cloud');

  const handleBoardPointerDown = (event) => {
    if (!boardRef.current || noteDragState.current) return;
    if (event.target !== event.currentTarget && !String(event.target.className).includes('board-surface')) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: boardRef.current.scrollLeft,
    };
  };

  const handleBoardPointerMove = (event) => {
    if (!dragState.current.active || !boardRef.current) return;

    const deltaX = event.clientX - dragState.current.startX;
    boardRef.current.scrollLeft = dragState.current.scrollLeft - deltaX;
    syncViewport();
  };

  const stopBoardDragging = () => {
    dragState.current.active = false;
  };

  const handleScroll = () => {
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(syncViewport, 50);
  };

  const bringNoteToFront = (noteId) => {
    const highest = Math.max(
      50,
      ...Object.values(liftedNotes),
      ...notes.map((item) => layouts[item.id]?.zIndex ?? 10)
    );

    setLiftedNotes((current) => ({
      ...current,
      [noteId]: highest + 1,
    }));

    return highest + 1;
  };

  const persistNotePlacement = async (noteId, layout) => {
    const patch = {
      pos_x: Number(((layout.x / boardWidth) * 100).toFixed(2)),
      pos_y: Number(((layout.y / boardHeight) * 100).toFixed(2)),
      rotation: Number(layout.rotation.toFixed(2)),
    };

    setNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, ...patch } : note))
    );

    if (status === 'cloud' && supabase && isUuid(noteId)) {
      const { error: updateError } = await supabase.from('notes').update(patch).eq('id', noteId);
      if (updateError) {
        console.error('Supabase error:', updateError.message);
        setError(getSupabaseIssueMessage(updateError));
      }
    } else {
      updateLocalNote(noteId, patch);
    }
  };

  const handleNotePointerDown = (event, note) => {
    event.stopPropagation();
    event.preventDefault();

    if (!surfaceRef.current) return;

    const layout = layouts[note.id];
    if (!layout) return;

    const nextZIndex = bringNoteToFront(note.id);

    noteDragState.current = {
      noteId: note.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: layout.x,
      originY: layout.y,
      moved: false,
    };

    setDraggingNoteId(note.id);
    setNoteOverrides((current) => ({
      ...current,
      [note.id]: {
        ...current[note.id],
        x: layout.x,
        y: layout.y,
        rotation: layout.rotation,
        scale: layout.scale,
        zIndex: nextZIndex,
      },
    }));

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleNotePointerMove = (event) => {
    const dragSnapshot = noteDragState.current;
    if (!dragSnapshot) return;

    const deltaX = event.clientX - dragSnapshot.startX;
    const deltaY = event.clientY - dragSnapshot.startY;
    const moved = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;

    if (moved) {
      dragSnapshot.moved = true;
    }

    const nextX = clamp(dragSnapshot.originX + deltaX, 18, boardWidth - 280);
    const nextY = clamp(dragSnapshot.originY + deltaY, 18, boardHeight - 280);
    const { noteId } = dragSnapshot;

    setNoteOverrides((current) => ({
      ...current,
      [noteId]: {
        ...current[noteId],
        x: nextX,
        y: nextY,
      },
    }));
  };

  const handleNotePointerUp = async (note) => {
    if (!noteDragState.current) return;

    const wasMoved = noteDragState.current.moved;
    const noteId = noteDragState.current.noteId;
    noteDragState.current = null;
    setDraggingNoteId(null);

    if (!wasMoved) {
      setSelectedNote(note);
      return;
    }

    const layout = noteOverrides[noteId] || layouts[noteId];
    if (!layout) return;
    await persistNotePlacement(noteId, layout);
  };

  const handleDeleteNote = async (note) => {
    setSelectedNote(null);
    setNotes((current) => current.filter((item) => item.id !== note.id));
    setNoteOverrides((current) => {
      const next = { ...current };
      delete next[note.id];
      return next;
    });

    if (status === 'cloud' && supabase && isUuid(note.id)) {
      const { error: deleteError } = await supabase.from('notes').delete().eq('id', note.id);
      if (deleteError) {
        console.error('Supabase error:', deleteError.message);
        setError(getSupabaseIssueMessage(deleteError));
      }
    } else {
      removeLocalNote(note.id);
    }
  };

  const visibleNotes = useMemo(() => {
    const buffer = viewport.width || 640;
    return notes.filter((note) => {
      const layout = layouts[note.id];
      if (!layout) return false;
      return layout.x > viewport.left - buffer && layout.x < viewport.right + buffer;
    });
  }, [layouts, notes, viewport]);

  return (
    <div className="app-bg app-bg--board">
      <main className="notie-shell notie-shell--board">
        <Header board subtitle="Pick a paper, add a few stickers, and pin it to the board." />

        <motion.section
          className="board-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="board-toolbar">
            <div className="board-brand">
              <span className="board-brand__dot" />
              <span className="board-brand__text">corkboard</span>
            </div>
            <div className={`board-badge ${status === 'cloud' ? 'is-cloud' : 'is-local'}`}>
              {status === 'cloud' ? 'Live board' : 'Local board'}
            </div>
          </div>

          <div className="board-scroll-hint">&larr; Drag left and right to explore &rarr;</div>
          {error ? <p className="board-alert">{error}</p> : null}
          {loading ? <div className="board-status">Loading board...</div> : null}

          <div
            ref={boardRef}
            className="board-scroll"
            onScroll={handleScroll}
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={stopBoardDragging}
            onPointerLeave={stopBoardDragging}
          >
            <div
              ref={surfaceRef}
              className="board-surface"
              style={{
                width: `${boardWidth}px`,
                minHeight: `${boardHeight}px`,
                height: `${boardHeight}px`,
              }}
            >
              {visibleNotes.map((note, index) => {
                const layout = layouts[note.id];
                if (!layout) return null;

                return (
                  <motion.div
                    key={note.id}
                    className={`board-note ${draggingNoteId === note.id ? 'is-dragging' : ''}`}
                    style={{
                      left: `${layout.x}px`,
                      top: `${layout.y}px`,
                      '--board-tilt': `${layout.rotation}deg`,
                      '--board-scale': layout.scale,
                      zIndex: liftedNotes[note.id] ?? layout.zIndex,
                    }}
                    initial={{ opacity: 0, scale: 0.82, y: 26 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 210,
                      damping: 18,
                      delay: index * 0.03,
                    }}
                    onPointerDown={(event) => handleNotePointerDown(event, note)}
                    onPointerMove={handleNotePointerMove}
                    onPointerUp={() => handleNotePointerUp(note)}
                    onPointerCancel={() => handleNotePointerUp(note)}
                  >
                    <NoteCard note={note} board interactive />
                  </motion.div>
                );
              })}

              {!loading && !notes.length ? (
                <div className="board-status board-status--empty">
                  No notes yet. Be the first to pin one.
                </div>
              ) : null}
            </div>
          </div>
        </motion.section>
      </main>

      <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} onDelete={handleDeleteNote} />
    </div>
  );
}
