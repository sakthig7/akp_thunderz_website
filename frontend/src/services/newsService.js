import api from './api';

export const getNews = (params) => api.get('/news', { params });
export const getNewsArticle = (id) => api.get(`/news/${id}`);
export const createNews = (formData) => api.post('/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateNews = (id, formData) => api.put(`/news/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteNews = (id) => api.delete(`/news/${id}`);
