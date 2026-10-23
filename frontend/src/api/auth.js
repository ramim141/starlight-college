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

export const changePasswordApi = async (payload) => {
  const response = await api.post('auth/change-password/', payload);
  return response.data;
};

export const refreshApi = async (refreshToken) => {
  const response = await api.post('auth/token/refresh/', { refresh: refreshToken });
  return response.data;
};

export const updateProfileApi = async (formDataOrPayload) => {
  const isFormData = formDataOrPayload instanceof FormData;
  const response = await api.patch('auth/me/', formDataOrPayload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export default {
  loginApi,
  getCurrentUserApi,
  logoutApi,
  changePasswordApi,
  updateProfileApi,
  refreshApi,
};