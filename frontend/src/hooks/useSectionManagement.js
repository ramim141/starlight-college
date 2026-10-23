import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import {
  createSectionApi,
  updateSectionApi,
  assignSectionInchargeApi
} from '../api/principal';
import { toast } from 'sonner';

export const useSectionManagement = () => {
  const queryClient = useQueryClient();

  // Filters
  const [filterSession, setFilterSession] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL'); // ALL | XI | XII
  const [filterGroup, setFilterGroup] = useState('ALL'); // ALL | SCI | HUM | BUS | GEN
  const [filterIncharge, setFilterIncharge] = useState('ALL'); // ALL | ASSIGNED | UNASSIGNED
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' | 'cards'

  // Modal States
  const [assignModalSec, setAssignModalSec] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [supervisingSection, setSupervisingSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // TanStack Query for all hub data
  const {
    data = {
      sections: [],
      teachers: [],
      parentCalls: [],
      leaves: [],
      waivers: [],
      handovers: []
    },
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['principal', 'sections-and-incharge-hub'],
    queryFn: async () => {
      try {
        const [secRes, staffRes, callsRes, leavesRes, waiversRes, handoversRes] = await Promise.allSettled([
          api.get('academics/sections/'),
          api.get('auth/staff/?role=TEACHER'),
          api.get('operations/parent-calls/'),
          api.get('operations/leaves/'),
          api.get('finance/waivers/'),
          api.get('finance/handovers/'),
        ]);

        return {
          sections: secRes.status === 'fulfilled' ? (secRes.value.data?.results || secRes.value.data || []) : [],
          teachers: staffRes.status === 'fulfilled' ? (staffRes.value.data?.results || staffRes.value.data || []) : [],
          parentCalls: callsRes.status === 'fulfilled' ? (callsRes.value.data?.results || callsRes.value.data || []) : [],
          leaves: leavesRes.status === 'fulfilled' ? (leavesRes.value.data?.results || leavesRes.value.data || []) : [],
          waivers: waiversRes.status === 'fulfilled' ? (waiversRes.value.data?.results || waiversRes.value.data || []) : [],
          handovers: handoversRes.status === 'fulfilled' ? (handoversRes.value.data?.results || handoversRes.value.data || []) : [],
        };
      } catch {
        toast.error('সেকশন ও ইনচার্জ ডেটা লোড করা যায়নি');
        return {
          sections: [],
          teachers: [],
          parentCalls: [],
          leaves: [],
          waivers: [],
          handovers: []
        };
      }
    },
    staleTime: 1000 * 60 * 3,
  });

  const { sections, teachers, parentCalls, leaves, waivers, handovers } = data;

  // Collision map: teacher ID -> array of assigned section summaries
  const teacherAssignedSectionMap = useMemo(() => {
    const map = new Map();
    sections.forEach((sec) => {
      if (sec.in_charge_teacher) {
        const existing = map.get(sec.in_charge_teacher) || [];
        existing.push({
          id: sec.id,
          section_name: sec.section_name,
          class_level_display: sec.class_level_display || sec.class_level,
          group_display: sec.group_display || sec.group,
          session: sec.session,
        });
        map.set(sec.in_charge_teacher, existing);
      }
    });
    return map;
  }, [sections]);

  // Unique sessions list for filter
  const availableSessions = useMemo(() => {
    const set = new Set();
    sections.forEach((sec) => {
      if (sec.session) set.add(sec.session);
    });
    return Array.from(set).sort().reverse();
  }, [sections]);

  // Summary live metrics
  const stats = useMemo(() => {
    const totalSections = sections.length;
    const assignedCount = sections.filter((s) => s.in_charge_teacher).length;
    const unassignedCount = totalSections - assignedCount;
    const totalStudents = sections.reduce((acc, s) => acc + (s.total_students || 0), 0);
    return {
      totalSections,
      assignedCount,
      unassignedCount,
      totalStudents,
    };
  }, [sections]);

  // Filter sections
  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      if (filterSession !== 'ALL' && sec.session !== filterSession) return false;
      if (filterClass !== 'ALL' && sec.class_level !== filterClass) return false;
      if (filterGroup !== 'ALL' && sec.group !== filterGroup) return false;
      if (filterIncharge === 'ASSIGNED' && !sec.in_charge_teacher) return false;
      if (filterIncharge === 'UNASSIGNED' && sec.in_charge_teacher) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesSection = (sec.section_name || '').toLowerCase().includes(q);
        const matchesClass = (sec.class_level_display || '').toLowerCase().includes(q);
        const matchesGroup = (sec.group_display || '').toLowerCase().includes(q);
        const matchesTeacher = (sec.in_charge_teacher_name || '').toLowerCase().includes(q);
        const matchesSession = (sec.session || '').toLowerCase().includes(q);

        if (!matchesSection && !matchesClass && !matchesGroup && !matchesTeacher && !matchesSession) {
          return false;
        }
      }

      return true;
    });
  }, [sections, filterSession, filterClass, filterGroup, filterIncharge, searchTerm]);

  // Hierarchy Grouping: Session -> Class -> Group -> Sections
  const hierarchyData = useMemo(() => {
    const sessionMap = new Map();

    filteredSections.forEach((sec) => {
      const sessionKey = sec.session || 'অন্যান্য সেশন';
      const classKey = sec.class_level_display || (sec.class_level === 'XI' ? 'একাদশ শ্রেণি (XI)' : 'দ্বাদশ শ্রেণি (XII)');
      const groupKey = sec.group_display || (
        sec.group === 'SCI' ? 'বিজ্ঞান' :
        sec.group === 'HUM' ? 'মানবিক' :
        sec.group === 'BUS' ? 'ব্যবসায় শিক্ষা' : 'সাধারণ'
      );

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, new Map());
      }
      const classMap = sessionMap.get(sessionKey);

      if (!classMap.has(classKey)) {
        classMap.set(classKey, new Map());
      }
      const groupMap = classMap.get(classKey);

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey).push(sec);
    });

    return sessionMap;
  }, [filteredSections]);

  // Handlers
  const handleAssignIncharge = async (sectionId, teacherId) => {
    setSubmitting(true);
    try {
      const res = await assignSectionInchargeApi(sectionId, teacherId);
      if (res.success || res.id) {
        toast.success(res.message || 'ইনচার্জ সফলভাবে নিয়োগ দেওয়া হয়েছে।');
        setAssignModalSec(null);
        queryClient.invalidateQueries({ queryKey: ['principal', 'sections-and-incharge-hub'] });
      } else {
        toast.error(res.message || 'ইনচার্জ নিয়োগ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'ইনচার্জ নিয়োগ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSection = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        in_charge_teacher: formData.in_charge_teacher || null
      };
      const res = await createSectionApi(payload);
      toast.success(`নতুন শাখা '${res.class_level_display || res.class_level} - ${res.group_display || res.group} (${res.section_name})' সফলভাবে তৈরি হয়েছে`);
      setCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['principal', 'sections-and-incharge-hub'] });
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'শাখা তৈরি ব্যর্থ হয়েছে। এই সেশনে একই শাখা আগে থেকেই থাকতে পারে।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSection = async (sectionId, formData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        in_charge_teacher: formData.in_charge_teacher || null
      };
      await updateSectionApi(sectionId, payload);
      toast.success('শাখার বিবরণ সফলভাবে হালনাগাদ করা হয়েছে');
      setEditingSection(null);
      queryClient.invalidateQueries({ queryKey: ['principal', 'sections-and-incharge-hub'] });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'শাখা হালনাগাদ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sections,
    teachers,
    parentCalls,
    leaves,
    waivers,
    handovers,
    loading,
    refetch,
    stats,
    teacherAssignedSectionMap,
    availableSessions,
    // Filters
    filterSession,
    setFilterSession,
    filterClass,
    setFilterClass,
    filterGroup,
    setFilterGroup,
    filterIncharge,
    setFilterIncharge,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    // Filtered data
    filteredSections,
    hierarchyData,
    // Modals
    assignModalSec,
    setAssignModalSec,
    createModalOpen,
    setCreateModalOpen,
    editingSection,
    setEditingSection,
    supervisingSection,
    setSupervisingSection,
    submitting,
    // Actions
    handleAssignIncharge,
    handleCreateSection,
    handleUpdateSection,
  };
};
