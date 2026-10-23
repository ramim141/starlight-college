import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  LayoutGrid, 
  List, 
  WifiOff, 
  RefreshCw 
} from 'lucide-react';
import { getMyClassRoutineApi } from '../../api/student';
import { getAcademicHolidaysApi } from '../../api/academics';
import RoutineDayChips, { 
  DAYS_OF_WEEK, 
  getTodayModelDay, 
  toBanglaNumber 
} from '../../components/student/routine/RoutineDayChips';
import RoutinePeriodCard, { timeToMinutes } from '../../components/student/routine/RoutinePeriodCard';
import RoutineWeeklyCompactGrid from '../../components/student/routine/RoutineWeeklyCompactGrid';
import RoutineHolidayNotice from '../../components/student/routine/RoutineHolidayNotice';

const StudentRoutine = () => {
  // আজ কোন মডেল ডে (0=Sat..6=Fri)
  const initialTodayModelDay = useMemo(() => getTodayModelDay(), []);
  const [selectedDay, setSelectedDay] = useState(initialTodayModelDay);
  const [viewMode, setViewMode] = useState('DAILY'); // 'DAILY' | 'WEEKLY'
  const [currentTime, setCurrentTime] = useState(new Date());

  // লাইভ ক্লক টাইকার (প্রতি ৩০ সেকেন্ডে আপডেট হয়)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ক্লাস রুটিন ডেটা কুয়েরি (১৫ মিনিট ক্যাশ, পাবলিক-স্টুডেন্ট অফলাইন-ফ্রেন্ডলি)
  const routineQuery = useQuery({
    queryKey: ['student-routine'],
    queryFn: () => getMyClassRoutineApi(),
    staleTime: 1000 * 60 * 15, // ১৫ মিনিট ক্যাশ
    gcTime: 1000 * 60 * 60 * 24, // ২৪ ঘণ্টা মেমোরি
  });

  // একাডেমিক ক্যালেন্ডার ছুটি কুয়েরি
  const holidaysQuery = useQuery({
    queryKey: ['academic-holidays'],
    queryFn: () => getAcademicHolidaysApi(),
    staleTime: 1000 * 60 * 60,
  });

  const routines = Array.isArray(routineQuery.data)
    ? routineQuery.data
    : (routineQuery.data?.results || []);

  const holidays = Array.isArray(holidaysQuery.data)
    ? holidaysQuery.data
    : (holidaysQuery.data?.results || []);

  // সেকশনের নাম
  const sectionName = routines[0]?.section_display || 'আপনার শাখা';

  // প্রতিটি দিনে কয়টি করে ক্লাস আছে তার কাউন্টার ম্যাপ
  const routineCountsByDay = useMemo(() => {
    const counts = {};
    DAYS_OF_WEEK.forEach((d) => {
      counts[d.id] = routines.filter((r) => r.day_of_week === d.id).length;
    });
    return counts;
  }, [routines]);

  // নির্বাচিত দিনের রুটিন স্লটসমূহ (start_time অনুসারে সাজানো)
  const selectedDaySlots = useMemo(() => {
    return routines
      .filter((r) => r.day_of_week === selectedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [routines, selectedDay]);

  // আজ নির্বাচিত কি না
  const isToday = selectedDay === getTodayModelDay();

  // আজকের সময়ের হিসাব (মিনিটে)
  const nowMinutes = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  // পরবর্তী প্রথম ক্লাসের ইনডেক্স বের করা
  const nextUpcomingIndex = useMemo(() => {
    if (!isToday) return -1;
    return selectedDaySlots.findIndex((slot) => {
      const startMin = timeToMinutes(slot.start_time);
      return startMin > nowMinutes;
    });
  }, [isToday, selectedDaySlots, nowMinutes]);

  // চলমান ক্লাস আছে কি না
  const activeClass = useMemo(() => {
    if (!isToday) return null;
    return selectedDaySlots.find((slot) => {
      const startMin = timeToMinutes(slot.start_time);
      const endMin = timeToMinutes(slot.end_time);
      return nowMinutes >= startMin && nowMinutes < endMin;
    });
  }, [isToday, selectedDaySlots, nowMinutes]);

  // নির্বাচিত দিন যদি আজকের তারিখ হয় এবং কোনো সরকারি ছুটি থাকে
  const todayHoliday = useMemo(() => {
    if (!isToday) return null;
    const todayStr = currentTime.toISOString().split('T')[0];
    return holidays.find((h) => todayStr >= h.start_date && todayStr <= h.end_date);
  }, [isToday, currentTime, holidays]);

  const selectedDayObj = DAYS_OF_WEEK.find((d) => d.id === selectedDay) || DAYS_OF_WEEK[0];
  const isOffline = !navigator.onLine || (routineQuery.isError && routines.length > 0);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* ১. হেডার বার ও ভিউ টগল */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
            <span>পড়াশোনা</span>
            <span>•</span>
            <span className="text-brand-orange">ক্লাস রুটিন</span>
          </div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight leading-snug">
            দৈনিক ক্লাস রুটিন ও সময়সূচি
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            শাখা: <strong className="text-slate-800">{sectionName}</strong> — আপনার বিষয়, শিক্ষক ও ক্লাসরুমের দৈনিক তালিকা।
          </p>
        </div>

        {/* ভিউ মোড সুইচ পিল (দৈনিক / সাপ্তাহিক) */}
        <div className="flex items-center space-x-2">
          {/* রিফ্রেশ বাটন */}
          <button
            type="button"
            onClick={() => routineQuery.refetch()}
            disabled={routineQuery.isFetching}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition shadow-2xs min-h-[44px]"
            title="রুটিন রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-4 w-4 ${routineQuery.isFetching ? 'animate-spin text-brand-orange' : ''}`} />
          </button>

          <div className="flex rounded-2xl bg-slate-200/60 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('DAILY')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                viewMode === 'DAILY'
                  ? 'bg-white text-brand-navy shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>দৈনিক ভিউ</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('WEEKLY')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[40px] ${
                viewMode === 'WEEKLY'
                  ? 'bg-white text-brand-navy shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>সাপ্তাহিক রুটিন</span>
            </button>
          </div>
        </div>
      </div>

      {/* অফলাইন ক্যাশ নোটিশ */}
      {isOffline && (
        <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-xs font-bold text-amber-900 flex items-center space-x-2">
          <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
          <span>অফলাইন মোড — ক্যাশ থেকে সংরক্ষিত ক্লাস রুটিন দেখানো হচ্ছে।</span>
        </div>
      )}

      {/* চলমান ক্লাসের কুইক হাইলাইট ব্যানার (যদি থাকে) */}
      {isToday && activeClass && viewMode === 'DAILY' && (
        <div className="rounded-3xl bg-linear-to-r from-emerald-600 to-teal-700 text-white p-5 sm:p-6 shadow-md flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-200 text-xs font-black">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>এখন আপনার ক্লাস চলছে</span>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-tight">
              {activeClass.subject_name}
            </h3>
            <p className="text-xs text-emerald-100 font-medium">
              শিক্ষক: {activeClass.teacher_name} • কক্ষ: {activeClass.room_number ? `রুম ${toBanglaNumber(activeClass.room_number)}` : 'মূল কক্ষ'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block rounded-2xl bg-white/20 backdrop-blur-xs px-3.5 py-2 text-xs font-black">
              {activeClass.subject_code || 'চলমান'}
            </span>
          </div>
        </div>
      )}

      {/* ২. ভিউ কন্টেন্ট */}
      {viewMode === 'WEEKLY' ? (
        <RoutineWeeklyCompactGrid routines={routines} />
      ) : (
        <div className="space-y-5">
          {/* দিনের চিপস বার */}
          <RoutineDayChips
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            routineCountsByDay={routineCountsByDay}
          />

          {/* লোডিং শিমার কঙ্কাল */}
          {routineQuery.isLoading ? (
            <div className="space-y-3.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-slate-200 rounded-lg" />
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-6 w-48 bg-slate-200 rounded-md" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-4 bg-slate-100 rounded" />
                    <div className="h-4 bg-slate-100 rounded" />
                    <div className="h-4 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDay === 6 ? (
            /* শুক্রবার সাপ্তাহিক ছুটি */
            <RoutineHolidayNotice isFriday dayLabel="শুক্রবার" />
          ) : todayHoliday ? (
            /* সরকারি ছুটি */
            <RoutineHolidayNotice holiday={todayHoliday} dayLabel={selectedDayObj.label} />
          ) : selectedDaySlots.length === 0 ? (
            /* কোনো ক্লাস তালিকাভুক্ত নেই */
            <RoutineHolidayNotice dayLabel={selectedDayObj.label} />
          ) : (
            /* পিরিয়ড কার্ডস তালিকা */
            <div className="space-y-3.5">
              {selectedDaySlots.map((slot, idx) => (
                <RoutinePeriodCard
                  key={slot.id}
                  slot={slot}
                  index={idx}
                  isToday={isToday}
                  nowMinutes={nowMinutes}
                  isNextUpcoming={idx === nextUpcomingIndex}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRoutine;
