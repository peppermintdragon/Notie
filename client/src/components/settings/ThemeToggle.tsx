import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils/cn';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun },
    { value: 'dark' as const, icon: Moon },
    { value: 'system' as const, icon: Monitor },
  ];

  return (
    <div className="flex items-center rounded-full bg-gray-100 p-1 dark:bg-gray-800">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'rounded-full p-1.5 transition-all',
            theme === value
              ? 'bg-white text-primary-500 shadow-sm dark:bg-gray-700 dark:text-primary-400'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}
          aria-label={`Switch to ${value} mode`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
