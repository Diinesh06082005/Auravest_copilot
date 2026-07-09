import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../business/store/auth.store';
import { LoadingScreen } from '../../presentation/components/common/LoadingScreen';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Wait for checkAuth call to finish before deciding routing
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
