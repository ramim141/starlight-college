import React, { useState } from 'react';
import { BookOpen, Send, X, ShieldCheck } from 'lucide-react';

const BorrowConfirmModal = ({ isOpen, book, onClose, onConfirm, submitting }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    onConfirm({
      book: book.id,
      reason: reason.trim() || 'পড়াশোনা ও পরীক্ষার প্রস্তুতি',
    }, () => {
      setReason('');
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-premium border border-slate-200 animate-scale-up">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="বন্ধ করুন"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange border border-orange-200 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-navy">বই ধার নেওয়ার আবেদন</h3>
            <p className="text-xs text-slate-500">অনুমোদনের পর লাইব্রেরি থেকে বইটি সংগ্রহ করতে পারবেন</p>
          </div>
        </div>

        {/* সিলেক্টেড বইয়ের সারসংক্ষেপ */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4 text-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase">নির্বাচিত বই</p>
          <h4 className="font-bold text-slate-900 mt-0.5">{book.title}</h4>
          <p className="text-slate-600 text-[11px]">লেখক: {book.author}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              বই নেওয়ার উদ্দেশ্য বা কারণ (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: পদার্থবিজ্ঞান অ্যাসাইনমেন্ট বা এইচএসসি পরীক্ষার প্রস্তুতি"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none transition min-h-[44px]"
            />
          </div>

          {/* লাইব্রেরি পলিসি নির্দেশাবলি */}
          <div className="rounded-2xl bg-blue-50/70 p-3.5 border border-blue-200/80 text-[11px] text-slate-700 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-brand-navy mb-1">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
              <span>লাইব্রেরি নীতিমালা ও ফ্লো</span>
            </div>
            <p>• আবেদনটি প্রথমে সংশ্লিষ্ট বিষয়ের শিক্ষক অনুমোদন করবেন।</p>
            <p>• অনুমোদনের পর লাইব্রেরি থেকে বই ইস্যুর সময় থেকে ৭ দিন পড়ার সুযোগ পাবেন।</p>
            <p>• নির্ধারিত তারিখের পর বই জমা দিলে প্রতিদিন ১০ টাকা বিলম্ব ফি ধার্য হবে।</p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-brand-orange px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-60 min-h-[44px]"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'আবেদন জমা হচ্ছে...' : 'আবেদন নিশ্চিত করুন'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition min-h-[44px]"
            >
              বাতিল
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BorrowConfirmModal;
