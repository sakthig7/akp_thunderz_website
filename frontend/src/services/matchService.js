import api from './api';

export const getMatches = (params) => api.get('/matches', { params });
export const getMatch = (id) => api.get(`/matches/${id}`);
export const createMatch = (data) => api.post('/matches', data);
export const updateMatch = (id, data) => api.put(`/matches/${id}`, data);
export const updateLiveState = (id, liveMatchData, status) => api.put(`/matches/${id}/live-state`, { liveMatchData, status });
export const deleteMatch = (id) => api.delete(`/matches/${id}`);
