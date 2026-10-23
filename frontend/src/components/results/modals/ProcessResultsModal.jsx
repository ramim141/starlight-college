import React from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  Users, 
  Award, 
  Loader2 
} from 'lucide-react';

const ProcessResultsModal = ({
  isOpen,
  onClose,
  onConfirm,
  exam = null,
  section = null,
  isProcessing = false,
  hasPendingChecklist = false,
  pendingCount = 0,
}) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg p-6 space-y-5 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ফলাফল ও মেধা তালিকা প্রসেস করুন
              </h3>
              <p className="text-xs text-slate-500">
                স্বয়ংক্রিয় গ্রেডিং, ৮০-২০ রূপান্তর ও মেধা অবস্থান গণনা ইঞ্জিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* কনফিগারেশন প্রিভিউ */}
        <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">পরীক্ষার নাম:</span>
            <strong className="text-slate-800 dark:text-slate-200">{exam.name}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">শিক্ষাবর্ষ ও শ্রেণি:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {exam.session} | {exam.class_level_display || exam.class_level}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">প্রসেসিং পরিধি:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {section ? `শাখা: ${section.section_name}` : 'সম্পূর্ণ শ্রেণির সকল শাখা'}
            </span>
          </div>
        </div>

        {/* কী কী হিসাব করা হবে */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-wide">
            স্বয়ংক্রিয় হিসাব বিবরণী:
          </h4>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 pl-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>CQ + MCQ + ব্যবহারিক ১০০ নম্বরকে ৮০%-এ কনভার্ট করে টিউটোরিয়ালের ২০ যোগ হবে।</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ডিজিটাল উপস্থিতি ও শ্রেণি ইনচার্জের নৈতিকতা নম্বর মিলিয়ে ১২৪ নম্বরের সহ-পাঠ্যক্রমিক কার্যক্রম যোগ হবে।</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>বাংলাদেশ শিক্ষা বোর্ড স্ট্যান্ডার্ডে GPA ৫.০০ স্কেলে মেধা তালিকা ও র্যাঙ্ক নির্ধারিত হবে।</span>
            </li>
          </ul>
        </div>

        {/* অসম্পূর্ণ চেকলিস্ট সতর্কতা */}
        {hasPendingChecklist && (
          <div className="p-3.5 border rounded-2xl bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">সতর্কতা: চেকলিস্টে {pendingCount}টি বিষয় অসম্পূর্ণ রয়েছে!</strong>
              <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                এখনই প্রসেস করলে যেসকল শিক্ষার্থীর নম্বর এন্ট্রি এখনও বাকি রয়েছে, তাদের ০ বা অনুপস্থিত ধরে জিপিএ হিসাব করা হবে।
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>প্রসেসিং চলছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ফলাফল প্রসেস শুরু করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessResultsModal;
