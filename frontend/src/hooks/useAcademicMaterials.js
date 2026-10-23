import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import {
  getSyllabiApi,
  createSyllabusApi,
  deleteSyllabusApi,
  getHomeworksApi,
  createHomeworkApi,
  deleteHomeworkApi,
  getSyllabusCompletionApi,
  getSubjectsApi,
} from '../api/academics';
import { toast } from 'sonner';

export const useAcademicMaterials = () => {
  const queryClient = useQueryClient();

  // মোডাল ও সাবমিট স্টেট
  const [uploadSyllabusModalOpen, setUploadSyllabusModalOpen] = useState(false);
  const [postHomeworkModalOpen, setPostHomeworkModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ফিল্টার স্টেট
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL');

  // ১. সিলেবাস তালিকা কোয়েরি
  const {
    data: syllabi = [],
    isLoading: loadingSyllabi,
  } = useQuery({
    queryKey: ['academics', 'syllabi'],
    queryFn: async () => {
      const res = await getSyllabiApi();
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  // ২. হোমওয়ার্ক তালিকা কোয়েরি
  const {
    data: homeworks = [],
    isLoading: loadingHomeworks,
  } = useQuery({
    queryKey: ['academics', 'homeworks'],
    queryFn: async () => {
      const res = await getHomeworksApi();
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  // ৩. সিলেবাস অগ্রগতি (Stub / Backend Readiness)
  const {
    data: syllabusCompletion = [],
    isLoading: loadingCompletion,
  } = useQuery({
    queryKey: ['academics', 'syllabi', 'completion'],
    queryFn: async () => {
      const res = await getSyllabusCompletionApi();
      return res?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৪. সহায়ক ডেটা: বিষয়সমূহ
  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ['academics', 'subjects'],
    queryFn: async () => {
      const res = await getSubjectsApi();
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৫. সহায়ক ডেটা: সেকশনসমূহ
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['academics', 'sections'],
    queryFn: async () => {
      const res = await api.get('academics/sections/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৬. সহায়ক ডেটা: শিক্ষকবৃন্দ
  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ['auth', 'staff', 'teachers'],
    queryFn: async () => {
      const res = await api.get('auth/staff/?role=TEACHER');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ফিল্টার করা সিলেবাস
  const filteredSyllabi = useMemo(() => {
    if (selectedSubjectFilter === 'ALL') return syllabi;
    return syllabi.filter((s) => String(s.subject) === String(selectedSubjectFilter));
  }, [syllabi, selectedSubjectFilter]);

  // ফিল্টার করা হোমওয়ার্ক
  const filteredHomeworks = useMemo(() => {
    return homeworks.filter((hw) => {
      if (selectedSectionFilter !== 'ALL' && String(hw.section) !== String(selectedSectionFilter)) {
        return false;
      }
      if (selectedSubjectFilter !== 'ALL' && String(hw.subject) !== String(selectedSubjectFilter)) {
        return false;
      }
      return true;
    });
  }, [homeworks, selectedSectionFilter, selectedSubjectFilter]);

  // সিলেবাস আপলোড হ্যান্ডলার
  const handleUploadSyllabus = async (formData) => {
    setSubmitting(true);
    try {
      await createSyllabusApi(formData);
      toast.success('সিলেবাস সফলভাবে আপলোড করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['academics', 'syllabi'] });
      setUploadSyllabusModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'সিলেবাস আপলোড ব্যর্থ হয়েছে';
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // সিলেবাস ডিলিট
  const handleDeleteSyllabus = async (id, title) => {
    setSubmitting(true);
    try {
      await deleteSyllabusApi(id);
      toast.success(`'${title || 'সিলেবাস'}' সফলভাবে মুছে ফেলা হয়েছে`);
      queryClient.invalidateQueries({ queryKey: ['academics', 'syllabi'] });
    } catch {
      toast.error('সিলেবাস মুছতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // হোমওয়ার্ক পোস্ট হ্যান্ডলার
  const handlePostHomework = async (formData) => {
    setSubmitting(true);
    try {
      await createHomeworkApi(formData);
      toast.success('নতুন হোমওয়ার্ক সফলভাবে পোস্ট করা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['academics', 'homeworks'] });
      setPostHomeworkModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'হোমওয়ার্ক পোস্ট ব্যর্থ হয়েছে';
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // হোমওয়ার্ক ডিলিট
  const handleDeleteHomework = async (id, title) => {
    setSubmitting(true);
    try {
      await deleteHomeworkApi(id);
      toast.success(`'${title || 'হোমওয়ার্ক'}' সফলভাবে মুছে ফেলা হয়েছে`);
      queryClient.invalidateQueries({ queryKey: ['academics', 'homeworks'] });
    } catch {
      toast.error('হোমওয়ার্ক মুছতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    syllabi,
    filteredSyllabi,
    homeworks,
    filteredHomeworks,
    syllabusCompletion,
    subjects,
    sections,
    teachers,
    loading: loadingSyllabi || loadingHomeworks || loadingSubjects || loadingSections || loadingTeachers,
    loadingCompletion,
    // Filters
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    selectedSectionFilter,
    setSelectedSectionFilter,
    // Modals
    uploadSyllabusModalOpen,
    setUploadSyllabusModalOpen,
    postHomeworkModalOpen,
    setPostHomeworkModalOpen,
    submitting,
    // Actions
    handleUploadSyllabus,
    handleDeleteSyllabus,
    handlePostHomework,
    handleDeleteHomework,
  };
};
