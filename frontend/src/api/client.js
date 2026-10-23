import axios from 'axios';
import { toast } from 'sonner';
import { broadcastAuthEvent } from '../utils/authSync';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

// ============================================================================
// TOKEN STORAGE ARCHITECTURE & TRADE-OFF DOCUMENTATION:
//
// Trade-off:
// 1. Access Token: Kept exclusively in-memory (module-scoped variable) to minimize
//    the XSS attack surface (malicious scripts cannot inspect localStorage to steal it).
// 2. Refresh Token: Persisted in localStorage because the backend provides JWT tokens
//    in JSON response bodies (not httpOnly cookies). This allows user sessions to survive
//    browser reloads. On app startup, AuthContext performs an initial refresh to repopulate
//    the in-memory access token before protected routes render.
// ============================================================================
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token || null;
};

export const getAccessToken = () => inMemoryAccessToken;

export const clearAuthSession = (options = { showToast: true, notifySync: true }) => {
  setAccessToken(null);
  try {
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    // Legacy cleanup if any existed
    localStorage.removeItem('access_token');
  } catch {
    // Storage access safety
  }

  if (options.notifySync) {
    broadcastAuthEvent('LOGOUT');
  }

  if (options.showToast) {
    toast.error('সেশনের মেয়াদ শেষ, আবার লগইন করুন');
  }

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    // Small timeout ensures toast renders before browser unloads page
    setTimeout(() => {
      window.location.href = '/login';
    }, 450);
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Single-flight refresh promise: multiple concurrent 401s share this single promise
let refreshPromise = null;

/**
 * Executes a single-flight token refresh against SimpleJWT.
 * Handles token rotation by saving both new access token and new rotated refresh token.
 */
export const refreshTokenSilently = async () => {
  if (refreshPromise) return refreshPromise;

  const refreshUnderLock = async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) return null;

    const requestRefresh = async (token) => {
      const res = await axios.post(BASE_URL + 'auth/token/refresh/', { refresh: token });
      setAccessToken(res.data.access);
      if (res.data.refresh) localStorage.setItem('refresh_token', res.data.refresh);
      return res.data.access;
    };

    try {
      // Read after taking the cross-tab lock so a rotated token from another tab is used.
      return await requestRefresh(refreshToken);
    } catch (error) {
      // If the browser lacks cross-tab locks, retry with a token another tab just rotated.
      const latestRefreshToken = localStorage.getItem('refresh_token');
      if (
        [400, 401].includes(error.response?.status) &&
        latestRefreshToken &&
        latestRefreshToken !== refreshToken
      ) {
        try {
          return await requestRefresh(latestRefreshToken);
        } catch (retryError) {
          error = retryError;
        }
      }

      // Keep the session through network/server outages; clear it only when the server rejects the refresh token.
      if ([400, 401].includes(error.response?.status)) {
        clearAuthSession({ showToast: true, notifySync: true });
      }
      throw error;
    }
  };

  refreshPromise = (async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.locks?.request) {
        return await navigator.locks.request('starlight-auth-refresh', refreshUnderLock);
      }
      return await refreshUnderLock();
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
// রিকোয়েস্ট ইন্টারসেপ্টর: প্রতি রিকোয়েস্টে ইন-মেমোরি এক্সেস টোকেন ইনজেক্ট করা
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// রেসপন্স ইন্টারসেপ্টর: টোকেন এক্সপায়ার হলে সিঙ্গেল-ফ্লাইট অটো-রিফ্রেশ
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('auth/token/refresh/') ||
      requestUrl.includes('auth/login/') ||
      requestUrl.includes('auth/logout/');

    // 401 Unauthorized এবং অথেনটিকেশন বা রিফ্রেশ ছাড়া সাধারণ রিকোয়েস্ট
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshTokenSilently();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;