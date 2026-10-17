import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyScheduleApi,
  teacherCheckInApi,
  teacherCheckOutApi,
  getTeacherAttendanceTodayApi,
  getTeacherAttendanceHistoryApi,
  getMyMarkersApi,
  requestMarkerApi,
  acknowledgeMarkerApi,
  getMyLeavesApi,
  applyTeacherLeaveApi,
  getMyProxyClassesApi,
  getTeacherSectionLeavesApi,
  recommendStudentLeaveApi,
  getAtRiskStudentsApi,
  getMyInvigilationsApi,
  getMyPayrollsApi,
  getMySalaryClaimsApi,
  submitSalaryClaimApi,
  getTeacherNoticesApi,
  getTeacherStaffListApi,
} from '../../api/teacher';
import api from '../../api/client';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  Award,
  Sparkles,
  BookOpen,
  AlertCircle,
  LogIn,
  LogOut,
  Check,
  Users,
  PhoneCall,
  FileText,
  Plus,
  Send,
  CreditCard,
  Package,
  ClipboardList,
  GraduationCap,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Download,
  HelpCircle,
  Bus,
  FileCheck,
  Eye,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const { user, isClassIncharge, refreshUser } = useAuth();
  const navigate = useNavigate();

  // মূল ডেটা স্টেট
  const [schedule, setSchedule] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [proxyClasses, setProxyClasses] = useState([]);
  const [sectionLeaves, setSectionLeaves] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [invigilations, setInvigilations] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [salaryClaims, setSalaryClaims] = useState([]);
  const [notices, setNotices] = useState([]);
  const [colleagueTeachers, setColleagueTeachers] = useState([]);
  const [exams, setExams] = useState([]);

  // UI কন্ট্রোল
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('routine'); // routine | incharge | exams | leaves | finance | notices
  const [currentTime, setCurrentTime] = useState(new Date());

  // মডাল স্টেট
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ফর্ম ফিল্ডস
  const [checkInRemarks, setCheckInRemarks] = useState('');
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'CASUAL',
    start_date: '',
    end_date: '',
    reason: '',
    proxy_teacher: '',
  });
  const [markerForm, setMarkerForm] = useState({
    marker_color: 'BLACK',
    quantity: 1,
    reason: 'দৈনন্দিন ক্লাসরুম পাঠদান',
  });
  const [claimForm, setClaimForm] = useState({
    claim_type: 'EXAM_EVALUATION',
    amount: '',
    description: '',
  });

  // রিয়েলটাইম ঘড়ি
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // সকল ডেটা লোড
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      let activeIncharge = isClassIncharge;
      if (refreshUser) {
        const refreshed = await refreshUser();
        if (refreshed) {
          activeIncharge = Boolean(
            refreshed.is_class_incharge ||
            (Array.isArray(refreshed.incharge_sections) && refreshed.incharge_sections.length > 0)
          );
        }
      }

      const results = await Promise.allSettled([
        getMyScheduleApi(),
        getTeacherAttendanceTodayApi(),
        getTeacherAttendanceHistoryApi(),
        getMyMarkersApi(),
        getMyLeavesApi(),
        getMyProxyClassesApi(),
        activeIncharge ? getTeacherSectionLeavesApi() : Promise.resolve({ results: [] }),
        activeIncharge ? getAtRiskStudentsApi() : Promise.resolve({ watchlist: [] }),
        getMyInvigilationsApi(),
        getMyPayrollsApi(),
        getMySalaryClaimsApi(),
        getTeacherNoticesApi(),
        getTeacherStaffListApi(),
        api.get('examination/exams/'),
      ]);

      const [
        schRes,
        attnTodayRes,
        attnHistRes,
        markerRes,
        leaveRes,
        proxyRes,
        secLeaveRes,
        atRiskRes,
        invigRes,
        payrollRes,
        claimRes,
        noticeRes,
        staffRes,
        examsRes,
      ] = results;

      if (schRes.status === 'fulfilled' && schRes.value?.success) {
        setSchedule(schRes.value);
      }
      if (attnTodayRes.status === 'fulfilled') {
        const list = attnTodayRes.value?.results || attnTodayRes.value;
        setTodayAttendance(Array.isArray(list) && list.length > 0 ? list[0] : null);
      }
      if (attnHistRes.status === 'fulfilled') {
        const list = attnHistRes.value?.results || attnHistRes.value;
        setAttendanceHistory(Array.isArray(list) ? list : []);
      }
      if (markerRes.status === 'fulfilled') {
        const list = markerRes.value?.results || markerRes.value;
        setMarkers(Array.isArray(list) ? list : []);
      }
      if (leaveRes.status === 'fulfilled') {
        const list = leaveRes.value?.results || leaveRes.value;
        setLeaves(Array.isArray(list) ? list : []);
      }
      if (proxyRes.status === 'fulfilled' && proxyRes.value?.success) {
        setProxyClasses(proxyRes.value.data || []);
      }
      if (secLeaveRes.status === 'fulfilled') {
        const list = secLeaveRes.value?.results || secLeaveRes.value;
        setSectionLeaves(Array.isArray(list) ? list : []);
      }
      if (atRiskRes.status === 'fulfilled' && atRiskRes.value?.success) {
        setAtRiskList(atRiskRes.value.watchlist || []);
      }
      if (invigRes.status === 'fulfilled') {
        const list = invigRes.value?.results || invigRes.value;
        setInvigilations(Array.isArray(list) ? list : []);
      }
      if (payrollRes.status === 'fulfilled') {
        const list = payrollRes.value?.results || payrollRes.value;
        setPayrolls(Array.isArray(list) ? list : []);
      }
      if (claimRes.status === 'fulfilled') {
        const list = claimRes.value?.results || claimRes.value;
        setSalaryClaims(Array.isArray(list) ? list : []);
      }
      if (noticeRes.status === 'fulfilled') {
        const list = noticeRes.value?.results || noticeRes.value;
        setNotices(Array.isArray(list) ? list : []);
      }
      if (staffRes.status === 'fulfilled') {
        const list = staffRes.value?.results || staffRes.value;
        setColleagueTeachers(Array.isArray(list) ? list : []);
      }
      if (examsRes.status === 'fulfilled') {
        const list = examsRes.value?.data?.results || examsRes.value?.data || [];
        setExams(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
      toast.error('কিছু ডেটা লোড হতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isClassIncharge]);

  // চেক-ইন হ্যান্ডলার
  const handleCheckIn = async () => {
    setSubmitting(true);
    try {
      const res = await teacherCheckInApi(checkInRemarks || 'ডিজিটাল চেক-ইন সম্পন্ন');
      if (res.success) {
        toast.success(res.message);
        setShowCheckInModal(false);
        setCheckInRemarks('');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'চেক-ইন ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // চেক-আউট হ্যান্ডলার
  const handleCheckOut = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আজকের মতো চেক-আউট করতে চান?')) return;
    setSubmitting(true);
    try {
      const res = await teacherCheckOutApi();
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'চেক-আউট ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // মার্কার রিসিট কনফার্মেশন
  const handleAcknowledgeMarker = async (id) => {
    try {
      const res = await acknowledgeMarkerApi(id);
      if (res.success) {
        toast.success(res.message);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'মার্কার প্রাপ্তি নিশ্চিত করা যায়নি');
    }
  };

  // মার্কার রিকুইজিশন সাবমিট
  const handleRequestMarker = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await requestMarkerApi(markerForm);
      if (res.success || res.id) {
        toast.success('মার্কারের আবেদন সফলভাবে জমা হয়েছে। প্রশাসন অনুমোদন করলে স্টক আপডেট হবে।');
        setShowMarkerModal(false);
        setMarkerForm({ marker_color: 'BLACK', quantity: 1, reason: 'দৈনন্দিন ক্লাসরুম পাঠদান' });
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'আবেদন সম্পন্ন করা যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  // ছুটির আবেদন সাবমিট
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      toast.error('তারিখ ও ছুটির কারণ প্রদান করুন');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...leaveForm };
      if (!payload.proxy_teacher) delete payload.proxy_teacher;
      const res = await applyTeacherLeaveApi(payload);
      if (res.success || res.id) {
        toast.success('ছুটির আবেদন সফলভাবে প্রিন্সিপালের অনুমোদনের জন্য পাঠানো হয়েছে।');
        setShowLeaveModal(false);
        setLeaveForm({ leave_type: 'CASUAL', start_date: '', end_date: '', reason: '', proxy_teacher: '' });
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ছুটির আবেদন জমা দেওয়া যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  // ইনচার্জ কর্তৃক শিক্ষার্থী ছুটির সুপারিশ
  const handleRecommendStudentLeave = async (leaveId, status) => {
    try {
      const res = await recommendStudentLeaveApi(leaveId, {
        status: status,
        remarks: 'শ্রেণি ইনচার্জ কর্তৃক যাচাইপূর্বক সুপারিশকৃত',
      });
      if (res.success) {
        toast.success(res.message || 'ছুটির সুপারিশ প্রিন্সিপালকে পাঠানো হয়েছে');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'সুপারিশ করা সম্ভব হয়নি');
    }
  };

  // ভাতা ও ভাউচার ক্লেইম সাবমিট
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.amount || !claimForm.description) {
      toast.error('টাকার পরিমাণ ও বিবরণ উল্লেখ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitSalaryClaimApi(claimForm);
      if (res.success || res.id) {
        toast.success('ভাতা ক্লেইম সফলভাবে জমা হয়েছে। প্রিন্সিপাল অনুমোদনের পর অ্যাকাউন্টে যুক্ত হবে।');
        setShowClaimModal(false);
        setClaimForm({ claim_type: 'EXAM_EVALUATION', amount: '', description: '' });
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ক্লেইম আবেদন ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // পরিসংখ্যান ক্যালকুলেশন
  const unacknowledgedMarkers = useMemo(
    () => markers.filter((m) => m.status === 'ISSUED' && !m.is_acknowledged),
    [markers]
  );

  const pendingStudentLeaves = useMemo(
    () => sectionLeaves.filter((l) => l.incharge_status === 'PENDING'),
    [sectionLeaves]
  );

  const upcomingClass = useMemo(() => {
    if (!schedule?.data || schedule.data.length === 0) return null;
    return schedule.data[0];
  }, [schedule]);

  const approvedLeavesCount = useMemo(
    () => leaves.filter((l) => l.status === 'APPROVED').length,
    [leaves]
  );

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent shadow-lg"></div>
        <p className="text-sm font-bold text-slate-500">শিক্ষক ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* ১. শিক্ষক স্বাগতম ও স্মার্ট ডিজিটাল পাঞ্চ প্যানেল */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#1A365D] to-[#142B4E] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* প্রোফাইল পরিচিতি */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-amber-600 text-white text-2xl sm:text-3xl font-black shadow-lg shadow-brand-orange/30 border-2 border-white/20">
              {user?.first_name?.[0] || 'T'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {user?.full_name || user?.username}
                </h1>
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-orange-200 border border-white/15">
                  {user?.teacher_profile?.designation || 'প্রভাষক'}
                </span>
                {isClassIncharge && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 inline mr-1" /> শ্রেণি ইনচার্জ
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-300">
                বিভাগ: <span className="font-semibold text-white">{user?.teacher_profile?.department || 'বিজ্ঞান ও মানবিক'}</span> | 
                আইডি: <span className="font-mono font-bold text-brand-orange">{user?.teacher_profile?.employee_id || 'TCH-001'}</span>
              </p>
              
              {/* লাইভ ডিজিটাল ঘড়ি ও আজকের স্ট্যাটাস */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5 rounded-xl bg-black/25 px-3 py-1 text-xs font-mono font-bold text-slate-200 border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-brand-orange animate-pulse" />
                  <span>{currentTime.toLocaleTimeString('bn-BD')}</span>
                </div>

                {todayAttendance?.check_in_time ? (
                  <div className="flex items-center space-x-1.5 rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>উপস্থিত: {todayAttendance.check_in_time}</span>
                    {todayAttendance.check_out_time && (
                      <span className="text-slate-300">| প্রস্থান: {todayAttendance.check_out_time}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>আজকের হাজিরা পেন্ডিং</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* চেক-ইন / চেক-আউট অ্যাকশন কন্ট্রোল */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center space-x-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/10"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-brand-orange' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            {!todayAttendance?.check_in_time ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                disabled={submitting}
                className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-400 hover:to-teal-500 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span>ডিজিটাল চেক-ইন (Check-in)</span>
              </button>
            ) : !todayAttendance?.check_out_time ? (
              <button
                onClick={handleCheckOut}
                disabled={submitting}
                className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-600/30 transition hover:from-rose-400 hover:to-red-500 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span>অফিস ত্যাগ (Check-out)</span>
              </button>
            ) : (
              <div className="rounded-2xl bg-emerald-600/40 px-4 py-2 text-xs font-bold text-emerald-200 border border-emerald-500/40">
                ✓ আজকের হাজিরা ও প্রস্থান সম্পন্ন
              </div>
            )}

            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center space-x-1.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/15"
            >
              <Calendar className="h-4 w-4 text-orange-300" />
              <span>ছুটির আবেদন</span>
            </button>
          </div>

        </div>

        {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* ২. মার্কার বুঝে নেওয়ার জরুরি অ্যালার্ট (যদি অফিসে ইস্যু করা থাকে) */}
      {unacknowledgedMarkers.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 text-slate-800 shadow-sm animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🖍️</span>
              <div>
                <h4 className="text-sm font-black text-[#0F2C59]">অফিস থেকে মার্কার ইস্যু করা হয়েছে!</h4>
                <p className="text-xs text-slate-600">
                  আপনি মার্কার বুঝে পেলে নিচের বাটনে ক্লিক করুন। সাথে সাথে সেন্ট্রাল ইনভেন্টরি স্টক আপডেট হবে।
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {unacknowledgedMarkers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleAcknowledgeMarker(m.id)}
                  className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-black text-white shadow-md hover:bg-brand-orange-hover active:scale-95 transition"
                >
                  <Check className="h-4 w-4" />
                  <span>মার্কার বুঝে পেয়েছি ({m.quantity}টি {m.marker_color_display || m.marker_color})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ২.১. ইনচার্জ স্পেশাল কমান্ড বার (যখন শিক্ষক কোনো শাখার ইনচার্জ হিসেবে নিযুক্ত হন) */}
      {isClassIncharge && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-6 text-white shadow-xl border-2 border-emerald-400/40">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white flex items-center space-x-1 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 mr-1 text-yellow-300 animate-spin" />
                  <span>শ্রেণি ইনচার্জ কন্ট্রোল হাব</span>
                </span>
                {user?.incharge_sections?.[0] && (
                  <span className="rounded-full bg-yellow-400/25 px-3 py-1 text-xs font-black text-yellow-200 border border-yellow-300/40">
                    শাখা: {user.incharge_sections[0].class_level_display || user.incharge_sections[0].class_level} - {user.incharge_sections[0].group_display || user.incharge_sections[0].group} ({user.incharge_sections[0].section_name}) [{user.incharge_sections[0].session}]
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                আপনি {user?.incharge_sections?.map(s => `${s.class_level_display || s.class_level} (${s.section_name})`).join(', ') || 'শ্রেণি'} শাখার ইনচার্জ হিসেবে দায়িত্বপ্রাপ্ত!
              </h2>
              <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
                প্রিন্সিপাল ড্যাশবোর্ড থেকে ইনচার্জের সকল প্রশাসনিক ক্ষমতা সক্রিয় করা হয়েছে। নিচের বাটনগুলো দিয়ে আপনার ক্লাসের যাবতীয় কার্যক্রম এক ক্লিকে পরিচালনা করুন।
              </p>

              {/* কুইক ম্যাট্রিক্স */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-xl bg-black/25 px-3 py-1.5 font-bold text-white border border-white/10">
                  👥 মোট শিক্ষার্থী: {user?.incharge_sections?.[0]?.total_students ?? '—'} জন
                </span>
                <span className="rounded-xl bg-black/25 px-3 py-1.5 font-bold text-white border border-white/10">
                  ⚠️ At-Risk ঝুঁকিপূর্ণ: {atRiskList.length} জন
                </span>
                <span className="rounded-xl bg-black/25 px-3 py-1.5 font-bold text-white border border-white/10">
                  ✉️ ছুটির আবেদন: {pendingStudentLeaves.length} টি অপেক্ষমাণ
                </span>
              </div>
            </div>

            {/* ৬টি প্রধান ইনচার্জ শর্টকাট বাটন */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
              <Link
                to="/teacher/incharge/bulk-attendance"
                className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95"
              >
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
                <span>বাল্ক হাজিরা</span>
              </Link>
              <Link
                to="/teacher/incharge/enrollment"
                className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95"
              >
                <Users className="h-4 w-4 text-emerald-600" />
                <span>শিক্ষার্থী ভর্তি</span>
              </Link>
              <Link
                to="/teacher/incharge/fees"
                className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95"
              >
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>ফি আদায়</span>
              </Link>
              <Link
                to="/teacher/incharge/at-risk"
                className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95"
              >
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>At-Risk ট্র্যাকার</span>
              </Link>
              <Link
                to="/teacher/incharge/call-log"
                className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95"
              >
                <PhoneCall className="h-4 w-4 text-emerald-600" />
                <span>কল ডায়েরি</span>
              </Link>
              <button
                onClick={() => setActiveTab('incharge')}
                className="flex items-center space-x-2 rounded-2xl bg-yellow-400 text-slate-900 px-3.5 py-2.5 text-xs font-black shadow hover:bg-yellow-300 transition active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-slate-900" />
                <span>ইনচার্জ হাব</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ৩. চার কার্ড সম্বলিত এক্সিকিউটিভ কেপিআই স্ট্রিপ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* কার্ড ১: আজকের ক্লাস */}
        <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">আজকের ক্লাস শিডিউল</span>
            <div className="rounded-2xl bg-blue-50 p-2 text-brand-navy">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-brand-navy">
              {schedule?.total_classes_today || 0}
            </h3>
            <span className="text-xs font-bold text-slate-500">টি পিরিয়ড</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>বার: <strong className="text-slate-700">{schedule?.day || 'আজ'}</strong></span>
          </p>
        </div>

        {/* কার্ড ২: উপস্থিতি ও হাজিরা রেট */}
        <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ডিজিটাল উপস্থিতি রেট</span>
            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">
              {attendanceHistory.length > 0
                ? `${Math.min(100, Math.round((attendanceHistory.length / 26) * 100))}%`
                : '১০০%'}
            </h3>
            <span className="text-xs font-bold text-slate-500">চলতি মাস</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            মোট উপস্থিত: <strong className="text-slate-700">{attendanceHistory.length} দিন</strong>
          </p>
        </div>

        {/* কার্ড ৩: ছুটি ও প্রক্সি দায়িত্ব */}
        <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ছুটি ও প্রক্সি ক্লাস</span>
            <div className="rounded-2xl bg-purple-50 p-2 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-purple-600">
              {proxyClasses.length}
            </h3>
            <span className="text-xs font-bold text-slate-500">টি প্রক্সি ডিউটি</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            অনুমোদিত ছুটি: <strong className="text-slate-700">{approvedLeavesCount} টি</strong>
          </p>
        </div>

        {/* কার্ড ৪: ইনভেন্টরি ও মার্কার */}
        <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">মার্কার রিকুইজিশন</span>
            <div className="rounded-2xl bg-orange-50 p-2 text-brand-orange">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-brand-orange">
              {markers.length}
            </h3>
            <span className="text-xs font-bold text-slate-500">টি আবেদন</span>
          </div>
          <button
            onClick={() => setShowMarkerModal(true)}
            className="mt-2 text-xs font-bold text-brand-navy hover:text-brand-orange transition flex items-center space-x-1"
          >
            <span>+ নতুন মার্কারের আবেদন</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* ৪. আসন্ন পরবর্তী ক্লাসের স্পটলাইট স্পট (যদি ক্লাস থাকে) */}
      {upcomingClass && (
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20">
              <BookOpen className="h-7 w-7 text-brand-orange" />
            </div>
            <div>
              <span className="rounded-md bg-brand-orange px-2 py-0.5 text-[10px] font-black uppercase text-white">
                পরবর্তী নির্ধারিত ক্লাস
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {upcomingClass.subject_name} — {upcomingClass.section_display}
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                রুম নম্বর: <strong className="text-white font-mono">{upcomingClass.room_number || 'অনির্ধারিত'}</strong> | 
                সময়: <strong className="text-white font-mono">{upcomingClass.start_time} - {upcomingClass.end_time}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/teacher/incharge/bulk-attendance"
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-400 transition"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>ক্লাসের হাজিরা নিন</span>
            </Link>
            <Link
              to="/teacher/materials"
              className="flex items-center space-x-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25 transition border border-white/15"
            >
              <FileText className="h-4 w-4 text-orange-300" />
              <span>নোট / হোমওয়ার্ক দিন</span>
            </Link>
          </div>
        </div>
      )}

      {/* ৫. শিক্ষক কন্ট্রোল সেন্টারের ট্যাব নেভিগেশন */}
      <div className="rounded-3xl bg-white p-2 border border-slate-100 shadow-soft">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto p-1">
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'routine'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>আজকের ক্লাস ও রুটিন</span>
          </button>

          {isClassIncharge && (
            <button
              onClick={() => setActiveTab('incharge')}
              className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'incharge'
                  ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>ইনচার্জ কমান্ড হাব ({pendingStudentLeaves.length > 0 ? `! ${pendingStudentLeaves.length}` : 'সক্রিয়'})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'exams'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>পরীক্ষা, মার্কস ও হল গার্ড ({invigilations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'leaves'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>ছুটি ও মার্কার রিকুইজিশন</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'finance'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>বেতন স্লিপ ও ভাতা ক্লেইম ({salaryClaims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'notices'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>নোটিশ ও সার্কুলার ({notices.length})</span>
          </button>
        </div>
      </div>

      {/* ৬. ট্যাব ভিত্তিক বিস্তারিত কন্টেন্ট */}

      {/* ট্যাব ১: আজকের ক্লাস ও রুটিন */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          
          {/* প্রক্সি দায়িত্ব থাকলে স্পেশাল কার্ড */}
          {proxyClasses.length > 0 && (
            <div className="rounded-3xl bg-purple-50 border-2 border-purple-200 p-6 text-purple-900 shadow-soft">
              <div className="flex items-center space-x-3 mb-4">
                <div className="rounded-xl bg-purple-200 p-2 text-purple-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-purple-950">আপনার উপর অর্পিত প্রক্সি ক্লাস দায়িত্ব</h4>
                  <p className="text-xs text-purple-700">সহকর্মী শিক্ষক ছুটিতে থাকায় আপনাকে এই ক্লাসগুলো নেওয়ার দায়িত্ব দেওয়া হয়েছে।</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proxyClasses.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-white p-4 border border-purple-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      প্রক্সি ক্লাস
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 mt-2">
                      মূল শিক্ষক: {p.teacher_name || p.teacher?.full_name || 'সহকর্মী শিক্ষক'}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      মেয়াদ: {p.start_date} হতে {p.end_date} | কারণ: {p.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* আজকের ক্লাসের তালিকা */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-brand-sky p-2.5 text-brand-navy">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">
                    আজকের ক্লাস শিডিউল ({schedule?.day || 'আজ'})
                  </h3>
                  <p className="text-xs text-slate-400">নির্ধারিত সময় অনুযায়ী ক্লাসে পাঠদান সম্পন্ন করুন</p>
                </div>
              </div>
              <Link
                to="/teacher/schedule"
                className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1"
              >
                <span>সম্পূর্ণ সাপ্তাহিক রুটিন দেখুন</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6">
              {!schedule?.data || schedule.data.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarCheck className="mx-auto h-12 w-12 text-slate-300" />
                  <h4 className="mt-3 text-sm font-bold text-slate-700">আজকে আপনার কোনো ক্লাস নির্ধারিত নেই!</h4>
                  <p className="text-xs text-slate-400 mt-1">পাঠ প্রস্তুতি নিন বা পরীক্ষার খাতা মূল্যায়ন করুন।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedule.data.map((slot, idx) => (
                    <div
                      key={slot.id || idx}
                      className="group rounded-3xl border border-slate-200/90 bg-slate-50/60 p-5 hover:border-brand-orange hover:bg-white transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="rounded-xl bg-[#0F2C59] px-2.5 py-1 text-[11px] font-black text-white">
                          রুম: {slot.room_number || 'N/A'}
                        </span>
                        <span className="text-xs font-black text-brand-orange">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-brand-orange transition">
                        {slot.subject_name}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        {slot.section_display}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <Link
                          to="/teacher/incharge/bulk-attendance"
                          className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>হাজিরা নিন</span>
                        </Link>
                        <Link
                          to="/teacher/materials"
                          className="text-xs font-bold text-slate-500 hover:text-brand-navy flex items-center space-x-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>লেকচার শিট</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ট্যাব ২: শ্রেণি ইনচার্জ কমান্ড হাব */}
      {activeTab === 'incharge' && isClassIncharge && (
        <div className="space-y-6">
          
          {/* ইনচার্জ অ্যাকশন গ্রিড */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
              <div className="rounded-2xl bg-brand-orange/10 p-2.5 text-brand-orange">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-brand-navy">দায়িত্বপ্রাপ্ত শাখার কমান্ড সেন্টার</h3>
                <p className="text-xs text-slate-400">এক নজরে আপনার শাখার শিক্ষার্থী, হাজিরা ও নিয়ন্ত্রণ ব্যবস্থা</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Link
                to="/teacher/incharge/bulk-attendance"
                className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 border border-emerald-100 hover:border-emerald-300 transition shadow-sm"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">এক ক্লিকে ক্লাসের হাজিরা</h4>
                  <p className="text-xs text-slate-500 mt-1">পুরো সেকশনের দৈনিক উপস্থিতি বা অনুপস্থিতি ইনপুট দিন</p>
                </div>
                <span className="mt-4 text-xs font-black text-emerald-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
                  <span>হাজিরা শিট খুলুন</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>

              <Link
                to="/teacher/incharge/enrollment"
                className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50/50 p-5 border border-purple-100 hover:border-purple-300 transition shadow-sm"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20 mb-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">শিক্ষার্থী ভর্তি ও তথ্য</h4>
                  <p className="text-xs text-slate-500 mt-1">নতুন আইডি দিয়ে ভর্তি ও রোলসহ শিক্ষার্থীদের প্রোফাইল দেখুন</p>
                </div>
                <span className="mt-4 text-xs font-black text-purple-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
                  <span>ভর্তি হাব খুলুন</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>

              <Link
                to="/teacher/incharge/at-risk"
                className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-rose-50 to-red-50/50 p-5 border border-rose-100 hover:border-rose-300 transition shadow-sm"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/20 mb-3">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">দুর্বল শিক্ষার্থী (At-Risk)</h4>
                  <p className="text-xs text-slate-500 mt-1">উপস্থিতি &lt;৭০% ও ফেল করা শিক্ষার্থীদের তালিকা ({atRiskList.length} জন)</p>
                </div>
                <span className="mt-4 text-xs font-black text-rose-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
                  <span>ওয়াচলিস্ট দেখুন</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>

              <Link
                to="/teacher/incharge/fees"
                className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 border border-blue-100 hover:border-blue-300 transition shadow-sm"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 mb-3">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">ফি আদায় ও রশিদ</h4>
                  <p className="text-xs text-slate-500 mt-1">শিক্ষার্থীদের বেতন ও ইনভয়েস কালেকশন ও হিসাব</p>
                </div>
                <span className="mt-4 text-xs font-black text-blue-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
                  <span>ফি পোর্টাল খুলুন</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>

              <Link
                to="/teacher/incharge/call-log"
                className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 border border-amber-100 hover:border-amber-300 transition shadow-sm"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-md shadow-brand-orange/20 mb-3">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">অভিভাবক কল ডায়েরি</h4>
                  <p className="text-xs text-slate-500 mt-1">অনুপস্থিতি বা অভিযোগ নিয়ে অভিভাবকদের সাথে আলোচনার রেকর্ড</p>
                </div>
                <span className="mt-4 text-xs font-black text-brand-orange flex items-center space-x-1 group-hover:translate-x-1 transition">
                  <span>কল ডায়েরি খুলুন</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* শিক্ষার্থী ছুটির আবেদন সুপারিশ */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-purple-50 p-2.5 text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">
                    শিক্ষার্থী ছুটির আবেদন ({pendingStudentLeaves.length}টি অপেক্ষমাণ)
                  </h3>
                  <p className="text-xs text-slate-400">ইনচার্জ হিসেবে আবেদনটি যাচাই করে প্রিন্সিপালের কাছে সুপারিশ পাঠান</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {pendingStudentLeaves.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">এই মুহূর্তে কোনো শিক্ষার্থীর ছুটির আবেদন অপেক্ষমাণ নেই।</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingStudentLeaves.map((leave) => (
                    <div key={leave.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-extrabold text-brand-navy">
                            {leave.student_name || 'শিক্ষার্থী'}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            রোল: {leave.roll_number || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          তারিখ: <strong>{leave.start_date} হতে {leave.end_date}</strong> ({leave.total_days || 1} দিন)
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 italic">
                          কারণ: "{leave.reason}"
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRecommendStudentLeave(leave.id, 'RECOMMENDED')}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
                        >
                          সুপারিশ করুন (Recommend)
                        </button>
                        <button
                          onClick={() => handleRecommendStudentLeave(leave.id, 'REJECTED')}
                          className="rounded-xl bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* At-Risk শিক্ষার্থী প্রিভিউ */}
          {atRiskList.length > 0 && (
            <div className="rounded-3xl bg-rose-50/60 border border-rose-200 p-6 shadow-soft">
              <div className="flex items-center justify-between pb-4 border-b border-rose-200/60">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <h4 className="font-extrabold text-sm text-rose-950">
                    ঝুঁকিপূর্ণ শিক্ষার্থী ওয়াচলিস্ট ({atRiskList.length} জন)
                  </h4>
                </div>
                <Link
                  to="/teacher/incharge/at-risk"
                  className="text-xs font-black text-rose-700 hover:underline flex items-center space-x-1"
                >
                  <span>সম্পূর্ণ তালিকা</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {atRiskList.slice(0, 4).map((stu) => (
                  <div key={stu.student_id} className="rounded-2xl bg-white p-4 border border-rose-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-orange">রোল: {stu.roll_number}</span>
                      <h5 className="font-bold text-sm text-brand-navy">{stu.student_name}</h5>
                      <p className="text-xs text-rose-600 font-semibold mt-0.5">
                        উপস্থিতি: {stu.attendance_percentage}%
                      </p>
                    </div>
                    {stu.guardian_phone && (
                      <a
                        href={`tel:${stu.guardian_phone}`}
                        className="flex items-center space-x-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>কল করুন</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ট্যাব ৩: পরীক্ষা, মার্কস ও হল গার্ড */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          
          {/* হল গার্ড / ইনভিজিলেশন রোস্টার */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">
                    পরীক্ষার হল গার্ড ও ইনভিজিলেশন রোস্টার ({invigilations.length})
                  </h3>
                  <p className="text-xs text-slate-400">পরীক্ষার হলে আপনার দায়িত্বপ্রাপ্ত রুম ও সময়সূচি</p>
                </div>
              </div>
              <Link
                to="/teacher/exams"
                className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1"
              >
                <span>প্রশ্নপত্র ও ডিউটি সেন্টার</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4">
              {invigilations.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">আপাতত আপনার কোনো হল গার্ড ডিউটি নির্ধারিত নেই।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {invigilations.map((inv) => (
                    <div key={inv.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                          রুম: {inv.room_number || inv.room?.room_number || 'N/A'}
                        </span>
                        <span className="text-xs font-bold text-brand-orange font-mono">
                          {inv.duty_date || inv.exam?.start_date}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-brand-navy">{inv.exam_name || inv.exam?.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">সময়: {inv.start_time || '১০:০০ AM'} হতে {inv.end_time || '০১:০০ PM'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* মার্কস এন্ট্রির সরাসরি লিংক ও চলমান পরীক্ষা */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-amber-50 p-2.5 text-brand-orange">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">পরীক্ষার মার্কস এন্ট্রি ও মূল্যায়ন</h3>
                  <p className="text-xs text-slate-400">CQ, MCQ ও ব্যবহারিক নম্বর সফটওয়্যারে সংরক্ষণ করুন</p>
                </div>
              </div>
              <Link
                to="/teacher/marks"
                className="rounded-2xl bg-brand-orange px-4 py-2 text-xs font-black text-white shadow-md hover:bg-brand-orange-hover transition"
              >
                + মার্কস এন্ট্রি করুন
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.slice(0, 4).map((ex) => (
                <div key={ex.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-orange">{ex.session} সেশন</span>
                    <h5 className="font-bold text-sm text-brand-navy">{ex.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">শ্রেণি: {ex.class_level_display || ex.class_level}</p>
                  </div>
                  <Link
                    to="/teacher/marks"
                    className="flex items-center space-x-1 text-xs font-bold text-brand-navy hover:text-brand-orange transition"
                  >
                    <span>নম্বর দিন</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ট্যাব ৪: ছুটি ও মার্কার রিকুইজিশন */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          
          {/* ছুটির আবেদন ও হিস্ট্রি */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-purple-50 p-2.5 text-purple-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">আমার ছুটির আবেদন ও রেকর্ড</h3>
                  <p className="text-xs text-slate-400">ছুটির অনুমোদন ও প্রক্সি ক্লাসের স্ট্যাটাস</p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="rounded-2xl bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-purple-500 transition"
              >
                + ছুটির আবেদন করুন
              </button>
            </div>

            <div className="mt-4">
              {leaves.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">আপনার কোনো ছুটির আবেদন রেকর্ড নেই।</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leaves.map((l) => (
                    <div key={l.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-brand-navy uppercase">
                            {l.leave_type_display || l.leave_type}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            l.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {l.status_display || l.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          তারিখ: <strong>{l.start_date} হতে {l.end_date}</strong> ({l.total_days || 1} দিন)
                        </p>
                        <p className="text-xs text-slate-500 italic mt-0.5">কারণ: {l.reason}</p>
                      </div>

                      {l.proxy_teacher_name && (
                        <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                          প্রক্সি শিক্ষক: <strong>{l.proxy_teacher_name}</strong>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* মার্কার রিকুইজিশন হিস্ট্রি */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-orange-50 p-2.5 text-brand-orange">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">হোয়াইটবোর্ড মার্কার রিকুইজিশন</h3>
                  <p className="text-xs text-slate-400">ক্লাসরুমের জন্য কালো, নীল, লাল মার্কারের রিকুইজিশন হিস্ট্রি</p>
                </div>
              </div>
              <button
                onClick={() => setShowMarkerModal(true)}
                className="rounded-2xl bg-brand-orange px-4 py-2 text-xs font-black text-white shadow-md hover:bg-brand-orange-hover transition"
              >
                + মার্কার রিকুইজিশন
              </button>
            </div>

            <div className="mt-4">
              {markers.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">এখনো কোনো মার্কার রিকুইজিশন করা হয়নি।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {markers.map((m) => (
                    <div key={m.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-extrabold text-brand-navy border border-slate-200">
                          {m.marker_color_display || m.marker_color} ({m.quantity}টি)
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          m.status === 'ISSUED' && m.is_acknowledged ? 'bg-emerald-100 text-emerald-700' :
                          m.status === 'ISSUED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {m.status === 'ISSUED' && m.is_acknowledged ? 'প্রাপ্তি নিশ্চিত' :
                           m.status === 'ISSUED' ? 'ইস্যুকৃত (অপেক্ষমাণ)' : 'রিকোয়েস্টেড'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 italic">কারণ: {m.reason}</p>
                      
                      {m.status === 'ISSUED' && !m.is_acknowledged && (
                        <button
                          onClick={() => handleAcknowledgeMarker(m.id)}
                          className="mt-3 w-full rounded-xl bg-brand-orange py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-orange-hover"
                        >
                          মার্কার বুঝে পেয়েছি
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ট্যাব ৫: বেতন ও ভাতা ক্লেইম */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          
          {/* মাসিক পে-রোল স্লিপ */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-brand-navy">আমার মাসিক বেতন স্লিপ (Payslips)</h3>
                  <p className="text-xs text-slate-400">প্রতি মাসের মূল বেতন, ইনচার্জ ভাতা ও নিট পরিশোধিত অর্থ</p>
                </div>
              </div>
              <button
                onClick={() => setShowClaimModal(true)}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-500 transition"
              >
                + ভাউচার / ভাতা ক্লেইম
              </button>
            </div>

            <div className="mt-4">
              {payrolls.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">কোনো বেতন স্লিপ রেকর্ড পাওয়া যায়নি।</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {payrolls.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-brand-navy">
                          মাস: {p.month}/{p.year}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          p.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status_display || p.status}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>মূল বেতন:</span>
                          <strong className="text-slate-800">{p.base_salary} BDT</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>বোনাস ও ভাতা:</span>
                          <strong className="text-emerald-600">+{p.bonus_allowance} BDT</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>কর্তন:</span>
                          <strong className="text-rose-600">-{p.deductions} BDT</strong>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-brand-navy">
                          <span>নিট প্রদেয়:</span>
                          <span className="text-emerald-700 font-extrabold">{p.net_salary} BDT</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ভাতা ক্লেইম হিস্ট্রি */}
          <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
            <h4 className="font-bold text-sm text-brand-navy mb-4">আমার ক্লেইম ভাউচারের তালিকা</h4>
            {salaryClaims.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">কোনো ভাউচার ক্লেইম জমা দেওয়া হয়নি।</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {salaryClaims.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-brand-navy uppercase">{c.claim_type_display || c.claim_type}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-emerald-600">{c.amount} BDT</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        {c.status_display || c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ট্যাব ৬: নোটিশ ও সার্কুলার */}
      {activeTab === 'notices' && (
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-4">
            <div className="rounded-2xl bg-brand-sky p-2.5 text-brand-navy">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">কলেজ নোটিশ ও প্রিন্সিপালের সার্কুলার</h3>
              <p className="text-xs text-slate-400">সকল প্রাতিষ্ঠানিক নির্দেশিকা, ছুটির প্রজ্ঞাপন ও মিটিং নোটিশ</p>
            </div>
          </div>

          {notices.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">এই মুহূর্তে কোনো নতুন নোটিশ প্রকাশিত হয়নি।</p>
          ) : (
            <div className="space-y-3">
              {notices.map((n) => (
                <div key={n.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 hover:border-brand-navy transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="rounded-md bg-[#0F2C59] px-2 py-0.5 text-[10px] font-bold text-white">
                      {n.notice_type || 'সার্কুলার'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{n.created_at?.slice(0, 10)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-brand-navy mt-2">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= মডালসমূহ ================= */}

      {/* ১. ডিজিটাল চেক-ইন মডাল */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-brand-navy">আজকের ডিজিটাল চেক-ইন</h3>
              <button onClick={() => setShowCheckInModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                বর্তমান সময়: <strong className="font-mono text-brand-navy">{currentTime.toLocaleTimeString('bn-BD')}</strong>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: অন-টাইম উপস্থিতি"
                  value={checkInRemarks}
                  onChange={(e) => setCheckInRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowCheckInModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-500 shadow-md"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'চেক-ইন নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ২. ছুটির আবেদন মডাল */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-brand-navy">শিক্ষক ছুটির আবেদন ফর্ম</h3>
              <button onClick={() => setShowLeaveModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ছুটির ধরন *</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                >
                  <option value="CASUAL">নৈমিত্তিক ছুটি (Casual Leave)</option>
                  <option value="MEDICAL">চিকিৎসাজনিত ছুটি (Medical Leave)</option>
                  <option value="DUTY">দাপ্তরিক দায়িত্বজনিত ছুটি (Duty Leave)</option>
                  <option value="MATERNITY">মাতৃত্বকালীন ছুটি (Maternity Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শুরুর তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শেষ তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রক্সি শিক্ষক নির্ধারণ (ঐচ্ছিক)</label>
                <select
                  value={leaveForm.proxy_teacher}
                  onChange={(e) => setLeaveForm({ ...leaveForm, proxy_teacher: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                >
                  <option value="">সহকর্মী শিক্ষক নির্বাচন করুন</option>
                  {colleagueTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">ছুটি চলাকালে আপনার ক্লাসগুলো যে শিক্ষক পরিচালনা করবেন।</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ছুটির কারণ ও বিস্তারিত *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="ছুটির যৌক্তিক কারণ উল্লেখ করুন..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-black text-white hover:bg-purple-500 shadow-md"
                >
                  {submitting ? 'পাঠানো হচ্ছে...' : 'আবেদন জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ৩. মার্কার রিকুইজিশন মডাল */}
      {showMarkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-brand-navy">হোয়াইটবোর্ড মার্কার রিকুইজিশন</h3>
              <button onClick={() => setShowMarkerModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRequestMarker} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মার্কারের রঙ *</label>
                <select
                  value={markerForm.marker_color}
                  onChange={(e) => setMarkerForm({ ...markerForm, marker_color: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                >
                  <option value="BLACK">কালো মার্কার (Black Marker)</option>
                  <option value="BLUE">নীল মার্কার (Blue Marker)</option>
                  <option value="RED">লাল মার্কার (Red Marker)</option>
                  <option value="GREEN">সবুজ মার্কার (Green Marker)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পরিমাণ (টি) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={markerForm.quantity}
                  onChange={(e) => setMarkerForm({ ...markerForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রয়োজনের কারণ *</label>
                <input
                  type="text"
                  required
                  value={markerForm.reason}
                  onChange={(e) => setMarkerForm({ ...markerForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMarkerModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-black text-white hover:bg-brand-orange-hover shadow-md"
                >
                  {submitting ? 'পাঠানো হচ্ছে...' : 'রিকুইজিশন পাঠান'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ৪. ভাতা ও ভাউচার ক্লেইম মডাল */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-brand-navy">ভাতা ও ভাউচার ক্লেইম আবেদন</h3>
              <button onClick={() => setShowClaimModal(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitClaim} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ভাতার ধরন *</label>
                <select
                  value={claimForm.claim_type}
                  onChange={(e) => setClaimForm({ ...claimForm, claim_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                >
                  <option value="EXAM_EVALUATION">পরীক্ষার খাতা মূল্যায়ন ভাতা</option>
                  <option value="INVIGILATION">পরীক্ষার হল গার্ড অনারিয়াম</option>
                  <option value="CONVEYANCE">যাতায়াত ও ভ্রমণ ভাতা (Conveyance)</option>
                  <option value="CLASSROOM_SUPPLY">ক্লাসরুম বা ল্যাব জরুরি ব্যয়</option>
                  <option value="OTHER">অন্যান্য প্রাতিষ্ঠানিক ভাতা</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">দাবিকৃত টাকার পরিমাণ (BDT) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="যেমন: ১৫০০.০০"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ ও রেফারেন্স *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="পরীক্ষার নাম, খাতার সংখ্যা বা ভাউচার বিস্তারিত..."
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-500 shadow-md"
                >
                  {submitting ? 'জমা হচ্ছে...' : 'ক্লেইম ভাউচার পাঠান'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherDashboard;