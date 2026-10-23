import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Bus, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

const ServiceHubModal = ({ 
  isMounted, 
  isVisible, 
  activeTab = 'transport', 
  onClose 
}) => {
  const [bodyHeight, setBodyHeight] = useState('auto');
  const bodyRef = useRef(null);

  const services = [
    { key: 'transport', label: 'পরিবহন', icon: Bus },
    { key: 'routine', label: 'রুটিন', icon: Calendar },
    { key: 'library', label: 'লাইব্রেরি', icon: BookOpen },
    { key: 'fees', label: 'ফি পেমেন্ট', icon: CreditCard },
    { key: 'idcard', label: 'ডিজিটাল আইডি', icon: ShieldCheck },
  ];

  const activeService = services.find((service) => service.key === activeTab) || services[0];
  const ActiveServiceIcon = activeService.icon;

  useEffect(() => {
    if (bodyRef.current && isMounted) {
      setBodyHeight(bodyRef.current.scrollHeight);
    }
  }, [activeTab, isMounted]);

  if (!isMounted) return null;

  return (
    <div 
      style={{
        transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isVisible ? 1 : 0,
      }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 select-none sm:items-center bg-slate-900/60 backdrop-blur-xs sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        style={{
          transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
          transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(36px) scale(0.95)',
          opacity: isVisible ? 1 : 0,
        }}
        className="w-full max-w-lg p-5 bg-white border shadow-2xl rounded-t-lg sm:rounded-lg sm:p-6 border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#EA580C]">
              <ActiveServiceIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F2C59]">{activeService.label}</h3>
              <p className="text-[10px] text-slate-500">সার্ভিসের বিস্তারিত তথ্য</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* নির্বাচিত সার্ভিসের ডায়নামিক হাইট কন্টেইনার */}
        <div 
          style={{
            height: bodyHeight ? `${bodyHeight}px` : 'auto',
            transition: 'height 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className="overflow-hidden transition-all duration-400"
        >
          <div ref={bodyRef} className="py-2">
            
            {activeTab === 'transport' && (
              <div className="space-y-3 text-xs hero-stagger-1 text-slate-600">
                <p className="font-medium">সিলেট মহানগরীর প্রধান ৮টি রুটে নিজস্ব জিপিএস ট্র্যাকারযুক্ত শীতাতপ নিয়ন্ত্রিত বাস চলাচল করে।</p>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                    <strong>রুট ১: কদমতলী &rarr; দক্ষিণ সুরমা &rarr; ক্যাম্পাস</strong>
                    <span className="text-[#EA580C] font-mono">সকাল ৭:৪৫</span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                    <strong>রুট ২: টিলাগড় &rarr; শিবগঞ্জ &rarr; নয়াসড়ক &rarr; ক্যাম্পাস</strong>
                    <span className="text-[#EA580C] font-mono">সকাল ৭:৫০</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <strong>রুট ৩: মদিনা মার্কেট &rarr; পাঠানটুলা &rarr; চৌহাট্টা &rarr; ক্যাম্পাস</strong>
                    <span className="text-[#EA580C] font-mono">সকাল ৮:০০</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'routine' && (
              <div className="space-y-3 text-xs hero-stagger-1 text-slate-600">
                <p className="font-medium">একাদশ ও দ্বাদশ শ্রেণির দৈনিক ক্লাস সময়সূচি সকাল ৮:৩০ হতে দুপুর ১:৪৫ পর্যন্ত অনুষ্ঠিত হয়।</p>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                  <p>• <strong>১ম ও ২য় পিরিয়ড:</strong> সকাল ৮:৩০ - ১০:০০</p>
                  <p>• <strong>টিফিন ও বিরতি:</strong> সকাল ১১:৩০ - ১২:০০</p>
                  <p>• <strong>ব্যবহারিক ল্যাব:</strong> দুপুর ১২:০০ - ১:৪৫</p>
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <div className="space-y-3 text-xs hero-stagger-1 text-slate-600">
                <p className="font-medium">কলেজের সেন্ট্রাল লাইব্রেরিতে রয়েছে ১৫,০০০+ বিজ্ঞান, ব্যবসায় ও রেফারেন্স গ্রন্থ।</p>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                  <p>• <strong>বই ইস্যু:</strong> এককালীন ৩টি বই ১৪ দিনের জন্য নেওয়া যায়।</p>
                  <p>• <strong>ই-লাইব্রেরি:</strong> জার্নাল ও পিডিএফ স্টাডি সুবিধা।</p>
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-3 text-xs hero-stagger-1 text-slate-600">
                <p className="font-medium">বিকাশ, নগদ বা ডেবিট কার্ড দিয়ে ঘরে বসেই টিউশন ও পরীক্ষার ফি প্রদান করা যায়।</p>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                  <p>• টাকা জমা দেওয়ার সাথে সাথে ডিজিটাল মানি রিসিট প্রস্তুত হয়।</p>
                  <p>• বকেয়া বিবরণী স্টুডেন্ট পোর্টালে সরাসরি দেখা যায়।</p>
                </div>
              </div>
            )}

            {activeTab === 'idcard' && (
              <div className="space-y-3 text-xs hero-stagger-1 text-slate-600">
                <p className="font-medium">ইউনিক কিউআর কোড সংবলিত স্মার্ট ডিজিটাল পরিচয়পত্র।</p>
                <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                  <p>• ক্যাম্পাসে প্রবেশ ও লাইব্রেরি অ্যাক্সেসে আইডি কার্ড বাধ্যতামূলক।</p>
                  <p>• স্টুডেন্ট পোর্টাল থেকে সরাসরি ডাউনলোড ও প্রিন্টযোগ্য।</p>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <Link
            to="/login"
            className="text-xs font-black text-[#EA580C] hover:underline inline-flex items-center space-x-1"
          >
            <span>স্টুডেন্ট পোর্টালে লগইন</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceHubModal;