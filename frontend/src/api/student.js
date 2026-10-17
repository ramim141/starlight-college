import api from './client';

// শিক্ষার্থীর উপস্থিতি রিপোর্ট
export const getMyAttendanceApi = async () => {
  const res = await api.get('academics/attendance/my-attendance/');
  return res.data;
};

// শিক্ষার্থীর ডিজিটাল আইডি কার্ড
export const getMyIdCardApi = async () => {
  const res = await api.get('academics/students/my-id-card/');
  return res.data;
};

// শিক্ষার্থীর পরিবহন রুট ও ব্রেকডাউন অ্যালার্ট
export const getMyTransportRouteApi = async () => {
  const res = await api.get('finance/vehicles/my-route/');
  return res.data;
};

// শিক্ষার্থীর সকল বেতন ও ফি ইনভয়েস
export const getMyInvoicesApi = async () => {
  const res = await api.get('finance/invoices/');
  return res.data;
};

// পরীক্ষার তালিকা
export const getExamsListApi = async () => {
  const res = await api.get('examination/exams/');
  return res.data;
};

// শিক্ষার্থীর স্মার্ট অ্যাডমিট কার্ড (Due-Lock সহ)
export const getMyAdmitCardApi = async (examId) => {
  const res = await api.get(`examination/exams/${examId}/my-admit-card/`);
  return res.data;
};

// শিক্ষার্থীর পূর্ণাঙ্গ প্রগ্রেস রিপোর্ট কার্ড (মার্কশিট)
export const getMyProgressReportApi = async (examId) => {
  const res = await api.get(`examination/reports/progress-report/?exam=${examId}`);
  return res.data;
};

// নোটিশ বোর্ড
export const getNoticesApi = async () => {
  const res = await api.get('operations/notices/');
  return res.data;
};