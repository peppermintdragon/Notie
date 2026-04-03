import api from './api';
import type { CreateMemoryRequest } from '@shared/types/api';

export const memoryService = {
  getAll: (params?: URLSearchParams) => api.get(`/memories?${params?.toString() || ''}`),
  getOne: (id: string) => api.get(`/memories/${id}`),
  create: (data: FormData) => api.post('/memories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: Partial<CreateMemoryRequest>) => api.put(`/memories/${id}`, data),
  delete: (id: string) => api.delete(`/memories/${id}`),
  getOnThisDay: () => api.get('/memories/on-this-day'),
};

export const albumService = {
  getAll: () => api.get('/albums'),
  create: (name: string) => api.post('/albums', { name }),
  delete: (id: string) => api.delete(`/albums/${id}`),
};
