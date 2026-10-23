import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { toast } from 'sonner';

export const useStudentManagement = () => {
  const queryClient = useQueryClient();

  // ফিল্টার স্টেট
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL'); // 'ALL' | '11' | '12'
  const [groupFilter, setGroupFilter] = useState('ALL'); // 'ALL' | 'SCIENCE' | 'HUMANITIES' | 'COMMERCE'
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL'); // 'ALL' | 'MALE' | 'FEMALE'
  const [transportFilter, setTransportFilter] = useState('ALL'); // 'ALL' | 'YES' | 'NO'
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // মোডাল স্টেটসমূহ
  const [selectedStudentFor360, setSelectedStudentFor360] = useState(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [temporaryPinTarget, setTemporaryPinTarget] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // ১. শিক্ষার্থী তালিকা কোয়েরি
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['academics', 'students-all'],
    queryFn: async () => {
      const res = await api.get('academics/students/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  // ২. সেকশন তালিকা কোয়েরি
  const { data: sections = [] } = useQuery({
    queryKey: ['academics', 'sections-list'],
    queryFn: async () => {
      const res = await api.get('academics/sections/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // সেকশন ও সেশনের ইউনিক তালিকা
  const availableSessions = useMemo(() => {
    const set = new Set();
    sections.forEach((sec) => {
      if (sec.session) set.add(sec.session);
    });
    students.forEach((s) => {
      if (s.session) set.add(s.session);
    });
    return Array.from(set).sort().reverse();
  }, [sections, students]);

  // শিক্ষার্থী শ্রেণি ডিটেকশন
  const getStudentClass = useCallback((student) => {
    const level = String(student?.class_level || '').toUpperCase();
    const display = String(student?.section_name_display || '').toUpperCase();
    if (level === 'XI' || display.includes('XI') || display.includes('একাদশ') || display.includes('11')) {
      return '11';
    }
    if (level === 'XII' || display.includes('XII') || display.includes('দ্বাদশ') || display.includes('12')) {
      return '12';
    }
    return 'OTHER';
  }, []);

  // শিক্ষার্থী গ্রুপ ডিটেকশন
  const getStudentGroup = useCallback((student) => {
    const grp = String(student?.group || '').toUpperCase();
    const display = String(student?.section_name_display || '').toUpperCase();
    if (grp === 'SCI' || display.includes('বিজ্ঞান') || display.includes('SCIENCE') || display.includes('SCI')) {
      return 'SCIENCE';
    }
    if (grp === 'HUM' || display.includes('মানবিক') || display.includes('HUMANITIES') || display.includes('HUM')) {
      return 'HUMANITIES';
    }
    if (grp === 'BUS' || display.includes('ব্যবসায়') || display.includes('ব্যবসায়') || display.includes('BUS')) {
      return 'COMMERCE';
    }
    return 'OTHER';
  }, []);

  // শিক্ষার্থী লিঙ্গ ডিটেকশন
  const getStudentGender = useCallback((student) => {
    const g = String(student?.gender || '').toUpperCase();
    if (g === 'FEMALE' || g === 'F') return 'FEMALE';
    return 'MALE';
  }, []);

  // মাল্টি-ফিল্টার প্রসেসিং
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // সেশন ফিল্টার
    if (sessionFilter !== 'ALL') {
      result = result.filter((s) => s.session === sessionFilter);
    }

    // শ্রেণি ফিল্টার
    if (classFilter !== 'ALL') {
      result = result.filter((s) => getStudentClass(s) === classFilter);
    }

    // বিভাগ ফিল্টার
    if (groupFilter !== 'ALL') {
      result = result.filter((s) => getStudentGroup(s) === groupFilter);
    }

    // নির্দিষ্ট শাখা ফিল্টার
    if (sectionFilter !== 'ALL') {
      result = result.filter((s) => String(s.section) === String(sectionFilter));
    }

    // লিঙ্গ ফিল্টার
    if (genderFilter !== 'ALL') {
      result = result.filter((s) => getStudentGender(s) === genderFilter);
    }

    // পরিবহন ব্যবহারকারী ফিল্টার
    if (transportFilter === 'YES') {
      result = result.filter((s) => s.uses_transport);
    } else if (transportFilter === 'NO') {
      result = result.filter((s) => !s.uses_transport);
    }

    // স্ট্যাটাস ফিল্টার
    if (statusFilter === 'ACTIVE') {
      result = result.filter((s) => s.is_active !== false);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((s) => s.is_active === false);
    }

    // সার্চ ফিল্টার
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const name = String(s.full_name || `${s.first_name || ''} ${s.last_name || ''}`).toLowerCase();
        const id = String(s.student_unique_id || '').toLowerCase();
        const roll = String(s.roll_number || '');
        const phone = String(s.phone || '');
        const guardianPhone = String(s.guardian_phone || '');
        const ssc = String(s.ssc_roll || '');

        return (
          name.includes(q) ||
          id.includes(q) ||
          roll.includes(q) ||
          phone.includes(q) ||
          guardianPhone.includes(q) ||
          ssc.includes(q)
        );
      });
    }

    // রোল অনুযায়ী সাজানো
    result.sort((a, b) => {
      const rollA = parseInt(a.roll_number || '9999', 10);
      const rollB = parseInt(b.roll_number || '9999', 10);
      return rollA - rollB;
    });

    return result;
  }, [
    students,
    sessionFilter,
    classFilter,
    groupFilter,
    sectionFilter,
    genderFilter,
    transportFilter,
    statusFilter,
    searchTerm,
    getStudentClass,
    getStudentGroup,
    getStudentGender,
  ]);

  // পেজিনেশন হিসাব
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // ফিল্টার রিসেট
  const handleResetFilters = () => {
    setSearchTerm('');
    setSessionFilter('ALL');
    setClassFilter('ALL');
    setGroupFilter('ALL');
    setSectionFilter('ALL');
    setGenderFilter('ALL');
    setTransportFilter('ALL');
    setStatusFilter('ACTIVE');
    setCurrentPage(1);
  };

  // শাখা স্থানান্তর (Transfer)
  const handleTransferStudent = async (studentId, targetSectionId) => {
    setSubmittingAction(true);
    try {
      await api.patch(`academics/students/${studentId}/`, { section: targetSectionId });
      toast.success('শিক্ষার্থীর শাখা সফলভাবে স্থানান্তর করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['academics', 'students-all'] });
      setTransferTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'শাখা স্থানান্তর ব্যর্থ হয়েছে');
    } finally {
      setSubmittingAction(false);
    }
  };

  // শিক্ষার্থী অ্যাকাউন্ট সক্রিয় / নিষ্ক্রিয়
  const handleToggleStudentActive = async (student) => {
    setSubmittingAction(true);
    try {
      if (student.is_active !== false) {
        await api.delete(`academics/students/${student.id}/`);
        toast.success(`${student.full_name || student.student_unique_id} এর অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে`);
      } else {
        await api.patch(`academics/students/${student.id}/`, { is_active: true });
        toast.success(`${student.full_name || student.student_unique_id} এর অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে`);
      }
      queryClient.invalidateQueries({ queryKey: ['academics', 'students-all'] });
      setDeactivateTarget(null);
    } catch {
      toast.error('শিক্ষার্থীর স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setSubmittingAction(false);
    }
  };

  return {
    students,
    filteredStudents,
    paginatedStudents,
    sections,
    availableSessions,
    loadingStudents,
    // Filters & Pagination
    searchTerm,
    setSearchTerm,
    sessionFilter,
    setSessionFilter,
    classFilter,
    setClassFilter,
    groupFilter,
    setGroupFilter,
    sectionFilter,
    setSectionFilter,
    genderFilter,
    setGenderFilter,
    transportFilter,
    setTransportFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount: filteredStudents.length,
    handleResetFilters,
    // Modals
    selectedStudentFor360,
    setSelectedStudentFor360,
    bulkImportOpen,
    setBulkImportOpen,
    enrollmentOpen,
    setEnrollmentOpen,
    temporaryPinTarget,
    setTemporaryPinTarget,
    transferTarget,
    setTransferTarget,
    deactivateTarget,
    setDeactivateTarget,
    submittingAction,
    handleTransferStudent,
    handleToggleStudentActive,
  };
};
