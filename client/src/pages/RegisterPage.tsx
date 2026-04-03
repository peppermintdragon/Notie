import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name);
      toast.success('Account created! Let\'s set up your profile.');
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      if (err.response?.data?.errors) {
        const flat: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(flat);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-gray-900 dark:text-white">
        Create your account
      </h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">
        Start your love story on TwoGether today.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Your Name"
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={18} />}
          error={errors.name}
          required
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={18} />}
          error={errors.password}
          required
          minLength={8}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Type it again"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock size={18} />}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-500 hover:text-primary-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
