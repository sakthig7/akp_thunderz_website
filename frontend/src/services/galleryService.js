import api from './api';

export const getGallery = (params) => api.get('/gallery', { params });
export const uploadGallery = (formData) => api.post('/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateGalleryItem = (id, data) => api.put(`/gallery/${id}`, data);
export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`);
