import React from 'react';
import { AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, name: 'শনিবার', short: 'শনি' },
  { id: 1, name: 'রবিবার', short: 'রবি' },
  { id: 2, name: 'সোমবার', short: 'সোম' },
  { id: 3, name: 'মঙ্গলবার', short: 'মঙ্গল' },
  { id: 4, name: 'বুধবার', short: 'বুধ' },
  { id: 5, name: 'বৃহস্পতিবার', short: 'বৃহঃ' },
];

const getSubjectBadgeStyle = (name) => {
  if (!name) return { bg: 'bg-slate-100 text-slate-800 border-slate-200' };
  const s = name.toLowerCase();
  if (s.includes('রসায়ন') || s.includes('chem')) return { bg: 'bg-pink-100 text-pink-800 border-pink-300' };
  if (s.includes('পদার্থ') || s.includes('phys')) return { bg: 'bg-red-100 text-red-800 border-red-300' };
  if (s.includes('জীব') || s.includes('bio')) return { bg: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
  if (s.includes('গণিত') || s.includes('math')) return { bg: 'bg-orange-100 text-orange-800 border-orange-300' };
  if (s.includes('ইংরেজি') || s.includes('eng')) return { bg: 'bg-blue-100 text-blue-900 border-blue-300' };
  if (s.includes('বাংলা') || s.includes('bang')) return { bg: 'bg-amber-100 text-amber-900 border-amber-300' };
  if (s.includes('ইতিহাস') || s.includes('hist')) return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  if (s.includes('পৌরনীতি') || s.includes('civic')) return { bg: 'bg-rose-100 text-rose-900 border-rose-300' };
  if (s.includes('যুক্তিবিদ্যা') || s.includes('logic')) return { bg: 'bg-green-100 text-green-900 border-green-300' };
  if (s.includes('ইসলামিক') || s.includes('islam')) return { bg: 'bg-teal-100 text-teal-900 border-teal-300' };
  if (s.includes('ict') || s.includes('তথ্য')) return { bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
  return { bg: 'bg-slate-100 text-slate-800 border-slate-200' };
};

const RoutineWeeklyGrid = ({
  periods,
  routines,
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
    <div className="hidden md:block rounded-3xl bg-white p-6 border border-slate-200 shadow-soft overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#0F2C59] text-white">
            <th className="p-3 w-28 text-center font-bold border-r border-blue-900/40">বার / দিন</th>
            {periods.map((p, idx) => (
              <th
                key={idx}
                className={`p-2.5 text-center font-bold border-r border-blue-900/30 ${
                  p.isBreak || p.isAssembly ? 'bg-slate-800/80 text-amber-300' : ''
                }`}
              >
                <div className="text-[12px]">{p.label}</div>
                <div className="text-[10px] font-mono opacity-80 mt-0.5">{p.timeDisplay}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {DAYS_OF_WEEK.map((day) => (
            <tr key={day.id} className="hover:bg-slate-50/50 transition-colors">
              {/* দিন কলাম */}
              <td className="p-3 bg-slate-50 text-center font-black text-brand-navy border-r border-slate-200">
                <span className="text-xs">{day.name}</span>
              </td>

              {/* পিরিয়ড স্লট কলাম */}
              {periods.map((period, pIdx) => {
                if (period.isBreak || period.isAssembly) {
                  return (
                    <td
                      key={pIdx}
                      className="p-2 text-center bg-slate-50/60 border-r border-slate-100 text-[10px] font-bold text-slate-400 select-none"
                    >
                      {period.period}
                    </td>
                  );
                }

                const slot = findSlot(day.id, period);

                if (slot) {
                  const badgeStyle = getSubjectBadgeStyle(slot.subject_name);
                  return (
                    <td
                      key={pIdx}
                      className="p-2 border-r border-slate-100 align-top group relative min-w-[125px]"
                    >
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xs hover:shadow-md transition">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold truncate border ${badgeStyle.bg}`}
                            title={slot.subject_name}
                          >
                            {slot.subject_name}
                          </span>
                          {slot.room_number && (
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-bold shrink-0">
                              {slot.room_number}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-bold text-slate-700 truncate" title={slot.teacher_name}>
                          {slot.teacher_name || 'শিক্ষক নির্ধারণ নেই'}
                        </div>

                        {canEdit && (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={() => onEditSlot(slot)}
                              className="p-1 rounded text-slate-500 hover:text-brand-navy hover:bg-slate-100 cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteSlot(slot.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                }

                return (
                  <td
                    key={pIdx}
                    className="p-2 text-center border-r border-slate-100 align-middle min-w-[125px]"
                  >
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => onAddSlot(day.id, period)}
                        className="w-full h-16 rounded-xl border border-dashed border-slate-200 hover:border-brand-orange hover:bg-orange-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-brand-orange transition cursor-pointer group"
                        title="স্লট যুক্ত করুন"
                      >
                        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold mt-0.5">যুক্ত করুন</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300 select-none">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoutineWeeklyGrid;
