import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, CheckCircle2, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { BucketListItemData } from '@shared/types/api';

const CATEGORIES = [
  { value: 'ALL', label: 'All', emoji: '🌟' },
  { value: 'TRAVEL', label: 'Travel', emoji: '✈️' },
  { value: 'FOOD', label: 'Food', emoji: '🍕' },
  { value: 'EXPERIENCE', label: 'Experience', emoji: '🎭' },
  { value: 'MOVIES', label: 'Movies', emoji: '🎬' },
  { value: 'ADVENTURE', label: 'Adventure', emoji: '🏔️' },
  { value: 'LEARNING', label: 'Learning', emoji: '📚' },
  { value: 'FITNESS', label: 'Fitness', emoji: '💪' },
  { value: 'OTHER', label: 'Other', emoji: '📌' },
];

const PRIORITY_COLORS = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'default',
} as const;

export default function BucketListPage() {
  const [items, setItems] = useState<BucketListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    fetchItems();
  }, [filter, statusFilter]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams({ status: statusFilter });
      if (filter !== 'ALL') params.set('category', filter);
      const res = await api.get(`/bucket-list?${params}`);
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load bucket list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      const res = await api.post('/bucket-list', { title, description, category, priority });
      setItems((prev) => [res.data.data, ...prev]);
      setShowCreate(false);
      setTitle(''); setDescription(''); setCategory('OTHER'); setPriority('MEDIUM');
      toast.success('Added to bucket list!');
    } catch {
      toast.error('Failed to add item');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await api.patch(`/bucket-list/${id}/toggle`);
      const updated = res.data.data;
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, isCompleted: updated.isCompleted, completedAt: updated.completedAt } : i));
      if (updated.isCompleted) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        toast.success('Completed! 🎉');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const completed = items.filter((i) => i.isCompleted).length;
  const total = items.length;

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Bucket List</h1>
          {total > 0 && (
            <p className="text-sm text-gray-500">{completed}/{total} completed</p>
          )}
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus size={18} /> Add Item</Button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-green-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === c.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`text-sm font-medium px-3 py-1 rounded-lg transition-all ${
              statusFilter === s.value ? 'bg-gray-200 dark:bg-gray-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState icon="🎯" title="Bucket list is empty" description="Add things you want to do together!" action={{ label: 'Add First Item', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card padding="sm" className={item.isCompleted ? 'opacity-60' : ''}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(item.id)} className="flex-shrink-0">
                      {item.isCompleted ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} className="text-gray-300 hover:text-primary-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-500 truncate">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm">{CATEGORIES.find((c) => c.value === item.category)?.emoji}</span>
                      <Badge variant={PRIORITY_COLORS[item.priority as keyof typeof PRIORITY_COLORS]}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add to Bucket List" size="sm">
        <div className="space-y-4">
          <Input label="What do you want to do?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Visit Paris together" autoFocus />
          <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="More details..." />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating}>Add Item</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
