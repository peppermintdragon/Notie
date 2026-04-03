import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { MOOD_CONFIG, MoodType } from '@shared/types/enums';

export default function MoodPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [myMood, setMyMood] = useState<MoodType | null>(null);
  const [partnerMood, setPartnerMood] = useState<MoodType | null>(null);
  const [isMatch, setIsMatch] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    Promise.all([
      api.get('/mood/today'),
      api.get(`/mood/calendar?month=${month}`),
      api.get('/mood/insights'),
    ]).then(([todayRes, calRes, insightsRes]) => {
      setMyMood(todayRes.data.data?.myMood || null);
      setPartnerMood(todayRes.data.data?.partnerMood || null);
      setIsMatch(todayRes.data.data?.isMatch || false);
      setCalendar(calRes.data.data || []);
      setInsights(insightsRes.data.data || null);
    }).catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('mood:partner-updated', (data) => {
      setPartnerMood(data.mood as MoodType);
    });

    socket.on('mood:match', (data) => {
      setIsMatch(true);
      setShowMatch(true);
      confetti({ particleCount: 100, spread: 70 });
      setTimeout(() => setShowMatch(false), 4000);
    });

    return () => {
      socket.off('mood:partner-updated');
      socket.off('mood:match');
    };
  }, [socket]);

  const handleSetMood = async (mood: MoodType) => {
    try {
      const res = await api.post('/mood', { mood });
      setMyMood(mood);
      if (res.data.data?.isMatch) {
        setIsMatch(true);
        setShowMatch(true);
        confetti({ particleCount: 100, spread: 70 });
        setTimeout(() => setShowMatch(false), 4000);
      }
      if (res.data.data?.partnerMood) {
        setPartnerMood(res.data.data.partnerMood);
      }
      socket?.emit('mood:set', { mood });
      toast.success(`Mood set to ${MOOD_CONFIG[mood].label}!`);
    } catch {
      toast.error('Failed to set mood');
    }
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Mood Sync</h1>

      {/* Mood Match Celebration */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMatch(false)}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-center"
            >
              <p className="text-7xl mb-4">{myMood ? MOOD_CONFIG[myMood].emoji : '💕'}</p>
              <h2 className="text-3xl font-bold text-white mb-2">Mood Match!</h2>
              <p className="text-white/80 text-lg">You're both feeling the same way!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current mood display */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-sm text-gray-500 mb-2">Your Mood</p>
            <p className="text-4xl mb-1">{myMood ? MOOD_CONFIG[myMood].emoji : '❓'}</p>
            <p className="font-medium">{myMood ? MOOD_CONFIG[myMood].label : 'Not set'}</p>
          </div>
          <div className="flex-shrink-0 text-3xl">
            {isMatch ? '💕' : '♡'}
          </div>
          <div className="text-center flex-1">
            <p className="text-sm text-gray-500 mb-2">Partner's Mood</p>
            <p className="text-4xl mb-1">{partnerMood ? MOOD_CONFIG[partnerMood].emoji : '❓'}</p>
            <p className="font-medium">{partnerMood ? MOOD_CONFIG[partnerMood].label : 'Not set yet'}</p>
          </div>
        </div>
      </Card>

      {/* Mood Picker */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(MOOD_CONFIG).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSetMood(key as MoodType)}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all border-2 ${
                myMood === key
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-3xl">{config.emoji}</span>
              <span className="text-xs font-medium">{config.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Mood Insights */}
      {insights && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Mood Insights (Last 30 Days)</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-500">{insights.matchRate}%</p>
              <p className="text-xs text-gray-500">Match Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{insights.matchDays || 0}</p>
              <p className="text-xs text-gray-500">Mood Matches</p>
            </div>
            <div>
              <p className="text-3xl">{insights.mostCommonMood ? MOOD_CONFIG[insights.mostCommonMood as MoodType]?.emoji : '—'}</p>
              <p className="text-xs text-gray-500">Most Common</p>
            </div>
          </div>
        </Card>
      )}

      {/* Mood Calendar */}
      {calendar.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">This Month</h3>
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
            {calendar.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 py-1">
                <span className="text-xs text-gray-500">{new Date(day.date).getDate()}</span>
                <div className="flex gap-0.5">
                  {day.myMood && (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: MOOD_CONFIG[day.myMood as MoodType]?.color }}
                      title={`You: ${day.myMood}`}
                    />
                  )}
                  {day.partnerMood && (
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: MOOD_CONFIG[day.partnerMood as MoodType]?.color }}
                      title={`Partner: ${day.partnerMood}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
