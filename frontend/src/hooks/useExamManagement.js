import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getExamsListApi,
  createExamApi,
  updateExamApi,
  deleteExamApi,
  getExamSubjectConfigsApi,
  createExamSubjectConfigApi,
  updateExamSubjectConfigApi,
  deleteExamSubjectConfigApi,
  getExamRoomsApi,
  createExamRoomApi,
  updateExamRoomApi,
  deleteExamRoomApi,
  processExamResultsApi,
} from '../api/principal';
import { getSubjectsApi } from '../api/teacher';

/**
 * পরীক্ষার লাইফসাইকেল স্টেট ও অ্যালাউড ট্রানজিশন বের করার হেলপার
 */
export const getExamLifecycleInfo = (exam) => {
  if (!exam) return { key: 'DRAFT', label: 'খসড়া', color: 'slate', allowedTransitions: [] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = exam.start_date ? new Date(exam.start_date) : null;
  const endDate = exam.end_date ? new Date(exam.end_date) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  // ১. প্রকাশিত (PUBLISHED)
  if (exam.is_published) {
    return {
      key: 'PUBLISHED',
      label: 'প্রকাশিত',
      color: 'emerald',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
      allowedTransitions: ['UNPUBLISH'],
    };
  }

  // ২. ফলাফল প্রসেসড বা প্রস্তুত (PROCESSED)
  if (exam.results_processed || exam.processed_results_count > 0) {
    return {
      key: 'PROCESSED',
      label: 'ফলাফল প্রস্তুত',
      color: 'indigo',
      badgeClass: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20',
      allowedTransitions: ['PUBLISH', 'REPROCESS'],
    };
  }

  // ৩. নম্বর এন্ট্রি পর্ব (MARKS_ENTRY) - পরীক্ষা শেষ কিন্তু ফলাফল প্রসেস হয়নি
  if (endDate && today > endDate) {
    return {
      key: 'MARKS_ENTRY',
      label: 'নম্বর এন্ট্রি',
      color: 'amber',
      badgeClass: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
      allowedTransitions: ['PROCESS_RESULTS'],
    };
  }

  // ৪. চলমান পরীক্ষা (RUNNING) - পরীক্ষার তারিখের মধ্যে রয়েছে
  if (startDate && endDate && today >= startDate && today <= endDate) {
    return {
      key: 'RUNNING',
      label: 'চলমান',
      color: 'sky',
      badgeClass: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
      allowedTransitions: ['PROCESS_RESULTS'],
    };
  }

  // ৫. খসড়া বা আসন্ন (DRAFT)
  return {
    key: 'DRAFT',
    label: 'খসড়া / আসন্ন',
    color: 'slate',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    allowedTransitions: ['PROCESS_RESULTS', 'PUBLISH'],
  };
};

export const useExamManagement = () => {
  const queryClient = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState('');

  // ১. পরীক্ষা তালিকা
  const examsQuery = useQuery({
    queryKey: ['principal', 'exams-list'],
    queryFn: async () => {
      const res = await getExamsListApi();
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const exams = examsQuery.data || [];

  // অটো-সিলেক্ট ১ম পরীক্ষা যদি আগে সিলেক্ট না থাকে
  const activeSelectedExamId = useMemo(() => {
    if (selectedExamId && exams.some(e => String(e.id) === String(selectedExamId))) {
      return selectedExamId;
    }
    return exams.length > 0 ? String(exams[0].id) : '';
  }, [selectedExamId, exams]);

  const selectedExam = useMemo(() => {
    return exams.find(e => String(e.id) === String(activeSelectedExamId)) || null;
  }, [exams, activeSelectedExamId]);

  // ২. পাঠ্য বিষয় তালিকা
  const subjectsQuery = useQuery({
    queryKey: ['principal', 'subjects-list'],
    queryFn: async () => {
      const res = await getSubjectsApi();
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const subjects = subjectsQuery.data || [];

  // ৩. বিষয়ভিত্তিক নম্বর কনফিগারেশন তালিকা (নির্বাচিত পরীক্ষার)
  const configsQuery = useQuery({
    queryKey: ['principal', 'exam-configs', activeSelectedExamId],
    queryFn: async () => {
      if (!activeSelectedExamId) return [];
      const res = await getExamSubjectConfigsApi(activeSelectedExamId);
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!activeSelectedExamId,
    staleTime: 1000 * 60 * 3,
  });

  const configs = configsQuery.data || [];

  // ৪. পরীক্ষা হল ও রুম তালিকা
  const roomsQuery = useQuery({
    queryKey: ['principal', 'exam-rooms'],
    queryFn: async () => {
      const res = await getExamRoomsApi();
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const rooms = roomsQuery.data || [];

  // ==========================================
  // Mutations (Exams CRUD & Lifecycle)
  // ==========================================
  const createExamMutation = useMutation({
    mutationFn: createExamApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      toast.success('নতুন পরীক্ষা সফলভাবে তৈরি হয়েছে');
      if (data?.id) setSelectedExamId(String(data.id));
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.response?.data?.name?.[0] || 'পরীক্ষা তৈরিতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, payload }) => updateExamApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      toast.success('পরীক্ষার তথ্য সফলভাবে হালনাগাদ করা হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'পরীক্ষা আপডেট ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: deleteExamApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      toast.success('পরীক্ষা মুছে ফেলা হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'পরীক্ষা মুছতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  // লাইফসাইকেল ট্রানজিশন: ফলাফল প্রসেস
  const processResultMutation = useMutation({
    mutationFn: (examId) => processExamResultsApi(examId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      toast.success(res?.message || 'পরীক্ষার ফলাফল সফলভাবে তৈরি ও প্রসেস করা হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'ফলাফল প্রসেস করতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  // লাইফসাইকেল ট্রানজিশন: ফলাফল প্রকাশ / প্রত্যাহার
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }) => updateExamApi(id, { is_published: isPublished }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      toast.success(
        variables.isPublished
          ? 'পরীক্ষার ফলাফল শিক্ষার্থীদের জন্য উন্মুক্ত করা হয়েছে'
          : 'ফলাফল সফলভাবে প্রত্যাহার (Unpublish) করা হয়েছে'
      );
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  // ==========================================
  // Mutations (Subject Configs CRUD)
  // ==========================================
  const createConfigMutation = useMutation({
    mutationFn: createExamSubjectConfigApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exam-configs', activeSelectedExamId] });
      toast.success('বিষয়ভিত্তিক নম্বর বণ্টন কনফিগারেশন সংরক্ষিত হয়েছে');
    },
    onError: (err) => {
      const data = err.response?.data;
      const msg = data?.non_field_errors?.[0] || data?.detail || 'কনফিগারেশন সেভ করতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, payload }) => updateExamSubjectConfigApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exam-configs', activeSelectedExamId] });
      toast.success('নম্বর বণ্টন সফলভাবে হালনাগাদ হয়েছে');
    },
    onError: (err) => {
      const data = err.response?.data;
      const msg = data?.non_field_errors?.[0] || data?.detail || 'হালনাগাদ করতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: deleteExamSubjectConfigApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exam-configs', activeSelectedExamId] });
      toast.success('বিষয়ভিত্তিক কনফিগারেশন মুছে ফেলা হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'মুছতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  // ==========================================
  // Mutations (Rooms CRUD)
  // ==========================================
  const createRoomMutation = useMutation({
    mutationFn: createExamRoomApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exam-rooms'] });
      toast.success('নতুন পরীক্ষা কক্ষ যুক্ত হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.room_number?.[0] || err.response?.data?.detail || 'কক্ষ যোগ করতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, payload }) => updateExamRoomApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exam-rooms'] });
      toast.success('পরীক্ষা কক্ষের তথ্য হালনাগাদ হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'কক্ষ আপডেট ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: deleteExamRoomApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exam-rooms'] });
      toast.success('পরীক্ষা কক্ষ মুছে ফেলা হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'কক্ষ মুছতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  return {
    exams,
    selectedExamId: activeSelectedExamId,
    setSelectedExamId,
    selectedExam,
    subjects,
    configs,
    rooms,
    loadingExams: examsQuery.isLoading,
    loadingConfigs: configsQuery.isLoading,
    loadingRooms: roomsQuery.isLoading,
    loadingSubjects: subjectsQuery.isLoading,
    refetchExams: examsQuery.refetch,
    refetchConfigs: configsQuery.refetch,
    refetchRooms: roomsQuery.refetch,
    // Mutations
    createExam: createExamMutation.mutateAsync,
    isCreatingExam: createExamMutation.isPending,
    updateExam: updateExamMutation.mutateAsync,
    isUpdatingExam: updateExamMutation.isPending,
    deleteExam: deleteExamMutation.mutateAsync,
    isDeletingExam: deleteExamMutation.isPending,
    processResults: processResultMutation.mutateAsync,
    isProcessingResults: processResultMutation.isPending,
    togglePublish: togglePublishMutation.mutateAsync,
    isTogglingPublish: togglePublishMutation.isPending,
    createConfig: createConfigMutation.mutateAsync,
    isCreatingConfig: createConfigMutation.isPending,
    updateConfig: updateConfigMutation.mutateAsync,
    isUpdatingConfig: updateConfigMutation.isPending,
    deleteConfig: deleteConfigMutation.mutateAsync,
    isDeletingConfig: deleteConfigMutation.isPending,
    createRoom: createRoomMutation.mutateAsync,
    isCreatingRoom: createRoomMutation.isPending,
    updateRoom: updateRoomMutation.mutateAsync,
    isUpdatingRoom: updateRoomMutation.isPending,
    deleteRoom: deleteRoomMutation.mutateAsync,
    isDeletingRoom: deleteRoomMutation.isPending,
  };
};
