import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
