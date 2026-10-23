import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, ClipboardList, FileCheck2, HelpCircle, IdCard, ListChecks } from 'lucide-react';

const stepIcons = [ClipboardList, ListChecks, FileCheck2, IdCard];

const AdmissionSection = ({ content = {} }) => {
  const [openFaq, setOpenFaq] = useState(0);

  const defaultFaqs = [
    {
      q: 'একাদশ শ্রেণিতে ভর্তির ন্যূনতম যোগ্যতা কী?',
      a: 'বিজ্ঞান শাখায় ভর্তির জন্য মাধ্যমিক (SSC) পরীক্ষায় ন্যূনতম GPA 4.00, ব্যবসায় শিক্ষা শাখায় GPA 3.00 এবং মানবিক শাখায় GPA 2.50 প্রয়োজন।',
    },
    {
      q: 'কলেজের ডিজিটাল স্টুডেন্ট পোর্টাল কীভাবে ব্যবহার করতে হয়?',
      a: 'প্রত্যেক শিক্ষার্থীর জন্য রয়েছে স্বতন্ত্র প্রোফাইল। ভর্তির সময় প্রাপ্ত SSC Roll, Passing Year এবং গোপন 6-Digit PIN দিয়ে লগইন করে ঘরে বসেই মার্কশিট, ক্লাস রুটিন, নোটিশ ও ডিজিটাল আইডি কার্ড পাওয়া যায়।',
    },
    {
      q: 'মেধাবী ও সুবিধাবঞ্চিত শিক্ষার্থীদের জন্য বৃত্তির সুযোগ আছে কি?',
      a: 'হ্যাঁ! এসএসসিতে গোল্ডেন জিপিএ-৫ প্রাপ্তদের জন্য ১০০% টিউশন ফি মওকুফ এবং অসচ্ছল শিক্ষার্থীদের জন্য প্রিন্সিপাল ওয়েলফেয়ার ফান্ড থেকে বিশেষ ছাড় প্রদান করা হয়।',
    },
    {
      q: 'কলেজ বাস সার্ভিস কোন কোন রুটে চলাচল করে?',
      a: 'সিলেট শহরের আম্বরখানা, টিলাগড়, শিবগঞ্জ, কদমতলী, দক্ষিণ সুরমা, মদিনা মার্কেট এবং বিমানবন্দর রোডসহ প্রধান ৮টি রুটে নিজস্ব জিপিএস ট্র্যাকারযুক্ত শীতাতপ নিয়ন্ত্রিত বাস চলাচল করে।',
    },
    {
      q: 'অভিভাবক কীভাবে শিক্ষার্থীর ক্লাসের উপস্থিতি জানতে পারেন?',
      a: 'শ্রেণি ইনচার্জ প্রতিদিন ক্লাসে ডিজিটাল হাজিরা নেওয়ার সাথে সাথে অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের ফোনে স্বয়ংক্রিয় এসএমএস পৌঁছে যায়।',
    },
  ];
  const faqs = content.faqs?.length
    ? content.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
    : defaultFaqs;

  return (
    <section id="admission" className="relative overflow-hidden bg-gradient-to-b from-[#F6F9FD] via-white to-[#F6F9FD] py-12 sm:py-16">
      <div className="max-w-4xl px-4 mx-auto sm:px-6">
        
        <div className="max-w-xl mx-auto mb-8 text-center">
          <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3 py-1 text-xs font-black text-[#EA580C]">
            {content.badge || 'ভর্তি ২০২৬-২০২৭'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] tracking-tight mt-1.5">
            {content.title || 'ভর্তি নির্দেশিকা ও সাধারণ জিজ্ঞাসাসমূহ'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {content.description || 'একাদশ শ্রেণিতে ভর্তি সংক্রান্ত যেকোনো তথ্যের জন্য নিচের রোডম্যাপ ও প্রশ্নোত্তর পড়ুন'}
          </p>
        </div>

        {/* ৪ ধাপের রোডম্যাপ */}
        <ol className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(content.steps?.length ? content.steps : [
            { step: '১', title: 'অনলাইন আবেদন', desc: 'বোর্ড নিয়মে কলেজ চয়েস', color: 'bg-[#EA580C]' },
            { step: '২', title: 'মেধা তালিকা প্রকাশ', desc: 'এসএমএস কনফার্মেশন', color: 'bg-[#0F2C59]' },
            { step: '৩', title: 'ডকুমেন্ট ভেরিফিকেশন', desc: 'মার্কশিট ও সনদ যাচাই', color: 'bg-emerald-600' },
            { step: '৪', title: 'ডিজিটাল আইডি প্রাপ্তি', desc: 'স্টুডেন্ট পোর্টাল পিন', color: 'bg-purple-600' },
          ]).map((item, idx) => {
            const StepIcon = stepIcons[idx] || CheckCircle2;
            return (
              <li
                key={`${item.step}-${idx}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_16px_34px_-22px_rgba(15,44,89,0.45)] sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.color || 'bg-[#0F2C59]'} text-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
                    <StepIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-500 ring-1 ring-inset ring-slate-200/80">
                    ধাপ {item.step}
                  </span>
                </div>
                <strong className="block text-sm font-extrabold leading-snug text-[#0F2C59] transition-colors group-hover:text-[#EA580C]">
                  {item.title}
                </strong>
                <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">
                  {item.desc || item.description}
                </span>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full w-1/3 rounded-full bg-gradient-to-r from-[#EA580C] to-amber-400 transition-all duration-500 group-hover:w-full" />
                </div>
              </li>
            );
          })}
        </ol>

        {/* স্মুথ গ্রিড-হাইট এফএকিউ একর্ডিয়ন */}
        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,44,89,0.42)] sm:p-6">
          <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4 sm:mb-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#EA580C] ring-1 ring-inset ring-orange-100">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#0F2C59] sm:text-base">ভর্তি বিষয়ে সাধারণ প্রশ্ন</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">দ্রুত উত্তর পেতে একটি প্রশ্ন নির্বাচন করুন</p>
            </div>
            <span className="ml-auto hidden rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200 sm:inline-flex">
              {faqs.length.toLocaleString('bn-BD')}টি প্রশ্ন
            </span>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const answerId = `admission-faq-answer-${index}`;
              return (
                <div
                  key={`${faq.q}-${index}`}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen ? 'border-orange-200 bg-white shadow-sm shadow-orange-950/[0.03]' : 'border-slate-200/80 bg-white hover:border-slate-300'}`}
                >
                  <button
                    type="button"
                    id={`admission-faq-trigger-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-slate-50/80 sm:px-5"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black transition-colors ${isOpen ? 'bg-orange-50 text-[#EA580C]' : 'bg-slate-100 text-slate-500'}`}>
                      {(index + 1).toLocaleString('bn-BD')}
                    </span>
                    <span className={`flex-1 text-xs font-extrabold leading-relaxed sm:text-sm ${isOpen ? 'text-[#0F2C59]' : 'text-slate-700'}`}>
                      {faq.q}
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-[#EA580C] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </span>
                  </button>
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={`admission-faq-trigger-${index}`}
                    aria-hidden={!isOpen}
                    className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-slate-100 bg-gradient-to-r from-orange-50/50 to-white px-4 py-4 pl-14 text-xs leading-7 text-slate-600 sm:px-5 sm:pl-16 sm:text-sm">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <a href="#contact" className="group mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-[#EA580C] transition-colors hover:bg-orange-50">
            আরও সহায়তা প্রয়োজন? যোগাযোগ করুন
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default AdmissionSection;