import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react';

const MONTH_NAMES = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const MonthlyAttendanceSummaryTab = ({
  teachers = [],
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  lockState = null,
  onApproveMonth,
  isApproving = false,
  loading = false,
  error = false,
  onRefresh,
  onSelectTeacherDetail,
}) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  const isLocked = !!lockState;

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    const ok = await onApproveMonth(approvalNote);
    if (ok) {
      setConfirmModalOpen(false);
      setApprovalNote('');
    }
  };

  return (
    <div data-tab-panel="true" id="attendance-monthly-panel" role="tabpanel" aria-labelledby="attendance-monthly-tab" tabIndex={0} className="space-y-4">
      {/* কন্ট্রোল বার ও মাস সিলেক্টর */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-[0_8px_24px_-20px_rgba(15,44,89,0.4)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-orange" />
            <span className="text-xs font-bold text-slate-700 ">মাস নির্বাচন:</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs font-bold text-slate-800  focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs font-bold text-slate-800  focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* অ্যাকশন বাটন / লক অবস্থা */}
        <div className="flex items-center gap-3">
          {isLocked ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50  border border-emerald-200  text-emerald-800  text-xs font-bold">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>
                  অনুমোদিত ও লককৃত ({lockState.approved_by} • {new Date(lockState.approved_at).toLocaleDateString('bn-BD')})
                </span>
              </div>
              <Link
                to={`/principal/finance?tab=payroll&month=${selectedMonth}&year=${selectedYear}`}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md hover:bg-brand-orange/90 transition"
              >
                <span>এই মাসের পে-রোল তৈরি করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-brand-navy hover:bg-[#0F2C59]/90 text-white text-xs font-bold shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>মাসিক হাজিরা অনুমোদন করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* শিক্ষকগণের মাসিক উপস্থিতি টেবিল */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_8px_28px_-22px_rgba(15,44,89,0.42)]">
        {/* ডেস্কটপ টেবিল */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200  bg-slate-50/80  text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">শিক্ষক ও পদবী</th>
                <th className="py-3.5 px-4">আইডি</th>
                <th className="py-3.5 px-4 text-center">উপস্থিত দিন</th>
                <th className="py-3.5 px-4 text-center">বিলম্বিত (Late)</th>
                <th className="py-3.5 px-4 text-center">ছুটির দিন</th>
                <th className="py-3.5 px-4 text-center">মোট লগ</th>
                <th className="py-3.5 px-4 text-right">বিস্তারিত</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
                            {teachers.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-12 text-center">
                  {loading ? <span role="status" className="mx-auto block h-4 w-36 rounded bg-slate-100 motion-safe:animate-pulse" /> : error ? (
                    <div role="alert"><p className="text-sm font-bold text-slate-800">মাসিক হাজিরার তথ্য লোড করা যায়নি</p><button type="button" onClick={onRefresh} className="mt-3 min-h-[44px] rounded-xl bg-brand-navy px-4 text-xs font-bold text-white">আবার চেষ্টা করুন</button></div>
                  ) : <p className="text-sm font-semibold text-slate-700">এই মাসে কোনো হাজিরা রেকর্ড নেই</p>}
                </td></tr>
              )}
              {teachers.map((t) => (
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
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                      {t.presentDays} দিন
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                        t.lateDays > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.lateDays} বার
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                        t.leaveDays > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {t.leaveDays} দিন
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                    {t.totalLogs}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectTeacherDetail(t)}
                      className="inline-flex items-center gap-1 min-h-[38px] px-3.5 rounded-xl border border-slate-200  bg-slate-50  hover:border-brand-orange text-xs font-bold text-slate-700 "
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>লগ দেখুন</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* মোবাইল কার্ড ভিউ */}
        <div className="md:hidden divide-y divide-slate-100 ">
                    {teachers.length === 0 ? (
            <div className="p-8 text-center">
              {loading ? <span role="status" className="mx-auto block h-4 w-36 rounded bg-slate-100 motion-safe:animate-pulse" /> : error ? (
                <div role="alert"><p className="text-sm font-bold text-slate-800">মাসিক হাজিরার তথ্য লোড করা যায়নি</p><button type="button" onClick={onRefresh} className="mt-3 min-h-[44px] rounded-xl bg-brand-navy px-4 text-xs font-bold text-white">আবার চেষ্টা করুন</button></div>
              ) : <p className="text-sm font-semibold text-slate-700">এই মাসে কোনো হাজিরা রেকর্ড নেই</p>}
            </div>
          ) : teachers.map((t) => (
            <div key={t.teacherId} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
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

                <button
                  type="button"
                  onClick={() => onSelectTeacherDetail(t)}
                  className="min-h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
                >
                  দিনপঞ্জি
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                  উপস্থিতি: {t.presentDays} দিন
                </div>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800 font-bold">
                  লেট: {t.lateDays} বার
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-800 font-bold">
                  ছুটি: {t.leaveDays} দিন
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* মাস অনুমোদন নিশ্চিতকরণ মডাল */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white  p-6 shadow-2xl border border-slate-200  space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 ">
                  মাসিক উপস্থিতি চূড়ান্ত অনুমোদন
                </h3>
                <p className="text-xs text-slate-500">
                  {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600  leading-relaxed bg-slate-50  p-3.5 rounded-2xl border border-slate-200 ">
              আপনি কি <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong> মাসের সকল শিক্ষকের ডিজিটাল হাজিরা ও ছুটির রেকর্ড চূড়ান্তভাবে অনুমোদন করতে চান? অনুমোদিত হলে এই মাসের রেকর্ডসমূহ লক হয়ে যাবে এবং পে-রোল প্রক্রিয়াকরণ শুরু করা যাবে।
            </p>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700  mb-1">
                  অধ্যক্ষের নোট বা স্বাক্ষর মন্তব্য (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="যেমন: অক্টোবর মাসের নিয়মিত শিক্ষক হাজিরা অনুমোদিত হলো..."
                  className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 ">
                <button
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={isApproving}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl bg-brand-navy hover:bg-[#0F2C59]/90 text-white text-xs font-bold shadow-md disabled:opacity-60"
                >
                  {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>হ্যাঁ, অনুমোদন ও লক করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyAttendanceSummaryTab;

