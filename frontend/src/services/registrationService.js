import api from './api';

export const submitRegistration = (formData) => api.post('/registrations', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getRegistrations = (params) => api.get('/registrations', { params });
export const getRegistration = (id) => api.get(`/registrations/${id}`);
export const updateRegistrationStatus = (id, data) => api.put(`/registrations/${id}/status`, data);
export const deleteRegistration = (id) => api.delete(`/registrations/${id}`);
