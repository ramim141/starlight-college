import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Calendar,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

const TeacherProfileBanner = ({
  user,
  isClassIncharge,
  currentTime,
  todayAttendance,
  refreshing,
  submitting,
  onRefresh,
  onOpenCheckIn,
  onCheckOut,
  onOpenLeave,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#1A365D] to-[#142B4E] p-6 sm:p-8 text-white shadow-xl">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* প্রোফাইল পরিচিতি */}
        <div className="flex items-start sm:items-center space-x-4">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-amber-600 text-white text-2xl sm:text-3xl font-black shadow-lg shadow-brand-orange/30 border-2 border-white/20">
            {user?.first_name?.[0] || 'T'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {user?.full_name || user?.username}
              </h1>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-orange-200 border border-white/15">
                {user?.teacher_profile?.designation || 'প্রভাষক'}
              </span>
              {isClassIncharge && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-black text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <Sparkles className="h-3.5 w-3.5 inline mr-1" /> শ্রেণি ইনচার্জ
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-300">
              বিভাগ: <span className="font-semibold text-white">{user?.teacher_profile?.department || 'বিজ্ঞান ও মানবিক'}</span> | 
              আইডি: <span className="font-mono font-bold text-brand-orange">{user?.teacher_profile?.employee_id || 'TCH-001'}</span>
            </p>
            
            {/* লাইভ ডিজিটাল ঘড়ি ও আজকের স্ট্যাটাস */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5 rounded-xl bg-black/25 px-3 py-1 text-xs font-mono font-bold text-slate-200 border border-white/10">
                <Clock className="h-3.5 w-3.5 text-brand-orange animate-pulse" />
                <span>{currentTime.toLocaleTimeString('bn-BD')}</span>
              </div>

              {todayAttendance?.check_in_time ? (
                <div className="flex items-center space-x-1.5 rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>উপস্থিত: {todayAttendance.check_in_time}</span>
                  {todayAttendance.check_out_time && (
                    <span className="text-slate-300">| প্রস্থান: {todayAttendance.check_out_time}</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>আজকের হাজিরা পেন্ডিং</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* চেক-ইন / চেক-আউট অ্যাকশন কন্ট্রোল */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/10 cursor-pointer"
            title="তথ্য রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-brand-orange' : ''}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>

          {!todayAttendance?.check_in_time ? (
            <button
              onClick={onOpenCheckIn}
              disabled={submitting}
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-400 hover:to-teal-500 active:scale-95 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>ডিজিটাল চেক-ইন (Check-in)</span>
            </button>
          ) : !todayAttendance?.check_out_time ? (
            <button
              onClick={onCheckOut}
              disabled={submitting}
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-rose-600/30 transition hover:from-rose-400 hover:to-red-500 active:scale-95 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>অফিস ত্যাগ (Check-out)</span>
            </button>
          ) : (
            <div className="rounded-2xl bg-emerald-600/40 px-4 py-2 text-xs font-bold text-emerald-200 border border-emerald-500/40">
              ✓ আজকের হাজিরা ও প্রস্থান সম্পন্ন
            </div>
          )}

          <button
            onClick={onOpenLeave}
            className="flex items-center space-x-1.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/15 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-orange-300" />
            <span>ছুটির আবেদন</span>
          </button>
        </div>
      </div>

      {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
      <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-brand-orange/10 blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default TeacherProfileBanner;
