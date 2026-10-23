import React from 'react';
import { Clock, Plus, Edit2, Trash2, MapPin, User, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, name: 'শনিবার', short: 'শনি' },
  { id: 1, name: 'রবিবার', short: 'রবি' },
  { id: 2, name: 'সোমবার', short: 'সোম' },
  { id: 3, name: 'মঙ্গলবার', short: 'মঙ্গল' },
  { id: 4, name: 'বুধবার', short: 'বুধ' },
  { id: 5, name: 'বৃহস্পতিবার', short: 'বৃহঃ' },
];

const RoutineMobileDayList = ({
  periods,
  routines,
  selectedDay,
  setSelectedDay,
  canEdit,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}) => {
  const findSlot = (dayId, period) => {
    return routines.find((r) => {
      if (Number(r.day_of_week) !== dayId) return false;
      const rStart = (r.start_time || '').slice(0, 5);
      const pStart = (period.start || '').slice(0, 5);
      return rStart === pStart || (period.start <= r.start_time && (!period.end || r.start_time < period.end));
    });
  };

  return (
    <div className="md:hidden space-y-4">
      {/* দিন নির্বাচনের অনুভূমিক স্ক্রোল চিপস */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day.id;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDay(day.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition min-h-[44px] cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-brand-orange text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{day.name}</span>
            </button>
          );
        })}
      </div>

      {/* নির্বাচিত দিনের পিরিয়ড তালিকা */}
      <div className="space-y-3">
        {periods.map((period, idx) => {
          if (period.isBreak || period.isAssembly) {
            return (
              <div
                key={idx}
                className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3 text-center text-xs font-bold text-amber-900"
              >
                <span>{period.label} ({period.timeDisplay})</span>
              </div>
            );
          }

          const slot = findSlot(selectedDay, period);

          return (
            <div
              key={idx}
              className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft space-y-2.5"
            >
              {/* পিরিয়ড হেডার */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-brand-navy">
                  {period.label}
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {period.timeDisplay}
                </span>
              </div>

              {slot ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-black text-brand-navy">
                      {slot.subject_name}
                    </h4>
                    {slot.room_number && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-bold shrink-0">
                        <MapPin className="h-3 w-3 text-blue-600" />
                        {slot.room_number}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{slot.teacher_name || 'মনোনীত শিক্ষক নেই'}</span>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditSlot(slot)}
                          className="p-2 rounded-xl text-slate-600 hover:text-brand-navy hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSlot(slot.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center">
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => onAddSlot(selectedDay, period)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:border-brand-orange hover:text-brand-orange transition min-h-[44px] cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>ক্লাস স্লট নির্ধারণ করুন</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">কোনো ক্লাস নির্ধারিত নেই</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoutineMobileDayList;
