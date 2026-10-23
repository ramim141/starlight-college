import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import {
  getSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
} from '../api/academics';
import { toast } from 'sonner';

export const useSubjectManagement = () => {
  const queryClient = useQueryClient();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL'); // ALL | XI | XII
  const [groupFilter, setGroupFilter] = useState('ALL'); // ALL | SCI | HUM | BUS | GEN
  const [statusFilter, setStatusFilter] = useState('ACTIVE'); // ALL | ACTIVE | INACTIVE

  // Modals
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ১. বিষয় তালিকা কোয়েরি
  const { data: subjects = [], isLoading: loadingSubjects, refetch: refetchSubjects } = useQuery({
    queryKey: ['academics', 'subjects'],
    queryFn: async () => {
      const res = await getSubjectsApi();
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  // ২. শিক্ষক তালিকা কোয়েরি
  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ['auth', 'staff', 'teachers'],
    queryFn: async () => {
      const res = await api.get('auth/staff/?role=TEACHER');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ফিল্টার করা বিষয়সমূহ
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      if (classFilter !== 'ALL' && sub.class_level !== classFilter) return false;
      if (groupFilter !== 'ALL' && sub.group !== groupFilter) return false;
      if (statusFilter === 'ACTIVE' && sub.is_active === false) return false;
      if (statusFilter === 'INACTIVE' && sub.is_active !== false) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (sub.name || '').toLowerCase().includes(q);
        const matchesCode = (sub.code || '').toLowerCase().includes(q);
        const matchesTeacher = (sub.default_teacher_name || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesTeacher) return false;
      }

      return true;
    });
  }, [subjects, classFilter, groupFilter, statusFilter, searchTerm]);

  // সারাংশ পরিসংখ্যান
  const stats = useMemo(() => {
    const total = subjects.length;
    const active = subjects.filter((s) => s.is_active !== false).length;
    const withTeacher = subjects.filter((s) => Boolean(s.default_teacher)).length;
    const withoutTeacher = total - withTeacher;
    return { total, active, withTeacher, withoutTeacher };
  }, [subjects]);

  // হ্যান্ডলার্স
  const handleSaveSubject = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        class_level: formData.class_level,
        group: formData.group,
        default_teacher: formData.default_teacher || null,
        is_active: formData.is_active !== false,
      };

      if (editingSubject?.id) {
        await updateSubjectApi(editingSubject.id, payload);
        toast.success(`'${formData.name}' বিষয়ের তথ্য হালনাগাদ করা হয়েছে`);
      } else {
        await createSubjectApi(payload);
        toast.success(`নতুন বিষয় '${formData.name}' সফলভাবে যুক্ত হয়েছে`);
      }

      queryClient.invalidateQueries({ queryKey: ['academics', 'subjects'] });
      setCreateEditModalOpen(false);
      setEditingSubject(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.code?.[0] ||
        err.response?.data?.name?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'বিষয় সংরক্ষণ ব্যর্থ হয়েছে';
      toast.error(errorMsg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    setSubmitting(true);
    try {
      await deleteSubjectApi(subject.id);
      toast.success(`'${subject.name}' বিষয়টি সফলভাবে মুছে ফেলা হয়েছে`);
      queryClient.invalidateQueries({ queryKey: ['academics', 'subjects'] });
      setDeleteModalOpen(false);
      setDeletingSubject(null);
    } catch (err) {
      // Show backend ProtectedError / foreign key in-use message clearly
      const backendError =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'এই বিষয়টি বর্তমানে ক্লাস রুটিন, সিলেবাস বা পরীক্ষার মার্কশিটে অন্তর্ভুক্ত থাকায় ডিলিট করা সম্ভব নয়। বিকল্প হিসেবে বিষয়টিকে নিষ্ক্রিয় করতে পারেন।';
      toast.error(backendError, { duration: 5000 });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    subjects,
    teachers,
    filteredSubjects,
    stats,
    loading: loadingSubjects || loadingTeachers,
    refetchSubjects,
    // Filters
    searchTerm,
    setSearchTerm,
    classFilter,
    setClassFilter,
    groupFilter,
    setGroupFilter,
    statusFilter,
    setStatusFilter,
    // Modals
    createEditModalOpen,
    setCreateEditModalOpen,
    editingSubject,
    setEditingSubject,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingSubject,
    setDeletingSubject,
    submitting,
    // Actions
    handleSaveSubject,
    handleDeleteSubject,
  };
};
