import React from 'react';
import { Lock, Info } from 'lucide-react';

const HolidayEffectNoteBanner = () => {
  return (
    <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 text-xs text-amber-950 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <Lock className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5">
            <span>ডিজিটাল হাজিরা স্বয়ংক্রিয় লক নীতি</span>
            <span className="rounded-full bg-red-100 text-red-800 text-[10px] px-2 py-0.5 font-bold">
              স্বয়ংক্রিয় লক
            </span>
          </h4>
          <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed">
            একাডেমিক ছুটির তালিকায় নির্ধারিত দিনগুলোতে (<code className="font-mono font-bold text-amber-950">is_attendance_locked=True</code>) শিক্ষক, কর্মচারী ও শিক্ষার্থীদের ডিজিটাল হাজিরা গ্রহণ স্বয়ংক্রিয়ভাবে বন্ধ থাকবে। জরুরি প্রয়োজনে ছুটি শিথিল করতে হলে তালিকা থেকে উক্ত দিনটি নিষ্ক্রিয় বা মুছে দিন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default HolidayEffectNoteBanner;
