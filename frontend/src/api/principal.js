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

export const getExamSubjectConfigsApi = async (examId) => {
  const res = await api.get(`examination/configs/?exam=${examId}`);
  return res.data;
};

export const createExamSubjectConfigApi = async (payload) => {
  const res = await api.post('examination/configs/', payload);
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

export const getQuestionPaperSubmissionsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`examination/questions/${query ? '?' + query : ''}`);
  return res.data;
};

export const reviewQuestionPaperApi = async (id, status, feedback = '') => {
  const res = await api.patch(`examination/questions/${id}/review/`, { status, feedback });
  return res.data;
};
