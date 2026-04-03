import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { AlbumItem } from '@shared/types/api';

export default function AlbumsPage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/albums')
      .then((res) => setAlbums(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/albums', { name });
      setAlbums((prev) => [res.data.data, ...prev]);
      setShowCreate(false);
      setName('');
      toast.success('Album created!');
    } catch {
      toast.error('Failed to create album');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Albums</h1>
        <Button onClick={() => setShowCreate(true)}><Plus size={18} /> New Album</Button>
      </div>

      {albums.length === 0 ? (
        <EmptyState icon="📚" title="No albums yet" description="Organize your memories into albums!" action={{ label: 'Create Album', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {albums.map((a) => (
            <Card key={a.id} hover onClick={() => navigate(`/albums/${a.id}`)}>
              <div className="flex flex-col items-center gap-3 py-4">
                <FolderOpen size={40} className="text-primary-400" />
                <h3 className="font-semibold text-center">{a.name}</h3>
                <p className="text-sm text-gray-500">{a.memoryCount} memories</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Album" size="sm">
        <div className="space-y-4">
          <Input label="Album Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Our Trips" autoFocus />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
