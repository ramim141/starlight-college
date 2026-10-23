import React from 'react';
import { CalendarOff, Sun, Coffee } from 'lucide-react';

const RoutineHolidayNotice = ({ 
  isFriday = false, 
  holiday = null, 
  dayLabel = '' 
}) => {
  if (isFriday) {
    return (
      <div className="rounded-3xl bg-linear-to-br from-amber-50 to-orange-50/50 p-6 sm:p-8 border border-amber-200/80 text-center space-y-3 shadow-soft">
        <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mx-auto">
          <Coffee className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-brand-navy">
            {dayLabel} — সাপ্তাহিক ছুটি (Weekend)
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            সাপ্তাহিক ছুটির দিন হওয়ায় আজ কোনো নিয়মিত ক্লাস অনুষ্ঠিত হবে না। পূর্ববর্তী পাঠ পুনরাবৃত্তি করুন এবং আগামী সপ্তাহের প্রস্তুতির জন্য অন্যান্য দিনের রুটিন দেখুন।
          </p>
        </div>
      </div>
    );
  }

  if (holiday) {
    return (
      <div className="rounded-3xl bg-linear-to-br from-blue-50 to-indigo-50/50 p-6 sm:p-8 border border-blue-200/80 text-center space-y-3 shadow-soft">
        <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mx-auto">
          <Sun className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <span className="inline-block rounded-full bg-blue-200/80 px-3 py-0.5 text-[11px] font-black text-blue-900 mb-1">
            একাডেমিক ছুটির দিন
          </span>
          <h3 className="text-base font-black text-brand-navy">
            {holiday.name}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            সরকারি ও কলেজ ক্যালেন্ডার অনুযায়ী এই উপলক্ষে নিয়মিত ক্লাস কার্যক্রম স্থগিত থাকবে।
          </p>
        </div>
      </div>
    );
  }

  // কোনো ক্লাস শিডিউল করা না থাকলে
  return (
    <div className="rounded-3xl bg-white p-8 text-center border border-slate-200/80 shadow-soft space-y-3">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
        <CalendarOff className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-brand-navy">
          {dayLabel}বারে কোনো ক্লাস নির্ধারিত নেই
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          আপনার শাখার এই দিনের জন্য এখনো কোনো ক্লাস রুটিন এন্ট্রি করা হয়নি।
        </p>
      </div>
    </div>
  );
};

export default RoutineHolidayNotice;
