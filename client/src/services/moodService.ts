import api from './api';
import type { MoodType } from '@shared/types/enums';

export const moodService = {
  setMood: (mood: MoodType) => api.post('/mood', { mood }),
  getToday: () => api.get('/mood/today'),
  getCalendar: (month: string) => api.get(`/mood/calendar?month=${month}`),
  getInsights: () => api.get('/mood/insights'),
};
