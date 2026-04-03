import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Camera, PenLine, Calendar, Smile, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import type { DashboardData } from '@shared/types/api';
import { MOOD_CONFIG } from '@shared/types/enums';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const quickActions = [
    { icon: Camera, label: 'Add Memory', to: '/memories', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
    { icon: PenLine, label: 'Write Note', to: '/notes', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { icon: Calendar, label: 'Add Date', to: '/dates', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { icon: Smile, label: 'Set Mood', to: '/mood', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { icon: Heart, label: 'Ping Partner', to: '/long-distance', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { icon: MapPin, label: 'Bucket List', to: '/bucket-list', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero — Day Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary-500 via-blush-500 to-lavender-500 text-white border-0">
          <div className="text-center py-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-3"
            >
              <Heart size={40} fill="white" className="mx-auto opacity-90" />
            </motion.div>
            <p className="text-white/80 text-sm font-medium mb-1">Together for</p>
            <h2 className="text-5xl font-display font-extrabold">
              {data?.daysTogether || 0}
            </h2>
            <p className="text-white/80 text-lg mt-1">days</p>
            {data?.noteStreak && data.noteStreak > 0 && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm">
                🔥 {data.noteStreak} day note streak!
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Mood status */}
      {(data?.myMoodToday || data?.partnerMoodToday) && (
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {data.myMoodToday ? MOOD_CONFIG[data.myMoodToday]?.emoji : '❓'}
              </span>
              <div>
                <p className="text-xs text-gray-500">Your mood</p>
                <p className="font-medium text-sm">
                  {data.myMoodToday ? MOOD_CONFIG[data.myMoodToday]?.label : 'Not set'}
                </p>
              </div>
            </div>
            <Heart size={20} className="text-primary-300" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Partner's mood</p>
                <p className="font-medium text-sm">
                  {data.partnerMoodToday ? MOOD_CONFIG[data.partnerMoodToday]?.label : 'Not set yet'}
                </p>
              </div>
              <span className="text-2xl">
                {data.partnerMoodToday ? MOOD_CONFIG[data.partnerMoodToday]?.emoji : '❓'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {quickActions.map(({ icon: Icon, label, to, color }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${color}`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Daily Question */}
      {data?.dailyQuestion && (
        <Card>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💭</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Today's Question</h3>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {data.dailyQuestion}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Dates */}
      {data?.upcomingDates && data.upcomingDates.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Upcoming</h3>
          <div className="space-y-2">
            {data.upcomingDates.map((d) => (
              <Card key={d.id} padding="sm" hover onClick={() => navigate('/dates')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {d.type === 'BIRTHDAY' ? '🎂' : d.type === 'ANNIVERSARY' ? '💕' : '📅'}
                    </span>
                    <span className="font-medium">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary-500">
                      {d.daysUntil === 0 ? 'Today!' : `${d.daysUntil} days`}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* On This Day */}
      {data?.onThisDay && data.onThisDay.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            On This Day
          </h3>
          <div className="space-y-2">
            {data.onThisDay.map((m: any) => (
              <Card key={m.id} padding="sm" hover onClick={() => navigate(`/memories/${m.id}`)}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <div>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(m.date).getFullYear()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Welcome message for new users */}
      {!data?.daysTogether && (
        <Card className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">Welcome to TwoGether!</h3>
          <p className="text-gray-500 mb-4">
            Start by adding your first memory, sending a note, or setting your mood for the day.
          </p>
        </Card>
      )}
    </div>
  );
}
