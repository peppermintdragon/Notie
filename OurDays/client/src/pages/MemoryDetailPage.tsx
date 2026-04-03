import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Trash2, Edit } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/services/api';
import toast from 'react-hot-toast';
import type { MemoryItem } from '@shared/types/api';
import { MOOD_CONFIG, type MoodType } from '@shared/types/enums';

export default function MemoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<MemoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/memories/${id}`)
      .then((res) => setMemory(res.data.data))
      .catch(() => toast.error('Memory not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/memories/${id}`);
      toast.success('Memory deleted');
      navigate('/memories');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-24" /></div>;
  }

  if (!memory) {
    return <div className="text-center py-20"><p className="text-gray-500">Memory not found</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/memories')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Photos */}
      {memory.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {memory.photos.map((p, i) => (
            <motion.img
              key={p.id}
              src={p.url}
              alt={`Photo ${i + 1}`}
              className={`w-full rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                i === 0 && memory.photos.length > 2 ? 'col-span-2 row-span-2 h-72' : 'h-36'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedPhoto(p.url)}
            />
          ))}
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {memory.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(memory.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {memory.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} /> {memory.location}
              </div>
            )}
            {memory.moodTag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 dark:bg-gray-800">
                {MOOD_CONFIG[memory.moodTag as MoodType]?.emoji} {MOOD_CONFIG[memory.moodTag as MoodType]?.label}
              </span>
            )}
          </div>

          {memory.description && (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {memory.description}
            </p>
          )}

          <div className="flex items-center gap-2 pt-4 border-t dark:border-gray-800">
            <Avatar src={memory.author.profilePhoto} name={memory.author.name} size="sm" />
            <div>
              <p className="text-sm font-medium">{memory.author.name}</p>
              <p className="text-xs text-gray-400">
                Added {new Date(memory.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lightbox */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img src={selectedPhoto} alt="" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Memory"
        message="Are you sure? This memory will be moved to trash."
        confirmText="Delete"
      />
    </div>
  );
}
