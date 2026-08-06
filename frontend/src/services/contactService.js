import api from './api';

export const submitContact = (data) => api.post('/contacts', data);
export const getContacts = () => api.get('/contacts');
export const updateContact = (id, data) => api.put(`/contacts/${id}`, data);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);
