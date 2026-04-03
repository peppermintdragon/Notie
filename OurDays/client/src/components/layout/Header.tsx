import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/contexts/SocketContext';
import Avatar from '../ui/Avatar';
import ThemeToggle from '../settings/ThemeToggle';
import api from '@/services/api';

export default function Header() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setUnreadCount(res.data.data?.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse-soft" />
              <span className="text-xs text-gray-400 hidden sm:inline">Online</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Notifications */}
          <button
            className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User avatar */}
          {user && (
            <Avatar
              src={user.profilePhoto}
              name={user.name}
              size="sm"
            />
          )}
        </div>
      </div>
    </header>
  );
}
