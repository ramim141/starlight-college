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

// লাইব্রেরি বই ক্যাটালগ
export const getBooksCatalogApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`library/books/${query ? '?' + query : ''}`);
  return res.data;
};

// শিক্ষার্থীর নিজের ধার করা বই ও আবেদনের তালিকা
export const getMyBorrowedBooksApi = async () => {
  const res = await api.get('library/borrow/');
  return res.data;
};

// বই ধার নেওয়ার আবেদন সাবমিট
export const requestBookBorrowApi = async (payload) => {
  const res = await api.post('library/borrow/', payload);
  return res.data;
};

// ==========================================
// ব্যক্তিগত নোটস (Personal Sticky Notes)
// ==========================================
// ১. সকল ব্যক্তিগত নোট তালিকা
export const getPersonalNotesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/personal-notes/${query ? '?' + query : ''}`);
  return res.data;
};

// ২. নতুন নোট তৈরি
export const createPersonalNoteApi = async (payload) => {
  const res = await api.post('operations/personal-notes/', payload);
  return res.data;
};

// ৩. নোট আপডেট (বা অটোসেভ)
export const updatePersonalNoteApi = async (id, payload) => {
  const res = await api.patch(`operations/personal-notes/${id}/`, payload);
  return res.data;
};

// ৪. নোট ডিলিট
export const deletePersonalNoteApi = async (id) => {
  const res = await api.delete(`operations/personal-notes/${id}/`);
  return res.data;
};

// ==========================================
// শিক্ষার্থীর ছুটির আবেদন (Student Leave Applications)
// ==========================================
// ১. শিক্ষার্থীর ছুটির আবেদন তালিকা
export const getMyLeavesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/leaves/${query ? '?' + query : ''}`);
  return res.data;
};

// ২. ছুটির নতুন আবেদন দাখিল (FormData সহ)
export const submitLeaveApplicationApi = async (formData) => {
  const res = await api.post('operations/leaves/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ৩. অপেক্ষমাণ ছুটির আবেদন বাতিল (Delete)
export const cancelLeaveApplicationApi = async (leaveId) => {
  const res = await api.delete(`operations/leaves/${leaveId}/`);
  return res.data;
};

// ==========================================
// শিক্ষার্থীর ক্লাস রুটিন (Class Routine & Timetable)
// ==========================================
// শিক্ষার্থীর শাখার ক্লাস রুটিন (লগইন করা স্টুডেন্টের সেকশন স্বয়ংক্রিয় ফিল্টার হয়)
export const getMyClassRoutineApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/routines/${query ? '?' + query : ''}`);
  return res.data;
};

// ==========================================
// শিক্ষার্থীর হোমওয়ার্ক ও সিলেবাস (Homework & Syllabus)
// ==========================================
// ১. শিক্ষার্থীর সেকশনের হোমওয়ার্ক ও অ্যাসাইনমেন্ট তালিকা
export const getMyHomeworksApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/homeworks/${query ? '?' + query : ''}`);
  return res.data;
};

// ২. শিক্ষার্থীর সিলেবাস ও স্টাডি ফাইল তালিকা
export const getMySyllabiApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/syllabi/${query ? '?' + query : ''}`);
  return res.data;
};
