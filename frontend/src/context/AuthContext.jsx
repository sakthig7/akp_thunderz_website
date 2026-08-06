import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('akp_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('akp_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.getMe();
        setUser(data.user);
        localStorage.setItem('akp_user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('akp_token');
        localStorage.removeItem('akp_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('akp_token', data.token);
    localStorage.setItem('akp_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    persistSession(data);
    return data.user;
  };

  const adminLogin = async (credentials) => {
    const { data } = await authService.adminLogin(credentials);
    persistSession(data);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    persistSession(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem('akp_token');
    localStorage.removeItem('akp_user');
    setUser(null);
    toast.success('Logged out');
  };

  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('akp_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, adminLogin, register, logout, refreshUser, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
