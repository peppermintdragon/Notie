import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/services/api';
import type { MemoryItem } from '@shared/types/api';

export default function AlbumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(`/memories?albumId=${id}`)
      .then((res) => setMemories(res.data.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/albums')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
        <ArrowLeft size={18} /> Back to Albums
      </button>

      {memories.length === 0 ? (
        <EmptyState icon="📂" title="Empty album" description="Add memories to this album from the memories page." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {memories.map((m) => (
            <Card key={m.id} padding="sm" hover onClick={() => navigate(`/memories/${m.id}`)}>
              {m.photos[0] ? (
                <img src={m.photos[0].url} alt={m.title} className="mb-2 h-32 w-full rounded-lg object-cover" />
              ) : (
                <div className="mb-2 flex h-32 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">📸</div>
              )}
              <h3 className="font-semibold text-sm truncate">{m.title}</h3>
              <p className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
