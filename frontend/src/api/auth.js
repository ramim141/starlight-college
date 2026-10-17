import api from './client';

export const loginApi = async (credentials) => {
  const response = await api.post('auth/login/', credentials);
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await api.get('auth/me/');
  return response.data;
};

export const logoutApi = async (refreshToken) => {
  const response = await api.post('auth/logout/', { refresh: refreshToken });
  return response.data;
};