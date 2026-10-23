import React from 'react';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Phone,
} from 'lucide-react';

const TodayLiveAttendanceTab = ({
  teachers = [],
  selectedDate,
  onDateChange,
  filterType = 'all',
  onFilterChange,
  searchQuery = '',
  onSearchChange,
  onRefresh,
  onOpenVerifyModal,
  loading = false,
  error = false,
  totalTeachers = 0,
}) => {
  return (
    <div data-tab-panel="true" id="attendance-today-panel" role="tabpanel" aria-labelledby="attendance-today-tab" tabIndex={0} className="space-y-4">
      {/* ফিল্টার ও সার্চ কন্ট্রোল বার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200 shadow-[0_8px_24px_-20px_rgba(15,44,89,0.4)]">
        <div className="flex flex-wrap items-center gap-2">
          {/* তারিখ সিলেক্টর */}
          <div className="relative">
            <input
              type="date"
              aria-label="হাজিরার তারিখ"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 transition focus:bg-white  focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          {/* ফিল্টার বোতামসমূহ */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'all', label: 'সব শিক্ষক' },
              { id: 'late', label: 'বিলম্বিত (Late)' },
              { id: 'absent', label: 'অনুপস্থিত' },
              { id: 'leave', label: 'ছুটিতে' },
              { id: 'pending', label: 'পেন্ডিং ভেরিফিকেশন' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(f.id)}
                aria-pressed={filterType === f.id}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-brand-navy text-white '
                    : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 hover:text-[#0F2C59]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* সার্চ ও রিফ্রেশ */}
        <div className="flex items-center gap-2">
          {(filterType !== 'all' || searchQuery) && (
            <button type="button" onClick={() => { onFilterChange('all'); onSearchChange(''); }} className="min-h-[44px] whitespace-nowrap rounded-xl px-3 text-xs font-bold text-brand-orange hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange">ফিল্টার মুছুন</button>
          )}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="শিক্ষক খুঁজুন"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="নাম, বিভাগ বা আইডি..."
              className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            title="পুনরায় লোড করুন"
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200  bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-brand-orange transition"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* তালিকা / টেবিল */}
      {error ? (
        <div data-tab-panel="true" key={filterType} role="status" aria-label="লোড হচ্ছে" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 h-5 w-40 rounded-lg bg-slate-100 motion-safe:animate-pulse" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4"><span className="h-10 w-10 rounded-xl bg-slate-100 motion-safe:animate-pulse" /><span className="flex-1 space-y-2"><span className="block h-3 w-1/3 rounded bg-slate-100 motion-safe:animate-pulse" /><span className="block h-3 w-1/2 rounded bg-slate-50 motion-safe:animate-pulse" /></span></div>)}
          </div>
        </div>
      ) : loading && teachers.length === 0 ? (
        <div data-tab-panel="true" key={filterType} role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <XCircle className="mx-auto mb-3 h-9 w-9 text-rose-500" />
          <h4 className="text-sm font-bold text-slate-800">তথ্য লোড করা যায়নি</h4>
          <p className="mt-1 text-xs text-slate-600">সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।</p>
          <button type="button" onClick={onRefresh} className="mt-4 min-h-[44px] rounded-xl bg-brand-navy px-4 text-xs font-bold text-white hover:bg-[#0F2C59]/90">আবার চেষ্টা করুন</button>
        </div>
      ) : teachers.length === 0 ? (
        <div data-tab-panel="true" key={filterType} className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
          <Filter className="w-10 h-10 text-slate-400 mx-auto opacity-40" />
          <h4 className="text-sm font-bold text-slate-700">{totalTeachers === 0 ? 'কোনো শিক্ষক তালিকাভুক্ত নেই' : 'কোনো রেকর্ড পাওয়া যায়নি'}</h4>
          <p className="text-xs text-slate-400">{totalTeachers > 0 ? 'ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে দেখুন' : 'শিক্ষক যোগ হলে তাদের হাজিরার তথ্য এখানে দেখা যাবে'}</p>
        </div>
      ) : (
        <div data-tab-panel="true" key={filterType} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_8px_28px_-22px_rgba(15,44,89,0.42)]">
          {/* ডেস্কটপ টেবিল ভিউ */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200  bg-slate-50/80  text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">শিক্ষক ও পদবী</th>
                  <th className="py-3.5 px-4">আইডি</th>
                  <th className="py-3.5 px-4">প্রবেশ (Check-in)</th>
                  <th className="py-3.5 px-4">প্রস্থান (Check-out)</th>
                  <th className="py-3.5 px-4">উপস্থিতি অবস্থা</th>
                  <th className="py-3.5 px-4">ভেরিফিকেশন</th>
                  <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 ">
                {teachers.map((t) => {
                  const isPresent = t.status === 'PRESENT';
                  const isLate = t.status === 'LATE';
                  const isLeave = t.status === 'LEAVE';
                  const isAbsent = t.status === 'ABSENT';

                  return (
                    <tr key={t.teacherId} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2C59] text-brand-orange font-bold text-xs shrink-0">
                            {t.teacherName[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900  text-xs block">
                              {t.teacherName}
                            </span>
                            <span className="text-[11px] text-slate-500">{t.department}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 ">
                        {t.employeeId}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 ">
                        {t.checkInTime ? String(t.checkInTime).slice(0, 5) : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {t.checkOutTime ? String(t.checkOutTime).slice(0, 5) : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isPresent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800  ">
                            <CheckCircle2 className="w-3.5 h-3.5" /> উপস্থিত (On-Time)
                          </span>
                        )}
                        {isLate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800  ">
                            <AlertTriangle className="w-3.5 h-3.5" /> বিলম্বিত (Late)
                          </span>
                        )}
                        {isLeave && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800  ">
                            ছুটিতে (On Leave)
                          </span>
                        )}
                        {isAbsent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800  ">
                            <XCircle className="w-3.5 h-3.5" /> অনুপস্থিত
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {t.approvalStatus === 'APPROVED' ? (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
                          </span>
                        ) : t.approvalStatus === 'REJECTED' ? (
                          <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> বাতিলকৃত
                          </span>
                        ) : t.attendanceId ? (
                          <span className="text-[11px] text-amber-600 font-bold">অপেক্ষমাণ</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.attendanceId ? (
                          <button
                            type="button"
                            onClick={() => onOpenVerifyModal(t)}
                            className="min-h-[38px] px-3.5 rounded-xl border border-slate-200  bg-slate-50  hover:border-brand-orange text-slate-700  text-xs font-bold transition"
                          >
                            ভেরিফাই / কারেক্ট
                          </button>
                        ) : t.phone ? (
                          <a
                            href={`tel:${t.phone}`}
                            className="inline-flex items-center gap-1 min-h-[38px] px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100"
                          >
                            <Phone className="w-3.5 h-3.5" /> কল দিন
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* মোবাইল কার্ড ভিউ */}
          <div className="md:hidden divide-y divide-slate-100 ">
            {teachers.map((t) => {
              const isPresent = t.status === 'PRESENT';
              const isLate = t.status === 'LATE';
              const isLeave = t.status === 'LEAVE';
              const isAbsent = t.status === 'ABSENT';

              return (
                <div key={t.teacherId} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F2C59] text-brand-orange font-bold text-xs shrink-0">
                        {t.teacherName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900  text-xs">{t.teacherName}</h4>
                        <p className="text-[10px] text-slate-500">
                          {t.department} • আইডি: {t.employeeId}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isPresent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          অন-টাইম
                        </span>
                      )}
                      {isLate && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          বিলম্বিত
                        </span>
                      )}
                      {isLeave && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          ছুটিতে
                        </span>
                      )}
                      {isAbsent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          অনুপস্থিত
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600  bg-slate-50  p-2.5 rounded-xl font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ইন: {t.checkInTime ? String(t.checkInTime).slice(0, 5) : '—'}
                    </span>
                    <span>আউট: {t.checkOutTime ? String(t.checkOutTime).slice(0, 5) : '—'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">
                      ভেরিফিকেশন: <strong className="text-slate-700">{t.approvalStatusDisplay || 'প্রযোজ্য নয়'}</strong>
                    </span>

                    {t.attendanceId ? (
                      <button
                        type="button"
                        onClick={() => onOpenVerifyModal(t)}
                        className="min-h-[44px] px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold"
                      >
                        ভেরিফাই
                      </button>
                    ) : t.phone ? (
                      <a
                        href={`tel:${t.phone}`}
                        className="min-h-[44px] px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" /> কল দিন
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayLiveAttendanceTab;




