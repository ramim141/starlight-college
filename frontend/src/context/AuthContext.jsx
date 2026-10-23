import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUserApi, loginApi, logoutApi } from '../api/auth';
import { setAccessToken, refreshTokenSilently, clearAuthSession } from '../api/client';
import { broadcastAuthEvent, subscribeAuthEvents } from '../utils/authSync';
import { unsubscribeFromPushNotifications } from '../utils/pushManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // নন-সেনসিটিভ প্রোফাইল ডাটা দ্রুত অপটিমিস্টিক রেন্ডারের জন্য মেমোরি/ক্যাশ থেকে পড়া হয়
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user_data');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ১. অ্যাপ স্টার্টআপ ইনিশিয়ালাইজেশন:
  // রিফ্রেশ টোকেন থাকলে সাইলেন্ট রিফ্রেশের মাধ্যমে ইন-মেমোরি এক্সেস টোকেন আনা হয়
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const newAccessToken = await refreshTokenSilently();
          if (newAccessToken && isMounted) {
            const res = await getCurrentUserApi();
            if (res.success && res.data && isMounted) {
              setUser(res.data);
              localStorage.setItem('user_data', JSON.stringify(res.data));
            }
          }
        } catch {
          // Keep cached profile/session during temporary network failures.
          // refreshTokenSilently clears the session when the server rejects its refresh token.
          if (isMounted && !localStorage.getItem('refresh_token')) setUser(null);
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    // ২. মাল্টি-ট্যাব ব্রডকাস্ট সিঙ্ক লিসেনার
    const unsubscribeSync = subscribeAuthEvents((event) => {
      if (!isMounted) return;

      if (event.type === 'LOGOUT' || event.type === 'SESSION_EXPIRED') {
        setUser(null);
        setAccessToken(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (event.type === 'LOGIN') {
        const payload = event.payload;
        if (payload?.user) {
          setUser(payload.user);
          localStorage.setItem('user_data', JSON.stringify(payload.user));
          if (payload.access) {
            setAccessToken(payload.access);
          }
          if (payload.refresh) {
            localStorage.setItem('refresh_token', payload.refresh);
          }
        } else if (payload) {
          setUser(payload);
          localStorage.setItem('user_data', JSON.stringify(payload));
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeSync();
    };
  }, []);

  // লগইন হ্যান্ডলার
  const login = async (credentials) => {
    const data = await loginApi(credentials);

    // এক্সেস টোকেন শুধু ইন-মেমোরিতে সংরক্ষিত (XSS প্রোটেকশন)
    setAccessToken(data.access);

    // রিফ্রেশ টোকেন লোকাল স্টোরেজে সংরক্ষিত (রিলোডে সেশন ধরে রাখা)
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }

    // নন-সেনসিটিভ ইউজার ডাটা ক্যাশিং
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
      // অন্যান্য ওপেন ট্যাবে লগইন ও এক্সেস টোকেন সিঙ্ক করা (কোনো এক্সট্রা রিফ্রেশ কল ছাড়াই)
      broadcastAuthEvent('LOGIN', {
        user: data.user,
        access: data.access,
        refresh: data.refresh,
      });
    }

    return data.user;
  };

  // লগআউট হ্যান্ডলার
  const logout = async () => {
    try {
      // পুশ নোটিফিকেশন আনসাবস্ক্রাইব করার চেষ্টা
      await unsubscribeFromPushNotifications().catch(() => {});
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await logoutApi(refresh);
      }
    } catch {
      // ব্যাকএন্ড লগআউট কল ফেইল করলেও ক্লায়েন্ট সেশন অবিলম্বে পরিষ্কার করা হবে
    } finally {
      setUser(null);
      clearAuthSession({ showToast: false, notifySync: true });
    }
  };

  // ইউজার প্রোফাইল ডাটা রিফ্রেশ হেল্পার
  const refreshUser = async () => {
    try {
      const res = await getCurrentUserApi();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user_data', JSON.stringify(res.data));
        return res.data;
      }
    } catch (err) {
      console.error('Session profile refresh failed', err);
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

export default AuthContext;