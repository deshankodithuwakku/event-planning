import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Route protection component for role-based access control
 */
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireCustomer = false 
}) => {
  const { isAuthenticated, isAdmin, isCustomer, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireCustomer && !isCustomer) {
    return <Navigate to="/" replace />;
  }

  // All checks passed
  return children;
};

export default ProtectedRoute;
