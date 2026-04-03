import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/contexts/SocketContext';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { EMOTION_ICONS } from '@shared/constants/moods';
import type { DailyNoteItem } from '@shared/types/api';
import { NoteStatus } from '@shared/types/enums';

export default function DailyNotesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notes, setNotes] = useState<DailyNoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>(EMOTION_ICONS[0].key);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    Promise.all([
      api.get('/notes?pageSize=100'),
      api.get('/notes/streak'),
    ]).then(([notesRes, streakRes]) => {
      setNotes((notesRes.data.data || []).reverse());
      setStreak(streakRes.data.data?.streak || 0);
    }).catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('note:received', (note) => {
      setNotes((prev) => [...prev, note]);
      scrollToBottom();
    });

    socket.on('note:partner-typing', (data) => {
      setIsPartnerTyping(data.isTyping);
    });

    socket.on('note:read-receipt', (data) => {
      setNotes((prev) =>
        prev.map((n) => n.id === data.noteId ? { ...n, status: NoteStatus.READ, readAt: data.readAt } : n)
      );
    });

    return () => {
      socket.off('note:received');
      socket.off('note:partner-typing');
      socket.off('note:read-receipt');
    };
  }, [socket]);

  useEffect(() => { scrollToBottom(); }, [notes.length]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleTyping = () => {
    socket?.emit('note:typing', { isTyping: true });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('note:typing', { isTyping: false });
    }, 2000);
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/notes', { content, emotionIcon: selectedEmotion });
      setNotes((prev) => [...prev, res.data.data]);
      setContent('');
      socket?.emit('note:send', { content, emotionIcon: selectedEmotion });
      scrollToBottom();
    } catch {
      toast.error('Failed to send note');
    } finally {
      setSending(false);
    }
  };

  // Mark partner notes as read
  useEffect(() => {
    const unread = notes.filter((n) => n.author.id !== user?.id && n.status === 'SENT');
    unread.forEach((n) => {
      api.put(`/notes/${n.id}/read`).catch(() => {});
      socket?.emit('note:read', { noteId: n.id });
    });
  }, [notes, user?.id, socket]);

  const currentEmoji = EMOTION_ICONS.find((e) => e.key === selectedEmotion)?.emoji || '😊';

  if (isLoading) return <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold">Daily Notes</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <Flame size={16} /> {streak} day streak
          </div>
        )}
      </div>

      {/* Notes area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pb-4">
        {notes.length === 0 ? (
          <EmptyState icon="💌" title="No notes yet" description="Write your first note to your partner!" />
        ) : (
          notes.map((note) => {
            const isMine = note.author.id === user?.id;
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[80%] ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar src={note.author.profilePhoto} name={note.author.name} size="sm" />
                  <div className={`rounded-2xl px-4 py-3 ${
                    isMine
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className={`flex items-center gap-1.5 mt-1 text-xs ${isMine ? 'text-white/70 justify-end' : 'text-gray-400'}`}>
                      <span>{note.emotionIcon}</span>
                      <span>{new Date(note.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && (
                        <span>{note.status === 'READ' ? '✓✓' : '✓'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {isPartnerTyping && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
            </div>
            typing...
          </div>
        )}
      </div>

      {/* Emotion picker */}
      <AnimatePresence>
        {showEmotionPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 grid grid-cols-8 gap-2 rounded-2xl border bg-white p-3 shadow-lg dark:bg-gray-900 dark:border-gray-700"
          >
            {EMOTION_ICONS.map((e) => (
              <button
                key={e.key}
                onClick={() => { setSelectedEmotion(e.key); setShowEmotionPicker(false); }}
                className={`flex flex-col items-center gap-0.5 rounded-xl p-2 text-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedEmotion === e.key ? 'bg-primary-50 ring-2 ring-primary-300 dark:bg-primary-900/30' : ''
                }`}
              >
                <span className="text-xl">{e.emoji}</span>
                <span className="text-[10px] text-gray-500">{e.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2 pt-2 border-t dark:border-gray-800">
        <button
          onClick={() => setShowEmotionPicker(!showEmotionPicker)}
          className="flex-shrink-0 rounded-full p-2.5 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {currentEmoji}
        </button>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); handleTyping(); }}
            placeholder="Write a note to your partner..."
            className="input-field min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="flex-shrink-0 rounded-full bg-primary-500 p-2.5 text-white transition-all hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
