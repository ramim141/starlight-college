import React from 'react';
import { HelpCircle, X, CheckCircle2, Phone } from 'lucide-react';

export const LoginHelpModal = ({ isModalMounted, isModalVisible, closeHelpModal }) => {
  if (!isModalMounted) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      style={{
        transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isModalVisible ? 1 : 0,
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4"
      onClick={closeHelpModal}
    >
      <div 
        style={{
          transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
          transform: isModalVisible 
            ? 'translateY(0px) scale(1)' 
            : 'translateY(36px) scale(0.95)',
          opacity: isModalVisible ? 1 : 0,
        }}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-xl bg-orange-50 p-2 text-orange-600 border border-orange-100">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F2C59]">পিন ও পাসওয়ার্ড সহায়তা</h3>
              <p className="text-[11px] text-slate-500">অ্যাকাউন্ট অ্যাক্সেস পুনরুদ্ধার নির্দেশিকা</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={closeHelpModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 hover:rotate-90 transition-all duration-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 text-xs text-slate-600 space-y-3 leading-relaxed">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 hover:border-orange-200 transition-colors">
            <strong className="text-[#0F2C59] flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
              <span>শিক্ষার্থীদের পিন রিকভারি:</span>
            </strong>
            <p className="pl-5.5 text-slate-600">
              • ভর্তির সময় প্রদানকৃত অফিশিয়াল এসএমএসে আপনার ৬-ডিজিটের গোপন পিন দেওয়া হয়েছে।
            </p>
            <p className="pl-5.5 text-slate-600">
              • পিন ভুলে গেলে আপনার সেকশনের <strong>শ্রেণি ইনচার্জ (Class In-Charge)</strong> অথবা কলেজের আইসিটি সেলে যোগাযোগ করুন।
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1.5 hover:border-slate-300 transition-colors">
            <strong className="text-[#0F2C59] flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-[#0F2C59] shrink-0" />
              <span>শিক্ষক ও স্টাফ পাসওয়ার্ড:</span>
            </strong>
            <p className="pl-5.5 text-slate-600">
              • পাসওয়ার্ড রিসেট বা ইউজারনেম সংক্রান্ত যেকোনো পরিবর্তনের জন্য প্রিন্সিপাল অফিস বা সিস্টেম অ্যাডমিনিস্ট্রেটরের সহায়তা নিন।
            </p>
          </div>

          <div className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-teal-50/80 rounded-2xl border border-emerald-200/90 text-emerald-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-emerald-950">আইসিটি হেল্পডেস্ক</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
                      সকাল ১০:০০ - বিকাল ৩:০০
                    </span>
                  </div>
                  <a 
                    href="tel:+8801712345678" 
                    className="text-xs sm:text-[13px] font-black text-emerald-900 font-mono tracking-wider hover:underline block mt-0.5"
                  >
                    +৮৮০১৭১২-৩৪৫৬৭৮
                  </a>
                </div>
              </div>

              <a 
                href="tel:+8801712345678" 
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-sm shadow-emerald-600/20 transition-all shrink-0 whitespace-nowrap cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>সরাসরি কল করুন</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={closeHelpModal}
            className="w-full rounded-2xl bg-[#0F2C59] py-3 text-xs font-black text-white hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer"
          >
            বুঝতে পেরেছি
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginHelpModal;
