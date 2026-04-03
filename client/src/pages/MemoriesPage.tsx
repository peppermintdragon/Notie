import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid3X3, List, Clock, Search, Filter } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { MemoryItem } from '@shared/types/api';

type ViewMode = 'grid' | 'list' | 'timeline';

export default function MemoriesPage() {
  const navigate = useNavigate();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [search]);

  const fetchMemories = async () => {
    try {
      const params = new URLSearchParams({ pageSize: '50' });
      if (search) params.set('search', search);
      const res = await api.get(`/memories?${params}`);
      setMemories(res.data.data || []);
    } catch {
      toast.error('Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('date', date);
      if (description) formData.append('description', description);
      if (location) formData.append('location', location);
      photos.forEach((p) => formData.append('photos', p));

      await api.post('/memories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Memory saved!');
      setShowCreateModal(false);
      resetForm();
      fetchMemories();
    } catch {
      toast.error('Failed to save memory');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]);
    setLocation(''); setPhotos([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-display font-bold">Memories</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Add Memory
        </Button>
      </div>

      {/* Search and view toggle */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div className="flex rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700">
          {([
            { mode: 'grid' as const, icon: Grid3X3 },
            { mode: 'list' as const, icon: List },
            { mode: 'timeline' as const, icon: Clock },
          ]).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2.5 transition-colors ${viewMode === mode ? 'bg-primary-50 text-primary-500 dark:bg-primary-900/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          icon="📸"
          title="No memories yet"
          description="Start capturing your beautiful moments together!"
          action={{ label: 'Add First Memory', onClick: () => setShowCreateModal(true) }}
        />
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {memories.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`/memories/${m.id}`)}
                >
                  <Card padding="sm" hover>
                    {m.photos[0] ? (
                      <img src={m.photos[0].url} alt={m.title} className="mb-3 h-32 w-full rounded-lg object-cover" />
                    ) : (
                      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-lavender-100 dark:from-primary-900/20 dark:to-lavender-900/20">
                        <span className="text-3xl">📸</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-sm truncate">{m.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(m.date).toLocaleDateString()}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {memories.map((m) => (
                <Card key={m.id} padding="sm" hover onClick={() => navigate(`/memories/${m.id}`)}>
                  <div className="flex items-center gap-4">
                    {m.photos[0] ? (
                      <img src={m.photos[0].url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">📸</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{m.title}</h3>
                      <p className="text-sm text-gray-500">{new Date(m.date).toLocaleDateString()}</p>
                      {m.location && <p className="text-xs text-gray-400">📍 {m.location}</p>}
                    </div>
                    {m.moodTag && <span className="text-xl">{m.moodTag === 'HAPPY' ? '😊' : '💕'}</span>}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 h-full w-0.5 bg-primary-200 dark:bg-primary-800" />
              {memories.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative mb-6 cursor-pointer"
                  onClick={() => navigate(`/memories/${m.id}`)}
                >
                  <div className="absolute -left-5 top-2 h-4 w-4 rounded-full border-2 border-primary-400 bg-white dark:bg-gray-900" />
                  <Card padding="sm" hover>
                    <p className="text-xs text-primary-500 font-medium mb-1">
                      {new Date(m.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h3 className="font-semibold">{m.title}</h3>
                    {m.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{m.description}</p>}
                    {m.photos.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {m.photos.slice(0, 4).map((p) => (
                          <img key={p.id} src={p.url} alt="" className="h-20 w-20 rounded-lg object-cover flex-shrink-0" />
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Memory Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Memory" size="lg">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What happened?" required autoFocus />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files || []))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-600 hover:file:bg-primary-100"
            />
            {photos.length > 0 && <p className="text-xs text-gray-500 mt-1">{photos.length} file(s) selected</p>}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating}>Save Memory</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
