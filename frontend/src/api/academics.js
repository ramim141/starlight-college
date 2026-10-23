import api from './client';

// ==========================================
// ১. পাঠ্য বিষয়সমূহ (Subjects CRUD)
// ==========================================
export const getSubjectsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/subjects/${query ? '?' + query : ''}`);
  return res.data;
};

export const createSubjectApi = async (payload) => {
  const res = await api.post('academics/subjects/', payload);
  return res.data;
};

export const updateSubjectApi = async (id, payload) => {
  const res = await api.patch(`academics/subjects/${id}/`, payload);
  return res.data;
};

export const deleteSubjectApi = async (id) => {
  const res = await api.delete(`academics/subjects/${id}/`);
  return res.data;
};

// ==========================================
// ২. ক্লাস রুটিন টাইমটেবিল (Class Routines CRUD)
// ==========================================
export const getClassRoutinesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/routines/${query ? '?' + query : ''}`);
  return res.data;
};

export const createClassRoutineSlotApi = async (payload) => {
  const res = await api.post('academics/routines/', payload);
  return res.data;
};

export const updateClassRoutineSlotApi = async (id, payload) => {
  const res = await api.patch(`academics/routines/${id}/`, payload);
  return res.data;
};

export const deleteClassRoutineSlotApi = async (id) => {
  const res = await api.delete(`academics/routines/${id}/`);
  return res.data;
};

export const getMyScheduleApi = async () => {
  const res = await api.get('academics/routines/my-schedule/');
  return res.data;
};

// ==========================================
// ৩. একাডেমিক ছুটির দিন (Academic Holidays CRUD)
// ==========================================
export const getAcademicHolidaysApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/holidays/${query ? '?' + query : ''}`);
  return res.data;
};

export const createAcademicHolidayApi = async (payload) => {
  const res = await api.post('academics/holidays/', payload);
  return res.data;
};

export const updateAcademicHolidayApi = async (id, payload) => {
  const res = await api.patch(`academics/holidays/${id}/`, payload);
  return res.data;
};

export const deleteAcademicHolidayApi = async (id) => {
  const res = await api.delete(`academics/holidays/${id}/`);
  return res.data;
};

// ==========================================
// ৪. সিলেবাস ও স্টাডি ফাইল (Syllabi CRUD)
// ==========================================
export const getSyllabiApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/syllabi/${query ? '?' + query : ''}`);
  return res.data;
};

export const createSyllabusApi = async (formData) => {
  const res = await api.post('academics/syllabi/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteSyllabusApi = async (id) => {
  const res = await api.delete(`academics/syllabi/${id}/`);
  return res.data;
};

// ==========================================
// ৫. হোমওয়ার্ক ও অ্যাসাইনমেন্ট (Homeworks CRUD)
// ==========================================
export const getHomeworksApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/homeworks/${query ? '?' + query : ''}`);
  return res.data;
};

export const createHomeworkApi = async (formData) => {
  const res = await api.post('academics/homeworks/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteHomeworkApi = async (id) => {
  const res = await api.delete(`academics/homeworks/${id}/`);
  return res.data;
};

// ==========================================
// ৬. সিলেবাস অগ্রগতি ও কাভারেজ (Syllabus Completion Stub)
// ==========================================
// TODO: Backend endpoint GET /api/v1/academics/syllabi/progress/ needed
export const getSyllabusCompletionApi = async (_params = {}) => {
  console.warn('[STUB] getSyllabusCompletionApi called. Backend endpoint required.');
  return {
    success: true,
    data: [],
    message: 'সিলেবাস অগ্রগতি ট্র্যাকিংয়ের জন্য ব্যাকএন্ডে সিলেবাস চ্যাপ্টার/টপিক মডেল প্রয়োজন।',
  };
};
