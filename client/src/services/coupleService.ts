import api from './api';

export const coupleService = {
  getProfile: () => api.get('/couple'),
  updateProfile: (data: any) => api.put('/couple', data),
  getStats: () => api.get('/couple/stats'),
  uploadCoverPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return api.post('/couple/cover-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
