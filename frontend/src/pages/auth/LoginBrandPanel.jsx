import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Sparkles, FileSpreadsheet, BookOpen, Wallet, ShieldCheck } from 'lucide-react';

export const LoginBrandPanel = () => {
  return (
    <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0A1D3B] via-[#0F2C59] to-[#163A70] text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
      {/* ব্যাকগ্রাউন্ড ডেকোরেটিভ প্যাটার্ন */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold text-orange-200 hover:text-white backdrop-blur-md transition-all duration-200 group border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>হোমপেজে ফিরুন</span>
          </Link>

          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>EIIN: ১৩৪৫৬৭</span>
          </span>
        </div>

        {/* কলেজ ব্র্যান্ডিং */}
        <div className="pt-2">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 border border-white/20 transition-transform duration-300 hover:scale-105">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white leading-tight">
                STARLIGHT COLLEGE
              </h2>
              <p className="text-xs font-semibold text-orange-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> স্মার্ট সেন্ট্রাল অটোমেশন পোর্টাল
              </p>
            </div>
          </div>

          <h1 className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-snug">
            শিক্ষা, শৃঙ্খলা ও <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
              সাফল্যের ডিজিটাল ঠিকানা
            </span>
          </h1>

          <p className="mt-3 text-xs xl:text-sm text-slate-300 leading-relaxed">
            শিক্ষার্থী, শিক্ষক ও প্রশাসনের জন্য এক ক্লিকে উপস্থিতি, ফলাফল, রুটিন ও সার্বিক ফি ব্যবস্থাপনার আধুনিক উচ্চমাধ্যমিক প্ল্যাটফর্ম।
          </p>
        </div>

        {/* ফিচার কার্ডস */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:translate-x-1 p-3 border border-white/10 backdrop-blur-xs transition-all duration-300">
            <div className="h-8 w-8 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">ডিজিটাল মার্কশিট ও ফলাফল</span>
              <span className="text-slate-400 text-[11px]">যেকোনো সময় সরাসরি একাডেমিক ট্রান্সক্রিপ্ট দেখুন</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:translate-x-1 p-3 border border-white/10 backdrop-blur-xs transition-all duration-300">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">স্মার্ট হাজিরা ও কল ডায়েরি</span>
              <span className="text-slate-400 text-[11px]">শ্রেণি ইনচার্জ ট্র্যাকিং ও অভিভাবক নোটিফিকেশন</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:translate-x-1 p-3 border border-white/10 backdrop-blur-xs transition-all duration-300">
            <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white block">অনলাইন ফি রসিদ ও খতিয়ান</span>
              <span className="text-slate-400 text-[11px]">পেমেন্ট হিস্ট্রি ও ডিজিটাল মানি রিসিট ডাউনলোড</span>
            </div>
          </div>
        </div>
      </div>

      {/* নিচের সিকিউরিটি ও বোর্ড ব্যাজ */}
      <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white block text-[11px]">সিলেট শিক্ষা বোর্ড অনুমোদিত</span>
            <span className="text-[10px] text-slate-400">স্বীকৃত উচ্চমাধ্যমিক প্রতিষ্ঠান</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-orange-400 font-bold block bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
            256-BIT SSL
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginBrandPanel;
