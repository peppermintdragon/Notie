import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-lavender-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="text-center">
        <Heart size={64} className="mx-auto mb-4 text-primary-300" />
        <h1 className="text-6xl font-display font-extrabold gradient-text mb-2">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          This page must have wandered off looking for love...
        </p>
        <Link to="/">
          <Button>
            <ArrowLeft size={18} /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
