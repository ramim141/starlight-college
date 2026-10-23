import api from './client';

// ==========================================
// ০. স্টাফ ও শিক্ষক তালিকা (Staff & Teachers)
// ==========================================
export const getStaffListApi = async () => {
  const res = await api.get('auth/staff/');
  return res.data;
};

// ==========================================
// ১. গোপন অভিযোগ ও পরামর্শ (Student Complaints)
// ==========================================
export const getStudentComplaintsApi = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await api.get(`operations/complaints/${query}`);
  return res.data;
};

export const resolveStudentComplaintApi = async (id, status, remarks = '') => {
  const res = await api.patch(`operations/complaints/${id}/resolve/`, { status, remarks });
  return res.data;
};

// ==========================================
// ২. শিক্ষার্থী ও শিক্ষক ছুটি (Leave Management)
// ==========================================
export const getStudentLeavesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/leaves/${query ? '?' + query : ''}`);
  return res.data;
};

export const reviewStudentLeaveApi = async (id, status, remarks = '', forceApprove = false) => {
  const res = await api.patch(`operations/leaves/${id}/principal-review/`, {
    status,
    remarks,
    force_approve: forceApprove,
  });
  return res.data;
};

export const getTeacherLeavesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/teacher-leaves/${query ? '?' + query : ''}`);
  return res.data;
};

export const reviewTeacherLeaveApi = async (id, status, remarks = '') => {
  const res = await api.patch(`operations/teacher-leaves/${id}/review-leave/`, { status, remarks });
  return res.data;
};

// ==========================================
// ৩. অর্থায়ন, জরিমানা মওকুফ ও পে-রোল (Finance Hub)
// ==========================================
export const getFinancialBalanceSheetApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/analytics/balance-sheet/${query ? '?' + query : ''}`);
  return res.data;
};

export const getFineWaiverApplicationsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/waivers/${query ? '?' + query : ''}`);
  return res.data;
};

export const reviewFineWaiverApi = async (id, status, approvedAmount = 0, remarks = '') => {
  const res = await api.patch(`finance/waivers/${id}/principal-approval/`, {
    status,
    approved_waiver_amount: approvedAmount,
    remarks,
  });
  return res.data;
};

export const getTeacherPayrollsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/payrolls/${query ? '?' + query : ''}`);
  return res.data;
};

export const generateBulkPayrollApi = async (month, year) => {
  const res = await api.post('finance/payrolls/bulk-generate/', { month, year });
  return res.data;
};

export const approveTeacherPayrollApi = async (id) => {
  const res = await api.patch(`finance/payrolls/${id}/approve/`);
  return res.data;
};

export const getTeacherSalaryClaimsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/salary-claims/${query ? '?' + query : ''}`);
  return res.data;
};

export const reviewSalaryClaimApi = async (id, status, remarks = '') => {
  const res = await api.patch(`finance/salary-claims/${id}/principal-review/`, { status, remarks });
  return res.data;
};

export const getMasterDefaultersApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/analytics/defaulters/${query ? '?' + query : ''}`);
  return res.data;
};

export const getBankDepositsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/bank-deposits/${query ? '?' + query : ''}`);
  return res.data;
};

export const getSuppliersApi = async () => {
  const res = await api.get('finance/suppliers/');
  return res.data;
};

export const getSupplierPurchasesApi = async () => {
  const res = await api.get('finance/supplier-purchases/');
  return res.data;
};

// ==========================================
// ৪. যানবাহন ও রুট ফ্লিট (Transport Management)
// ==========================================
export const getVehiclesApi = async () => {
  const res = await api.get('finance/vehicles/');
  return res.data;
};

export const createVehicleApi = async (payload) => {
  const res = await api.post('finance/vehicles/', payload);
  return res.data;
};

export const updateVehicleApi = async (id, payload) => {
  const res = await api.patch(`finance/vehicles/${id}/`, payload);
  return res.data;
};

export const deleteVehicleApi = async (id) => {
  const res = await api.delete(`finance/vehicles/${id}/`);
  return res.data;
};

export const triggerVehicleBreakdownApi = async (vehicleId, payload) => {
  const res = await api.post(`finance/vehicles/${vehicleId}/emergency-breakdown/`, payload);
  return res.data;
};

export const getVehicleDailyLogsApi = async (vehicleId = '') => {
  const query = vehicleId ? `?vehicle=${vehicleId}` : '';
  const res = await api.get(`finance/vehicle-logs/${query}`);
  return res.data;
};

export const getVehicleMonthlyBillsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`finance/vehicle-bills/${query ? '?' + query : ''}`);
  return res.data;
};

// ==========================================
// ৫. সম্পদ ও মার্কার ইনভেন্টরি (Campus Inventory)
// ==========================================
export const getCollegeAssetsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/assets/${query ? '?' + query : ''}`);
  return res.data;
};

export const createCollegeAssetApi = async (payload) => {
  const res = await api.post('operations/assets/', payload);
  return res.data;
};

export const updateCollegeAssetApi = async (id, payload) => {
  const res = await api.patch(`operations/assets/${id}/`, payload);
  return res.data;
};

export const deleteCollegeAssetApi = async (id) => {
  const res = await api.delete(`operations/assets/${id}/`);
  return res.data;
};

export const getAssetCategoriesApi = async () => {
  const res = await api.get('operations/asset-categories/');
  return res.data;
};

export const createAssetCategoryApi = async (payload) => {
  const res = await api.post('operations/asset-categories/', payload);
  return res.data;
};

export const getMarkerStocksApi = async () => {
  const res = await api.get('operations/marker-stocks/');
  return res.data;
};

export const updateMarkerStockApi = async (id, payload) => {
  const res = await api.patch(`operations/marker-stocks/${id}/`, payload);
  return res.data;
};

export const getMarkerRequestsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/markers/${query ? '?' + query : ''}`);
  return res.data;
};

export const issueMarkerToTeacherApi = async (id, remarks = '') => {
  const res = await api.patch(`operations/markers/${id}/issue/`, { remarks });
  return res.data;
};

export const getMarkerMonthlyUsageApi = async (month, year) => {
  const res = await api.get(`operations/markers/monthly-usage/?month=${month}&year=${year}`);
  return res.data;
};

// ==========================================
// ৬. ক্লাব, ইভেন্ট ও অ্যালুমনি (Clubs & Alumni)
// ==========================================
export const getClubsApi = async () => {
  const res = await api.get('operations/clubs/');
  return res.data;
};

export const createClubApi = async (payload) => {
  const res = await api.post('operations/clubs/', payload);
  return res.data;
};

export const updateClubApi = async (id, payload) => {
  const res = await api.patch(`operations/clubs/${id}/`, payload);
  return res.data;
};

export const getClubEventsApi = async (clubId = '') => {
  const query = clubId ? `?club=${clubId}` : '';
  const res = await api.get(`operations/club-events/${query}`);
  return res.data;
};

export const createClubEventApi = async (payload) => {
  const res = await api.post('operations/club-events/', payload);
  return res.data;
};

export const getAlumniRecordsApi = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await api.get(`operations/alumni/${query}`);
  return res.data;
};

export const verifyAlumniRecordApi = async (id, status, rejectionReason = '') => {
  const res = await api.patch(`operations/alumni/${id}/verify/`, {
    status,
    rejection_reason: rejectionReason,
  });
  return res.data;
};

// ==========================================
// ৭. লাইব্রেরি ওভারসাইট (Central Library)
// ==========================================
export const getLibraryBooksApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`library/books/${query ? '?' + query : ''}`);
  return res.data;
};

export const createLibraryBookApi = async (payload) => {
  const res = await api.post('library/books/', payload);
  return res.data;
};

export const updateLibraryBookApi = async (id, payload) => {
  const res = await api.patch(`library/books/${id}/`, payload);
  return res.data;
};

export const getLibraryCategoriesApi = async () => {
  const res = await api.get('library/categories/');
  return res.data;
};

export const getLibraryBorrowRequestsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`library/borrow/${query ? '?' + query : ''}`);
  return res.data;
};

// ==========================================
// ৮. পরীক্ষা ও প্রশ্নপত্র হাব (Examination Hub)
// ==========================================
export const getExamsListApi = async () => {
  const res = await api.get('examination/exams/');
  return res.data;
};

export const createExamApi = async (payload) => {
  const res = await api.post('examination/exams/', payload);
  return res.data;
};

export const updateExamApi = async (id, payload) => {
  const res = await api.patch(`examination/exams/${id}/`, payload);
  return res.data;
};

export const deleteExamApi = async (id) => {
  const res = await api.delete(`examination/exams/${id}/`);
  return res.data;
};

export const getExamSubjectConfigsApi = async (examId) => {
  const res = await api.get(`examination/configs/?exam=${examId}`);
  return res.data;
};

export const createExamSubjectConfigApi = async (payload) => {
  const res = await api.post('examination/configs/', payload);
  return res.data;
};

export const updateExamSubjectConfigApi = async (id, payload) => {
  const res = await api.patch(`examination/configs/${id}/`, payload);
  return res.data;
};

export const deleteExamSubjectConfigApi = async (id) => {
  const res = await api.delete(`examination/configs/${id}/`);
  return res.data;
};

export const getExamRoomsApi = async () => {
  const res = await api.get('examination/rooms/');
  return res.data;
};

export const createExamRoomApi = async (payload) => {
  const res = await api.post('examination/rooms/', payload);
  return res.data;
};

export const updateExamRoomApi = async (id, payload) => {
  const res = await api.patch(`examination/rooms/${id}/`, payload);
  return res.data;
};

export const deleteExamRoomApi = async (id) => {
  const res = await api.delete(`examination/rooms/${id}/`);
  return res.data;
};

export const getQuestionPaperSubmissionsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`examination/questions/${query ? '?' + query : ''}`);
  return res.data;
};

export const reviewQuestionPaperApi = async (id, status, feedback = '') => {
  try {
    const res = await api.patch(`examination/questions/${id}/review/`, { status, feedback });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      // Fallback to direct PATCH on question paper instance
      const res = await api.patch(`examination/questions/${id}/`, { 
        status, 
        principal_remarks: feedback 
      });
      return res.data;
    }
    throw err;
  }
};

export const processExamResultsApi = async (examId, sectionId = null) => {
  const payload = { exam_id: examId };
  if (sectionId) payload.section_id = sectionId;
  const res = await api.post('examination/results/process/', payload);
  return res.data;
};

export const getExamResultsApi = async (examId) => {
  const res = await api.get(`examination/results/?exam=${examId}`);
  return res.data;
};

// ==========================================
// ৯. স্টাফ অ্যাকাউন্ট পরিচালনা (Staff Actions)
// ==========================================
export const createStaffApi = async (payload) => {
  const res = await api.post('auth/staff/', payload);
  return res.data;
};

export const updateStaffProfileApi = async (id, payload) => {
  const res = await api.patch(`auth/staff/${id}/`, payload);
  return res.data;
};

export const deactivateStaffApi = async (id) => {
  const res = await api.delete(`auth/staff/${id}/`);
  return res.data;
};

export const reactivateStaffApi = async (id) => {
  const res = await api.patch(`auth/staff/${id}/`, { is_active: true });
  return res.data;
};

// TODO: Backend endpoint POST /api/v1/auth/staff/<id>/reset-password/ needed
export const resetStaffPasswordApi = async (id, _newPassword = '') => {
  // Backend stub
  console.warn(`[STUB] resetStaffPasswordApi called for ${id}. Backend endpoint required.`);
  return { success: true, message: 'পাসওয়ার্ড রিসেটের নির্দেশ backend এ রেজিস্টার করা হয়েছে (Stub)' };
};

// TODO: Backend endpoint POST /api/v1/academics/students/<id>/reset-pin/ needed
export const resetStudentPinApi = async (id) => {
  // Backend stub
  console.warn(`[STUB] resetStudentPinApi called for ${id}. Backend endpoint required.`);
  return { success: true, message: 'স্টুডেন্ট পিন রিসেট নির্দেশ backend এ রেজিস্টার করা হয়েছে (Stub)' };
};

// ==========================================
// ১০. দৈনিক ক্যাশ ক্লোজিং অডিট (Daily Closing Sheet)
// ==========================================
export const getDailyCashClosingApi = async (date = '') => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`finance/analytics/daily-closing/${query}`);
  return res.data;
};

// ==========================================
// ১১. শিক্ষার্থীদের সামগ্রিক উপস্থিতি সারাংশ (Live Attendance)
// ==========================================
export const getTodayAttendanceSummaryApi = async (date = '') => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`academics/attendance/${query}`);
  return res.data;
};

// ==========================================
// ১২. একাডেমিক শাখা ও শ্রেণি ইনচার্জ (Sections & In-charge)
// ==========================================
export const getSectionsListApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`academics/sections/${query ? '?' + query : ''}`);
  return res.data;
};

export const createSectionApi = async (payload) => {
  const res = await api.post('academics/sections/', payload);
  return res.data;
};

export const updateSectionApi = async (id, payload) => {
  const res = await api.patch(`academics/sections/${id}/`, payload);
  return res.data;
};

export const assignSectionInchargeApi = async (id, teacherId) => {
  const res = await api.patch(`academics/sections/${id}/assign-incharge/`, {
    teacher_id: teacherId
  });
  return res.data;
};

// ==========================================
// ১৩. ফলাফল, মেধা তালিকা ও মার্কশিট (Reports)
// ==========================================
export const getMeritListApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`examination/reports/merit-list/${query ? '?' + query : ''}`);
  return res.data;
};

export const getSubjectAnalysisApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`examination/reports/subject-analysis/${query ? '?' + query : ''}`);
  return res.data;
};

export const getFailedStatisticsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`examination/reports/failed-statistics/${query ? '?' + query : ''}`);
  return res.data;
};

export const getStudentProgressReportApi = async (examId, studentId) => {
  const res = await api.get(`examination/reports/progress-report/?exam=${examId}&student=${studentId}`);
  return res.data;
};

export const getSectionMarkSheetAuditApi = async (examId, subjectId, sectionId) => {
  const res = await api.get(`examination/marks/mark-sheet/?exam=${examId}&subject=${subjectId}&section=${sectionId}`);
  return res.data;
};

export const getSectionFeeDuesAuditApi = async (sectionId) => {
  const res = await api.get(`finance/invoices/?section=${sectionId}&status=UNPAID`);
  return res.data;
};

// ==========================================
// ১৪. শিক্ষক হাজিরা ও দৈনিক ভেরিফিকেশন (Teacher Attendance)
// ==========================================
export const getTeacherAttendanceListApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`operations/teacher-attendance/${query ? '?' + query : ''}`);
  return res.data;
};

export const verifyTeacherAttendanceApi = async (id, approvalStatus, remarks = '') => {
  const res = await api.patch(`operations/teacher-attendance/${id}/verify/`, {
    approval_status: approvalStatus,
    remarks,
  });
  return res.data;
};


