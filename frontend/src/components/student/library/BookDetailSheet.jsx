import React from 'react';
import { BookOpen, MapPin, CheckCircle2, AlertCircle, X, ShieldAlert, Layers } from 'lucide-react';

const BookDetailSheet = ({ isOpen, book, onClose, onBorrowClick, hasOverdueBook }) => {
  if (!isOpen || !book) return null;

  const isAvailable = book.available_copies > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-premium border border-slate-200 animate-slide-up sm:animate-scale-up max-h-[90vh] overflow-y-auto">
        
        {/* ক্লোজ বাটন */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="বন্ধ করুন"
        >
          <X className="h-5 w-5" />
        </button>

        {/* বই আইকন ও টপ হেডার */}
        <div className="flex items-start space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange border border-orange-200 shrink-0 shadow-sm">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
              {book.category_name || 'সাধারণ'}
            </span>
            <h3 className="mt-1 text-base font-bold text-brand-navy leading-snug">
              {book.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">লেখক: {book.author}</p>
          </div>
        </div>

        {/* তথ্য গ্রিড */}
        <div className="my-6 grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">অবস্থান / তাক</span>
            <div className="flex items-center space-x-1 mt-0.5 font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-brand-orange shrink-0" />
              <span>{book.shelf_location || 'অনির্দিষ্ট'}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">স্টক অবস্থা</span>
            <div className={`mt-0.5 font-black flex items-center space-x-1 ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isAvailable ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>{book.available_copies} / {book.total_copies} কপি</span>
            </div>
          </div>

          {book.isbn && (
            <div className="col-span-2 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-400 font-medium">ISBN:</span>{' '}
              <span className="font-mono font-bold text-slate-800">{book.isbn}</span>
            </div>
          )}
        </div>

        {/* ওভারডিউ ব্লক ওয়ার্নিং */}
        {hasOverdueBook && (
          <div className="mb-4 rounded-2xl bg-rose-50 p-3.5 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-800">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">বিলম্বিত বই ফেরত বাকি আছে</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                আপনার কাছে একটি বিলম্বিত বই রয়েছে। সেটি জমা না দেওয়া পর্যন্ত নতুন বইয়ের আবেদন সাময়িকভাবে স্থগিত।
              </p>
            </div>
          </div>
        )}

        {/* স্টক নেই ওয়ার্নিং */}
        {!isAvailable && (
          <div className="mb-4 rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-800">
            <p className="font-bold">বর্তমান কপিগুলো শিক্ষার্থীরা ধার নিয়েছেন</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              কেউ বই ফেরত দিলে পুনরায় কপি স্টকে যুক্ত হবে।
            </p>
          </div>
        )}

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!isAvailable || hasOverdueBook}
            onClick={() => onBorrowClick(book)}
            className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-brand-orange px-5 py-3 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <Layers className="h-4 w-4" />
            <span>বইটির জন্য আবেদন করুন</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition min-h-[44px]"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookDetailSheet;
