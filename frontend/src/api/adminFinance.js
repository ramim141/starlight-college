import api from './client';

// === প্রিন্সিপাল এপিআই ===
export const getBalanceSheetApi = async (month = '', year = '') => {
  const query = month && year ? `?month=${month}&year=${year}` : '';
  const res = await api.get(`finance/analytics/balance-sheet/${query}`);
  return res.data;
};

export const getSystemAuditLogsApi = async () => {
  const res = await api.get('system/audit-logs/');
  return res.data;
};

export const getComplaintsApi = async () => {
  const res = await api.get('operations/complaints/');
  return res.data;
};

export const resolveComplaintApi = async (id, status, remarks = '') => {
  const res = await api.patch(`operations/complaints/${id}/resolve/`, { status, remarks });
  return res.data;
};

export const processExamResultsApi = async (examId) => {
  const res = await api.post('examination/results/process/', { exam_id: examId });
  return res.data;
};

// === অ্যাকাউন্ট্যান্ট এপিআই ===
export const getStudentInvoicesForPaymentApi = async (searchQuery = '') => {
  const res = await api.get(`finance/invoices/?status=UNPAID`);
  return res.data;
};

export const collectInvoicePaymentApi = async (invoiceId, payload) => {
  const res = await api.post(`finance/invoices/${invoiceId}/collect-payment/`, payload);
  return res.data;
};

export const getCashHandoversApi = async () => {
  const res = await api.get('finance/cash-handovers/');
  return res.data;
};

export const verifyCashHandoverApi = async (id, notes = '') => {
  const res = await api.patch(`finance/cash-handovers/${id}/verify-cash/`, { notes });
  return res.data;
};

export const getDailyCashClosingApi = async (date = '') => {
  const query = date ? `?date=${date}` : '';
  const res = await api.get(`finance/analytics/daily-closing/${query}`);
  return res.data;
};

export const getExpensesListApi = async () => {
  const res = await api.get('finance/expenses/');
  return res.data;
};

export const recordExpenseApi = async (payload) => {
  const res = await api.post('finance/expenses/', payload);
  return res.data;
};

export const createExpenseApi = recordExpenseApi;

export const verifyExpenseApi = async (id, status, rejection_reason = '') => {
  const res = await api.patch(`finance/expenses/${id}/verify/`, { status, rejection_reason });
  return res.data;
};

export const getExpenseCategoriesApi = async () => {
  const res = await api.get('finance/categories/');
  return res.data;
};