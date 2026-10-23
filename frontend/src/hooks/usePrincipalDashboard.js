import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { 
  getBalanceSheetApi, 
  getComplaintsApi, 
  resolveComplaintApi, 
  processExamResultsApi 
} from '../api/adminFinance';
import { getExamsListApi } from '../api/student';
import { getDailyCashClosingApi } from '../api/principal';
import { toast } from 'sonner';

export const usePrincipalDashboard = () => {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedExamForProcess, setSelectedExamForProcess] = useState('');
  const [processingResult, setProcessingResult] = useState(false);
  const [revealedComplaintIds, setRevealedComplaintIds] = useState(new Set());
  const [resolvingId, setResolvingId] = useState(null);

  // লাইভ ক্লক
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }, []);

  // ১. ব্যালেন্স শিট কোয়েরি
  const { data: balanceSheet, isLoading: loadingBalanceSheet } = useQuery({
    queryKey: ['principal', 'balance-sheet'],
    queryFn: async () => {
      const res = await getBalanceSheetApi();
      return res?.success ? res : null;
    },
    staleTime: 1000 * 60 * 3,
  });

  // ২. দৈনিক ক্যাশ ক্লোজিং অডিট
  const { data: dailyCashData, isLoading: loadingDailyCash } = useQuery({
    queryKey: ['principal', 'daily-cash', todayStr],
    queryFn: async () => {
      try {
        const res = await getDailyCashClosingApi(todayStr);
        return res?.cash_summary || null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 3,
  });

  // ৩. শিক্ষক তালিকা
  const { data: staffList = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['principal', 'staff-list'],
    queryFn: async () => {
      const res = await api.get('auth/staff/?role=TEACHER');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৪. আজকের শিক্ষক উপস্থিতি
  const { data: todayTeacherAttendance = [], isLoading: loadingTeacherAttendance } = useQuery({
    queryKey: ['principal', 'teacher-attendance-today', todayStr],
    queryFn: async () => {
      const res = await api.get(`operations/teacher-attendance/?date=${todayStr}`);
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৫. আজকের শিক্ষার্থী উপস্থিতি
  const { data: todayStudentAttendance = [], isLoading: loadingStudentAttendance } = useQuery({
    queryKey: ['principal', 'student-attendance-today', todayStr],
    queryFn: async () => {
      try {
        const res = await api.get(`academics/attendance/?date=${todayStr}`);
        return res.data?.results || res.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৬. একাডেমিক শাখা তালিকা
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['principal', 'sections-list'],
    queryFn: async () => {
      const res = await api.get('academics/sections/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৭. গোপন অভিযোগ তালিকা
  const { data: complaints = [], isLoading: loadingComplaints } = useQuery({
    queryKey: ['principal', 'complaints-list'],
    queryFn: async () => {
      const res = await getComplaintsApi();
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৮. পরীক্ষা তালিকা
  const { data: exams = [] } = useQuery({
    queryKey: ['principal', 'exams-list'],
    queryFn: async () => {
      const res = await getExamsListApi();
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // ৯. জরুরি পরিবহন সতর্কতা
  const { data: transportAlert = null } = useQuery({
    queryKey: ['principal', 'transport-alert'],
    queryFn: async () => {
      try {
        const res = await api.get('finance/vehicles/');
        const list = res.data?.results || res.data || [];
        return Array.isArray(list) ? list.find((v) => v.has_active_breakdown || v.breakdown_alert) : null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 2,
  });

  // ==========================================
  // ১০. ১১টি ক্যাটাগরির সমান্তরাল অপেক্ষমাণ অনুমোদন কোয়েরি (staleTime 60s)
  // ==========================================
  const pendingApprovalsQuery = useQuery({
    queryKey: ['principal', 'pending-approvals-matrix'],
    queryFn: async () => {
      const endpoints = [
        { key: 'student_leaves', url: 'operations/leaves/?principal_status=PENDING', label: 'শিক্ষার্থী ছুটি', path: '/principal/leaves?tab=student' },
        { key: 'teacher_leaves', url: 'operations/teacher-leaves/?status=PENDING', label: 'শিক্ষক ছুটি', path: '/principal/leaves?tab=teacher' },
        { key: 'proxy_duties', url: 'operations/teacher-leaves/?status=APPROVED', label: 'প্রক্সি ক্লাস দায়িত্ব', path: '/principal/leaves?tab=proxy' },
        { key: 'fine_waivers', url: 'finance/waivers/?principal_status=PENDING', label: 'জরিমানা মওকুফ', path: '/principal/finance?tab=waivers' },
        { key: 'expenses', url: 'finance/expenses/?status=PENDING', label: 'খরচ ও ভাউচার', path: '/principal/expenses' },
        { key: 'payrolls', url: 'finance/payrolls/?status=PENDING', label: 'শিক্ষক পে-রোল', path: '/principal/finance?tab=payroll' },
        { key: 'salary_claims', url: 'finance/salary-claims/?status=PENDING', label: 'বেতন ক্লেইম', path: '/principal/finance?tab=claims' },
        { key: 'certificates', url: 'operations/certificates/?status=PENDING', label: 'প্রত্যয়নপত্র / টিসি', path: '/principal/certificates' },
        { key: 'alumni', url: 'operations/alumni/?status=PENDING', label: 'অ্যালুমনি আবেদন', path: '/principal/clubs?tab=alumni' },
        { key: 'question_papers', url: 'examination/questions/?status=SUBMITTED', label: 'প্রশ্নপত্র অডিট', path: '/principal/exams?tab=questions' },
        { key: 'complaints', url: 'operations/complaints/?status=PENDING', label: 'গোপন অভিযোগ', path: '/principal/complaints' },
      ];

      const results = await Promise.allSettled(
        endpoints.map(async (item) => {
          try {
            const res = await api.get(item.url);
            const count = Array.isArray(res.data?.results) 
              ? res.data.count ?? res.data.results.length 
              : Array.isArray(res.data) 
                ? res.data.length 
                : 0;
            return { ...item, count };
          } catch {
            return { ...item, count: 0 };
          }
        })
      );

      return results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter(Boolean);
    },
    staleTime: 1000 * 60, // 60s
  });

  const pendingApprovalsList = pendingApprovalsQuery.data || [];
  const totalPendingApprovals = useMemo(() => {
    return pendingApprovalsList.reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [pendingApprovalsList]);

  // মোট শিক্ষার্থী হিসাব
  const totalStudentsEnrolled = useMemo(() => {
    return sections.reduce((acc, sec) => acc + (sec.total_students || sec.student_count || 0), 0);
  }, [sections]);

  // আজকের শিক্ষার্থী উপস্থিতি হার
  const studentAttendanceRate = useMemo(() => {
    if (!totalStudentsEnrolled || !todayStudentAttendance.length) return null;
    const present = todayStudentAttendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    return Math.min(100, Math.round((present / totalStudentsEnrolled) * 100));
  }, [totalStudentsEnrolled, todayStudentAttendance]);

  // শিক্ষক উপস্থিতি হিসাব
  const teacherAttendanceStats = useMemo(() => {
    const totalTeachers = staffList.length || 0;
    const presentCount = todayTeacherAttendance.length;
    const lateCount = todayTeacherAttendance.filter((a) => a.is_late).length;
    const absentCount = Math.max(0, totalTeachers - presentCount);
    return {
      total: totalTeachers,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      rate: totalTeachers > 0 ? Math.min(100, Math.round((presentCount / totalTeachers) * 100)) : 0,
    };
  }, [staffList, todayTeacherAttendance]);

  // প্রাথমিক এক্সাম সিলেকশন
  useEffect(() => {
    if (exams.length > 0 && !selectedExamForProcess) {
      setSelectedExamForProcess(exams[0].id);
    }
  }, [exams, selectedExamForProcess]);

  // ১-ক্লিক রেজাল্ট ও মেধা প্রসেস
  const handleProcessResult = async () => {
    if (!selectedExamForProcess) {
      toast.error('অনুগ্রহ করে পরীক্ষা নির্বাচন করুন');
      return;
    }
    setProcessingResult(true);
    try {
      const res = await processExamResultsApi(selectedExamForProcess);
      if (res.success) {
        toast.success(res.message || 'মেধা তালিকা ও গ্রেডশিট সফলভাবে প্রসেস করা হয়েছে');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'রেজাল্ট প্রসেসিং ব্যর্থ হয়েছে');
    } finally {
      setProcessingResult(false);
    }
  };

  // অভিযোগ সমাধান
  const handleResolveComplaint = async (id, status = 'RESOLVED') => {
    setResolvingId(id);
    try {
      const res = await resolveComplaintApi(
        id,
        status,
        'অধ্যক্ষ মহোদয় কর্তৃক পর্যালোচনা সম্পন্ন ও গৃহীত ব্যবস্থা কার্যকর'
      );
      if (res.success) {
        toast.success(res.message || 'অভিযোগ নিষ্পত্তি করা হয়েছে');
        queryClient.invalidateQueries({ queryKey: ['principal', 'complaints-list'] });
        queryClient.invalidateQueries({ queryKey: ['principal', 'pending-approvals-matrix'] });
      }
    } catch {
      toast.error('অভিযোগ সমাধান ব্যর্থ হয়েছে');
    } finally {
      setResolvingId(null);
    }
  };

  const toggleRevealIdentity = (id) => {
    setRevealedComplaintIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // সামগ্রিক রিফ্রেশ হ্যান্ডলার
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['principal'] });
    setTimeout(() => setRefreshing(false), 600);
    toast.success('ড্যাশবোর্ড ডেটা হালনাগাদ করা হয়েছে');
  }, [queryClient]);

  const summary = balanceSheet?.summary || null;

  return {
    currentTime,
    refreshing,
    onRefresh: handleRefresh,
    // Data
    balanceSheet,
    summary,
    dailyCashData,
    sections,
    staffList,
    complaints,
    exams,
    transportAlert,
    pendingApprovalsList,
    totalPendingApprovals,
    totalStudentsEnrolled,
    studentAttendanceRate,
    teacherAttendanceStats,
    // Exam processing
    selectedExamForProcess,
    setSelectedExamForProcess,
    onProcessResult: handleProcessResult,
    processingResult,
    // Complaints
    revealedComplaintIds,
    toggleRevealIdentity,
    onResolveComplaint: handleResolveComplaint,
    resolvingId,
    // Loadings
    loadingBalanceSheet,
    loadingDailyCash,
    loadingStaff,
    loadingTeacherAttendance,
    loadingStudentAttendance,
    loadingSections,
    loadingComplaints,
    loadingPendingApprovals: pendingApprovalsQuery.isLoading,
  };
};
