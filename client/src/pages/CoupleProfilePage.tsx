import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Camera, Calendar, PenLine, Smile, ListChecks, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';

interface CoupleStats {
  daysTogether: number;
  memoriesCount: number;
  notesCount: number;
  moodMatchCount: number;
  bucketCompleted: number;
  totalBucket: number;
}

interface CoupleData {
  id: string;
  coupleNickname?: string;
  coverPhoto?: string;
  themeColor: string;
  relationshipStartDate?: string;
  howWeMet?: string;
  members: Array<{ id: string; name: string; nickname?: string; profilePhoto?: string; loveLanguage?: string; birthday?: string }>;
}

const LOVE_LANGUAGE_LABELS: Record<string, string> = {
  WORDS_OF_AFFIRMATION: '💬 Words of Affirmation',
  ACTS_OF_SERVICE: '🤝 Acts of Service',
  RECEIVING_GIFTS: '🎁 Receiving Gifts',
  QUALITY_TIME: '⏰ Quality Time',
  PHYSICAL_TOUCH: '🤗 Physical Touch',
};

export default function CoupleProfilePage() {
  const { user } = useAuth();
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [stats, setStats] = useState<CoupleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/couple'),
      api.get('/couple/stats'),
    ]).then(([coupleRes, statsRes]) => {
      setCouple(coupleRes.data.data);
      setStats(statsRes.data.data);
    }).catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  if (!couple || !stats) return <div className="text-center py-20 text-gray-500">Unable to load profile</div>;

  const statItems = [
    { icon: Calendar, label: 'Days Together', value: stats.daysTogether, color: 'text-pink-500' },
    { icon: Camera, label: 'Memories', value: stats.memoriesCount, color: 'text-purple-500' },
    { icon: PenLine, label: 'Notes Exchanged', value: stats.notesCount, color: 'text-blue-500' },
    { icon: Smile, label: 'Mood Matches', value: stats.moodMatchCount, color: 'text-yellow-500' },
    { icon: ListChecks, label: 'Bucket List Done', value: `${stats.bucketCompleted}/${stats.totalBucket}`, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Cover + couple info */}
      <Card className="overflow-hidden p-0">
        <div
          className="h-40 bg-gradient-to-br from-primary-400 to-lavender-400"
          style={couple.coverPhoto ? { backgroundImage: `url(${couple.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end gap-4">
            <div className="flex -space-x-4">
              {couple.members.map((m) => (
                <Avatar key={m.id} src={m.profilePhoto} name={m.name} size="xl" className="ring-4 ring-white dark:ring-gray-900" />
              ))}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-display font-bold">
                {couple.coupleNickname || couple.members.map((m) => m.name).join(' & ')}
              </h1>
              {couple.howWeMet && (
                <p className="text-sm text-gray-500 mt-1">Met: {couple.howWeMet}</p>
              )}
              {couple.relationshipStartDate && (
                <p className="text-sm text-gray-500">
                  Together since {new Date(couple.relationshipStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statItems.map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} whileHover={{ y: -2 }}>
            <Card className="text-center" padding="sm">
              <Icon size={24} className={`mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Partner profiles side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {couple.members.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={m.profilePhoto} name={m.name} size="lg" />
              <div>
                <h3 className="font-semibold text-lg">{m.name}</h3>
                {m.nickname && <p className="text-sm text-gray-500">"{m.nickname}"</p>}
              </div>
              {m.id === user?.id && (
                <span className="ml-auto text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full dark:bg-primary-900/30 dark:text-primary-400">You</span>
              )}
            </div>
            {m.loveLanguage && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Love Language</p>
                <p className="font-medium">{LOVE_LANGUAGE_LABELS[m.loveLanguage] || m.loveLanguage}</p>
              </div>
            )}
            {m.birthday && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Birthday</p>
                <p className="font-medium">{new Date(m.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
