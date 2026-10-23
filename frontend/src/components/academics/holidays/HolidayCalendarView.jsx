import React from 'react';
import { Lock, Plus } from 'lucide-react';

const HolidayCalendarView = ({
  calendarDays,
  banglaWeekdays,
  findHolidayForDate,
  canEdit,
  onDateClick,
}) => {
  return (
    <div className="rounded-3xl bg-white p-6 border-2 border-slate-200 shadow-premium">
      {/* সপ্তাহের বারের নাম */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold pb-3 mb-2 border-b border-slate-200">
        {banglaWeekdays.map((dayName, idx) => (
          <div
            key={idx}
            className={`py-1.5 rounded-xl ${
              idx === 6 ? 'text-red-600 bg-red-50/50' : 'text-brand-navy'
            }`}
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* ক্যালেন্ডারের দিনগুলো */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((item, idx) => {
          if (!item) {
            return (
              <div
                key={idx}
                className="min-h-[90px] rounded-2xl bg-slate-50/40 opacity-40"
              />
            );
          }

          const holiday = findHolidayForDate(item.dateString);
          const isFriday = item.isFriday;

          return (
            <div
              key={idx}
              onClick={() => {
                if (canEdit && !holiday && !isFriday) {
                  onDateClick(item.dateString);
                }
              }}
              className={`min-h-[95px] p-2 rounded-2xl border transition flex flex-col justify-between ${
                holiday
                  ? 'bg-rose-50/70 border-rose-200'
                  : isFriday
                  ? 'bg-red-50/30 border-red-100'
                  : 'bg-white border-slate-100 hover:border-brand-orange/40 hover:bg-orange-50/20 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black ${
                    holiday || isFriday ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {item.dayNumber}
                </span>

                {holiday?.is_attendance_locked && (
                  <span title="ডিজিটাল হাজিরা লক">
                    <Lock className="h-3 w-3 text-red-500" />
                  </span>
                )}
              </div>

              {holiday ? (
                <div className="mt-1">
                  <div
                    className="text-[10px] font-extrabold text-rose-900 bg-rose-100/80 px-1.5 py-0.5 rounded truncate"
                    title={holiday.title}
                  >
                    {holiday.title}
                  </div>
                  <span className="text-[9px] text-rose-700 font-bold block mt-0.5">
                    {holiday.holiday_type_display || holiday.holiday_type}
                  </span>
                </div>
              ) : isFriday ? (
                <span className="text-[10px] font-bold text-red-400 self-center">
                  সাপ্তাহিক ছুটি
                </span>
              ) : (
                canEdit && (
                  <span className="text-[9px] text-slate-300 hover:text-brand-orange font-bold self-center opacity-0 hover:opacity-100 transition">
                    + ছুটি দিন
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HolidayCalendarView;
