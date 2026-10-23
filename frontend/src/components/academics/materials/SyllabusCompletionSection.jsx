import React from 'react';
import { CheckCircle2, AlertCircle, Info, BookOpen } from 'lucide-react';

const SyllabusCompletionSection = ({ subjects, syllabi }) => {
  // প্রতিটি বিষয়ের সিলেবাস আপলোড স্ট্যাটাস হিসাব
  const coverageData = subjects.map((sub) => {
    const hasSyllabus = syllabi.some((syl) => Number(syl.subject) === Number(sub.id));
    return {
      ...sub,
      hasSyllabus,
    };
  });

  const total = subjects.length;
  const uploaded = coverageData.filter((s) => s.hasSyllabus).length;
  const percentage = total > 0 ? Math.round((uploaded / total) * 100) : 0;

  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-brand-navy">
              বিষয়ভিত্তিক সিলেবাস কাভারেজ ড্যাশবোর্ড
            </h3>
            <p className="text-xs text-slate-400 font-medium">অধ্যক্ষ তদারকি ও অগ্রগতি নিরীক্ষা</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">সার্বিক কাভারেজ:</span>
          <span className="font-mono text-xs font-black text-brand-orange bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl">
            {uploaded}/{total} বিষয় ({percentage}%)
          </span>
        </div>
      </div>

      {/* অগ্রগতি বার */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-orange to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ব্যাকএন্ড স্টাব ও প্রয়োজনীয়তা নোট */}
      <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-3 text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <span className="font-bold">টপিক/চ্যাপ্টারভিত্তিক অগ্রগতি ট্র্যাকিং:</span>{' '}
          বর্তমানে আপলোডকৃত সিলেবাস ডকুমেন্টের ভিত্তিতে কাভারেজ প্রদর্শন করা হচ্ছে। প্রতিটি চ্যাপ্টার বা পাঠ্যসূচির শতাংশ অগ্রগতি রেকর্ডের জন্য ব্যাকএন্ডে সিলেবাস চ্যাপ্টার/টপিক প্রগ্রেস মডেল প্রয়োজন।
        </div>
      </div>

      {/* বিষয় তালিকা গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
        {coverageData.slice(0, 9).map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
          >
            <div className="truncate mr-2">
              <span className="font-bold text-slate-800 block truncate">{item.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">[{item.code}]</span>
            </div>
            {item.hasSyllabus ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                <CheckCircle2 className="h-3 w-3" />
                আপলোড সম্পন্ন
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">
                <AlertCircle className="h-3 w-3" />
                সিলেবাস বাকি
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusCompletionSection;
