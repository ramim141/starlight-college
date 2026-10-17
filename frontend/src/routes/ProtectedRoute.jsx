import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // ইউজারের নিজস্ব রোলের ড্যাশবোর্ডে রিডাইরেক্ট করা
    const defaultPaths = {
      PRINCIPAL: '/principal',
      TEACHER: '/teacher',
      ACCOUNTANT: '/accountant',
      STUDENT: '/student',
    };
    return <Navigate to={defaultPaths[user.role] || '/login'} replace />;
  }

  return <Outlet />;
};