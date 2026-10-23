import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
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
  getTeacherNoticesApi,
  getTeacherStaffListApi,
} from '../api/teacher';
import api from '../api/client';
import { toast } from 'sonner';

export const useTeacherDashboard = () => {
  const { user, isClassIncharge, refreshUser } = useAuth();

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

  return {
    user,
    isClassIncharge,
    schedule,
    todayAttendance,
    attendanceHistory,
    markers,
    leaves,
    proxyClasses,
    sectionLeaves,
    atRiskList,
    invigilations,
    payrolls,
    salaryClaims,
    notices,
    colleagueTeachers,
    exams,
    unacknowledgedMarkers,
    pendingStudentLeaves,
    upcomingClass,
    approvedLeavesCount,
    loading,
    refreshing,
    currentTime,
    submitting,
    showLeaveModal,
    setShowLeaveModal,
    showMarkerModal,
    setShowMarkerModal,
    showClaimModal,
    setShowClaimModal,
    showCheckInModal,
    setShowCheckInModal,
    checkInRemarks,
    setCheckInRemarks,
    leaveForm,
    setLeaveForm,
    markerForm,
    setMarkerForm,
    claimForm,
    setClaimForm,
    fetchDashboardData,
    handleCheckIn,
    handleCheckOut,
    handleAcknowledgeMarker,
    handleRequestMarker,
    handleApplyLeave,
    handleRecommendStudentLeave,
    handleSubmitClaim,
  };
};

export default useTeacherDashboard;
