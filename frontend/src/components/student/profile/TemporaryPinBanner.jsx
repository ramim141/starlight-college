import React from 'react';
import { AlertTriangle, KeyRound, ArrowRight } from 'lucide-react';

const TemporaryPinBanner = ({ onGoToSecurity }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 p-4 sm:p-5 border border-amber-300 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-800 shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                নিরাপত্তা সতর্কতা
              </span>
              <span className="text-xs font-bold text-amber-900">অস্থায়ী পিন সক্রিয়</span>
            </div>
            <h3 className="mt-1 font-bold text-sm sm:text-base text-slate-800 leading-snug">
              আপনি বর্তমানে একটি অস্থায়ী পিন (Temporary PIN) ব্যবহার করছেন।
            </h3>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
              আপনার অ্যাকাউন্টের তথ্যের সর্বোচ্চ নিরাপত্তার স্বার্থে অবিলম্বে একটি নতুন স্থায়ী ও শক্তিশালী পাসওয়ার্ড সেট করুন।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToSecurity}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 shadow-sm transition min-h-[44px] shrink-0 cursor-pointer"
        >
          <KeyRound className="h-4 w-4" />
          <span>পাসওয়ার্ড সেট করুন</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TemporaryPinBanner;
