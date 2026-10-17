import api from './client';

export const getNotificationsApi = async () => {
  const res = await api.get('operations/notifications/');
  return res.data;
};

export const getUnreadCountApi = async () => {
  const res = await api.get('operations/notifications/unread-count/');
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await api.patch(`operations/notifications/${id}/mark-read/`);
  return res.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await api.post('operations/notifications/mark-all-read/');
  return res.data;
};