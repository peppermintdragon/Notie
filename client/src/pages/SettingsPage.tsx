import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Download, UserMinus, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/settings/ThemeToggle';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [timezone, setTimezone] = useState(user?.timezone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Notifications
  const [prefs, setPrefs] = useState({ notifyNotes: true, notifyMoods: true, notifyPings: true, notifyDates: true });

  // Danger zone
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    api.get('/settings/preferences')
      .then((res) => {
        const p = res.data.data;
        if (p) setPrefs({ notifyNotes: p.notifyNotes, notifyMoods: p.notifyMoods, notifyPings: p.notifyPings, notifyDates: p.notifyDates });
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', { name, nickname: nickname || undefined, timezone: timezone || undefined });
      updateUser({ name, nickname });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed!');
      setShowPasswordModal(false);
      setCurrentPassword(''); setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleTogglePref = async (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await api.put('/settings/preferences', updated);
    } catch {
      setPrefs(prefs);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/settings/export');
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `twogether-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!');
    } catch {
      toast.error('Failed to export');
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.delete('/couple/disconnect');
      updateUser({ coupleId: undefined });
      toast.success('Couple disconnected');
      setShowDisconnect(false);
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><User size={20} /> Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <Avatar src={user?.profilePhoto} name={user?.name || ''} size="lg" />
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Optional" />
          <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. America/New_York" />
          <Button onClick={handleSaveProfile} isLoading={savingProfile} size="sm">Save Changes</Button>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Theme</p>
          <ThemeToggle />
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><Lock size={20} /> Security</h2>
        <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><Bell size={20} /> Notifications</h2>
        <div className="space-y-3">
          {[
            { key: 'notifyNotes' as const, label: 'Daily Notes' },
            { key: 'notifyMoods' as const, label: 'Mood Updates' },
            { key: 'notifyPings' as const, label: 'Thinking of You Pings' },
            { key: 'notifyDates' as const, label: 'Date Reminders' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span>{label}</span>
              <button
                onClick={() => handleTogglePref(key)}
                className={`relative h-6 w-11 rounded-full transition-colors ${prefs[key] ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow ${prefs[key] ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>

      {/* Data */}
      <Card>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><Download size={20} /> Data</h2>
        <Button variant="secondary" size="sm" onClick={handleExport}>Export All Data (JSON)</Button>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/30">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <Button variant="ghost" size="sm" onClick={() => setShowDisconnect(true)}>
            <UserMinus size={16} /> Disconnect Couple
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteAccount(true)}>
            <Trash2 size={16} /> Delete Account
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Button variant="ghost" className="w-full" onClick={handleLogout}>
        <LogOut size={18} /> Sign Out
      </Button>

      {/* Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" size="sm">
        <div className="space-y-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} isLoading={changingPassword}>Update Password</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showDisconnect} onClose={() => setShowDisconnect(false)} onConfirm={handleDisconnect} title="Disconnect Couple" message="This will permanently disconnect your couple. Your memories will be deleted. Are you absolutely sure?" confirmText="Disconnect" />
      <ConfirmDialog isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} onConfirm={handleDeleteAccount} title="Delete Account" message="Your account will be scheduled for deletion. You have 30 days to recover it. Are you sure?" confirmText="Delete My Account" />
    </div>
  );
}
