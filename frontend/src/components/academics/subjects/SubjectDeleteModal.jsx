import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const SubjectDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  subject,
  submitting,
}) => {
  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-rose-600 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-brand-navy">বিষয় মুছে ফেলার নিশ্চিতকরণ</h3>
            <p className="text-xs text-rose-600 font-bold">সতর্কতামূলক বার্তা</p>
          </div>
        </div>

        <div className="space-y-3 py-2 text-xs text-slate-600">
          <p>
            আপনি কি নিশ্চিত যে <strong className="text-brand-navy font-black">'{subject.name}' [{subject.code}]</strong> বিষয়টি সম্পূর্ণ মুছে ফেলতে চান?
          </p>
          <div className="rounded-2xl bg-amber-50 p-3 border border-amber-200 text-amber-900 font-medium leading-relaxed">
            <strong>লক্ষ্য করুন:</strong> এই বিষয়টি যদি কোনো ক্লাস রুটিন, সিলেবাস অথবা পরীক্ষার গ্রেডশিটে ব্যবহৃত হয়ে থাকে, তবে ডেটা সুরক্ষার স্বার্থে ব্যাকএন্ড থেকে এটি স্বয়ংক্রিয়ভাবে প্রত্যাখ্যাত হবে। সে ক্ষেত্রে বিষয়টি ডিলিট না করে নিষ্ক্রিয় (Inactive) রাখা উত্তম।
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={() => onConfirm(subject)}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 min-h-[44px] disabled:opacity-50 cursor-pointer"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectDeleteModal;
