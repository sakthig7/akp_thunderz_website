import api from './api';

export const getPlayers = (params) => api.get('/players', { params });
export const getPlayer = (id) => api.get(`/players/${id}`);
export const createPlayer = (formData) => api.post('/players', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePlayer = (id, formData) => api.put(`/players/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePlayer = (id) => api.delete(`/players/${id}`);
export const linkAccount = (id, userId) => api.put(`/players/${id}/link-account`, { userId: userId || null });
