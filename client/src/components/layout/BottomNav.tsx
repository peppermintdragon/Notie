import { NavLink } from 'react-router-dom';
import { Home, Camera, PenLine, Smile, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/memories', icon: Camera, label: 'Memories' },
  { to: '/notes', icon: PenLine, label: 'Notes' },
  { to: '/mood', icon: Smile, label: 'Mood' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/80 backdrop-blur-lg dark:bg-gray-900/80 dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
                isActive
                  ? 'text-primary-500'
                  : 'text-gray-400 dark:text-gray-500'
              )
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
