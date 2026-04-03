import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, Copy, Check, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/services/api';
import toast from 'react-hot-toast';

const LOVE_LANGUAGES = [
  { value: 'WORDS_OF_AFFIRMATION', label: 'Words of Affirmation', emoji: '💬' },
  { value: 'ACTS_OF_SERVICE', label: 'Acts of Service', emoji: '🤝' },
  { value: 'RECEIVING_GIFTS', label: 'Receiving Gifts', emoji: '🎁' },
  { value: 'QUALITY_TIME', label: 'Quality Time', emoji: '⏰' },
  { value: 'PHYSICAL_TOUCH', label: 'Physical Touch', emoji: '🤗' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 data
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loveLanguage, setLoveLanguage] = useState('');

  // Step 2 data
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Step 3 data
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [howWeMet, setHowWeMet] = useState('');
  const [coupleNickname, setCoupleNickname] = useState('');
  const [themeColor, setThemeColor] = useState('#F43F5E');

  const THEME_COLORS = [
    '#F43F5E', '#EC4899', '#A855F7', '#8B5CF6',
    '#3B82F6', '#06B6D4', '#10B981', '#F59E0B',
  ];

  const handleStep1 = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setIsLoading(true);
    try {
      await api.put('/auth/onboarding/step1', {
        name, nickname: nickname || undefined,
        birthday: birthday || undefined,
        loveLanguage: loveLanguage || undefined,
      });
      updateUser({ name, nickname });
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCouple = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/onboarding/create-couple');
      setGeneratedCode(res.data.data.inviteCode);
      updateUser({ coupleId: res.data.data.couple.id });
      setMode('create');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create couple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCouple = async () => {
    if (inviteCode.length < 6) {
      toast.error('Please enter the full invite code');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/onboarding/join-couple', { inviteCode });
      updateUser({ coupleId: res.data.data.coupleId });
      toast.success("You're connected!");
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStep3 = async () => {
    if (!relationshipStartDate) {
      toast.error('When did your love story begin?');
      return;
    }
    setIsLoading(true);
    try {
      await api.put('/auth/onboarding/step3', {
        relationshipStartDate, howWeMet: howWeMet || undefined,
        coupleNickname: coupleNickname || undefined, themeColor,
      });
      setStep(4);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/onboarding/complete');
      updateUser({ onboardingCompleted: true });
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => navigate('/'), 2000);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-lavender-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold transition-all ${
                s === step ? 'bg-primary-500 text-white scale-110' :
                s < step ? 'bg-primary-200 text-primary-700 dark:bg-primary-800 dark:text-primary-300' :
                'bg-gray-200 text-gray-400 dark:bg-gray-800'
              }`}>
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-lavender-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            {/* Step 1: Personal Profile */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tell us about you
                  </h2>
                  <p className="text-gray-500">Let's start with the basics, lovebird</p>
                </div>

                <Input label="Your name" value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" required autoFocus />
                <Input label="Nickname (optional)" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="A cute nickname?" />
                <Input label="Birthday (optional)" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Love Language (optional)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {LOVE_LANGUAGES.map((ll) => (
                      <button
                        key={ll.value}
                        onClick={() => setLoveLanguage(ll.value === loveLanguage ? '' : ll.value)}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition-all ${
                          loveLanguage === ll.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                      >
                        <span className="text-xl">{ll.emoji}</span>
                        <span className="font-medium">{ll.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleStep1} className="w-full" isLoading={isLoading}>
                  Continue <ArrowRight size={18} />
                </Button>
              </div>
            )}

            {/* Step 2: Create or Join Couple */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Connect with your partner
                  </h2>
                  <p className="text-gray-500">Create a couple or join your partner's invitation</p>
                </div>

                {!mode && !generatedCode && (
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={handleCreateCouple}
                      className="card-hover flex flex-col items-center gap-3 p-8 text-center"
                    >
                      <Heart size={32} className="text-primary-500" />
                      <span className="text-lg font-semibold">Create a Couple</span>
                      <span className="text-sm text-gray-500">Generate an invite code for your partner</span>
                    </button>
                    <button
                      onClick={() => setMode('join')}
                      className="card-hover flex flex-col items-center gap-3 p-8 text-center"
                    >
                      <span className="text-3xl">🔗</span>
                      <span className="text-lg font-semibold">Join Your Partner</span>
                      <span className="text-sm text-gray-500">Enter the invite code they shared</span>
                    </button>
                  </div>
                )}

                {generatedCode && (
                  <div className="text-center space-y-4">
                    <div className="text-5xl">🎉</div>
                    <p className="text-gray-600 dark:text-gray-400">Share this code with your partner:</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="rounded-xl bg-gray-100 px-6 py-4 font-mono text-3xl font-bold tracking-widest dark:bg-gray-800">
                        {generatedCode}
                      </div>
                      <button onClick={copyCode} className="rounded-xl bg-primary-100 p-3 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400">
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">This code expires in 7 days</p>
                    <Button onClick={() => setStep(3)} className="w-full" variant="secondary">
                      Continue to couple setup <ArrowRight size={18} />
                    </Button>
                  </div>
                )}

                {mode === 'join' && (
                  <div className="space-y-4">
                    <Input
                      label="Invite Code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-character code"
                      maxLength={6}
                      className="text-center font-mono text-2xl tracking-widest"
                      autoFocus
                    />
                    <Button onClick={handleJoinCouple} className="w-full" isLoading={isLoading}>
                      Join Partner
                    </Button>
                    <button onClick={() => setMode(null)} className="w-full text-sm text-gray-500 hover:text-gray-700">
                      <ArrowLeft size={14} className="inline mr-1" /> Go back
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Couple Profile */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your love story
                  </h2>
                  <p className="text-gray-500">Tell us about your relationship</p>
                </div>

                <Input
                  label="When did your story begin?"
                  type="date"
                  value={relationshipStartDate}
                  onChange={(e) => setRelationshipStartDate(e.target.value)}
                  required
                />
                <Input
                  label="How did you meet? (optional)"
                  value={howWeMet}
                  onChange={(e) => setHowWeMet(e.target.value)}
                  placeholder="At a coffee shop, through friends..."
                />
                <Input
                  label="Couple nickname (optional)"
                  value={coupleNickname}
                  onChange={(e) => setCoupleNickname(e.target.value)}
                  placeholder="e.g. The Adventurers"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme Color
                  </label>
                  <div className="flex gap-3">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        className={`h-10 w-10 rounded-full transition-all ${
                          themeColor === color ? 'ring-4 ring-offset-2 ring-primary-300 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={18} /> Back
                  </Button>
                  <Button onClick={handleStep3} className="flex-1" isLoading={isLoading}>
                    Continue <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Celebration */}
            {step === 4 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6 py-8"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <PartyPopper size={64} className="mx-auto text-primary-500" />
                </motion.div>
                <h2 className="text-3xl font-bold gradient-text font-display">
                  Day 1 together on TwoGether!
                </h2>
                <p className="text-gray-500 text-lg">
                  Your beautiful journey starts now. Let's make every moment count.
                </p>
                <Button onClick={handleComplete} size="lg" isLoading={isLoading}>
                  Start Our Journey
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
