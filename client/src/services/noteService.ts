import api from './api';
import type { SendNoteRequest } from '@shared/types/api';

export const noteService = {
  getAll: (params?: URLSearchParams) => api.get(`/notes?${params?.toString() || ''}`),
  send: (data: SendNoteRequest) => api.post('/notes', data),
  markRead: (id: string) => api.put(`/notes/${id}/read`),
  delete: (id: string) => api.delete(`/notes/${id}`),
  getStreak: () => api.get('/notes/streak'),
};
