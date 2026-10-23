import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getFinancialBalanceSheetApi, 
  getFineWaiverApplicationsApi, 
  reviewFineWaiverApi, 
  getTeacherPayrollsApi, 
  generateBulkPayrollApi, 
  approveTeacherPayrollApi, 
  getTeacherSalaryClaimsApi, 
  reviewSalaryClaimApi, 
  getMasterDefaultersApi,
  getBankDepositsApi,
  getSuppliersApi
} from '../../api/principal';
import { getExpensesListApi, verifyExpenseApi, createExpenseApi } from '../../api/adminFinance';
import api from '../../api/client';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  Building2, 
  AlertTriangle, 
  Plus, 
  Search,
  ExternalLink,
  Percent,
  Send,
  Download,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * FinancialHub - বহু-ব্যবহারযোগ্য (Reusable) অর্থায়ন, ক্যাশ, ভাউচার ও পে-রোল ম্যানেজমেন্ট হাব
 * অধ্যক্ষ (Principal), হিসাবরক্ষক (Accountant), এবং শিক্ষক (Teacher) উভয়ের পোর্টাল থেকেই ব্যবহারযোগ্য।
 */
const FinancialHub = ({ 
  overrideRole = null, 
  defaultTab = null,
  allowedTabs = null 
}) => {
  const { user, isPrincipal: authIsPrincipal, isTeacher: authIsTeacher, role: authRole } = useAuth();

  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isAccountant = overrideRole ? overrideRole === 'ACCOUNTANT' : (authRole === 'ACCOUNTANT' || authRole === 'STAFF');
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;

  // কোন কোন ট্যাব দেখানো হবে
  const availableTabs = allowedTabs || (() => {
    if (isTeacher && !isPrincipal && !isAccountant) {
      return ['my_payroll', 'my_claims'];
    }
    if (isAccountant && !isPrincipal) {
      return ['balance', 'expenses', 'waivers', 'payroll', 'defaulters', 'bank'];
    }
    // Default Principal
    return ['balance', 'expenses', 'waivers', 'payroll', 'defaulters', 'bank'];
  })();

  const initialTab = defaultTab && availableTabs.includes(defaultTab) 
    ? defaultTab 
    : availableTabs[0] || 'balance';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // ১. ব্যালেন্স শিট ডেটা
  const [balanceData, setBalanceData] = useState(null);

  // ২. খরচের ভাউচার
  const [expenses, setExpenses] = useState([]);
  const [rejectModalVoucher, setRejectModalVoucher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseForm, setNewExpenseForm] = useState({
    title: '',
    category: '',
    amount: '',
    description: '',
    voucher_no: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  // ৩. জরিমানা মওকুফ
  const [waivers, setWaivers] = useState([]);
  const [selectedWaiver, setSelectedWaiver] = useState(null);
  const [approvedWaiverAmount, setApprovedWaiverAmount] = useState('');
  const [waiverRemarks, setWaiverRemarks] = useState('');

  // ৪. পে-রোল ও ক্লেইম
  const [payrolls, setPayrolls] = useState([]);
  const [claims, setClaims] = useState([]);
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [generatingBulk, setGeneratingBulk] = useState(false);

  // শিক্ষক ব্যক্তিগত ক্লেইম আবেদন
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    requested_amount: '',
    reason: ''
  });

  // ৫. বকেয়া তালিকা
  const [defaulters, setDefaulters] = useState([]);
  const [defaulterSearch, setDefaulterSearch] = useState('');

  // ৬. ব্যাংক ও সরবরাহকারী
  const [bankDeposits, setBankDeposits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [newDepositForm, setNewDepositForm] = useState({
    bank_name: '',
    account_number: '',
    deposit_slip_number: '',
    amount: ''
  });

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'balance') {
        const res = await getFinancialBalanceSheetApi();
        if (res.success) setBalanceData(res);
      } else if (activeTab === 'expenses') {
        const res = await getExpensesListApi();
        const list = res.results || res;
        setExpenses(Array.isArray(list) ? list : []);
      } else if (activeTab === 'waivers') {
        const res = await getFineWaiverApplicationsApi();
        const list = res.results || res;
        setWaivers(Array.isArray(list) ? list : []);
      } else if (activeTab === 'payroll' || activeTab === 'my_payroll' || activeTab === 'my_claims') {
        const [payRes, claimRes] = await Promise.allSettled([
          getTeacherPayrollsApi(),
          getTeacherSalaryClaimsApi()
        ]);
        if (payRes.status === 'fulfilled') {
          const pList = payRes.value.results || payRes.value;
          setPayrolls(Array.isArray(pList) ? pList : []);
        }
        if (claimRes.status === 'fulfilled') {
          const cList = claimRes.value.results || claimRes.value;
          setClaims(Array.isArray(cList) ? cList : []);
        }
      } else if (activeTab === 'defaulters') {
        const res = await getMasterDefaultersApi();
        const list = res.defaulters || res.results || res;
        setDefaulters(Array.isArray(list) ? list : []);
      } else if (activeTab === 'bank') {
        const [bankRes, suppRes] = await Promise.allSettled([
          getBankDepositsApi(),
          getSuppliersApi()
        ]);
        if (bankRes.status === 'fulfilled') {
          const bList = bankRes.value.results || bankRes.value;
          setBankDeposits(Array.isArray(bList) ? bList : []);
        }
        if (suppRes.status === 'fulfilled') {
          const sList = suppRes.value.results || suppRes.value;
          setSuppliers(Array.isArray(sList) ? sList : []);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  // ভাউচার অনুমোদন ও রিজেক্ট
  const handleVerifyVoucher = async (id, status, reason = '') => {
    try {
      const res = await verifyExpenseApi(id, status, reason);
      if (res.success) {
        toast.success(res.message);
        setRejectModalVoucher(null);
        setRejectionReason('');
        fetchTabData();
      }
    } catch (err) {
      toast.error('ভাউচার অ্যাকশন ব্যর্থ হয়েছে');
    }
  };

  // নতুন ভাউচার জমা (হিসাবরক্ষক বা এডমিন)
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newExpenseForm,
        amount: parseFloat(newExpenseForm.amount)
      };
      if (createExpenseApi) {
        await createExpenseApi(payload);
      } else {
        await api.post('finance/expenses/', payload);
      }
      toast.success('খরচের ভাউচার সফলভাবে তৈরি হয়েছে');
      setShowAddExpenseModal(false);
      setNewExpenseForm({
        title: '',
        category: '',
        amount: '',
        description: '',
        voucher_no: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      fetchTabData();
    } catch (err) {
      toast.error('ভাউচার তৈরি করা যায়নি');
    }
  };

  // ব্যাংক জমা সাবমিট
  const handleCreateDeposit = async (e) => {
    e.preventDefault();
    try {
      await api.post('finance/bank-deposits/', {
        ...newDepositForm,
        amount: parseFloat(newDepositForm.amount)
      });
      toast.success('ব্যাংক জমা রেকর্ড সফল হয়েছে');
      setShowAddDepositModal(false);
      setNewDepositForm({ bank_name: '', account_number: '', deposit_slip_number: '', amount: '' });
      fetchTabData();
    } catch (err) {
      toast.error('ব্যাংক জমা রেকর্ড সংরক্ষণ করা যায়নি');
    }
  };

  // জরিমানা মওকুফ চূড়ান্ত অনুমোদন
  const handleWaiverSubmit = async (status) => {
    try {
      const amount = status === 'APPROVED' ? parseFloat(approvedWaiverAmount) || 0 : 0;
      const res = await reviewFineWaiverApi(selectedWaiver.id, status, amount, waiverRemarks);
      if (res.success) {
        toast.success(res.message);
        setSelectedWaiver(null);
        setApprovedWaiverAmount('');
        setWaiverRemarks('');
        fetchTabData();
      }
    } catch (err) {
      toast.error('মওকুফ সিদ্ধান্ত সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  // বাল্ক পে-রোল তৈরি
  const handleGenerateBulkPayroll = async () => {
    setGeneratingBulk(true);
    try {
      const res = await generateBulkPayrollApi(bulkMonth, bulkYear);
      if (res.success) {
        toast.success(res.message);
        fetchTabData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'পে-রোল তৈরি ব্যর্থ হয়েছে');
    } finally {
      setGeneratingBulk(false);
    }
  };

  // পে-রোল অনুমোদন
  const handleApprovePayroll = async (id) => {
    try {
      const res = await approveTeacherPayrollApi(id);
      if (res.success) {
        toast.success(res.message);
        fetchTabData();
      }
    } catch (err) {
      toast.error('পে-রোল অনুমোদন ব্যর্থ হয়েছে');
    }
  };

  // স্যালারি ক্লেইম অনুমোদন
  const handleReviewClaim = async (id, status) => {
    try {
      const res = await reviewSalaryClaimApi(id, status, 'কর্তৃপক্ষ কর্তৃক পর্যালোচনা সম্পন্ন');
      if (res.success) {
        toast.success(res.message);
        fetchTabData();
      }
    } catch (err) {
      toast.error('ক্লেইম রিভিউ ব্যর্থ হয়েছে');
    }
  };

  // শিক্ষকের ব্যক্তিগত ক্লেইম আবেদন
  const handleTeacherSubmitClaim = async (e) => {
    e.preventDefault();
    try {
      await api.post('finance/teacher-salary-claims/', {
        requested_amount: parseFloat(claimForm.requested_amount),
        reason: claimForm.reason
      });
      toast.success('বেতন সমন্বয় বা বিশেষ ভাতার ক্লেইম সফলভাবে জমা হয়েছে');
      setShowClaimModal(false);
      setClaimForm({ requested_amount: '', reason: '' });
      fetchTabData();
    } catch (err) {
      toast.error('ক্লেইম আবেদন জমা দেওয়া যায়নি');
    }
  };

  // ট্যাবের কনফিগ
  const tabConfigs = [
    { id: 'balance', label: 'ব্যালেন্স শিট', icon: TrendingUp },
    { id: 'expenses', label: 'ভাউচার অডিট ও খরচ', icon: FileText },
    { id: 'waivers', label: 'জরিমানা মওকুফ', icon: Percent },
    { id: 'payroll', label: 'শিক্ষক পে-রোল', icon: Users },
    { id: 'defaulters', label: 'মাস্টার বকেয়া খতিয়ান', icon: AlertTriangle },
    { id: 'bank', label: 'ব্যাংক ও ভেন্ডর লেজার', icon: Building2 },
    { id: 'my_payroll', label: 'আমার বেতন বিবরণী', icon: Briefcase },
    { id: 'my_claims', label: 'আমার ভাতা ক্লেইম', icon: Send },
  ].filter(tab => availableTabs.includes(tab.id));

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isTeacher && !isPrincipal && !isAccountant 
                ? 'শিক্ষক বেতন ও আর্থিক সেবা হাব' 
                : 'অর্থায়ন, ক্যাশ ও অডিট কমান্ড সেন্টার'}
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              {isTeacher && !isPrincipal && !isAccountant
                ? 'মাসিক বেতন স্লিপ, এলাউন্স ও স্পেশাল ক্লেইম সাবমিট করুন'
                : 'ব্যালেন্স শিট, ভাউচার অডিট, জরিমানা মওকুফ, শিক্ষক পে-রোল ও মাস্টার বকেয়া খতিয়ান'}
            </p>
          </div>
        </div>

        {/* ট্যাব নেভিগেশন */}
        <div className="flex flex-wrap items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10 gap-1">
          {tabConfigs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-brand-orange text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* ================= ১. ব্যালেন্স শিট ও আর্থিক অ্যানালিটিক্স ================= */}
          {activeTab === 'balance' && (
            <div data-tab-panel="true" className="space-y-6">
              {/* মেট্রিক কার্ডস */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>মোট নগদ আদায়</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                    ৳ {balanceData?.summary?.total_collected?.toLocaleString('en-IN') || '0'}
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">শিক্ষার্থী ফি ও কাউন্টার আদায়</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>অনুমোদিত মোট খরচ</span>
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                    ৳ {balanceData?.summary?.total_expense?.toLocaleString('en-IN') || '0'}
                  </div>
                  <p className="text-xs text-rose-500 mt-1">ভাউচার অনুমোদিত প্রাতিষ্ঠানিক ব্যয়</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>নিট স্থিতি (Net Balance)</span>
                    <DollarSign className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-blue-600 dark:text-blue-400">
                    ৳ {balanceData?.summary?.net_balance?.toLocaleString('en-IN') || '0'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">আদায় মাইনাস মোট খরচ</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>মোট বকেয়া পাওনা</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                    ৳ {balanceData?.summary?.total_due_receivable?.toLocaleString('en-IN') || '0'}
                  </div>
                  <p className="text-xs text-amber-600 mt-1">শিক্ষার্থীদের অপরিশোধিত ইনভয়েস</p>
                </div>
              </div>

              {/* ক্যাটাগরিভিত্তিক খরচ ও কালেকশন মেথড ব্রেকডাউন */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-orange" />
                    খাত অনুযায়ী খরচ বিবরণী (Expense Breakdown)
                  </h3>
                  <div className="space-y-3">
                    {balanceData?.expense_breakdown?.length === 0 ? (
                      <p className="text-sm text-slate-400">কোনো খরচের রেকর্ড নেই।</p>
                    ) : (
                      balanceData?.expense_breakdown?.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-sm">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{cat.category}</span>
                            <span className="text-xs text-slate-400 block">{cat.voucher_count} টি অনুমোদিত ভাউচার</span>
                          </div>
                          <span className="font-black text-rose-600 dark:text-rose-400">
                            ৳ {cat.total_amount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-orange" />
                    পেমেন্ট চ্যানেল অনুযায়ী আদায় (Collection Channels)
                  </h3>
                  <div className="space-y-3">
                    {balanceData?.payment_channel_breakdown?.length === 0 ? (
                      <p className="text-sm text-slate-400">কোনো আদায়ের রেকর্ড নেই।</p>
                    ) : (
                      balanceData?.payment_channel_breakdown?.map((pm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-sm">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{pm.method}</span>
                            <span className="text-xs text-slate-400 block">{pm.transactions} টি লেনদেন</span>
                          </div>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            ৳ {pm.total_collected?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= ২. ভাউচার অডিট ও খরচ ================= */}
          {activeTab === 'expenses' && (
            <div data-tab-panel="true" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    প্রাতিষ্ঠানিক খরচের ভাউচার অডিট ({expenses.length})
                  </h3>
                  <p className="text-xs text-slate-400">হিসাবরক্ষক কর্তৃক দাখিলকৃত ও অধ্যক্ষ কর্তৃক অনুমোদিত ভাউচার</p>
                </div>
                {(isAccountant || isPrincipal) && (
                  <button
                    onClick={() => setShowAddExpenseModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    নতুন ভাউচার দাখিল
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">ভাউচার নং ও তারিখ</th>
                      <th className="py-3 px-4">খাত ও বিবরণ</th>
                      <th className="py-3 px-4">পরিমাণ</th>
                      <th className="py-3 px-4">রসিদ / স্লিপ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{exp.voucher_no}</span>
                          <span className="block text-xs text-slate-400">{exp.expense_date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{exp.category_name || exp.title}</span>
                          <span className="block text-xs text-slate-500 line-clamp-1">{exp.description}</span>
                        </td>
                        <td className="py-3 px-4 font-black text-rose-600 dark:text-rose-400">
                          ৳ {parseFloat(exp.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          {exp.receipt_image ? (
                            <a
                              href={exp.receipt_image}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              রসিদ দেখুন <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">রসিদ নেই</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {exp.status === 'APPROVED' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">অনুমোদিত</span>
                          ) : exp.status === 'REJECTED' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500">প্রত্যাখ্যাত</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">অপেক্ষমাণ</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {exp.status === 'PENDING' && isPrincipal ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerifyVoucher(exp.id, 'APPROVED')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                অনুমোদন
                              </button>
                              <button
                                onClick={() => setRejectModalVoucher(exp)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                              >
                                রিজেক্ট
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{exp.status === 'PENDING' ? 'অপেক্ষমাণ' : 'সম্পন্ন'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ৩. অনুপস্থিতির জরিমানা মওকুফ ================= */}
          {activeTab === 'waivers' && (
            <div data-tab-panel="true" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  অনুপস্থিতির জরিমানা মওকুফের আবেদন তালিকা ({waivers.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ইনচার্জ কর্তৃক সুপারিশকৃত আবেদনের ওপর ভিত্তি করে অধ্যক্ষ কর্তৃক ছাড়ের পরিমাণ নির্ধারণ
                </p>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {waivers.map((waiver) => (
                  <div key={waiver.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{waiver.student_name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {waiver.student_roll}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        মোট আরোপিত জরিমানা: <strong>৳ {waiver.total_fine_amount}</strong> | আবেদনকৃত মওকুফ: <strong>৳ {waiver.requested_waiver_amount}</strong>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                        <strong>কারণ:</strong> {waiver.reason}
                      </p>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        ইনচার্জ মন্তব্য: {waiver.incharge_remarks || 'মন্তব্য নেই'} ({waiver.incharge_status})
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {waiver.principal_status === 'APPROVED' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                          ৳ {waiver.approved_waiver_amount} মওকুফ অনুমোদিত
                        </span>
                      ) : waiver.principal_status === 'REJECTED' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs">
                          মওকুফ প্রত্যাখ্যাত
                        </span>
                      ) : isPrincipal ? (
                        <button
                          onClick={() => {
                            setSelectedWaiver(waiver);
                            setApprovedWaiverAmount(waiver.requested_waiver_amount || waiver.total_fine_amount);
                            setWaiverRemarks(waiver.principal_remarks || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs shadow-md"
                        >
                          মওকুফ পর্যালোচনা ও অনুমোদন
                        </button>
                      ) : (
                        <span className="text-xs text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-lg">
                          অধ্যক্ষের সিদ্ধান্তের অপেক্ষায়
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= ৪. শিক্ষক পে-রোল ও স্যালারি ক্লেইম ================= */}
          {activeTab === 'payroll' && (
            <div data-tab-panel="true" className="space-y-6">
              {/* বাল্ক পে-রোল তৈরি কন্ট্রোল */}
              {(isPrincipal || isAccountant) && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">মাসিক শিক্ষক পে-রোল জেনারেশন</h3>
                    <p className="text-xs text-slate-400 mt-0.5">সব শিক্ষকের বেসিক স্যালারি অনুযায়ী এক ক্লিকে পে-রোল শিট প্রস্তুত করুন</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={bulkMonth}
                      onChange={(e) => setBulkMonth(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                    >
                      {[...Array(12).keys()].map(m => (
                        <option key={m + 1} value={m + 1}>{m + 1} মাস</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={bulkYear}
                      onChange={(e) => setBulkYear(e.target.value)}
                      className="w-24 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                    />
                    <button
                      onClick={handleGenerateBulkPayroll}
                      disabled={generatingBulk}
                      className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      {generatingBulk ? 'তৈরি হচ্ছে...' : 'বাল্ক পে-রোল জেনারেট'}
                    </button>
                  </div>
                </div>
              )}

              {/* পে-রোল তালিকা */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-bold text-xs uppercase text-slate-500">পে-রোল রেকর্ডসমূহ ({payrolls.length})</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="py-3 px-4">শিক্ষকের নাম</th>
                        <th className="py-3 px-4">মাস/বছর</th>
                        <th className="py-3 px-4">মূল বেতন</th>
                        <th className="py-3 px-4">বোনাস/কর্তন</th>
                        <th className="py-3 px-4">নিট প্রদেয়</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {payrolls.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{p.teacher_name}</td>
                          <td className="py-3 px-4 text-xs font-mono">{p.month}/{p.year}</td>
                          <td className="py-3 px-4">৳ {parseFloat(p.base_salary).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-xs text-slate-500">+৳{p.bonus_allowance} / -৳{p.deductions}</td>
                          <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                            ৳ {parseFloat(p.net_payable).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {p.status === 'PENDING' && isPrincipal ? (
                              <button
                                onClick={() => handleApprovePayroll(p.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                অনুমোদন দিন
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">{p.status === 'APPROVED' ? 'অনুমোদিত' : 'অপেক্ষমাণ'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* শিক্ষকের বিশেষ স্যালারি ক্লেইম তালিকা */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase text-slate-500">শিক্ষকদের ব্যক্তিগত স্যালারি ক্লেইম ও আবেদন ({claims.length})</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="py-3 px-4">শিক্ষক</th>
                        <th className="py-3 px-4">ক্লেইমকৃত পরিমাণ</th>
                        <th className="py-3 px-4">কারণ ও বিবরণ</th>
                        <th className="py-3 px-4">স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {claims.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{c.teacher_name}</td>
                          <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                            ৳ {parseFloat(c.requested_amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">{c.reason || 'বেতন ক্লেইম'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {c.status === 'PENDING' && isPrincipal ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleReviewClaim(c.id, 'APPROVED_BY_PRINCIPAL')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                >
                                  অনুমোদন
                                </button>
                                <button
                                  onClick={() => handleReviewClaim(c.id, 'REJECTED')}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                                >
                                  রিজেক্ট
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">{c.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= ৫. মাস্টার বকেয়া তালিকা ================= */}
          {activeTab === 'defaulters' && (
            <div data-tab-panel="true" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    পুরো কলেজের মাস্টার বকেয়া তালিকা ({defaulters.length} জন)
                  </h3>
                  <p className="text-xs text-slate-400">ফি অপরিশোধিত শিক্ষার্থীদের সম্পূর্ণ তালিকা</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
                    value={defaulterSearch}
                    onChange={(e) => setDefaulterSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium w-64 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4">শিক্ষার্থীর আইডি ও নাম</th>
                      <th className="py-3 px-4">শ্রেণি ও শাখা</th>
                      <th className="py-3 px-4">বকেয়া পরিমাণ</th>
                      <th className="py-3 px-4">অভিভাবকের ফোন</th>
                      <th className="py-3 px-4">ইনভয়েস সংখ্যা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {defaulters
                      .filter(d => 
                        d.student_name?.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
                        d.student_unique_id?.toLowerCase().includes(defaulterSearch.toLowerCase())
                      )
                      .map((d, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{d.student_name}</span>
                            <span className="block text-xs font-mono text-slate-400">{d.student_unique_id}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                            {d.section_name || 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-black text-rose-600 dark:text-rose-400">
                            ৳ {parseFloat(d.total_due).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                            {d.guardian_phone || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-xs font-bold text-amber-600">
                            {d.unpaid_invoices_count || 1} টি
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ৬. ব্যাংক ও ভেন্ডর লেজার ================= */}
          {activeTab === 'bank' && (
            <div data-tab-panel="true" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">ব্যাংক জমা ও রসিদ রেকর্ড</h3>
                    <p className="text-xs text-slate-400">প্রতিদিনের নগদ জমার ব্যাংক রসিদ ভেরিফিকেশন</p>
                  </div>
                  {(isAccountant || isPrincipal) && (
                    <button
                      onClick={() => setShowAddDepositModal(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                    >
                      + নতুন জমা
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bankDeposits.map((b) => (
                    <div key={b.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{b.bank_name}</span>
                        <span className="block text-slate-400">হিসাব: {b.account_number} | স্লিপ: {b.deposit_slip_number}</span>
                      </div>
                      <span className="font-black text-emerald-600 text-sm">৳ {parseFloat(b.amount).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">ভেন্ডর ও সরবরাহকারী প্রতিষ্ঠান</h3>
                  <p className="text-xs text-slate-400">স্থায়ী ঠিকাদার, প্রিন্টিং ও স্টেশনারি সরবরাহকারী</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {suppliers.map((s) => (
                    <div key={s.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                        <span className="block text-slate-400">যোগাযোগ: {s.contact_person} ({s.phone})</span>
                      </div>
                      <span className="font-bold text-slate-600">{s.category || 'জেনারেল'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= ৭. শিক্ষকের নিজস্ব বেতন স্লিপ (Teacher Portal View) ================= */}
          {activeTab === 'my_payroll' && (
            <div data-tab-panel="true" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">আমার মাসিক বেতন স্লিপ রেকর্ডসমূহ</h3>
                  <p className="text-xs text-slate-400">প্রতি মাসের বেসিক স্যালারি, প্রণোদনা ও কর্তনের বিস্তারিত হিসেব</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4">মাস ও বছর</th>
                      <th className="py-3 px-4">মূল বেতন (Basic)</th>
                      <th className="py-3 px-4">বোনাস ও বিশেষ ভাতা</th>
                      <th className="py-3 px-4">কর্তন (Deductions)</th>
                      <th className="py-3 px-4">নিট প্রদেয় বেতন</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payrolls.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                          কোনো পে-রোল রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      payrolls.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{p.month}/{p.year}</td>
                          <td className="py-3 px-4">৳ {parseFloat(p.base_salary).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-emerald-600">+৳ {parseFloat(p.bonus_allowance).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-rose-500">-৳ {parseFloat(p.deductions).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">৳ {parseFloat(p.net_payable).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {p.status === 'APPROVED' ? 'অনুমোদিত ও প্রদেয়' : 'প্রক্রিয়াধীন'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ৮. শিক্ষকের নিজস্ব ভাতা ক্লেইম (Teacher Portal View) ================= */}
          {activeTab === 'my_claims' && (
            <div data-tab-panel="true" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">আমার স্যালারি ও রিইমবার্সমেন্ট ক্লেইম</h3>
                  <p className="text-xs text-slate-400">পরীক্ষা পরিদর্শনের সম্মানী, ওভারটাইম ক্লাস বা বিশেষ ভাতার আবেদন</p>
                </div>
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  নতুন ক্লেইম আবেদন
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {claims.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    কোনো ক্লেইমের রেকর্ড নেই।
                  </div>
                ) : (
                  claims.map((c) => (
                    <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span>৳ {parseFloat(c.requested_amount).toLocaleString('en-IN')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.status === 'APPROVED_BY_PRINCIPAL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1">{c.reason}</p>
                      </div>
                      <span className="text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* মওকুফ অনুমোদন মডাল */}
      {selectedWaiver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              জরিমানা মওকুফ সিদ্ধান্ত গ্রহণ
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              শিক্ষার্থী: <strong className="text-slate-800 dark:text-slate-200">{selectedWaiver.student_name}</strong> (রোল: {selectedWaiver.student_roll})
            </p>

            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <div className="flex justify-between">
                <span>মোট আরোপিত জরিমানা:</span>
                <span className="font-bold">৳ {selectedWaiver.total_fine_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>আবেদনকৃত মওকুফ:</span>
                <span className="font-bold text-amber-600">৳ {selectedWaiver.requested_waiver_amount}</span>
              </div>
              <div className="flex justify-between text-blue-600 dark:text-blue-400">
                <span>ইনচার্জের সুপারিশ:</span>
                <span>{selectedWaiver.incharge_status}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  অনুমোদিত মওকুফের পরিমাণ (টাকা):
                </label>
                <input
                  type="number"
                  value={approvedWaiverAmount}
                  onChange={(e) => setApprovedWaiverAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  placeholder="যেমন: 500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  অধ্যক্ষের অফিসিয়াল মন্তব্য / কারণ:
                </label>
                <textarea
                  value={waiverRemarks}
                  onChange={(e) => setWaiverRemarks(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  placeholder="অনুমোদনের সাপেক্ষে নির্দেশনা লিখুন..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedWaiver(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleWaiverSubmit('REJECTED')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                প্রত্যাখ্যান করুন
              </button>
              <button
                onClick={() => handleWaiverSubmit('APPROVED')}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                মওকুফ অনুমোদন দিন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ভাউচার রিজেক্ট মডাল */}
      {rejectModalVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">ভাউচার প্রত্যাখানের কারণ</h3>
            <p className="text-xs text-slate-400 mt-1">ভাউচার নং: {rejectModalVoucher.voucher_no}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="কী কারণে ভাউচারটি নাকচ করা হচ্ছে তা লিখুন..."
              className="mt-4 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectModalVoucher(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleVerifyVoucher(rejectModalVoucher.id, 'REJECTED', rejectionReason)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white"
              >
                প্রত্যাখ্যান নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* নতুন ভাউচার তৈরির মডাল (হিসাবরক্ষক / এডমিন) */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">নতুন খরচের ভাউচার দাখিল</h3>
            <p className="text-xs text-slate-500 mt-1">প্রাতিষ্ঠানিক ব্যয়ের বিবরণ ও রসিদ সংযুক্ত করুন</p>
            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">খরচের শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={newExpenseForm.title}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, title: e.target.value })}
                  placeholder="যেমন: প্রিন্টার কালি ও ফটোকপি পেপার"
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">টাকার পরিমাণ (৳)</label>
                  <input
                    type="number"
                    required
                    value={newExpenseForm.amount}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: e.target.value })}
                    placeholder="যেমন: 2500"
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ভাউচার নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newExpenseForm.voucher_no}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, voucher_no: e.target.value })}
                    placeholder="স্বয়ংক্রিয় বা কাস্টম"
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">বিস্তারিত বিবরণ</label>
                <textarea
                  value={newExpenseForm.description}
                  onChange={(e) => setNewExpenseForm({ ...newExpenseForm, description: e.target.value })}
                  rows={2}
                  placeholder="খরচের প্রেক্ষাপট বা ভেন্ডরের তথ্য..."
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* নতুন ব্যাংক জমা মডাল */}
      {showAddDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">নতুন ব্যাংক জমা রেকর্ড</h3>
            <form onSubmit={handleCreateDeposit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ব্যাংকের নাম</label>
                <input
                  type="text"
                  required
                  value={newDepositForm.bank_name}
                  onChange={(e) => setNewDepositForm({ ...newDepositForm, bank_name: e.target.value })}
                  placeholder="যেমন: সোনালী ব্যাংক, মতিঝিল শাখা"
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">হিসাব নম্বর</label>
                  <input
                    type="text"
                    required
                    value={newDepositForm.account_number}
                    onChange={(e) => setNewDepositForm({ ...newDepositForm, account_number: e.target.value })}
                    placeholder="হিসাব নং"
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ডিপোজিট স্লিপ নং</label>
                  <input
                    type="text"
                    required
                    value={newDepositForm.deposit_slip_number}
                    onChange={(e) => setNewDepositForm({ ...newDepositForm, deposit_slip_number: e.target.value })}
                    placeholder="স্লিপ নং"
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">জমার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  value={newDepositForm.amount}
                  onChange={(e) => setNewDepositForm({ ...newDepositForm, amount: e.target.value })}
                  placeholder="যেমন: 50000"
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDepositModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* শিক্ষকের স্যালারি ক্লেইম মডাল */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">বেতন সমন্বয় বা ভাতা ক্লেইম আবেদন</h3>
            <p className="text-xs text-slate-500 mt-1">অধ্যক্ষের অনুমোদনের জন্য বিশেষ ভাতার আবেদনপত্র</p>
            <form onSubmit={handleTeacherSubmitClaim} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ক্লেইমকৃত টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  value={claimForm.requested_amount}
                  onChange={(e) => setClaimForm({ ...claimForm, requested_amount: e.target.value })}
                  placeholder="যেমন: 3500"
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">যৌক্তিক কারণ ও বিবরণ</label>
                <textarea
                  required
                  value={claimForm.reason}
                  onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}
                  rows={3}
                  placeholder="যেমন: এইচএসসি বোর্ড প্র্যাকটিক্যাল পরীক্ষা পরিদর্শনের ভাতা..."
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-orange hover:bg-brand-orange/90 text-white shadow-md"
                >
                  আবেদন পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHub;



