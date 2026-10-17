import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  List, 
  Trash2, 
  CalendarOff,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const HolidaysTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit = (isPrincipal || overrideRole === 'PRINCIPAL') && overrideRole !== 'TEACHER' && user?.role !== 'TEACHER';

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // ভিউ মোড: 'calendar' (ক্যালেন্ডার গ্রিড) অথবা 'table' (সকল ছুটির তালিকা)
  const [calendarViewMode, setCalendarViewMode] = useState('table'); // ডিফল্ট তালিকা ভিউ
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    title: '', 
    holiday_type: 'GOVERNMENT', 
    start_date: new Date().toISOString().split('T')[0], 
    end_date: new Date().toISOString().split('T')[0], 
    is_attendance_locked: true
  });

  const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const banglaWeekdays = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

  const fetchHolidays = async () => {
    try {
      // _t দিয়ে ক্যাশ বাইপাস করে লাইভ ডেটা আনা হচ্ছে
      const res = await api.get(`academics/holidays/?_t=${Date.now()}`);
      setHolidays(res.data.results || res.data || []);
    } catch (err) {
      toast.error('ছুটির তথ্য লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // নতুন ছুটি সংরক্ষণ
  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('academics/holidays/', holidayForm);
      if (res.status === 201) {
        toast.success(`'${res.data.title}' সফলভাবে ছুটির তালিকায় যুক্ত হয়েছে`);
        setShowHolidayModal(false);
        setHolidayForm({ 
          title: '', 
          holiday_type: 'GOVERNMENT', 
          start_date: new Date().toISOString().split('T')[0], 
          end_date: new Date().toISOString().split('T')[0], 
          is_attendance_locked: true 
        });
        fetchHolidays();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ছুটি সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  // ছুটি ডিলিট করা
  const handleDeleteHoliday = async (id, title) => {
    if (!window.confirm(`আপনি কি '${title}' ছুটিটি মুছে ফেলতে চান?`)) return;
    try {
      await api.delete(`academics/holidays/${id}/`);
      toast.success('ছুটি সফলভাবে তালিকা থেকে মুছে ফেলা হয়েছে');
      fetchHolidays();
    } catch (err) {
      toast.error('ছুটি মুছতে ব্যর্থ হয়েছে');
    }
  };

  // কত দিন ছুটি তা হিসাব
  const calculateDuration = (start, end) => {
    if (!start || !end) return '১ দিন';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} দিন`;
  };

  // ক্যালেন্ডার ডেটা প্রসেসিং
  const getCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

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
  };

  const findHolidayForDate = (dateString) => {
    return holidays.find(h => h.start_date <= dateString && dateString <= h.end_date);
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCalendarDateClick = (dateString) => {
    setHolidayForm({
      title: '',
      holiday_type: 'GOVERNMENT',
      start_date: dateString,
      end_date: dateString,
      is_attendance_locked: true,
    });
    setShowHolidayModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* কন্ট্রোল বার: ভিউ টগল ও নতুন ছুটি বাটন */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
        
        {/* ভিউ মোড অনুযায়ী হেডার */}
        {calendarViewMode === 'calendar' ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm transition"
                title="পূর্ববর্তী মাস"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm transition"
                title="পরবর্তী মাস"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-brand-navy">
                {banglaMonths[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </h3>
              <span className="text-xs text-slate-400 font-medium">মাসিক ক্যালেন্ডার ভিউ</span>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-black text-brand-navy">সকল ছুটির তালিকা</h3>
            <span className="text-xs text-slate-500 font-bold">
              মোট নির্ধারিত ছুটি: <strong className="text-brand-orange">{holidays.length} টি</strong>
            </span>
          </div>
        )}

        {/* ডানপাশ: ভিউ সুইচ ও বাটন */}
        <div className="flex items-center space-x-2.5">
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setCalendarViewMode('table')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                calendarViewMode === 'table' ? 'bg-[#0F2C59] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>তালিকা ভিউ</span>
            </button>
            <button
              onClick={() => setCalendarViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                calendarViewMode === 'calendar' ? 'bg-[#0F2C59] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>ক্যালেন্ডার ভিউ</span>
            </button>
          </div>

          {canEdit && (
            <button
              onClick={() => {
                setHolidayForm({
                  title: '',
                  holiday_type: 'GOVERNMENT',
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date().toISOString().split('T')[0],
                  is_attendance_locked: true,
                });
                setShowHolidayModal(true);
              }}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন ছুটি নির্ধারণ</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= ভিউ ১: সকল ছুটির তালিকা টেবিল (Table View) ================= */}
      {calendarViewMode === 'table' && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
              <tr>
                <th className="p-3 w-12 text-center">SL</th>
                <th className="p-3">ছুটির শিরোনাম</th>
                <th className="p-3">ছুটির ধরন</th>
                <th className="p-3">শুরুর তারিখ</th>
                <th className="p-3">শেষের তারিখ</th>
                <th className="p-3 text-center">মোট সময়</th>
                <th className="p-3 text-center">হাজিরা স্ট্যাটাস</th>
                {canEdit && <th className="p-3 text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? "8" : "7"} className="py-12 text-center text-slate-400">
                    <CalendarOff className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">বর্তমানে কোনো ছুটির দিন নির্ধারিত নেই।</p>
                  </td>
                </tr>
              ) : (
                holidays.map((h, index) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center text-slate-400">{index + 1}</td>
                    <td className="p-3 font-bold text-brand-navy text-sm">{h.title}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                        h.holiday_type === 'GOVERNMENT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        h.holiday_type === 'RELIGIOUS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        h.holiday_type === 'WEEKEND' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {h.holiday_type_display}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700 font-bold">{h.start_date}</td>
                    <td className="p-3 font-mono text-slate-700 font-bold">{h.end_date}</td>
                    <td className="p-3 text-center font-bold text-brand-orange">
                      {calculateDuration(h.start_date, h.end_date)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center space-x-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold">
                        <Lock className="h-3 w-3 mr-0.5" />
                        <span>হাজিরা লক</span>
                      </span>
                    </td>
                    {canEdit && (
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteHoliday(h.id, h.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="ছুটি ডিলিট করুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= ভিউ ২: মাসিক ক্যালেন্ডার গ্রিড (Calendar View) ================= */}
      {calendarViewMode === 'calendar' && (
        <div className="rounded-3xl bg-white p-6 border-2 border-slate-200 shadow-premium">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold pb-3 mb-2 border-b border-slate-200">
            {banglaWeekdays.map((dayName, idx) => (
              <div key={idx} className={`py-1.5 rounded-xl ${idx === 6 ? 'text-red-600 bg-red-50/50' : 'text-brand-navy'}`}>
                {dayName}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((item, idx) => {
              if (!item) {
                return <div key={idx} className="min-h-[90px] rounded-2xl bg-slate-50/40 opacity-40"></div>;
              }

              const holiday = findHolidayForDate(item.dateString);
              const isWeekendFriday = item.isFriday;

              let cellBg = 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200';
              let badgeBg = '';

              if (holiday) {
                if (holiday.holiday_type === 'GOVERNMENT') {
                  cellBg = 'bg-rose-50 border-rose-300';
                  badgeBg = 'bg-rose-600 text-white';
                } else if (holiday.holiday_type === 'RELIGIOUS') {
                  cellBg = 'bg-emerald-50 border-emerald-300';
                  badgeBg = 'bg-emerald-600 text-white';
                } else {
                  cellBg = 'bg-orange-50 border-orange-300';
                  badgeBg = 'bg-brand-orange text-white';
                }
              } else if (isWeekendFriday) {
                cellBg = 'bg-amber-50/50 border-amber-200';
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleCalendarDateClick(item.dateString)}
                  className={`group relative min-h-[90px] p-2.5 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${cellBg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${holiday ? 'text-rose-700' : isWeekendFriday ? 'text-amber-700' : 'text-slate-800'}`}>
                      {item.dayNumber}
                    </span>

                    {isWeekendFriday && !holiday && (
                      <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                        শুক্রবার
                      </span>
                    )}
                  </div>

                  {holiday && (
                    <div className="mt-1">
                      <span className={`block truncate rounded-lg px-2 py-1 text-[10px] font-extrabold text-center shadow-sm ${badgeBg}`}>
                        {holiday.title}
                      </span>
                    </div>
                  )}

                  {!holiday && !isWeekendFriday && (
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-400 text-center transition">
                      + ছুটি দিন
                    </span>
                  )}

                  {/* হোভার টুলটিপ */}
                  {holiday && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-52 rounded-2xl bg-slate-900/95 p-3 text-white shadow-2xl backdrop-blur-md group-hover:block z-40 border border-slate-700">
                      <h4 className="font-extrabold text-xs text-white leading-snug">{holiday.title}</h4>
                      <span className="mt-1 inline-block rounded-md bg-brand-orange px-2 py-0.5 text-[9px] font-extrabold text-white">
                        {holiday.holiday_type_display}
                      </span>
                      <p className="mt-1 text-[10px] text-slate-300">
                        মেয়াদ: {holiday.start_date} হতে {holiday.end_date}
                      </p>
                      {holiday.is_attendance_locked && (
                        <div className="mt-1.5 flex items-center space-x-1 text-[10px] font-bold text-rose-300">
                          <span>🔒 হাজিরা সম্পূর্ণ লক থাকবে</span>
                        </div>
                      )}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="font-bold text-slate-800">কালার সংকেত:</span>
            <span className="flex items-center"><span className="h-3 w-3 rounded-full bg-rose-600 mr-1.5"></span> সরকারি ছুটি</span>
            <span className="flex items-center"><span className="h-3 w-3 rounded-full bg-emerald-600 mr-1.5"></span> ধর্মীয় উৎসব</span>
            <span className="flex items-center"><span className="h-3 w-3 rounded-full bg-amber-500 mr-1.5"></span> সাপ্তাহিক ছুটি (শুক্রবার)</span>
            <span className="flex items-center"><span className="h-3 w-3 rounded-full bg-brand-orange mr-1.5"></span> কলেজ ছুটি</span>
          </div>
        </div>
      )}

      {/* ================= নতুন ছুটি নির্ধারণ মডাল ================= */}
      {canEdit && showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-3">নতুন ছুটির দিন নির্ধারণ</h3>
            <form onSubmit={handleCreateHoliday} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ছুটির শিরোনাম</label>
                <input
                  type="text" 
                  placeholder="যেমন: মহান বিজয় দিবস বা পবিত্র ঈদুল ফিতর"
                  value={holidayForm.title} 
                  onChange={e => setHolidayForm({...holidayForm, title: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ছুটির ধরন</label>
                <select
                  value={holidayForm.holiday_type} 
                  onChange={e => setHolidayForm({...holidayForm, holiday_type: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                >
                  <option value="GOVERNMENT">সরকারি ছুটি (Government Holiday)</option>
                  <option value="RELIGIOUS">ধর্মীয় উৎসব (Religious Festival)</option>
                  <option value="WEEKEND">সাপ্তাহিক ছুটি/শুক্রবার (Weekend)</option>
                  <option value="COLLEGE">কলেজ নিজস্ব ছুটি (College Authority)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={holidayForm.start_date} 
                    onChange={e => setHolidayForm({...holidayForm, start_date: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={holidayForm.end_date} 
                    onChange={e => setHolidayForm({...holidayForm, end_date: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none" 
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox" 
                  id="lockAttnModal"
                  checked={holidayForm.is_attendance_locked} 
                  onChange={e => setHolidayForm({...holidayForm, is_attendance_locked: e.target.checked})}
                  className="h-4 w-4 text-brand-orange rounded"
                />
                <label htmlFor="lockAttnModal" className="text-xs font-bold text-slate-700 cursor-pointer">
                  এই দিনে হাজিরা সম্পূর্ণ লক থাকবে
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowHolidayModal(false)} 
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button 
                  type="submit" 
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidaysTab;