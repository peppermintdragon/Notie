import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Trophy } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { SpecialDateItem } from '@shared/types/api';

const DATE_TYPE_ICONS: Record<string, string> = {
  ANNIVERSARY: '💕',
  BIRTHDAY: '🎂',
  FIRST_DATE: '✨',
  CUSTOM: '📅',
};

export default function SpecialDatesPage() {
  const [dates, setDates] = useState<SpecialDateItem[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<string>('CUSTOM');
  const [isRecurring, setIsRecurring] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dates'),
      api.get('/dates/milestones'),
    ]).then(([datesRes, milestonesRes]) => {
      setDates(datesRes.data.data || []);
      setMilestones(milestonesRes.data.data || []);
    }).catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !date) { toast.error('Name and date are required'); return; }
    setCreating(true);
    try {
      const res = await api.post('/dates', { name, date, type, isRecurring });
      setDates((prev) => [...prev, res.data.data].sort((a, b) => a.daysUntil - b.daysUntil));
      setShowCreate(false);
      resetForm();
      toast.success('Date added!');
    } catch {
      toast.error('Failed to add date');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/dates/${id}`);
      setDates((prev) => prev.filter((d) => d.id !== id));
      toast.success('Date removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => { setName(''); setDate(''); setType('CUSTOM'); setIsRecurring(true); };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Special Dates</h1>
        <Button onClick={() => setShowCreate(true)}><Plus size={18} /> Add Date</Button>
      </div>

      {dates.length === 0 ? (
        <EmptyState icon="📅" title="No special dates" description="Track anniversaries, birthdays, and other special moments!" action={{ label: 'Add Date', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-3">
          {dates.map((d) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{DATE_TYPE_ICONS[d.type] || '📅'}</span>
                    <div>
                      <h3 className="font-semibold">{d.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        {d.isRecurring && ' (yearly)'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {d.daysUntil === 0 ? (
                      <Badge variant="success">Today!</Badge>
                    ) : d.daysUntil <= 7 ? (
                      <Badge variant="warning">{d.daysUntil} days</Badge>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">{d.daysUntil} days</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <Trophy size={20} className="text-yellow-500" /> Milestones
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {milestones.map((m) => (
              <Card key={m.days} padding="sm" className={!m.achieved ? 'opacity-40' : ''}>
                <div className="text-center">
                  <span className="text-2xl">{m.icon}</span>
                  <p className="font-semibold text-sm mt-1">{m.label}</p>
                  {m.achieved ? (
                    <Badge variant="success" className="mt-1">Achieved!</Badge>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">{m.daysUntil}d left</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Special Date" size="sm">
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Our Anniversary" autoFocus />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
            <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ANNIVERSARY">Anniversary</option>
              <option value="BIRTHDAY">Birthday</option>
              <option value="FIRST_DATE">First Date</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm">Repeats every year</span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating}>Add Date</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
