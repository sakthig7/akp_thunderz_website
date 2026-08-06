import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Spinner full />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export default AdminRoute;
