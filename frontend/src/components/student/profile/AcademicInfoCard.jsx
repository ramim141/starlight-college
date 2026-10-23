import React from 'react';
import { BookOpen, Lock, Info, AlertCircle } from 'lucide-react';
import { toBanglaNumber } from './ProfileHeaderCard';

const AcademicInfoCard = ({ user }) => {
  const student = user?.student_profile;
  const section = student?.section_details;

  const academicItems = [
    { label: 'শ্রেণি', value: section?.class_level_display || 'অনির্ধারিত' },
    { label: 'গ্রুপ / বিভাগ', value: section?.group_display || 'অনির্ধারিত' },
    { label: 'শাখা', value: section?.section_name || 'অনির্ধারিত' },
    { label: 'রোল নম্বর', value: student?.roll_number ? toBanglaNumber(student.roll_number) : 'অনির্ধারিত' },
    { label: 'শিক্ষাবর্ষ (Session)', value: student?.session || section?.session || 'অনির্ধারিত' },
    { label: 'এসএসসি রোল (SSC Roll)', value: student?.ssc_roll ? toBanglaNumber(student.ssc_roll) : 'অনির্ধারিত' },
    { label: 'পাসের বছর', value: student?.passing_year ? toBanglaNumber(student.passing_year) : 'অনির্ধারিত' },
    { label: 'এইচএসসি রেজিস্ট্রেশন নম্বর', value: student?.hsc_registration_no || 'প্রক্রিয়াধীন' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm space-y-5">
      {/* হেডার */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-navy">একাডেমিক তথ্য ও রেকর্ড</h3>
            <p className="text-xs text-slate-400">কলেজের মূল ভর্তি ডাটাবেজ অনুসারে রেকর্ডকৃত</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Lock className="h-3 w-3" />
          <span>অপরিবর্তনযোগ্য</span>
        </div>
      </div>

      {/* একাডেমিক রেকর্ড গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {academicItems.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-slate-50/70 p-3.5 border border-slate-200/70 relative group"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{item.label}</span>
              <Lock className="h-3 w-3 text-slate-300 group-hover:text-slate-400 transition" />
            </div>
            <p className="mt-1.5 text-sm font-bold text-brand-navy truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* তথ্য সংশোধন সংক্রান্ত দিকনির্দেশনা */}
      <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-200/80 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-amber-900 block mb-0.5">তথ্য সংশোধন ও পরিবর্তনের নিয়ম:</span>
          রোল, গ্রুপ বা রেজাল্ট সংক্রান্ত তথ্য প্রাতিষ্ঠানিক সনদপত্রের সাথে মিলিয়ে তৈরি করা। কোনো তথ্যে অসঙ্গতি পরিলক্ষিত হলে সরাসরি আপনার <strong className="text-brand-navy font-bold">শাখা ইনচার্জ শিক্ষক</strong> অথবা কলেজ প্রশাসনিক শাখায় আবেদন করুন।
        </div>
      </div>
    </div>
  );
};

export default AcademicInfoCard;
