import React from 'react';
import { DAYS_OF_WEEK, getTodayModelDay, toBanglaNumber } from './RoutineDayChips';
import { formatTimeBn } from './RoutinePeriodCard';
import { Clock, MapPin, User } from 'lucide-react';

const RoutineWeeklyCompactGrid = ({ routines = [] }) => {
  const todayModelDay = getTodayModelDay();

  // দিন অনুযায়ী রুটিন সাজানো
  const routineByDay = DAYS_OF_WEEK.map((day) => {
    const slots = routines
      .filter((r) => r.day_of_week === day.id)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return {
      ...day,
      isToday: day.id === todayModelDay,
      slots,
    };
  });

  return (
    <div className="space-y-4">
      {/* বড় স্ক্রিনে গ্রিড ও মোবাইলে হরাইজন্টাল স্ক্রল */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[840px] grid grid-cols-7 gap-3">
          {routineByDay.map((day) => (
            <div
              key={day.id}
              className={`rounded-2xl border flex flex-col overflow-hidden transition ${
                day.isToday
                  ? 'border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/30'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* কলাম হেডার */}
              <div
                className={`p-3 text-center border-b ${
                  day.isToday
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-slate-50 text-slate-800 border-slate-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="text-xs font-black">{day.label}</span>
                  {day.isToday && (
                    <span className="rounded-md bg-brand-orange px-1.5 py-0.2 text-[9px] font-black text-white">
                      আজ
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                  {day.id === 6 ? 'ছুটি' : `${toBanglaNumber(day.slots.length)}টি ক্লাস`}
                </span>
              </div>

              {/* পিরিয়ড স্লট তালিকা */}
              <div className="p-2 space-y-2 flex-1">
                {day.id === 6 ? (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-[11px] font-bold text-slate-400">
                      সাপ্তাহিক ছুটি
                    </span>
                  </div>
                ) : day.slots.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-[11px] text-slate-300 font-medium">
                      ক্লাস নেই
                    </span>
                  </div>
                ) : (
                  day.slots.map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs hover:border-brand-navy hover:shadow-xs transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span className="text-brand-orange">{toBanglaNumber(idx + 1)}ম পিরিয়ড</span>
                        <span>{slot.subject_code}</span>
                      </div>

                      <h4 className="text-xs font-black text-brand-navy leading-tight truncate" title={slot.subject_name}>
                        {slot.subject_name}
                      </h4>

                      <div className="text-[10px] text-slate-500 space-y-0.5 pt-0.5 border-t border-slate-100">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{formatTimeBn(slot.start_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{slot.teacher_name}</span>
                        </div>
                        {slot.room_number && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                            <span>রুম {toBanglaNumber(slot.room_number)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutineWeeklyCompactGrid;
