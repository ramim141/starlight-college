import React from 'react';
import { CalendarOff, Lock, Edit2, Trash2 } from 'lucide-react';

const HolidayListView = ({
  holidays,
  canEdit,
  calculateDuration,
  onEditHoliday,
  onDeleteHoliday,
}) => {
  return (
    <div className="space-y-4">
      {/* ডেস্কটপ টেবিল ভিউ */}
      <div className="hidden md:block rounded-3xl bg-white p-6 border border-slate-200 shadow-soft overflow-x-auto">
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
                <td colSpan={canEdit ? 8 : 7} className="py-12 text-center text-slate-400">
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
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                        h.holiday_type === 'GOVERNMENT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : h.holiday_type === 'RELIGIOUS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : h.holiday_type === 'WEEKEND'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {h.holiday_type_display || h.holiday_type}
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
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditHoliday(h)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteHoliday(h)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="ছুটি ডিলিট করুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* মোবাইল কার্ড ভিউ */}
      <div className="md:hidden space-y-3">
        {holidays.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-400 border border-slate-200 shadow-soft">
            <CalendarOff className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">বর্তমানে কোনো ছুটির দিন নির্ধারিত নেই।</p>
          </div>
        ) : (
          holidays.map((h) => (
            <div
              key={h.id}
              className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-black text-brand-navy">{h.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${
                    h.holiday_type === 'GOVERNMENT'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : h.holiday_type === 'RELIGIOUS'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : h.holiday_type === 'WEEKEND'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {h.holiday_type_display || h.holiday_type}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">তারিখ পরিসর:</span>
                  <span className="font-mono text-slate-800">{h.start_date} হতে {h.end_date}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">মোট সময়:</span>
                  <span className="font-bold text-brand-orange">{calculateDuration(h.start_date, h.end_date)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="inline-flex items-center space-x-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-bold">
                  <Lock className="h-3 w-3 mr-0.5" />
                  <span>হাজিরা স্বয়ংক্রিয় লক</span>
                </span>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditHoliday(h)}
                      className="p-2 rounded-xl text-slate-600 hover:text-brand-navy hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHoliday(h)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HolidayListView;
