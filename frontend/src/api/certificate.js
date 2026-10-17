import api from './client';

// শিক্ষার্থীর সার্টিফিকেট আবেদন তালিকা
export const getMyCertificatesApi = async () => {
  const res = await api.get('operations/certificates/');
  return res.data;
};

// নতুন সার্টিফিকেট আবেদন সাবমিট
export const requestCertificateApi = async (payload) => {
  const res = await api.post('operations/certificates/', payload);
  return res.data;
};

// গোপন অভিযোগ বা পরামর্শ সাবমিট
export const submitComplaintApi = async (payload) => {
  const res = await api.post('operations/complaints/', payload);
  return res.data;
};