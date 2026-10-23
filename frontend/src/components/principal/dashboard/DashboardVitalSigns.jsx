import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  GraduationCap, 
  UserCheck, 
  DollarSign, 
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

const TileSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft animate-pulse">
    <div className="flex items-center justify-between">
      <div className="w-24 h-4 rounded bg-slate-200" />
      <div className="w-9 h-9 rounded-2xl bg-slate-100" />
    </div>
    <div className="w-32 h-8 mt-4 rounded bg-slate-200" />
    <div className="w-40 h-3 mt-2 rounded bg-slate-100" />
  </div>
);

const DashboardVitalSigns = ({
  totalStudentsEnrolled = 0,
  studentAttendanceRate = null,
  teacherAttendanceStats = { present: 0, total: 0, late: 0, absent: 0, rate: 0 },
  summary = null,
  dailyCashData = null,
  totalPendingApprovals = 0,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="w-48 h-5 rounded bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <TileSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ক্যাশ ইন হ্যান্ড বনাম ভেরিফাইড ক্যাশ হ্যান্ডওভার
  const cashInHand = summary?.net_cash_in_hand ?? (dailyCashData?.net_closing_cash_in_hand ?? 0);
  const verifiedHandover = dailyCashData?.incharge_handed_over_cash ?? 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-extrabold leading-snug text-brand-navy">
          <TrendingUp className="w-4 h-4 text-brand-orange" />
          <span>কলেজের প্রধান ৫টি ভাইটাল সাইনস (Live Operational Vital Signs)</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-400">প্রতিটি টাইল ক্লিকেবল</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* ১. আজকের শিক্ষার্থী উপস্থিতি % */}
        <Link
          to="/principal/sections"
          className="group block min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">শিক্ষার্থী উপস্থিতি</span>
            <div className="flex items-center justify-center font-bold text-blue-600 transition-colors h-9 w-9 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline mt-3 space-x-2">
            <h4 className="text-2xl font-black sm:text-3xl text-brand-navy">
              {studentAttendanceRate !== null ? `${studentAttendanceRate}%` : '—'}
            </h4>
            <span className="text-xs font-bold text-slate-500">
              ({totalStudentsEnrolled} জনের মধ্যে)
            </span>
          </div>
          <p className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>আজকের উপস্থিতি হার</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* ২. আজকের শিক্ষক উপস্থিতি (উপস্থিত/দেরি/অনুপস্থিত) */}
        <Link
          to="/principal/staff"
          className="group block min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">শিক্ষক উপস্থিতি</span>
            <div className="flex items-center justify-center font-bold text-emerald-600 transition-colors h-9 w-9 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline mt-3 space-x-1.5">
            <h4 className="text-2xl font-black sm:text-3xl text-emerald-600">
              {teacherAttendanceStats.present}
              <span className="text-base font-bold text-slate-400">/{teacherAttendanceStats.total}</span>
            </h4>
            <span className="text-xs font-bold text-emerald-700">জন উপস্থিত</span>
          </div>
          <p className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              দেরি: <strong className="text-amber-600">{teacherAttendanceStats.late}</strong> | অনুপস্থিত: <strong className="text-rose-600">{teacherAttendanceStats.absent}</strong>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </Link>

        {/* ৩. ক্যাশ ইন হ্যান্ড বনাম ভেরিফাইড ক্যাশ */}
        <Link
          to="/principal/finance"
          className="group block min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ক্যাশ ইন হ্যান্ড</span>
            <div className="flex items-center justify-center font-bold text-indigo-600 transition-colors h-9 w-9 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-black sm:text-3xl text-brand-navy">
              ৳ {Number(cashInHand || 0).toLocaleString('en-IN')}
            </h4>
            <p className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>ভেরিফাইড জমা: <strong>৳{Number(verifiedHandover || 0).toLocaleString('en-IN')}</strong></span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </Link>

        {/* ৪. মোট শিক্ষার্থী বকেয়া */}
        <Link
          to="/principal/finance?tab=defaulters"
          className="group block min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">বকেয়া পাওনা</span>
            <div className="flex items-center justify-center font-bold text-amber-600 transition-colors h-9 w-9 rounded-2xl bg-amber-50 group-hover:bg-amber-600 group-hover:text-white">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-black sm:text-3xl text-amber-600">
              ৳ {Number(summary?.total_student_due_receivable || 0).toLocaleString('en-IN')}
            </h4>
            <p className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>ডিফল্টার তালিকা দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </Link>

        {/* ৫. অনুমোদনের মোট অপেক্ষমাণ সিদ্ধান্ত */}
        <a
          href="#approvals-strip"
          className="group block min-h-[148px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট অনুমোদন অপেক্ষমাণ</span>
            <div className="flex items-center justify-center font-bold text-brand-orange transition-colors h-9 w-9 rounded-2xl bg-orange-50 group-hover:bg-brand-orange group-hover:text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline mt-3 space-x-2">
            <h4 className="text-2xl font-black sm:text-3xl text-brand-orange">
              {totalPendingApprovals}
            </h4>
            <span className="text-xs font-bold text-slate-500">টি আবেদন</span>
          </div>
          <p className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>১১টি ক্যাটাগরির সারসংক্ষেপ</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </a>

      </div>
    </div>
  );
};

export default DashboardVitalSigns;
