import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { 
  deactivateStaffApi, 
  reactivateStaffApi,
  resetStaffPasswordApi
} from '../api/principal';
import { toast } from 'sonner';

export const useStaffManagement = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'TEACHER' | 'INCHARGE' | 'ACCOUNTANT'
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [sortBy, setSortBy] = useState('pending'); // 'pending' | 'name' | 'attendance'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // মোডাল স্টেটসমূহ
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaffFor360, setSelectedStaffFor360] = useState(null);
  const [deactivateStaffTarget, setDeactivateStaffTarget] = useState(null);
  const [passwordResetTarget, setPasswordResetTarget] = useState(null);
  const [printIdTarget, setPrintIdTarget] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  const localDateStr = useMemo(() => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }, []);

  // ১. স্টাফ ও শিক্ষক তালিকা
  const { data: staffList = [], isLoading: loadingStaff } = useQuery({
    queryKey: ['principal', 'staff-management-list'],
    queryFn: async () => {
      const res = await api.get('auth/staff/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  // ২. আজকের উপস্থিতি
  const { data: todayAttendance = [] } = useQuery({
    queryKey: ['principal', 'staff-today-attendance', localDateStr],
    queryFn: async () => {
      const res = await api.get(`operations/teacher-attendance/?date=${localDateStr}`);
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৩. অপেক্ষমাণ শিক্ষক ছুটি
  const { data: pendingLeaves = [] } = useQuery({
    queryKey: ['principal', 'staff-pending-leaves'],
    queryFn: async () => {
      const res = await api.get('operations/teacher-leaves/?status=PENDING');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৪. অপেক্ষমাণ বেতন দাবি
  const { data: pendingClaims = [] } = useQuery({
    queryKey: ['principal', 'staff-pending-claims'],
    queryFn: async () => {
      const res = await api.get('finance/salary-claims/?status=PENDING');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // ৫. অনিষ্পন্ন মার্কার রিকুইজিশন
  const { data: pendingMarkers = [] } = useQuery({
    queryKey: ['principal', 'staff-pending-markers'],
    queryFn: async () => {
      const res = await api.get('operations/markers/?status=REQUESTED');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  // পার-স্টাফ মেট্রিক্স ম্যাপিং
  const metricsById = useMemo(() => {
    const map = new Map();
    const todayMap = new Map();
    todayAttendance.forEach((log) => {
      if (log.teacher) todayMap.set(log.teacher, log);
    });

    const leaveCountMap = new Map();
    pendingLeaves.forEach((l) => {
      const tid = l.teacher?.id || l.teacher;
      leaveCountMap.set(tid, (leaveCountMap.get(tid) || 0) + 1);
    });

    const claimCountMap = new Map();
    pendingClaims.forEach((c) => {
      const tid = c.teacher?.id || c.teacher;
      claimCountMap.set(tid, (claimCountMap.get(tid) || 0) + 1);
    });

    const markerCountMap = new Map();
    pendingMarkers.forEach((m) => {
      const tid = m.teacher?.id || m.teacher;
      markerCountMap.set(tid, (markerCountMap.get(tid) || 0) + 1);
    });

    staffList.forEach((s) => {
      const leaves = leaveCountMap.get(s.id) || 0;
      const claims = claimCountMap.get(s.id) || 0;
      const markers = markerCountMap.get(s.id) || 0;
      const pendingCount = leaves + claims + markers;

      map.set(s.id, {
        todayLog: todayMap.get(s.id) || null,
        pendingLeavesCount: leaves,
        pendingClaimsCount: claims,
        pendingMarkersCount: markers,
        pendingCount,
        hasPendingAction: pendingCount > 0,
      });
    });

    return map;
  }, [staffList, todayAttendance, pendingLeaves, pendingClaims, pendingMarkers]);

  // ফিল্টার ও সার্চ প্রসেসিং
  const filteredStaff = useMemo(() => {
    let result = [...staffList];

    // রোল ফিল্টার
    if (roleFilter === 'TEACHER') {
      result = result.filter((s) => s.role === 'TEACHER' || s.role_display === 'Teacher');
    } else if (roleFilter === 'INCHARGE') {
      result = result.filter((s) => s.is_class_incharge);
    } else if (roleFilter === 'ACCOUNTANT') {
      result = result.filter((s) => s.role === 'ACCOUNTANT' || s.role_display === 'Accountant');
    }

    // স্ট্যাটাস ফিল্টার
    if (statusFilter === 'ACTIVE') {
      result = result.filter((s) => s.is_active !== false);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((s) => s.is_active === false);
    }

    // সার্চ
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const fullName = (s.full_name || `${s.first_name || ''} ${s.last_name || ''}`).toLowerCase();
        const username = String(s.username || '').toLowerCase();
        const phone = String(s.phone || '');
        const empId = String(s.employee_id || s.teacher_profile?.employee_id || '').toLowerCase();
        const dept = String(s.department || s.teacher_profile?.department || '').toLowerCase();
        const desig = String(s.designation || s.teacher_profile?.designation || '').toLowerCase();

        return (
          fullName.includes(q) ||
          username.includes(q) ||
          phone.includes(q) ||
          empId.includes(q) ||
          dept.includes(q) ||
          desig.includes(q)
        );
      });
    }

    // সর্টিং
    result.sort((a, b) => {
      const ma = metricsById.get(a.id);
      const mb = metricsById.get(b.id);
      if (sortBy === 'pending' && ma && mb && mb.pendingCount !== ma.pendingCount) {
        return mb.pendingCount - ma.pendingCount;
      }
      return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '', 'bn');
    });

    return result;
  }, [staffList, roleFilter, statusFilter, searchQuery, sortBy, metricsById]);

  // পেজিনেশন
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  // সারাংশ গণনা
  const summaryCounts = useMemo(() => {
    const total = staffList.length;
    const teachers = staffList.filter((s) => s.role === 'TEACHER').length;
    const accountants = staffList.filter((s) => s.role === 'ACCOUNTANT').length;
    const incharges = staffList.filter((s) => s.is_class_incharge).length;
    const active = staffList.filter((s) => s.is_active !== false).length;
    const inactive = total - active;

    return { total, teachers, accountants, incharges, active, inactive };
  }, [staffList]);

  // অ্যাকশন হ্যান্ডলারস
  const handleToggleActive = async (staff, _reason = '') => {
    setSubmittingAction(true);
    try {
      if (staff.is_active !== false) {
        // নিষ্ক্রিয় করা
        await deactivateStaffApi(staff.id);
        toast.success(`${staff.full_name || staff.username} অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে`);
      } else {
        // পুনরায় সক্রিয় করা
        await reactivateStaffApi(staff.id);
        toast.success(`${staff.full_name || staff.username} অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে`);
      }
      queryClient.invalidateQueries({ queryKey: ['principal', 'staff-management-list'] });
      setDeactivateStaffTarget(null);
    } catch {
      toast.error('স্টাফ স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResetPassword = async (staff, newPassword) => {
    setSubmittingAction(true);
    try {
      const res = await resetStaffPasswordApi(staff.id, newPassword);
      toast.success(res.message || 'পাসওয়ার্ড রিসেটের অনুরোধ সফল হয়েছে');
      setPasswordResetTarget(null);
    } catch {
      toast.error('পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে');
    } finally {
      setSubmittingAction(false);
    }
  };

  return {
    staffList,
    filteredStaff,
    paginatedStaff,
    metricsById,
    summaryCounts,
    loadingStaff,
    // Filters & Pagination
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount: filteredStaff.length,
    // Modals
    createModalOpen,
    setCreateModalOpen,
    editingStaff,
    setEditingStaff,
    selectedStaffFor360,
    setSelectedStaffFor360,
    deactivateStaffTarget,
    setDeactivateStaffTarget,
    passwordResetTarget,
    setPasswordResetTarget,
    printIdTarget,
    setPrintIdTarget,
    submittingAction,
    handleToggleActive,
    handleResetPassword,
  };
};
