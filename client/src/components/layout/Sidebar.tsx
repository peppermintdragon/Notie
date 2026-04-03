import { NavLink } from 'react-router-dom';
import { Heart, Home, Camera, PenLine, Smile, Calendar, ListChecks, Users, MapPin, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/memories', icon: Camera, label: 'Memories' },
  { to: '/notes', icon: PenLine, label: 'Notes' },
  { to: '/mood', icon: Smile, label: 'Mood' },
  { to: '/dates', icon: Calendar, label: 'Dates' },
  { to: '/bucket-list', icon: ListChecks, label: 'Bucket List' },
  { to: '/profile', icon: Users, label: 'Our Profile' },
  { to: '/long-distance', icon: MapPin, label: 'Long Distance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-white dark:bg-gray-900 dark:border-gray-800 lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b dark:border-gray-800">
          <Heart size={28} className="text-primary-500" fill="currentColor" />
          <span className="font-display text-2xl font-bold gradient-text">TwoGether</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t px-6 py-4 dark:border-gray-800">
          <p className="text-xs text-gray-400">Made with love</p>
        </div>
      </div>
    </aside>
  );
}
