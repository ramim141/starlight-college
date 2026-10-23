import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Award, ChevronRight } from 'lucide-react';

const ExamsTabContent = ({ invigilations = [], exams = [] }) => {
  return (
    <div className="space-y-6">
      {/* হল গার্ড / ইনভিজিলেশন রোস্টার */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">
                পরীক্ষার হল গার্ড ও ইনভিজিলেশন রোস্টার ({invigilations.length})
              </h3>
              <p className="text-xs text-slate-400">পরীক্ষার হলে আপনার দায়িত্বপ্রাপ্ত রুম ও সময়সূচি</p>
            </div>
          </div>
          <Link
            to="/teacher/exams"
            className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>প্রশ্নপত্র ও ডিউটি সেন্টার</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4">
          {invigilations.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">আপাতত আপনার কোনো হল গার্ড ডিউটি নির্ধারিত নেই।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invigilations.map((inv) => (
                <div key={inv.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                      রুম: {inv.room_number || inv.room?.room_number || 'N/A'}
                    </span>
                    <span className="text-xs font-bold text-brand-orange font-mono">
                      {inv.duty_date || inv.exam?.start_date}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-brand-navy">{inv.exam_name || inv.exam?.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">সময়: {inv.start_time || '১০:০০ AM'} হতে {inv.end_time || '০১:০০ PM'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* মার্কস এন্ট্রির সরাসরি লিংক ও চলমান পরীক্ষা */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-amber-50 p-2.5 text-brand-orange">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">পরীক্ষার মার্কস এন্ট্রি ও মূল্যায়ন</h3>
              <p className="text-xs text-slate-400">CQ, MCQ ও ব্যবহারিক নম্বর সফটওয়্যারে সংরক্ষণ করুন</p>
            </div>
          </div>
          <Link
            to="/teacher/marks"
            className="rounded-2xl bg-brand-orange px-4 py-2 text-xs font-black text-white shadow-md hover:bg-brand-orange-hover transition cursor-pointer"
          >
            + মার্কস এন্ট্রি করুন
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.slice(0, 4).map((ex) => (
            <div key={ex.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-orange">{ex.session} সেশন</span>
                <h5 className="font-bold text-sm text-brand-navy">{ex.name}</h5>
                <p className="text-xs text-slate-500 mt-0.5">শ্রেণি: {ex.class_level_display || ex.class_level}</p>
              </div>
              <Link
                to="/teacher/marks"
                className="flex items-center space-x-1 text-xs font-bold text-brand-navy hover:text-brand-orange transition cursor-pointer"
              >
                <span>নম্বর দিন</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamsTabContent;
