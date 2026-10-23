import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getQuestionPaperSubmissionsApi, reviewQuestionPaperApi } from '../api/principal';
import { getSubjectsApi } from '../api/teacher';

export const useQuestionPaperReview = (selectedExam = null, configs = []) => {
  const queryClient = useQueryClient();

  // ১. প্রশ্নপত্র জমাদানের তালিকা
  const questionsQuery = useQuery({
    queryKey: ['principal', 'question-papers', selectedExam?.id],
    queryFn: async () => {
      const params = selectedExam?.id ? { exam: selectedExam.id } : {};
      const res = await getQuestionPaperSubmissionsApi(params);
      const list = res?.results || res || [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const questionPapers = questionsQuery.data || [];

  // ২. বিষয় ও বিষয়ের শিক্ষক তালিকা
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

  // ৩. প্রশ্নপত্র রিভিউ মিউটেশন (অনুমোদন বা সংশোধন অনুরোধ)
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, feedback }) => reviewQuestionPaperApi(id, status, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['principal', 'question-papers'] });
      // ড্যাশবোর্ডের "অনুমোদনের অপেক্ষায়" ব্যাজ কাউন্ট স্বয়ংক্রিয়ভাবে আপডেট করা
      queryClient.invalidateQueries({ queryKey: ['principal', 'pending-approvals-matrix'] });

      if (variables.status === 'ACCEPTED') {
        toast.success('প্রশ্নপত্র সফলভাবে অনুমোদিত হয়েছে');
      } else if (variables.status === 'REVISION') {
        toast.success('প্রশ্নপত্র সংশোধনের নির্দেশনা শিক্ষকের কাছে পাঠানো হয়েছে');
      } else {
        toast.success('প্রশ্নপত্রের স্ট্যাটাস সফলভাবে সংরক্ষিত হয়েছে');
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'প্রশ্নপত্র রিভিউ সম্পন্ন করা যায়নি';
      toast.error(msg);
    },
  });

  // ৪. স্পেসিফিকেশন ৫: ১০০% ব্যাকএন্ড ডেটা থেকে যেসব শিক্ষক এখনো প্রশ্নপত্র জমা দেননি এবং ডেডলাইন হিসাব
  const submissionTracking = useMemo(() => {
    if (!selectedExam || !Array.isArray(configs) || configs.length === 0) {
      return {
        totalSubjects: 0,
        submittedCount: 0,
        pendingCount: 0,
        unsubmittedItems: [],
        submissionRate: 0,
        isOverdue: false,
        daysRemaining: null,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = selectedExam.start_date ? new Date(selectedExam.start_date) : null;
    let daysRemaining = null;
    let isOverdue = false;

    if (deadline) {
      deadline.setHours(0, 0, 0, 0);
      const diffTime = deadline.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isOverdue = daysRemaining < 0;
    }

    const unsubmitted = [];
    let submittedCount = 0;

    configs.forEach((cfg) => {
      const subject = subjects.find(
        (s) => String(s.id) === String(cfg.subject) || s.code === cfg.subject_code
      );
      const submission = questionPapers.find(
        (qp) => String(qp.subject) === String(cfg.subject)
      );

      const teacherName =
        submission?.teacher_name ||
        subject?.default_teacher_name ||
        'নির্ধারিত শিক্ষক নেই';

      if (submission && submission.status === 'ACCEPTED') {
        submittedCount += 1;
      } else if (submission && submission.status === 'SUBMITTED') {
        // জমা হয়েছে কিন্তু রিভিউ অপেক্ষমাণ
        unsubmitted.push({
          configId: cfg.id,
          subjectId: cfg.subject,
          subjectName: cfg.subject_name || subject?.name || 'অজানা বিষয়',
          subjectCode: cfg.subject_code || subject?.code || 'N/A',
          teacherName,
          status: 'PENDING_REVIEW',
          statusLabel: 'অনুমোদনের অপেক্ষায়',
          submission,
          deadline: selectedExam.start_date,
          daysRemaining,
          isOverdue,
        });
      } else if (submission && submission.status === 'REVISION') {
        // সংশোধন প্রয়োজন
        unsubmitted.push({
          configId: cfg.id,
          subjectId: cfg.subject,
          subjectName: cfg.subject_name || subject?.name || 'অজানা বিষয়',
          subjectCode: cfg.subject_code || subject?.code || 'N/A',
          teacherName,
          status: 'REVISION',
          statusLabel: 'সংশোধন আবশ্যক',
          submission,
          deadline: selectedExam.start_date,
          daysRemaining,
          isOverdue,
        });
      } else {
        // আদৌ জমা দেওয়া হয়নি
        unsubmitted.push({
          configId: cfg.id,
          subjectId: cfg.subject,
          subjectName: cfg.subject_name || subject?.name || 'অজানা বিষয়',
          subjectCode: cfg.subject_code || subject?.code || 'N/A',
          teacherName,
          status: 'NOT_SUBMITTED',
          statusLabel: 'জমা দেওয়া হয়নি',
          submission: null,
          deadline: selectedExam.start_date,
          daysRemaining,
          isOverdue,
        });
      }
    });

    const totalSubjects = configs.length;
    const pendingCount = unsubmitted.length;
    const submissionRate = totalSubjects > 0 ? Math.round((submittedCount / totalSubjects) * 100) : 0;

    return {
      totalSubjects,
      submittedCount,
      pendingCount,
      unsubmittedItems: unsubmitted,
      submissionRate,
      isOverdue,
      daysRemaining,
    };
  }, [selectedExam, configs, questionPapers, subjects]);

  return {
    questionPapers,
    loadingQuestions: questionsQuery.isLoading,
    refetchQuestions: questionsQuery.refetch,
    reviewPaper: reviewMutation.mutateAsync,
    isReviewing: reviewMutation.isPending,
    submissionTracking,
  };
};
