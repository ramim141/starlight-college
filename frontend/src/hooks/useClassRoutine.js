import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import {
  getClassRoutinesApi,
  createClassRoutineSlotApi,
  updateClassRoutineSlotApi,
  deleteClassRoutineSlotApi,
} from '../api/academics';
import { toast } from 'sonner';

export const useClassRoutine = () => {
  const queryClient = useQueryClient();

  // শিফট ও নির্বাচিত সেকশন
  const [routineGender, setRoutineGender] = useState('FEMALE'); // FEMALE | MALE
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedMobileDay, setSelectedMobileDay] = useState(1); // 1 = রবিবার

  // পিরিয়ড শিডিউল কনফিগ
  const defaultFemalePeriods = [
    { period: '১ম', label: '১ম পিরিয়ড', timeDisplay: '০৯:১০ - ১০:০৫', start: '09:10', end: '10:05' },
    { period: '২য়', label: '২য় পিরিয়ড', timeDisplay: '১০:০৬ - ১০:৫০', start: '10:06', end: '10:50' },
    { period: '৩য়', label: '৩য় পিরিয়ড', timeDisplay: '১০:৫১ - ১১:৩০', start: '10:51', end: '11:30' },
    { isBreak: true, period: 'বিরতি', label: 'টিফিন বিরতি', timeDisplay: '১১:৩১ - ১১:৫০', start: '11:31', end: '11:50' },
    { period: '৪র্থ', label: '৪র্থ পিরিয়ড', timeDisplay: '১১:৫১ - ১২:৩০', start: '11:51', end: '12:30' },
    { period: '৫ম', label: '৫ম পিরিয়ড', timeDisplay: '১২:৩১ - ০১:১৫', start: '12:31', end: '13:15' },
    { period: '৬ষ্ঠ', label: '৬ষ্ঠ পিরিয়ড', timeDisplay: '০১:১৬ - ০১:৫৫', start: '13:16', end: '13:55' },
  ];

  const defaultMalePeriods = [
    { isAssembly: true, period: 'সমাবেশ', label: 'প্রাতঃ সমাবেশ', timeDisplay: '০৯:৫৫ - ১০:০৫', start: '09:55', end: '10:05' },
    { period: '১ম', label: '১ম পিরিয়ড', timeDisplay: '১০:০৬ - ১০:৫০', start: '10:06', end: '10:50' },
    { period: '২য়', label: '২য় পিরিয়ড', timeDisplay: '১০:৫১ - ১১:৩০', start: '10:51', end: '11:30' },
    { period: '৩য়', label: '৩য় পিরিয়ড', timeDisplay: '১১:৩১ - ১২:১০', start: '11:31', end: '12:10' },
    { isBreak: true, period: 'বিরতি', label: 'নামাজ ও টিফিন', timeDisplay: '১২:১১ - ১২:৩০', start: '12:11', end: '12:30' },
    { period: '৪র্থ', label: '৪র্থ পিরিয়ড', timeDisplay: '১২:৩১ - ০১:১৫', start: '12:31', end: '13:15' },
    { period: '৫ম', label: '৫ম পিরিয়ড', timeDisplay: '০১:১৬ - ০১:৫৫', start: '13:16', end: '13:55' },
    { period: '৬ষ্ঠ', label: '৬ষ্ঠ পিরিয়ড', timeDisplay: '০১:৫৬ - ০২:৩৫', start: '13:56', end: '14:35' },
  ];

  const [femalePeriods, setFemalePeriods] = useState(() => {
    try {
      const saved = localStorage.getItem('college_routine_female_periods');
      return saved ? JSON.parse(saved) : defaultFemalePeriods;
    } catch {
      return defaultFemalePeriods;
    }
  });

  const [malePeriods, setMalePeriods] = useState(() => {
    try {
      const saved = localStorage.getItem('college_routine_male_periods');
      return saved ? JSON.parse(saved) : defaultMalePeriods;
    } catch {
      return defaultMalePeriods;
    }
  });

  const activePeriods = routineGender === 'FEMALE' ? femalePeriods : malePeriods;

  // মোডাল ও অ্যাকশন স্টেট
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [periodConfigModalOpen, setPeriodConfigModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [backendConflictError, setBackendConflictError] = useState(null);

  // ১. সেকশন তালিকা কোয়েরি
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ['academics', 'sections'],
    queryFn: async () => {
      const res = await api.get('academics/sections/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ডিফল্ট সেকশন অটো-সিলেক্ট
  const activeSectionId = selectedSectionId || (sections[0]?.id ? String(sections[0].id) : '');

  // ২. শিক্ষক তালিকা কোয়েরি
  const { data: teachers = [] } = useQuery({
    queryKey: ['auth', 'staff', 'teachers'],
    queryFn: async () => {
      const res = await api.get('auth/staff/?role=TEACHER');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৩. বিষয় তালিকা কোয়েরি
  const { data: subjects = [] } = useQuery({
    queryKey: ['academics', 'subjects'],
    queryFn: async () => {
      const res = await api.get('academics/subjects/');
      return res.data?.results || res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ৪. রুটিন স্লট কোয়েরি (নির্বাচিত সেকশনের সম্পূর্ণ সাপ্তাহিক রুটিন)
  const {
    data: routines = [],
    isLoading: loadingRoutines,
    refetch: refetchRoutines,
  } = useQuery({
    queryKey: ['academics', 'routines', activeSectionId],
    queryFn: async () => {
      if (!activeSectionId) return [];
      const res = await getClassRoutinesApi({ section: activeSectionId });
      return res?.results || res || [];
    },
    enabled: Boolean(activeSectionId),
    staleTime: 1000 * 60 * 2,
  });

  const selectedSection = useMemo(() => {
    return sections.find((s) => String(s.id) === String(activeSectionId)) || null;
  }, [sections, activeSectionId]);

  // স্লট সেভ (Create / Update) - Trust backend conflict detection
  const handleSaveSlot = async (slotData) => {
    setSubmitting(true);
    setBackendConflictError(null);
    try {
      const payload = {
        section: activeSectionId,
        subject: slotData.subject,
        teacher: slotData.teacher,
        day_of_week: Number(slotData.day_of_week),
        start_time: slotData.start_time.length === 5 ? `${slotData.start_time}:00` : slotData.start_time,
        end_time: slotData.end_time.length === 5 ? `${slotData.end_time}:00` : slotData.end_time,
        room_number: slotData.room_number || '',
      };

      if (editingSlot?.id) {
        await updateClassRoutineSlotApi(editingSlot.id, payload);
        toast.success('রুটিন স্লট সফলভাবে আপডেট করা হয়েছে');
      } else {
        await createClassRoutineSlotApi(payload);
        toast.success('নতুন রুটিন স্লট যুক্ত হয়েছে');
      }

      queryClient.invalidateQueries({ queryKey: ['academics', 'routines'] });
      setSlotModalOpen(false);
      setEditingSlot(null);
    } catch (err) {
      // Extract DRF / ClassRoutine.clean() conflict messages
      const errorData = err.response?.data;
      let conflictMsg = 'ক্লাস রুটিন সংরক্ষণে সংঘাত ধরা পড়েছে।';

      if (typeof errorData === 'string') {
        conflictMsg = errorData;
      } else if (Array.isArray(errorData)) {
        conflictMsg = errorData[0];
      } else if (errorData?.non_field_errors) {
        conflictMsg = errorData.non_field_errors[0];
      } else if (errorData?.teacher) {
        conflictMsg = `শিক্ষক সংঘাত: ${errorData.teacher[0]}`;
      } else if (errorData?.section) {
        conflictMsg = `সেকশন সংঘাত: ${errorData.section[0]}`;
      } else if (errorData?.start_time || errorData?.end_time) {
        conflictMsg = `সময় সংঘাত: ${errorData.start_time?.[0] || errorData.end_time?.[0]}`;
      } else if (errorData?.detail) {
        conflictMsg = errorData.detail;
      }

      setBackendConflictError(conflictMsg);
      toast.error(conflictMsg, { duration: 5000 });
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // স্লট ডিলিট
  const handleDeleteSlot = async (slotId) => {
    setSubmitting(true);
    try {
      await deleteClassRoutineSlotApi(slotId);
      toast.success('রুটিন স্লট মুছে ফেলা হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['academics', 'routines'] });
    } catch {
      toast.error('স্লট ডিলিট ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // পিরিয়ড শিডিউল সংরক্ষণ
  const handleSavePeriods = (newSchedule) => {
    if (routineGender === 'FEMALE') {
      setFemalePeriods(newSchedule);
      localStorage.setItem('college_routine_female_periods', JSON.stringify(newSchedule));
    } else {
      setMalePeriods(newSchedule);
      localStorage.setItem('college_routine_male_periods', JSON.stringify(newSchedule));
    }
    setPeriodConfigModalOpen(false);
    toast.success('পিরিয়ড সময়সূচি আপডেট করা হয়েছে');
  };

  const handleResetDefaultPeriods = () => {
    if (routineGender === 'FEMALE') {
      setFemalePeriods(defaultFemalePeriods);
      localStorage.removeItem('college_routine_female_periods');
    } else {
      setMalePeriods(defaultMalePeriods);
      localStorage.removeItem('college_routine_male_periods');
    }
    setPeriodConfigModalOpen(false);
    toast.success('ডিফল্ট সময়সূচি রিস্টোর করা হয়েছে');
  };

  return {
    sections,
    selectedSection,
    selectedSectionId: activeSectionId,
    setSelectedSectionId,
    teachers,
    subjects,
    routines,
    loading: loadingSections || loadingRoutines,
    refetchRoutines,
    // Shift & Day
    routineGender,
    setRoutineGender,
    activePeriods,
    selectedMobileDay,
    setSelectedMobileDay,
    // Modals
    slotModalOpen,
    setSlotModalOpen,
    editingSlot,
    setEditingSlot,
    periodConfigModalOpen,
    setPeriodConfigModalOpen,
    submitting,
    backendConflictError,
    setBackendConflictError,
    // Actions
    handleSaveSlot,
    handleDeleteSlot,
    handleSavePeriods,
    handleResetDefaultPeriods,
  };
};
