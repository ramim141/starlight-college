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

// গোপন অভিযোগ বা পরামর্শ সাবমিট (ফাইল অ্যাটাচমেন্ট সহ)
export const submitComplaintApi = async (payload) => {
  const isFormData = payload instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const res = await api.post('operations/complaints/', payload, config);
  return res.data;
};

// শিক্ষার্থীর নিজের অভিযোগ ও পরামর্শ তালিকা
export const getMyComplaintsApi = async () => {
  const res = await api.get('operations/complaints/');
  return res.data;
};