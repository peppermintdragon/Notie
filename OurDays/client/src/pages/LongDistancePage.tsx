import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Shuffle, MapPin } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { VIRTUAL_DATE_IDEAS } from '@shared/constants/moods';

export default function LongDistancePage() {
  const { socket } = useSocket();
  const [pinging, setPinging] = useState(false);
  const [pingCooldown, setPingCooldown] = useState(false);
  const [dateIdea, setDateIdea] = useState(VIRTUAL_DATE_IDEAS[0]);
  const [recentPings, setRecentPings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/pings/recent')
      .then((res) => setRecentPings(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));

    randomDateIdea();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('ping:received', (data) => {
      toast.success(`${data.senderName} is thinking of you! 💕`, { duration: 5000, icon: '💕' });
      setRecentPings((prev) => [{ id: Date.now(), sender: { name: data.senderName }, createdAt: data.createdAt }, ...prev]);
    });
    return () => { socket.off('ping:received'); };
  }, [socket]);

  const handlePing = async () => {
    if (pingCooldown) return;
    setPinging(true);
    try {
      await api.post('/pings');
      toast.success('Your partner felt that! 💕');
      setPingCooldown(true);
      setTimeout(() => setPingCooldown(false), 10000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send ping');
    } finally {
      setPinging(false);
    }
  };

  const randomDateIdea = () => {
    const random = VIRTUAL_DATE_IDEAS[Math.floor(Math.random() * VIRTUAL_DATE_IDEAS.length)];
    setDateIdea(random);
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Long Distance</h1>

      {/* Thinking of You Ping */}
      <Card className="text-center py-8">
        <motion.button
          onClick={handlePing}
          disabled={pinging || pingCooldown}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className="mx-auto"
        >
          <motion.div
            animate={pinging ? { scale: [1, 1.3, 1] } : pingCooldown ? {} : { scale: [1, 1.05, 1] }}
            transition={pinging ? { duration: 0.5 } : { duration: 2, repeat: Infinity }}
            className={`mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full transition-all ${
              pingCooldown
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'bg-gradient-to-br from-primary-400 to-blush-400 shadow-lg shadow-primary-500/30 cursor-pointer'
            }`}
          >
            <Heart size={48} className={pingCooldown ? 'text-gray-400' : 'text-white'} fill={pingCooldown ? 'currentColor' : 'white'} />
          </motion.div>
        </motion.button>
        <h2 className="text-xl font-bold mb-1">Thinking of You</h2>
        <p className="text-gray-500 text-sm">
          {pingCooldown ? 'Sent! Wait a moment before sending again...' : 'Tap the heart to let your partner know'}
        </p>
      </Card>

      {/* Virtual Date Ideas */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Date Idea</h3>
          <Button variant="ghost" size="sm" onClick={randomDateIdea}>
            <Shuffle size={16} /> Shuffle
          </Button>
        </div>
        <motion.div
          key={dateIdea}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-to-r from-lavender-50 to-blush-50 dark:from-lavender-900/20 dark:to-blush-900/20 p-6 text-center"
        >
          <p className="text-lg font-medium">{dateIdea}</p>
        </motion.div>
      </Card>

      {/* Recent Pings */}
      {recentPings.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-3">Recent Pings</h3>
          <div className="space-y-2">
            {recentPings.slice(0, 10).map((p, i) => (
              <div key={p.id || i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-primary-400" fill="currentColor" />
                  <span>{p.sender?.name || 'Partner'} sent a ping</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
