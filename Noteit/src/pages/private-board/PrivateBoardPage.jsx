import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { loadPrivateBoardState, savePrivateBoardState } from './privateBoardStorage';

const BASE_NOTE_COLORS = [
  { id: 'yellow', label: 'Butter', fill: '#f7e88d', edge: '#d2b856', shadow: 'rgba(184, 152, 62, 0.22)' },
  { id: 'pink', label: 'Blush', fill: '#f4c8d4', edge: '#cb8ea1', shadow: 'rgba(181, 112, 134, 0.2)' },
  { id: 'green', label: 'Sage', fill: '#d7ebbf', edge: '#9db27b', shadow: 'rgba(117, 145, 88, 0.2)' },
  { id: 'blue', label: 'Sky', fill: '#cfe6f7', edge: '#89aac8', shadow: 'rgba(101, 138, 173, 0.2)' },
];

const BONUS_NOTE_COLORS = [
  { id: 'apricot', label: 'Apricot Glow', fill: '#f5d2b2', edge: '#cd9972', shadow: 'rgba(174, 116, 72, 0.22)' },
  { id: 'lavender', label: 'Moon Lavender', fill: '#ded2f7', edge: '#a795d7', shadow: 'rgba(137, 114, 188, 0.22)' },
];

const UNLOCK_DAY_TARGET = 10;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createNote(seed = 0) {
  return {
    id: `private-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    text: '',
    color: BASE_NOTE_COLORS[seed % BASE_NOTE_COLORS.length].id,
    pinned: false,
    x: clamp(18 + seed * 7 + randomBetween(-6, 10), 10, 68),
    y: clamp(14 + seed * 11 + randomBetween(-4, 8), 8, 72),
    rotation: Number(randomBetween(-4.6, 4.6).toFixed(2)),
    createdAt: new Date().toISOString(),
  };
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getCalendarCells(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: toDateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    };
  });
}

function getColorMeta(colorId) {
  return [...BASE_NOTE_COLORS, ...BONUS_NOTE_COLORS].find((color) => color.id === colorId) || BASE_NOTE_COLORS[0];
}

export default function PrivateBoardPage() {
  const { dateKey } = useParams();
  const navigate = useNavigate();
  const todayKey = toDateKey(new Date());
  const [monthDate, setMonthDate] = useState(() => {
    const base = dateKey ? new Date(`${dateKey}T12:00:00`) : new Date();
    return Number.isNaN(base.getTime()) ? new Date() : new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [privateState, setPrivateState] = useState(() => loadPrivateBoardState());
  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    if (!dateKey) return todayKey;
    const parsed = new Date(`${dateKey}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? todayKey : dateKey;
  });
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const boardRef = useRef(null);
  const dragState = useRef(null);

  useEffect(() => {
    savePrivateBoardState(privateState);
  }, [privateState]);

  useEffect(() => {
    if (!dateKey) return;
    const parsed = new Date(`${dateKey}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    setSelectedDateKey(dateKey);
    setMonthDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }, [dateKey]);

  const notesByDate = privateState.notesByDate;
  const checkinsByDate = privateState.checkinsByDate;
  const calendarCells = useMemo(() => getCalendarCells(monthDate), [monthDate]);
  const dayNotes = notesByDate[selectedDateKey] || [];
  const totalCheckins = Object.values(checkinsByDate).filter(Boolean).length;
  const hasUnlockedSurprise = totalCheckins >= UNLOCK_DAY_TARGET;
  const availableColors = hasUnlockedSurprise ? [...BASE_NOTE_COLORS, ...BONUS_NOTE_COLORS] : BASE_NOTE_COLORS;
  const selectedNote = dayNotes.find((note) => note.id === selectedNoteId) || null;

  useEffect(() => {
    if (!selectedNote && dayNotes.length) {
      setSelectedNoteId(dayNotes[dayNotes.length - 1].id);
    }
    if (!dayNotes.length) {
      setSelectedNoteId(null);
    }
  }, [dayNotes, selectedNote]);

  const updateNotesForDay = (updater) => {
    setPrivateState((current) => {
      const currentNotes = current.notesByDate[selectedDateKey] || [];
      const nextNotes = updater(currentNotes);
      return {
        ...current,
        notesByDate: {
          ...current.notesByDate,
          [selectedDateKey]: nextNotes,
        },
      };
    });
  };

  const handleAddNote = () => {
    const nextNote = createNote(dayNotes.length);
    updateNotesForDay((currentNotes) => [...currentNotes, nextNote]);
    setSelectedNoteId(nextNote.id);
  };

  const handleSelectDate = (nextDateKey) => {
    setSelectedDateKey(nextDateKey);
    navigate(`/private/${nextDateKey}`);
  };

  const handleUpdateNote = (noteId, patch) => {
    updateNotesForDay((currentNotes) =>
      currentNotes.map((note) => (note.id === noteId ? { ...note, ...patch } : note))
    );
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    updateNotesForDay((currentNotes) => currentNotes.filter((note) => note.id !== selectedNote.id));
    setSelectedNoteId(null);
  };

  const toggleCheckin = () => {
    setPrivateState((current) => ({
      ...current,
      checkinsByDate: {
        ...current.checkinsByDate,
        [selectedDateKey]: !current.checkinsByDate[selectedDateKey],
      },
    }));
  };

  const handleNotePointerDown = (event, note) => {
    event.stopPropagation();
    dragState.current = {
      noteId: note.id,
      originRotation: note.rotation || 0,
    };
    setSelectedNoteId(note.id);
  };

  const handleNoteDragEnd = (event, note) => {
    if (!boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const noteRect = event.currentTarget.getBoundingClientRect();
    const nextX = clamp(((noteRect.left - boardRect.left) / boardRect.width) * 100, 8, 72);
    const nextY = clamp(((noteRect.top - boardRect.top) / boardRect.height) * 100, 8, 76);

    handleUpdateNote(note.id, {
      x: Number(nextX.toFixed(2)),
      y: Number(nextY.toFixed(2)),
      rotation: Number((dragState.current?.originRotation ?? note.rotation).toFixed(2)),
    });
    dragState.current = null;
  };

  return (
    <div className="app-bg app-bg--private">
      <main className="notie-shell private-shell">
        <motion.header
          className="private-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="private-header__copy">
            <p className="private-header__eyebrow">Private board</p>
            <h1>My little memory lane.</h1>
            <p>A gentle calendar wall for thoughts you want to keep close.</p>
          </div>

          <div className="private-header__actions">
            <Link className="secondary-button" to="/">
              Public Notie
            </Link>
            <button className="primary-button" type="button" onClick={handleAddNote}>
              + Add note
            </button>
          </div>
        </motion.header>

        <section className="private-corkboard">
          <motion.aside
            className="private-calendar private-pin private-pin--calendar"
            initial={{ opacity: 0, x: -12, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: -2.4 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <span className="private-pin__thumb private-pin__thumb--red" aria-hidden="true" />
            <div className="private-calendar__header">
              <button
                className="icon-button"
                type="button"
                onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                aria-label="Previous month"
              >
                {'<'}
              </button>
              <h2>{getMonthLabel(monthDate)}</h2>
              <button
                className="icon-button"
                type="button"
                onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                aria-label="Next month"
              >
                {'>'}
              </button>
            </div>

            <div className="private-calendar__weekdays">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="private-calendar__grid">
              {calendarCells.map((cell) => {
                const noteCount = (notesByDate[cell.key] || []).length;
                const isChecked = !!checkinsByDate[cell.key];
                const isSelected = cell.key === selectedDateKey;
                const isToday = cell.key === todayKey;

                return (
                  <button
                    key={cell.key}
                    className={`private-day ${cell.inMonth ? '' : 'is-muted'} ${isSelected ? 'is-selected' : ''} ${
                      isToday ? 'is-today' : ''
                    } ${isChecked ? 'is-checked' : ''}`}
                    type="button"
                    onClick={() => handleSelectDate(cell.key)}
                  >
                    <span>{cell.day}</span>
                    {isChecked ? <strong className="private-day__check">+</strong> : null}
                    <span className="private-day__dots">
                      {Array.from({ length: Math.min(noteCount, 3) }, (_, index) => (
                        <i key={`${cell.key}-${index}`} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>

          <motion.div
            className="private-checkin private-pin private-pin--checkin"
            initial={{ opacity: 0, y: 10, rotate: 2.8 }}
            animate={{ opacity: 1, y: 0, rotate: 2.2 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.04 }}
          >
            <span className="private-pin__thumb private-pin__thumb--teal" aria-hidden="true" />
            <div>
              <p className="private-board__eyebrow">Daily check-in</p>
              <h3>{totalCheckins} / {UNLOCK_DAY_TARGET} days</h3>
              <p>Check in gently. After day 10, a tiny hidden palette opens up.</p>
            </div>
            <button
              className={`private-checkin__button ${checkinsByDate[selectedDateKey] ? 'is-active' : ''}`}
              type="button"
              onClick={toggleCheckin}
            >
              {checkinsByDate[selectedDateKey] ? 'Checked in' : 'Check in today'}
            </button>
          </motion.div>

          <motion.section
            className="private-board"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
          >
            <div className="private-board__topbar">
              <div>
                <p className="private-board__eyebrow">Selected day</p>
                <h2>
                  {new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
              </div>
              <div className="private-board__count">{dayNotes.length} notes</div>
            </div>

            <AnimatePresence>
              {hasUnlockedSurprise ? (
                <motion.div
                  className="private-unlock private-pin private-pin--unlock"
                  initial={{ opacity: 0, y: 14, scale: 0.97, rotate: -1.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <span className="private-pin__thumb private-pin__thumb--gold" aria-hidden="true" />
                  <span className="private-unlock__spark">*</span>
                  <div>
                    <p className="private-board__eyebrow">Unlocked</p>
                    <h3>Apricot Glow + Moon Lavender</h3>
                    <p>Your private board just opened a sweeter little palette.</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div ref={boardRef} className="private-board__surface" onClick={() => setSelectedNoteId(null)}>
              {dayNotes.length ? (
                <LayoutGroup>
                  <AnimatePresence mode="popLayout">
                    {dayNotes.map((note, index) => {
                      const color = getColorMeta(note.color);
                      const hoverRotate = note.rotation + (note.rotation >= 0 ? 1.2 : -1.2);

                      return (
                        <motion.button
                          key={note.id}
                          layout
                          type="button"
                          className={`private-note ${selectedNoteId === note.id ? 'is-selected' : ''}`}
                          style={{
                            left: `${note.x}%`,
                            top: `${note.y}%`,
                            rotate: note.rotation,
                            '--private-note-fill': color.fill,
                            '--private-note-edge': color.edge,
                            '--private-note-shadow': color.shadow,
                          }}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={{
                            layout: { type: 'spring', stiffness: 220, damping: 20 },
                            opacity: { duration: 0.22 },
                            scale: { type: 'spring', stiffness: 250, damping: 18, delay: index * 0.03 },
                          }}
                          whileHover={{
                            y: -4,
                            rotate: hoverRotate,
                            boxShadow: '0 26px 34px rgba(100, 72, 45, 0.22)',
                          }}
                          whileTap={{ scale: 0.985 }}
                          drag
                          dragMomentum
                          dragElastic={0.18}
                          dragConstraints={boardRef}
                          dragTransition={{
                            power: 0.18,
                            timeConstant: 260,
                            bounceStiffness: 220,
                            bounceDamping: 16,
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedNoteId(note.id);
                          }}
                          onPointerDown={(event) => handleNotePointerDown(event, note)}
                          onDragEnd={(event) => handleNoteDragEnd(event, note)}
                        >
                          {note.pinned ? <span className="private-note__pin" aria-hidden="true" /> : null}
                          <span className="private-note__text">{note.text || 'A little thought...'}</span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </LayoutGroup>
              ) : (
                <div className="private-board__empty">
                  <span>*</span>
                  <p>No note for this day yet. Start with one little thought.</p>
                </div>
              )}
            </div>

            <div className="private-editor private-pin private-pin--editor">
              <span className="private-pin__thumb private-pin__thumb--green" aria-hidden="true" />
              <div className="private-editor__header">
                <div>
                  <p className="private-board__eyebrow">Editing</p>
                  <h3>{selectedNote ? 'Tune this note' : 'Pick or add a note'}</h3>
                </div>
                {selectedNote ? (
                  <button className="danger-button" type="button" onClick={handleDeleteNote}>
                    Remove
                  </button>
                ) : null}
              </div>

              {selectedNote ? (
                <>
                  <textarea
                    className="private-editor__textarea"
                    value={selectedNote.text}
                    maxLength={240}
                    placeholder="What happened today?"
                    onChange={(event) => handleUpdateNote(selectedNote.id, { text: event.target.value })}
                  />

                  <div className="private-editor__controls">
                    <div className="private-editor__swatches">
                      {availableColors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          className={`private-swatch ${selectedNote.color === color.id ? 'is-active' : ''}`}
                          style={{ '--swatch-fill': color.fill, '--swatch-edge': color.edge }}
                          onClick={() => handleUpdateNote(selectedNote.id, { color: color.id })}
                          aria-label={`Choose ${color.label}`}
                        />
                      ))}
                    </div>

                    <label className="private-editor__pin-toggle">
                      <input
                        type="checkbox"
                        checked={selectedNote.pinned}
                        onChange={(event) => handleUpdateNote(selectedNote.id, { pinned: event.target.checked })}
                      />
                      Pin this one
                    </label>
                  </div>
                </>
              ) : (
                <p className="private-editor__empty">Tap a note to edit it, or add a fresh one for today.</p>
              )}
            </div>
          </motion.section>
        </section>
      </main>
    </div>
  );
}
