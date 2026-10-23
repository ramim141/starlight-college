import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, ShieldCheck } from 'lucide-react';

const NoticesSectionLink = () => {
  return (
    <div className="p-8 rounded-3xl border border-slate-200  bg-white  shadow-soft text-center max-w-2xl mx-auto space-y-4">
      <div className="p-3.5 rounded-2xl bg-orange-100  text-brand-orange w-fit mx-auto">
        <Bell className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 ">
          পাবলিক নোটিশ বোর্ড ব্যবস্থাপনা
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
          হোমপেজে প্রদর্শিত 'জরুরি নোটিশ বোর্ড' সেকশনের সকল নোটিশ সেন্ট্রাল নোটিশ ম্যানেজমেন্ট মডিউল থেকে রিয়েল-টাইমে প্রদর্শিত হয়। নতুন নোটিশ প্রকাশ, মেয়াদ নির্ধারণ ও ফাইল যুক্ত করতে নোটিশ ম্যানেজমেন্ট পেজে যান।
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/principal/notices"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold px-6 shadow-md shadow-brand-orange/20 transition"
        >
          <span>নোটিশ ম্যানেজমেন্টে প্রবেশ করুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="pt-4 border-t border-slate-100  flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>পাবলিক ওয়েবসাইটে স্বয়ংক্রিয়ভাবে সর্বশেষ নোটিশসমূহ সিঙ্ক থাকে</span>
      </div>
    </div>
  );
};

export default NoticesSectionLink;
