import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function AcceptInvitePage() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-lavender-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="card max-w-md text-center">
        <Heart size={48} className="mx-auto mb-4 text-primary-500" fill="currentColor" />
        <h1 className="text-2xl font-display font-bold mb-2">You've been invited!</h1>
        <p className="text-gray-500 mb-6">
          Someone wants to connect with you on TwoGether. Use the invite code <strong className="text-primary-500">{code}</strong> during onboarding.
        </p>
        {user ? (
          <Button onClick={() => navigate('/onboarding')} className="w-full">
            Continue to Onboarding
          </Button>
        ) : (
          <div className="space-y-3">
            <Button onClick={() => navigate('/register')} className="w-full">
              Create Account
            </Button>
            <Link to="/login" className="block text-sm text-primary-500 hover:text-primary-600">
              Already have an account? Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
