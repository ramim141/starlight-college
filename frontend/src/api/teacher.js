import api from './client';

// শিক্ষকের আজকের ক্লাস শিডিউল
export const getMyScheduleApi = async () => {
  const res = await api.get('academics/routines/my-schedule/');
  return res.data;
};

// ডিজিটাল চেক-ইন ও চেক-আউট
export const teacherCheckInApi = async (remarks = '') => {
  const res = await api.post('operations/teacher-attendance/check-in/', { remarks });
  return res.data;
};

export const teacherCheckOutApi = async () => {
  const res = await api.post('operations/teacher-attendance/check-out/');
  return res.data;
};

// শিক্ষকের আজকের হাজিরা রেকর্ড
export const getTeacherAttendanceTodayApi = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const res = await api.get(`operations/teacher-attendance/?date=${today}`);
  return res.data;
};

// শিক্ষকের মোট হাজিরা হিস্ট্রি
export const getTeacherAttendanceHistoryApi = async () => {
  const res = await api.get('operations/teacher-attendance/');
  return res.data;
};

// শিক্ষক সহকর্মী তালিকা (প্রক্সি শিক্ষক সিলেক্ট করার জন্য)
export const getTeacherStaffListApi = async () => {
  try {
    const res = await api.get('auth/staff/?role=TEACHER');
    return res.data;
  } catch {
    return { results: [] };
  }
};

// শিক্ষকের ছুটির আবেদন ও রেকর্ড
export const getMyLeavesApi = async () => {
  const res = await api.get('operations/teacher-leaves/');
  return res.data;
};

export const applyTeacherLeaveApi = async (payload) => {
  const res = await api.post('operations/teacher-leaves/', payload);
  return res.data;
};

// প্রক্সি ক্লাসের ডিউটি (সহকর্মীর পরিবর্তে ক্লাস নেওয়া)
export const getMyProxyClassesApi = async () => {
  const res = await api.get('operations/teacher-leaves/my-proxy-classes/');
  return res.data;
};

// মার্কার রিকুইজিশন ও স্টক
export const getMyMarkersApi = async () => {
  const res = await api.get('operations/markers/');
  return res.data;
};

export const requestMarkerApi = async (payload) => {
  const res = await api.post('operations/markers/', payload);
  return res.data;
};

export const acknowledgeMarkerApi = async (markerId) => {
  const res = await api.patch(`operations/markers/${markerId}/acknowledge/`);
  return res.data;
};

// মার্কস এন্ট্রির জন্য সেকশন ও বিষয় তালিকা
export const getSectionsApi = async () => {
  const res = await api.get('academics/sections/');
  return res.data;
};

export const getSubjectsApi = async () => {
  const res = await api.get('academics/subjects/');
  return res.data;
};

// ব্ল্যাঙ্ক মার্কশিট লোড
export const getMarkSheetApi = async (examId, subjectId, sectionId) => {
  const res = await api.get(`examination/marks/mark-sheet/?exam=${examId}&subject=${subjectId}&section=${sectionId}`);
  return res.data;
};

// এক ক্লিকে বাল্ক মার্কস সেভ
export const saveBulkMarksApi = async (payload) => {
  const res = await api.post('examination/marks/bulk-save/', payload);
  return res.data;
};

// শ্রেণি ইনচার্জের জন্য: আজকের হাজিরা শিট লোড
export const getSectionAttendanceSheetApi = async (sectionId, date) => {
  const res = await api.get(`academics/attendance/section-sheet/?section=${sectionId}&date=${date}`);
  return res.data;
};

// শ্রেণি ইনচার্জের জন্য: বাল্ক হাজিরা সাবমিট
export const submitBulkAttendanceApi = async (payload) => {
  const res = await api.post('academics/attendance/bulk-mark/', payload);
  return res.data;
};

// শ্রেণি ইনচার্জের জন্য: At-Risk ওয়াচলিস্ট
export const getAtRiskStudentsApi = async (sectionId = '') => {
  const query = sectionId ? `?section=${sectionId}` : '';
  const res = await api.get(`academics/students/at-risk-tracker/${query}`);
  return res.data;
};

// শ্রেণি ইনচার্জের জন্য: শিক্ষার্থীদের ছুটির সুপারিশ
export const getTeacherSectionLeavesApi = async () => {
  const res = await api.get('operations/leaves/');
  return res.data;
};

export const recommendStudentLeaveApi = async (leaveId, payload) => {
  const res = await api.patch(`operations/leaves/${leaveId}/incharge-review/`, payload);
  return res.data;
};

// শ্রেণি ইনচার্জের জন্য: অভিভাবক কল ডায়েরি
export const getParentCallsApi = async () => {
  const res = await api.get('operations/parent-calls/');
  return res.data;
};

export const logParentCallApi = async (payload) => {
  const res = await api.post('operations/parent-calls/', payload);
  return res.data;
};

// পরীক্ষার হল গার্ড / ইনভিজিলেশন ডিউটি
export const getMyInvigilationsApi = async () => {
  const res = await api.get('examination/invigilations/');
  return res.data;
};

// প্রশ্নপত্র আপলোড ও রেকর্ড
export const getMyQuestionPapersApi = async () => {
  const res = await api.get('examination/questions/');
  return res.data;
};

export const submitQuestionPaperApi = async (formData) => {
  const res = await api.post('examination/questions/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// শিক্ষকের বেতন স্লিপ
export const getMyPayrollsApi = async () => {
  const res = await api.get('finance/payrolls/');
  return res.data;
};

// শিক্ষকের খাতা দেখা ও পরীক্ষার ভাতা ক্লেইম
export const getMySalaryClaimsApi = async () => {
  const res = await api.get('finance/salary-claims/');
  return res.data;
};

export const submitSalaryClaimApi = async (payload) => {
  const res = await api.post('finance/salary-claims/', payload);
  return res.data;
};

// কলেজ নোটিশ ও সার্কুলার
export const getTeacherNoticesApi = async () => {
  const res = await api.get('operations/notices/');
  return res.data;
};