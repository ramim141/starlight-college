import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  getStaffListApi,
  getTeacherLeavesApi,
  getTeacherAttendanceListApi,
  verifyTeacherAttendanceApi,
} from '../api/principal';

const getTodayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const useTeacherAttendanceMonitor = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const todayStr = useMemo(() => getTodayStr(), []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'monthly'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'late' | 'absent' | 'leave' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingId, setVerifyingId] = useState(null);
  const [isApprovingMonth, setIsApprovingMonth] = useState(false);

  // ১. শিক্ষকগণের মাস্টার তালিকা
  const teachersQuery = useQuery({
    queryKey: ['principal', 'staff-teachers'],
    queryFn: async () => {
      const res = await getStaffListApi();
      const list = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      return list.filter((s) => s.role === 'TEACHER');
    },
    staleTime: 1000 * 60 * 10,
  });

  // ২. নির্বাচিত দিনের শিক্ষক হাজিরা রেকর্ডসমূহ (আজকের দিনে ৬০সে. লাইভ অটো-রিফ্রেশ)
  const isToday = selectedDate === todayStr;
  const dayAttendanceQuery = useQuery({
    queryKey: ['principal', 'teacher-attendance', selectedDate],
    queryFn: async () => {
      const res = await getTeacherAttendanceListApi({ date: selectedDate });
      return Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
    },
    refetchInterval: activeTab === 'today' && isToday ? 60000 : false,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 30,
  });

  // ৩. অনুমোদিত ছুটির তালিকা (আজকে কেউ ছুটিতে আছেন কিনা জানার জন্য)
  const approvedLeavesQuery = useQuery({
    queryKey: ['principal', 'teacher-leaves-approved'],
    queryFn: async () => {
      const res = await getTeacherLeavesApi({ status: 'APPROVED' });
      return Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৪. পুরো বছরের/মাসের সমস্ত হাজিরা রেকর্ড (মাসিক হিসাবের জন্য)
  const allAttendanceHistoryQuery = useQuery({
    queryKey: ['principal', 'teacher-attendance-all'],
    queryFn: async () => {
      const res = await getTeacherAttendanceListApi();
      return Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৫. আজকের লাইভ শিট ডাটা ম্যাপিং
  const todaySheetData = useMemo(() => {
    const teachers = teachersQuery.data || [];
    const logs = dayAttendanceQuery.data || [];
    const leaves = approvedLeavesQuery.data || [];

    return teachers.map((teacher) => {
      const log = logs.find((l) => l.teacher === teacher.id);
      const onLeave = leaves.some((lv) => {
        if (lv.teacher !== teacher.id) return false;
        return selectedDate >= lv.start_date && selectedDate <= lv.end_date;
      });

      let status = 'ABSENT';
      if (log) {
        status = log.is_late ? 'LATE' : 'PRESENT';
      } else if (onLeave) {
        status = 'LEAVE';
      }

      return {
        teacherId: teacher.id,
        teacherName: teacher.full_name || teacher.username,
        department: teacher.teacher_profile?.department || 'সাধারণ',
        employeeId: teacher.teacher_profile?.employee_id || '—',
        phone: teacher.phone_number || '',
        avatar: teacher.profile_picture || null,
        attendanceId: log?.id || null,
        checkInTime: log?.check_in_time || null,
        checkOutTime: log?.check_out_time || null,
        isLate: !!log?.is_late,
        approvalStatus: log?.approval_status || (onLeave ? 'APPROVED' : null),
        approvalStatusDisplay: log?.approval_status_display || (onLeave ? 'অনুমোদিত ছুটি' : null),
        remarks: log?.remarks || '',
        approvedByName: log?.approved_by_name || null,
        approvedAt: log?.approved_at || null,
        status, // 'PRESENT' | 'LATE' | 'LEAVE' | 'ABSENT'
      };
    });
  }, [teachersQuery.data, dayAttendanceQuery.data, approvedLeavesQuery.data, selectedDate]);

  // ফিল্টারকৃত আজকের তালিকা
  const filteredTodaySheet = useMemo(() => {
    let list = todaySheetData;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.teacherName.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.employeeId.toLowerCase().includes(q)
      );
    }

    if (filterType === 'late') list = list.filter((t) => t.isLate);
    else if (filterType === 'absent') list = list.filter((t) => t.status === 'ABSENT');
    else if (filterType === 'leave') list = list.filter((t) => t.status === 'LEAVE');
    else if (filterType === 'pending') list = list.filter((t) => t.approvalStatus === 'PENDING');

    return list;
  }, [todaySheetData, searchQuery, filterType]);

  // আজকের সারাংশ কেপিআই
  const todayKpi = useMemo(() => {
    const total = todaySheetData.length;
    const present = todaySheetData.filter((t) => t.status === 'PRESENT' || t.status === 'LATE').length;
    const onTime = todaySheetData.filter((t) => t.status === 'PRESENT').length;
    const late = todaySheetData.filter((t) => t.status === 'LATE').length;
    const leave = todaySheetData.filter((t) => t.status === 'LEAVE').length;
    const absent = todaySheetData.filter((t) => t.status === 'ABSENT').length;
    const pending = todaySheetData.filter((t) => t.approvalStatus === 'PENDING').length;

    return { total, present, onTime, late, leave, absent, pending };
  }, [todaySheetData]);

  // ৬. মাসিক শিট ডাটা এগ্রিগেশন
  const [monthlyLockState, setMonthlyLockState] = useState(null);

  const lockStorageKey = `teacher_attendance_approval_${selectedYear}_${selectedMonth}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(lockStorageKey);
      setMonthlyLockState(saved ? JSON.parse(saved) : null);
    } catch {
      setMonthlyLockState(null);
    }
  }, [selectedYear, selectedMonth, lockStorageKey]);

  const monthlyTeachersData = useMemo(() => {
    const teachers = teachersQuery.data || [];
    const allLogs = allAttendanceHistoryQuery.data || [];
    const allLeaves = approvedLeavesQuery.data || [];

    // নির্বাচিত মাসের লগ ও ছুটি
    const targetMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const monthLogs = allLogs.filter((l) => String(l.date).startsWith(targetMonthPrefix));

    return teachers.map((teacher) => {
      const logs = monthLogs.filter((l) => l.teacher === teacher.id);
      const presentLogs = logs.filter((l) => l.approval_status !== 'REJECTED');
      const lateLogs = logs.filter((l) => l.is_late);

      // সংশ্লিষ্ট মাসে শিক্ষকের অনুমোদিত ছুটির দিন
      const leaves = allLeaves.filter((lv) => {
        if (lv.teacher !== teacher.id) return false;
        return lv.start_date.startsWith(targetMonthPrefix) || lv.end_date.startsWith(targetMonthPrefix);
      });
      const leaveDays = leaves.reduce((acc, lv) => acc + (Number(lv.total_days) || 1), 0);

      const presentCount = presentLogs.length;
      const lateCount = lateLogs.length;
      const totalRecordedDays = logs.length;

      return {
        teacherId: teacher.id,
        teacherName: teacher.full_name || teacher.username,
        department: teacher.teacher_profile?.department || 'সাধারণ',
        employeeId: teacher.teacher_profile?.employee_id || '—',
        avatar: teacher.profile_picture || null,
        phone: teacher.phone_number || '',
        presentDays: presentCount,
        lateDays: lateCount,
        leaveDays,
        totalLogs: totalRecordedDays,
        dailyRecords: logs.sort((a, b) => String(b.date).localeCompare(String(a.date))),
      };
    });
  }, [teachersQuery.data, allAttendanceHistoryQuery.data, approvedLeavesQuery.data, selectedMonth, selectedYear]);

  // ৭. একক দিন ভেরিফিকেশন অ্যাকশন
  const handleVerifyDayAttendance = async (attendanceId, status, remarks = '') => {
    setVerifyingId(attendanceId);
    try {
      await verifyTeacherAttendanceApi(attendanceId, status, remarks);
      toast.success(
        status === 'APPROVED' ? 'হাজিরা সফলভাবে অনুমোদন করা হয়েছে' : 'হাজিরা রেকর্ড সংশোধন/বাতিল করা হয়েছে'
      );
      queryClient.invalidateQueries({ queryKey: ['principal', 'teacher-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'teacher-attendance-all'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'pending-approvals-matrix'] });
      return true;
    } catch {
      toast.error('হাজিরা ভেরিফিকেশন ব্যর্থ হয়েছে');
      return false;
    } finally {
      setVerifyingId(null);
    }
  };

  // ৮. মাসিক চূড়ান্ত অনুমোদন (Bulk per-day verify & lock)
  const handleApproveMonth = async (remarks = '') => {
    setIsApprovingMonth(true);
    try {
      const targetMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const allLogs = allAttendanceHistoryQuery.data || [];
      const pendingMonthLogs = allLogs.filter(
        (l) => String(l.date).startsWith(targetMonthPrefix) && l.approval_status === 'PENDING'
      );

      // ব্যাকএন্ডে মাসিক অনুমোদন এন্ডপয়েন্ট না থাকায় পেন্ডিং রেকর্ডগুলো সমান্তরালে অনুমোদন করা
      if (pendingMonthLogs.length > 0) {
        await Promise.allSettled(
          pendingMonthLogs.map((l) =>
            verifyTeacherAttendanceApi(
              l.id,
              'APPROVED',
              remarks || `অধ্যক্ষ কর্তৃক ${selectedMonth}/${selectedYear} মাসিক হাজিরা অনুমোদন`
            )
          )
        );
      }

      const lockData = {
        month: selectedMonth,
        year: selectedYear,
        approved_by: user?.full_name || user?.username || 'অধ্যক্ষ',
        approved_at: new Date().toISOString(),
        remarks: remarks || 'সম্পূর্ণ মাসিক হাজিরা পর্যালোচিত ও অনুমোদিত',
      };

      localStorage.setItem(lockStorageKey, JSON.stringify(lockData));
      setMonthlyLockState(lockData);

      toast.success(`${selectedMonth}/${selectedYear} মাসের শিক্ষক হাজিরা সফলভাবে অনুমোদিত ও লক করা হয়েছে`);
      queryClient.invalidateQueries({ queryKey: ['principal', 'teacher-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'teacher-attendance-all'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'pending-approvals-matrix'] });
      return true;
    } catch {
      toast.error('মাসিক হাজিরা অনুমোদন ব্যর্থ হয়েছে');
      return false;
    } finally {
      setIsApprovingMonth(false);
    }
  };

  const refetchToday = async () => Promise.all([
    teachersQuery.refetch(),
    dayAttendanceQuery.refetch(),
    approvedLeavesQuery.refetch(),
    allAttendanceHistoryQuery.refetch(),
  ]);

  return {
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    activeTab,
    setActiveTab,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    todayKpi,
    filteredTodaySheet,
    monthlyTeachersData,
    monthlyLockState,
    loading: teachersQuery.isLoading || dayAttendanceQuery.isLoading || approvedLeavesQuery.isLoading,
    todayError: teachersQuery.isError || dayAttendanceQuery.isError || approvedLeavesQuery.isError,
    monthlyError: teachersQuery.isError || allAttendanceHistoryQuery.isError || approvedLeavesQuery.isError,
    monthlyLoading: teachersQuery.isLoading || allAttendanceHistoryQuery.isLoading || approvedLeavesQuery.isLoading,
    verifyingId,
    isApprovingMonth,
    handleVerifyDayAttendance,
    handleApproveMonth,
    refetchToday,
  };
};

export default useTeacherAttendanceMonitor;
