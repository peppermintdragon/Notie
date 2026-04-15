import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FFFDF7',
          100: '#FFF9E8',
          200: '#FFF3D1',
          300: '#FFEBB3',
          400: '#FFE08A',
          500: '#FFD57E',
        },
        ink: {
          50: '#F7F6F3',
          100: '#ECEAE4',
          200: '#D5D1C8',
          300: '#B8B2A5',
          400: '#9A9283',
          500: '#7D7567',
          600: '#635C50',
          700: '#4A453C',
          800: '#2A2720',
          900: '#161410',
        },
        warm: {
          50: '#FFFBF5',
          100: '#FFF5E8',
          200: '#FFECD1',
          300: '#FFE4BD',
        },
        book: {
          DEFAULT: 'rgb(var(--book-accent) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"Noto Sans SC"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif TC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Noto Sans Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
