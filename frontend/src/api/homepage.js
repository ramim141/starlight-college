import api from './client';

const contentApi = (resource) => ({
  list: async () => (await api.get(`operations/homepage/${resource}/`)).data,
  create: async (payload) => (await api.post(`operations/homepage/${resource}/`, payload, payload instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : undefined)).data,
  update: async (id, payload) => (await api.patch(`operations/homepage/${resource}/${id}/`, payload, payload instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : undefined)).data,
  remove: async (id) => (await api.delete(`operations/homepage/${resource}/${id}/`)).data,
});

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1/';
  return `${apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const homepageContentApi = {
  hero: contentApi('hero'),
  services: contentApi('services'),
  departments: contentApi('departments'),
  about: contentApi('about'),
  admission: contentApi('admission'),
  steps: contentApi('admission-steps'),
  faqs: contentApi('faqs'),
  contact: contentApi('contact'),
  inquiries: {
    list: async (params) => (await api.get('operations/homepage/inquiries/', { params })).data,
    submit: async (payload) => (await api.post('operations/homepage/inquiries/', payload)).data,
    update: async (id, payload) => (await api.patch(`operations/homepage/inquiries/${id}/`, payload)).data,
    markContacted: async (id, payload = {}) => (await api.post(`operations/homepage/inquiries/${id}/mark_contacted/`, payload)).data,
    remove: async (id) => (await api.delete(`operations/homepage/inquiries/${id}/`)).data,
  },
};
