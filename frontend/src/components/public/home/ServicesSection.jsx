import React from 'react';
import { 
  Sparkles, 
  Award, 
  ArrowUpRight, 
  ShieldCheck, 
  CreditCard, 
  Bus, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  HelpCircle 
} from 'lucide-react';

const ServicesSection = ({ content = [], onOpenServiceModal, onOpenResultModal }) => {
  const services = Object.fromEntries(content.map((service) => [service.key, service]));
  return (
    <section id="services" className="border-b select-none py-14 sm:py-20 bg-slate-50/70 border-slate-200/80">
      <div className="px-4 mx-auto max-w-7xl sm:px-6">
        
        <div className="flex flex-col gap-4 mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-orange-50 border border-orange-200/60 px-3.5 py-1 text-xs font-black text-[#EA580C] mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ডিজিটাল সেলফ-সার্ভিস পোর্টাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] tracking-tight">
              স্টারলাইট স্মার্ট অ্যাপ সার্ভিসেস
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              শিক্ষার্থী, অভিভাবক ও শিক্ষকদের জন্য আধুনিক সেলফ-সার্ভিস ডিজিটাল হাব
            </p>
          </div>

          <div className="hidden sm:inline-flex items-center space-x-2 rounded-xl bg-white px-3.5 py-1.5 border border-slate-200 shadow-2xs text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>সব ডিজিটাল সার্ভিস সক্রিয়</span>
          </div>
        </div>

        {/* ৮টি প্রোডাকশন বেন্টো কার্ড গ্রিড */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          
          {/* ১. ডিজিটাল মার্কশিট */}
          <button
            type="button"
            onClick={() => onOpenResultModal()}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-amber-400 hover:shadow-[0_12px_28px_-10px_rgba(234,88,12,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#EA580C] group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/50 uppercase tracking-wider">
                  অনলাইন রেজাল্ট
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-[#EA580C] transition-colors leading-snug mt-3.5">
                ডিজিটাল মার্কশিট
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                রোল ও পরীক্ষা নির্বাচন করে তাৎক্ষণিক গ্রেডশিট
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#EA580C] transition-colors">
              <span>রেজাল্ট দেখুন</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* ২. ডিজিটাল আইডি কার্ড */}
          <button
            type="button"
            onClick={() => onOpenServiceModal('idcard')}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-blue-400 hover:shadow-[0_12px_28px_-10px_rgba(37,99,235,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center text-blue-600 transition-all duration-300 border h-11 w-11 rounded-xl bg-blue-50 border-blue-200/60 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/50 uppercase tracking-wider">
                  {services.idcard?.badge || 'কিউআর ভেরিফিকেশন'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-blue-600 transition-colors leading-snug mt-3.5">
                {services.idcard?.title || 'ডিজিটাল আইডি কার্ড'}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                {services.idcard?.description || 'স্মার্ট কার্ড ডাউনলোড ও গেট পাস প্রিভিউ'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
              <span>{services.idcard?.action_label || 'আইডি কার্ড তথ্য'}</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* ৩. অনলাইন ফি প্রদান */}
          <button
            type="button"
            onClick={() => onOpenServiceModal('fees')}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-emerald-400 hover:shadow-[0_12px_28px_-10px_rgba(16,185,129,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center transition-all duration-300 border h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 border-emerald-200/60 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/50 uppercase tracking-wider">
                  {services.fees?.badge || 'বিকাশ / নগদ'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-emerald-600 transition-colors leading-snug mt-3.5">
                {services.fees?.title || 'অনলাইন ফি প্রদান'}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                {services.fees?.description || 'মাসিক বেতন পরিশোধ ও ডিজিটাল রসিদ ডাউনলোড'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
              <span>{services.fees?.action_label || 'পেমেন্ট গাইড'}</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* ৪. কলেজ বাস রুট */}
          <button
            type="button"
            onClick={() => onOpenServiceModal('transport')}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-purple-400 hover:shadow-[0_12px_28px_-10px_rgba(147,51,234,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center text-purple-600 transition-all duration-300 border h-11 w-11 rounded-xl bg-purple-50 border-purple-200/60 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <Bus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-md border border-purple-200/50 uppercase tracking-wider">
                  {services.transport?.badge || '১০টি রুট'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-purple-600 transition-colors leading-snug mt-3.5">
                {services.transport?.title || 'কলেজ বাস রুট'}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                {services.transport?.description || 'জিপিএস ট্র্যাকিং, শিডিউল ও পিক-আপ পয়েন্ট'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-purple-600 transition-colors">
              <span>{services.transport?.action_label || 'রুট ম্যাপ দেখুন'}</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* ৫. স্মার্ট ক্লাস রুটিন */}
          <button
            type="button"
            onClick={() => onOpenServiceModal('routine')}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-cyan-400 hover:shadow-[0_12px_28px_-10px_rgba(6,182,212,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center transition-all duration-300 border h-11 w-11 rounded-xl bg-cyan-50 text-cyan-600 border-cyan-200/60 group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-cyan-700 bg-cyan-50/80 px-2 py-0.5 rounded-md border border-cyan-200/50 uppercase tracking-wider">
                  {services.routine?.badge || 'দৈনিক সূচি'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-cyan-600 transition-colors leading-snug mt-3.5">
                {services.routine?.title || 'স্মার্ট ক্লাস রুটিন'}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                {services.routine?.description || 'শাখাভিত্তিক পিরিয়ড ও প্র্যাকটিক্যাল ল্যাব সময়'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-cyan-600 transition-colors">
              <span>{services.routine?.action_label || 'রুটিন দেখুন'}</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* ৬. সেন্ট্রাল লাইব্রেরি */}
          <button
            type="button"
            onClick={() => onOpenServiceModal('library')}
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-rose-400 hover:shadow-[0_12px_28px_-10px_rgba(244,63,94,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center transition-all duration-300 border h-11 w-11 rounded-xl bg-rose-50 text-rose-600 border-rose-200/60 group-hover:scale-105 group-hover:bg-rose-600 group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-rose-700 bg-rose-50/80 px-2 py-0.5 rounded-md border border-rose-200/50 uppercase tracking-wider">
                  {services.library?.badge || '১৫,০০০+ বই'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-rose-600 transition-colors leading-snug mt-3.5">
                {services.library?.title || 'সেন্ট্রাল লাইব্রেরি'}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                {services.library?.description || 'বই ক্যাটালগ অনুসন্ধান ও ডিজিটাল বুক ইস্যু'}
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-rose-600 transition-colors">
              <span>{services.library?.action_label || 'ক্যাটালগ দেখুন'}</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

          {/* ৭. ভর্তি আবেদন ২০২৬ */}
          <a
            href="#admission"
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-orange-400 hover:shadow-[0_12px_28px_-10px_rgba(234,88,12,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-orange-50 text-[#EA580C] border border-orange-200/60 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#EA580C] group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-orange-700 bg-orange-50/80 px-2 py-0.5 rounded-md border border-orange-200/50 uppercase tracking-wider">
                  ভর্তি চলছে
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-[#EA580C] transition-colors leading-snug mt-3.5">
                ভর্তি আবেদন ২০২৬
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                একাদশ শ্রেণির বিজ্ঞান, বাণিজ্য ও মানবিকে আবেদন
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#EA580C] transition-colors">
              <span>ভর্তি নির্দেশিকা</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          {/* ৮. পরামর্শ ও হেল্পডেস্ক */}
          <a
            href="#contact"
            className="group relative rounded-2xl bg-white p-5 border border-slate-200/85 hover:border-slate-400 hover:shadow-[0_12px_28px_-10px_rgba(15,23,42,0.12)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex flex-col justify-between text-left cursor-pointer overflow-hidden min-h-[44px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0F2C59] group-hover:text-white group-hover:border-transparent shadow-2xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/50 uppercase tracking-wider">
                  ২৪/৭ সাপোর্ট
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#0F2C59] group-hover:text-[#0F2C59] transition-colors leading-snug mt-3.5">
                পরামর্শ ও হেল্পডেস্ক
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 line-clamp-1">
                গোপন মতামত বক্স ও প্রাতিষ্ঠানিক সহায়তা
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#0F2C59] transition-colors">
              <span>মতামত জানান</span>
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

        </div>

      </div>
    </section>
  );
};

export default ServicesSection;