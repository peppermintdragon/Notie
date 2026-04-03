import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Check your email!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mb-4 text-5xl">📧</div>
        <h1 className="mb-2 font-display text-2xl font-bold text-gray-900 dark:text-white">
          Check your email
        </h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          If an account exists with <strong>{email}</strong>, we've sent a password reset link.
        </p>
        <Link to="/login" className="text-sm font-medium text-primary-500 hover:text-primary-600">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to login
      </Link>
      <h1 className="mb-2 font-display text-3xl font-bold text-gray-900 dark:text-white">
        Reset password
      </h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          required
          autoFocus
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}
