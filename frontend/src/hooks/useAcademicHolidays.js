import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAcademicHolidaysApi,
  createAcademicHolidayApi,
  updateAcademicHolidayApi,
  deleteAcademicHolidayApi,
} from '../api/academics';
import { toast } from 'sonner';

export const useAcademicHolidays = () => {
  const queryClient = useQueryClient();

  // ভিউ মোড: 'table' (তালিকা) অথবা 'calendar' (ক্যালেন্ডার গ্রিড)
  const [calendarViewMode, setCalendarViewMode] = useState('table');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // মোডাল ও সাবমিট স্টেট
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingHoliday, setDeletingHoliday] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ১. ছুটির দিন কোয়েরি (TanStack Query)
  const {
    data: holidays = [],
    isLoading: loading,
    refetch: refetchHolidays,
  } = useQuery({
    queryKey: ['academics', 'holidays'],
    queryFn: async () => {
      const res = await getAcademicHolidaysApi({ _t: Date.now() });
      return res?.results || res || [];
    },
    staleTime: 1000 * 60 * 3,
  });

  const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const banglaWeekdays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

  // কত দিন ছুটি তা হিসাব
  const calculateDuration = (start, end) => {
    if (!start || !end) return '১ দিন';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} দিন`;
  };

  // ক্যালেন্ডার ডেটা প্রসেসিং (সপ্তাহ শুরু শনিবার দিয়ে)
  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // শনিবার = 0 ইনডেক্স করার জন্য:
    // JS getDay(): 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    // (getDay() + 1) % 7 -> Sat(6) => 0, Sun(0) => 1, ..., Fri(5) => 6
    const firstDayIndex = (firstDay.getDay() + 1) % 7;
    const totalDays = lastDay.getDate();

    const daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (new Date(year, month, d).getDay() + 1) % 7;
      daysArray.push({
        dayNumber: d,
        dateString: dateStr,
        isFriday: dayOfWeek === 6,
      });
    }

    return daysArray;
  }, [currentCalendarDate]);

  const findHolidayForDate = (dateString) => {
    return holidays.find((h) => h.start_date <= dateString && dateString <= h.end_date);
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // ছুটি সেভ (Create / Edit)
  const handleSaveHoliday = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        holiday_type: formData.holiday_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_attendance_locked: formData.is_attendance_locked !== false,
      };

      if (editingHoliday?.id) {
        await updateAcademicHolidayApi(editingHoliday.id, payload);
        toast.success(`'${formData.title}' ছুটির তথ্য আপডেট করা হয়েছে`);
      } else {
        await createAcademicHolidayApi(payload);
        toast.success(`'${formData.title}' সফলভাবে ছুটির তালিকায় যুক্ত হয়েছে`);
      }

      queryClient.invalidateQueries({ queryKey: ['academics', 'holidays'] });
      setCreateEditModalOpen(false);
      setEditingHoliday(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'ছুটি সংরক্ষণ ব্যর্থ হয়েছে';
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // ছুটি মুছে ফেলা
  const handleDeleteHoliday = async (holiday) => {
    setSubmitting(true);
    try {
      await deleteAcademicHolidayApi(holiday.id);
      toast.success(`'${holiday.title}' সফলভাবে তালিকা থেকে মুছে ফেলা হয়েছে`);
      queryClient.invalidateQueries({ queryKey: ['academics', 'holidays'] });
      setDeleteModalOpen(false);
      setDeletingHoliday(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'ছুটি মুছতে ব্যর্থ হয়েছে');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    holidays,
    loading,
    refetchHolidays,
    // Calendar & View State
    calendarViewMode,
    setCalendarViewMode,
    currentCalendarDate,
    setCurrentCalendarDate,
    banglaMonths,
    banglaWeekdays,
    calendarDays,
    findHolidayForDate,
    handlePrevMonth,
    handleNextMonth,
    calculateDuration,
    // Modals
    createEditModalOpen,
    setCreateEditModalOpen,
    editingHoliday,
    setEditingHoliday,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingHoliday,
    setDeletingHoliday,
    submitting,
    // Actions
    handleSaveHoliday,
    handleDeleteHoliday,
  };
};
