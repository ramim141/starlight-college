import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Award, 
  GraduationCap,
  ArrowRight
} from 'lucide-react';

const DashboardHeroHeader = ({
  transportAlert,
  currentTime,
  refreshing,
  onRefresh,
  exams = [],
  selectedExamForProcess,
  onSelectExam,
  onProcessResult,
  processingResult,
}) => {
  return (
    <div className="space-y-4">
      {/* ১. জরুরি পরিবহন ব্রেকডাউন সতর্কতা (যদি রাস্তায় কোনো বাস বিকল থাকে) */}
      {transportAlert && (
        <div className="relative overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-700 via-red-700 to-red-800 p-5 text-white shadow-lg shadow-rose-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase text-yellow-200">
                  জরুরি পরিবহন সতর্কতা
                </span>
                <h4 className="font-extrabold text-base text-white mt-0.5">
                  গাড়ি নং: {transportAlert.vehicle_number} ({transportAlert.route_name}) রাস্তায় বিকল হয়েছে!
                </h4>
                <p className="text-xs text-red-100">
                  চালক: {transportAlert.driver_name} ({transportAlert.driver_phone}) | শিক্ষার্থী ও অভিভাবকদের অ্যালার্ট পৌঁছেছে।
                </p>
              </div>
            </div>
            <Link
              to="/principal/transport"
              className="px-4 py-2 text-xs font-black transition bg-white shadow rounded-xl text-rose-700 hover:bg-red-50 shrink-0 min-h-[44px] flex items-center justify-center"
            >
              ফ্লিট মনিটরিং দেখুন &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* ২. প্রিমিয়াম হিরো ব্যানার */}
      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(118deg,#071a36_0%,#0d2b56_54%,#173d70_100%)] px-5 py-7 text-white shadow-xl shadow-slate-900/15 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
        {/* ব্যাকগ্রাউন্ড অরেঞ্জ আর্চ সোউশ SVG */}
        <svg
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3"
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dashboard-hero-swoosh" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FF6A1A" stopOpacity="0" />
              <stop offset="0.55" stopColor="#FF6A1A" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FFB067" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M0 300 C 160 130, 380 40, 600 18" fill="none" stroke="url(#dashboard-hero-swoosh)" strokeWidth="3" />
          <path d="M0 300 C 200 170, 400 90, 600 64" fill="none" stroke="url(#dashboard-hero-swoosh)" strokeWidth="1.5" opacity="0.45" />
        </svg>

        {/* টপ-রাইট সফট অরেঞ্জ গ্লো */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" aria-hidden="true" />

        <div className="relative z-10">
          {/* টপ পিল ব্যাজ ও লাইভ ঘড়ি */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              <GraduationCap className="h-4 w-4 text-brand-orange" aria-hidden="true" />
              প্রিন্সিপাল কমান্ড হাব
            </span>
            {currentTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-mono font-bold text-slate-200">
                <Clock className="h-3.5 w-3.5 text-brand-orange animate-pulse" />
                {currentTime.toLocaleTimeString('bn-BD')}
              </span>
            )}
          </div>

          {/* প্রধান শিরোনাম ও স্টাইলাইজড ওয়েভি আন্ডারলাইন */}
          <h2 className="mt-5 max-w-3xl text-3xl font-extrabold leading-[1.35] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            স্টারলাইট কলেজের
            <span className="block text-brand-orange">সার্বিক কমান্ড সেন্টার</span>
          </h2>
          <svg viewBox="0 0 300 12" className="mt-1 h-3 w-56" aria-hidden="true">
            <path d="M2 8 C 80 2, 200 2, 298 8" stroke="#FF6A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          {/* সাবটাইটেল ডেসক্রিপশন */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200/85 sm:text-base">
            শিক্ষার্থী, অ্যাকাডেমিক শাখা, ফি আদায়, রেজাল্ট ও প্রশাসনিক সিদ্ধান্ত এক জায়গা থেকে পরিচালনা করুন।
          </p>

          {/* অ্যাকশন বাটনসমূহ */}
          <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onProcessResult}
                disabled={processingResult || !selectedExamForProcess}
                className="inline-flex min-h-[48px] items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 text-sm font-bold text-white shadow-lg shadow-orange-950/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-950/30 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Award className="h-5 w-5" aria-hidden="true" />
                {processingResult ? 'প্রসেসিং হচ্ছে...' : 'রেজাল্ট ও মেধা প্রসেস'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.07] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-brand-orange' : ''}`} aria-hidden="true" />
                রিফ্রেশ করুন
              </button>
            </div>

            {/* পরীক্ষা নির্বাচন ড্রপডাউন (যদি পরীক্ষা তালিকা থাকে) */}
            {exams && exams.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-md">
                <span className="text-xs font-bold text-slate-300">পরীক্ষা:</span>
                <select
                  value={selectedExamForProcess}
                  onChange={(e) => onSelectExam(e.target.value)}
                  className="rounded-xl bg-[#0F2C59]/90 text-white px-3 py-1.5 text-xs font-bold border border-white/15 focus:outline-none focus:border-brand-orange cursor-pointer"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id} className="bg-[#0A2147] text-white">
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHeroHeader;
