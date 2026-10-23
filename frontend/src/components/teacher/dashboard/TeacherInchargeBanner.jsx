import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CalendarCheck,
  Users,
  CreditCard,
  ShieldAlert,
  PhoneCall,
} from 'lucide-react';

const TeacherInchargeBanner = ({
  user,
  isClassIncharge,
  atRiskList = [],
  pendingStudentLeaves = [],
  onSelectInchargeTab,
}) => {
  if (!isClassIncharge) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-6 text-white shadow-xl border-2 border-emerald-400/40">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white flex items-center space-x-1 backdrop-blur-md">
              <Sparkles className="h-4 w-4 mr-1 text-yellow-300 animate-spin" />
              <span>শ্রেণি ইনচার্জ কন্ট্রোল হাব</span>
            </span>
            {user?.incharge_sections?.[0] && (
              <span className="rounded-full bg-yellow-400/25 px-3 py-1 text-xs font-black text-yellow-200 border border-yellow-300/40">
                শাখা: {user.incharge_sections[0].class_level_display || user.incharge_sections[0].class_level} - {user.incharge_sections[0].group_display || user.incharge_sections[0].group} ({user.incharge_sections[0].section_name}) [{user.incharge_sections[0].session}]
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
            আপনি {user?.incharge_sections?.map(s => `${s.class_level_display || s.class_level} (${s.section_name})`).join(', ') || 'শ্রেণি'} শাখার ইনচার্জ হিসেবে দায়িত্বপ্রাপ্ত!
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
            প্রিন্সিপাল ড্যাশবোর্ড থেকে ইনচার্জের সকল প্রশাসনিক ক্ষমতা সক্রিয় করা হয়েছে। নিচের বাটনগুলো দিয়ে আপনার ক্লাসের যাবতীয় কার্যক্রম এক ক্লিকে পরিচালনা করুন।
          </p>

          {/* কুইক ম্যাট্রিক্স */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-xl bg-black/25 px-3 py-1.5 font-bold text-white border border-white/10">
              👥 মোট শিক্ষার্থী: {user?.incharge_sections?.[0]?.total_students ?? '—'} জন
            </span>
            <span className="rounded-xl bg-black/25 px-3 py-1.5 font-bold text-white border border-white/10">
              ⚠️ At-Risk ঝুঁকিপূর্ণ: {atRiskList.length} জন
            </span>
            <span className="rounded-xl bg-black/25 px-3 py-1.5 font-bold text-white border border-white/10">
              ✉️ ছুটির আবেদন: {pendingStudentLeaves.length} টি অপেক্ষমাণ
            </span>
          </div>
        </div>

        {/* ৬টি প্রধান ইনচার্জ শর্টকাট বাটন */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
          <Link
            to="/teacher/incharge/bulk-attendance"
            className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95 cursor-pointer"
          >
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
            <span>বাল্ক হাজিরা</span>
          </Link>
          <Link
            to="/teacher/incharge/enrollment"
            className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95 cursor-pointer"
          >
            <Users className="h-4 w-4 text-emerald-600" />
            <span>শিক্ষার্থী ভর্তি</span>
          </Link>
          <Link
            to="/teacher/incharge/fees"
            className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95 cursor-pointer"
          >
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span>ফি আদায়</span>
          </Link>
          <Link
            to="/teacher/incharge/at-risk"
            className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span>At-Risk ট্র্যাকার</span>
          </Link>
          <Link
            to="/teacher/incharge/call-log"
            className="flex items-center space-x-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-emerald-900 shadow hover:bg-emerald-50 transition active:scale-95 cursor-pointer"
          >
            <PhoneCall className="h-4 w-4 text-emerald-600" />
            <span>কল ডায়েরি</span>
          </Link>
          <button
            onClick={onSelectInchargeTab}
            className="flex items-center space-x-2 rounded-2xl bg-yellow-400 text-slate-900 px-3.5 py-2.5 text-xs font-black shadow hover:bg-yellow-300 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-slate-900" />
            <span>ইনচার্জ হাব</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherInchargeBanner;
