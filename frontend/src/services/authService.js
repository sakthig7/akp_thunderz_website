import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const adminLogin = (data) => api.post('/auth/admin/login', data);
export const logout = () => api.get('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/update-profile', data);
export const changePassword = (data) => api.put('/auth/change-password', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => api.put(`/auth/reset-password/${token}`, data);
