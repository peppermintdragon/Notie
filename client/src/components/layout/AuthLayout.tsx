import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import ThemeToggle from '../settings/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-primary-500 via-blush-400 to-lavender-400 p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center text-white"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8 inline-block"
          >
            <Heart size={64} fill="white" />
          </motion.div>
          <h1 className="mb-4 font-display text-5xl font-extrabold">TwoGether</h1>
          <p className="text-lg text-white/90">
            Your relationship, beautifully captured. Build memories, share moments, grow together.
          </p>
        </motion.div>
      </div>

      {/* Right side — forms */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2 lg:hidden">
            <Heart size={24} className="text-primary-500" fill="currentColor" />
            <span className="font-display text-xl font-bold gradient-text">TwoGether</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
