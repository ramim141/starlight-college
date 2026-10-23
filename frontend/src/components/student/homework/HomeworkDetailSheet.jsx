import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Paperclip, 
  Download, 
  CheckCircle2, 
  Circle, 
  Info,
  ExternalLink 
} from 'lucide-react';
import { getMediaUrl } from '../../../api/homepage';
import { formatDateBn, toBanglaNumber } from './HomeworkCard';

const HomeworkDetailSheet = ({ 
  homework, 
  isCompleted = false, 
  onToggleComplete, 
  onClose 
}) => {
  if (!homework) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* শিট হেডার */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="rounded-xl bg-brand-navy px-3 py-1 text-xs font-black text-white">
              {homework.subject_name}
            </span>
            {homework.section_display && (
              <span className="text-xs font-bold text-slate-500">
                {homework.section_display}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* স্ক্রলেবল কন্টেন্ট */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* শিরোনাম */}
          <div className="space-y-1">
            <h2 className="text-lg font-black text-brand-navy tracking-tight leading-snug">
              {homework.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>শিক্ষক: <strong className="text-slate-700">{homework.teacher_name}</strong></span>
              </span>
              <span>•</span>
              <span>দেওয়া হয়েছে: {formatDateBn(homework.created_at)}</span>
            </div>
          </div>

          {/* ডেডলাইন ও সময়সীমা কার্ড */}
          <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-black text-amber-900 block">জমা দেওয়ার শেষ সময় (Due Date)</span>
                <span className="text-xs font-bold text-slate-800">
                  {formatDateBn(homework.due_date)}
                </span>
              </div>
            </div>

            {isCompleted && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>সম্পন্ন</span>
              </span>
            )}
          </div>

          {/* পূর্ণাঙ্গ বিবরণ ও নির্দেশাবলী */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              হোমওয়ার্কের বিবরণ ও নির্দেশাবলী
            </h4>
            <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {homework.description}
            </div>
          </div>

          {/* সংযুক্ত ফাইল থাকলে ডাউনলোড বাটন */}
          {homework.attachment && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                সংযুক্ত শিক্ষামূলক ফাইল / শিট
              </h4>
              <a
                href={getMediaUrl(homework.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-white p-4 border border-slate-200 hover:border-brand-orange hover:bg-brand-orange/5 transition group shadow-2xs"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-brand-navy group-hover:text-brand-orange transition block truncate">
                      অ্যাসাইনমেন্টের ফাইল ডাউনলোড করুন
                    </span>
                    <span className="text-[11px] text-slate-400">পিডিএফ / ইমেজ ফাইল</span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-brand-orange group-hover:text-white transition shrink-0 ml-2">
                  <Download className="h-4 w-4" />
                </div>
              </a>
            </div>
          )}

          {/* ব্যক্তিগত চেকলিস্ট টগল সেকশন */}
          <div className="rounded-2xl bg-slate-100/70 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">ব্যক্তিগত পড়াশোনা ট্র্যাকার</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">লোকাল সেভ</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              পড়া বা বাড়ির কাজ সম্পন্ন হলে নিচের বাটনে চাপ দিয়ে চিহ্নিত করুন। এটি শুধুমাত্র আপনার ফোনেই সংরক্ষিত থাকে যাতে আপনি নিজের পড়াশোনার অগ্রগতি বুঝতে পারেন।
            </p>

            <button
              type="button"
              onClick={() => onToggleComplete(homework.id)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 min-h-[44px] ${
                isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>সম্পন্ন হয়েছে (আবার অসম্পূর্ণ করতে চাপুন)</span>
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 text-slate-400" />
                  <span>হোমওয়ার্কটি সম্পন্ন চিহ্নিত করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ফুটার */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition min-h-[44px]"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeworkDetailSheet;
