import { Fragment, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900',
                sizes[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
