import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUserApi, loginApi, logoutApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await getCurrentUserApi();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user_data', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Session verification failed", err);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_data', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await logoutApi(refresh);
    } catch (e) {
      console.warn("Logout notification error", e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const res = await getCurrentUserApi();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user_data', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.error("Session verification/refresh failed", err);
    }
    return null;
  };

  // রোল ও পারমিশন হেল্পার
  const isPrincipal = user?.role === 'PRINCIPAL';
  const isTeacher = user?.role === 'TEACHER';
  const isAccountant = user?.role === 'ACCOUNTANT';
  const isStudent = user?.role === 'STUDENT';
  const isClassIncharge = Boolean(
    user?.is_class_incharge ||
    (Array.isArray(user?.incharge_sections) && user.incharge_sections.length > 0)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isPrincipal,
        isTeacher,
        isAccountant,
        isStudent,
        isClassIncharge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};