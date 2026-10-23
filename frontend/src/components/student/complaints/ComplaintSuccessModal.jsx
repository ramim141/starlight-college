import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight, X } from 'lucide-react';

const ComplaintSuccessModal = ({ isOpen, onClose, onViewHistory, complaintData }) => {
  if (!isOpen) return null;

  const trackingId = complaintData?.id
    ? `COMP-${complaintData.id.slice(0, 8).toUpperCase()}`
    : 'COMP-SUBMITTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-premium border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="বন্ধ করুন"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-md">
          <ShieldCheck className="h-9 w-9" />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          অভিযোগ / পরামর্শ সফলভাবে প্রেরিত হয়েছে!
        </h3>

        <div className="mt-3 inline-block rounded-xl bg-slate-100 px-3.5 py-1.5 border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">ট্র্যাকিং রেফারেন্স</span>
          <span className="text-xs font-black text-brand-navy font-mono">{trackingId}</span>
        </div>

        <p className="mt-3 text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
          আপনার বার্তাটি অত্যন্ত গোপনীয়তার সাথে সরাসরি অধ্যক্ষ মহোদয়ের ড্যাশবোর্ডে পৌঁছে দেওয়া হয়েছে। অধ্যক্ষ এটি যাচাই করে সমাধানের ব্যবস্থা নেবেন।
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => {
              onClose();
              if (onViewHistory) onViewHistory();
            }}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition min-h-[44px]"
          >
            <span>আমার অভিযোগ তালিকায় দেখুন</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition min-h-[44px]"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintSuccessModal;
