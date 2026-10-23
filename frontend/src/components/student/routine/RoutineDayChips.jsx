import React from 'react';

export const DAYS_OF_WEEK = [
  { id: 0, label: 'শনিবার', shortLabel: 'শনি', en: 'Saturday' },
  { id: 1, label: 'রবিবার', shortLabel: 'রবি', en: 'Sunday' },
  { id: 2, label: 'সোমবার', shortLabel: 'সোম', en: 'Monday' },
  { id: 3, label: 'মঙ্গলবার', shortLabel: 'মঙ্গল', en: 'Tuesday' },
  { id: 4, label: 'বুধবার', shortLabel: 'বুধ', en: 'Wednesday' },
  { id: 5, label: 'বৃহস্পতিবার', shortLabel: 'বৃহস্পতি', en: 'Thursday' },
  { id: 6, label: 'শুক্রবার', shortLabel: 'শুক্র', en: 'Friday' },
];

// জাভাস্ক্রিপ্ট getDay() (0=Sun..6=Sat) থেকে মডেল ডে (0=Sat..6=Fri) রূপান্তর
export const getTodayModelDay = () => {
  const jsDay = new Date().getDay();
  return (jsDay + 1) % 7;
};

// সংখ্যাকে বাংলায় রূপান্তর
export const toBanglaNumber = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

const RoutineDayChips = ({ selectedDay, onSelectDay, routineCountsByDay = {} }) => {
  const todayModelDay = getTodayModelDay();

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selectedDay === day.id;
        const isToday = todayModelDay === day.id;
        const classCount = routineCountsByDay[day.id] || 0;

        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(day.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap min-h-[46px] border ${
              isSelected
                ? 'bg-brand-navy text-white border-brand-navy shadow-soft scale-[1.02]'
                : isToday
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/70'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{day.label}</span>

            {/* আজ নির্দেশক ব্যাজ */}
            {isToday && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-brand-orange text-white' : 'bg-amber-200 text-amber-900'
                }`}
              >
                আজ
              </span>
            )}

            {/* পিরিয়ড সংখ্যা (যদি ০ এর বেশি হয় অথবা শুক্রবার না হয়) */}
            {day.id !== 6 && classCount > 0 && (
              <span
                className={`text-[11px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {toBanglaNumber(classCount)}
              </span>
            )}

            {/* শুক্রবার হলে ছুটির চিহ্ন */}
            {day.id === 6 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                ছুটি
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default RoutineDayChips;
