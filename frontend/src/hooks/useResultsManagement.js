import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getExamsListApi,
  updateExamApi,
  processExamResultsApi,
  getMeritListApi,
  getSubjectAnalysisApi,
  getFailedStatisticsApi,
  getExamSubjectConfigsApi,
  getSectionMarkSheetAuditApi,
  getSectionFeeDuesAuditApi,
  getSectionsListApi,
} from '../api/principal';
import { getSubjectsApi } from '../api/teacher';

export const useResultsManagement = () => {
  const queryClient = useQueryClient();

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [failedGender, setFailedGender] = useState('MALE');

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

  // অটো-সিলেক্ট ১ম পরীক্ষা
  const activeExamId = useMemo(() => {
    if (selectedExamId && exams.some((e) => String(e.id) === String(selectedExamId))) {
      return selectedExamId;
    }
    return exams.length > 0 ? String(exams[0].id) : '';
  }, [selectedExamId, exams]);

  const selectedExam = useMemo(() => {
    return exams.find((e) => String(e.id) === String(activeExamId)) || null;
  }, [exams, activeExamId]);

  // ২. শাখা তালিকা
  const sectionsQuery = useQuery({
    queryKey: ['principal', 'sections-list'],
    queryFn: async () => {
      const res = await getSectionsListApi();
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const allSections = sectionsQuery.data || [];

  // নির্বাচিত পরীক্ষার শ্রেণি অনুযায়ী ফিল্টার করা শাখা
  const filteredSections = useMemo(() => {
    if (!selectedExam) return allSections;
    return allSections.filter(
      (s) => s.class_level === selectedExam.class_level && s.session === selectedExam.session
    );
  }, [allSections, selectedExam]);

  // ৩. অফিশিয়াল মেধা তালিকা
  const meritListQuery = useQuery({
    queryKey: ['principal', 'merit-list', activeExamId, selectedSectionId],
    queryFn: async () => {
      if (!activeExamId) return [];
      const params = { exam: activeExamId };
      if (selectedSectionId) params.section = selectedSectionId;
      const res = await getMeritListApi(params);
      const list = res?.data || res?.results || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!activeExamId,
    staleTime: 1000 * 60 * 3,
  });

  const meritList = meritListQuery.data || [];

  // ৪. বিষয়ভিত্তিক অ্যানালাইসিস
  const analysisQuery = useQuery({
    queryKey: ['principal', 'subject-analysis', activeExamId, selectedGroup],
    queryFn: async () => {
      if (!activeExamId) return [];
      const params = { exam: activeExamId };
      if (selectedGroup) params.group = selectedGroup;
      const res = await getSubjectAnalysisApi(params);
      const list = res?.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!activeExamId,
    staleTime: 1000 * 60 * 3,
  });

  const analysisList = analysisQuery.data || [];

  // ৫. অকৃতকার্য পরিসংখ্যান
  const failedStatsQuery = useQuery({
    queryKey: ['principal', 'failed-stats', activeExamId, failedGender],
    queryFn: async () => {
      if (!activeExamId) return [];
      const res = await getFailedStatisticsApi({ exam: activeExamId, gender: failedGender });
      const list = res?.data || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!activeExamId,
    staleTime: 1000 * 60 * 3,
  });

  const failedList = failedStatsQuery.data || [];

  // ৬. পরীক্ষার বিষয় কনফিগারেশন তালিকা
  const configsQuery = useQuery({
    queryKey: ['principal', 'exam-configs', activeExamId],
    queryFn: async () => {
      if (!activeExamId) return [];
      const res = await getExamSubjectConfigsApi(activeExamId);
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!activeExamId,
    staleTime: 1000 * 60 * 5,
  });

  const configs = configsQuery.data || [];

  // ৭. বিষয় ও বিষয়ের শিক্ষক তালিকা
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

  // ৮. স্পেসিফিকেশন ১: প্রাক-প্রসেসিং চেকলিস্ট অডিট কুয়েরি (নির্বাচিত শাখা ও বিষয়ের)
  const checklistAuditQuery = useQuery({
    queryKey: ['principal', 'checklist-audit', activeExamId, selectedSectionId],
    queryFn: async () => {
      if (!activeExamId || !selectedSectionId || configs.length === 0) {
        return {
          marksAudit: [],
          feeDueStudents: [],
          totalConfigured: configs.length,
          allCompleted: false,
          pendingSubjectCount: 0,
        };
      }

      // ক. প্রতিটি বিষয়ের নম্বর এন্ট্রি অডিট
      const marksAuditPromises = configs.map(async (cfg) => {
        const subj = subjects.find(
          (s) => String(s.id) === String(cfg.subject) || s.code === cfg.subject_code
        );
        const teacherName = subj?.default_teacher_name || 'শিক্ষক নির্ধারিত নেই';

        try {
          const res = await getSectionMarkSheetAuditApi(activeExamId, cfg.subject, selectedSectionId);
          const students = res?.students || [];
          const totalStudents = students.length;

          // যেসকল শিক্ষার্থীর নম্বর এন্ট্রি হয়েছে (প্রাপ্ত নম্বর আছে বা অনুপস্থিত রেকর্ড আছে)
          const enteredCount = students.filter(
            (s) => (s.cq_marks > 0 || s.mcq_marks > 0 || s.is_absent || s.grade_letter !== 'N/A')
          ).length;

          const isComplete = totalStudents > 0 && enteredCount === totalStudents;
          const isNotStarted = enteredCount === 0;

          return {
            subjectId: cfg.subject,
            subjectName: cfg.subject_name || subj?.name || 'অজানা বিষয়',
            subjectCode: cfg.subject_code || subj?.code || '',
            teacherName,
            totalStudents,
            enteredCount,
            pendingCount: totalStudents - enteredCount,
            status: isComplete ? 'COMPLETE' : isNotStarted ? 'NOT_STARTED' : 'PARTIAL',
          };
        } catch {
          return {
            subjectId: cfg.subject,
            subjectName: cfg.subject_name || subj?.name || 'অজানা বিষয়',
            subjectCode: cfg.subject_code || subj?.code || '',
            teacherName,
            totalStudents: 0,
            enteredCount: 0,
            pendingCount: 0,
            status: 'ERROR',
          };
        }
      });

      // খ. বকেয়া ফি অডিট
      const feeDuePromise = getSectionFeeDuesAuditApi(selectedSectionId).catch(() => ({ results: [] }));

      const [marksAudit, feeDueRes] = await Promise.all([
        Promise.all(marksAuditPromises),
        feeDuePromise,
      ]);

      const feeDueList = feeDueRes?.results || feeDueRes || [];
      const pendingSubjects = marksAudit.filter((m) => m.status !== 'COMPLETE');

      return {
        marksAudit,
        feeDueStudents: Array.isArray(feeDueList) ? feeDueList : [],
        totalConfigured: configs.length,
        allCompleted: pendingSubjects.length === 0 && marksAudit.length > 0,
        pendingSubjectCount: pendingSubjects.length,
      };
    },
    enabled: !!activeExamId && !!selectedSectionId && configs.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const checklistAudit = checklistAuditQuery.data || {
    marksAudit: [],
    feeDueStudents: [],
    totalConfigured: 0,
    allCompleted: false,
    pendingSubjectCount: 0,
  };

  // ==========================================
  // Mutations
  // ==========================================
  // ১. ফলাফল প্রসেস
  const processResultsMutation = useMutation({
    mutationFn: ({ examId, sectionId, reason = '' }) => {
      return processExamResultsApi(examId, sectionId);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'merit-list'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'subject-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'failed-stats'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'checklist-audit'] });
      toast.success(res?.message || 'ফলাফল সফলভাবে প্রসেস করা হয়েছে');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'ফলাফল প্রসেস করতে ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  // ২. ফলাফল প্রকাশ / প্রত্যাহার
  const togglePublishMutation = useMutation({
    mutationFn: ({ examId, isPublished }) => {
      return updateExamApi(examId, { is_published: isPublished });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'exams-list'] });
      queryClient.invalidateQueries({ queryKey: ['principal', 'merit-list'] });
      toast.success(
        variables.isPublished
          ? 'পরীক্ষার ফলাফল শিক্ষার্থীদের জন্য উন্মুক্ত (প্রকাশিত) করা হয়েছে'
          : 'ফলাফল সফলভাবে প্রত্যাহার (Unpublish) করা হয়েছে'
      );
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে';
      toast.error(msg);
    },
  });

  const handleRefreshAll = () => {
    examsQuery.refetch();
    meritListQuery.refetch();
    analysisQuery.refetch();
    failedStatsQuery.refetch();
    configsQuery.refetch();
    if (selectedSectionId) checklistAuditQuery.refetch();
  };

  return {
    exams,
    selectedExamId: activeExamId,
    setSelectedExamId,
    selectedExam,
    isExamPublished: selectedExam?.is_published ?? false,
    sections: filteredSections,
    selectedSectionId,
    setSelectedSectionId,
    selectedGroup,
    setSelectedGroup,
    failedGender,
    setFailedGender,
    meritList,
    analysisList,
    failedList,
    configs,
    checklistAudit,
    loadingExams: examsQuery.isLoading,
    loadingMerit: meritListQuery.isLoading,
    loadingAnalysis: analysisQuery.isLoading,
    loadingFailed: failedStatsQuery.isLoading,
    loadingChecklist: checklistAuditQuery.isLoading,
    refetchAll: handleRefreshAll,
    processResults: processResultsMutation.mutateAsync,
    isProcessing: processResultsMutation.isPending,
    togglePublish: togglePublishMutation.mutateAsync,
    isTogglingPublish: togglePublishMutation.isPending,
  };
};
