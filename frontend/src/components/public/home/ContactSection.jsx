import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight, Clock, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { homepageContentApi } from '../../../api/homepage';

const DEFAULT_HOTLINE = '+৮৮০১৭১২-৩৪৫৬৭৮, +৮৮০৮২১-৭৬৫৪৩২';
const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';

const toTelephoneHref = (phone) => {
  const westernDigits = Array.from(String(phone), (character) => {
    const digit = BENGALI_DIGITS.indexOf(character);
    return digit === -1 ? character : String(digit);
  }).join('');
  return `tel:${westernDigits.replace(/[^+\d]/g, '')}`;
};

const ContactSection = ({ content = {} }) => {
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', group: 'SCIENCE', message: '', bot_field: '' });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const campusAddress = content.address || 'আম্বরখানা মেইন রোড, বিমানবন্দর সড়ক মোড়, সিলেট সদর, সিলেট-৩১০০।';
  const hotlineNumbers = String(content.hotline || DEFAULT_HOTLINE).split(/[,;|\n]+/).map((number) => number.trim()).filter(Boolean);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name?.trim() || !inquiryForm.phone?.trim()) {
      toast.error('আপনার নাম ও মোবাইল নম্বর প্রদান করুন');
      return;
    }
    // বট / হানিপট গার্ড
    if (inquiryForm.bot_field) {
      return;
    }
    setSendingInquiry(true);
    try {
      await homepageContentApi.inquiries.submit({
        name: inquiryForm.name.trim(),
        phone: inquiryForm.phone.trim(),
        group: inquiryForm.group,
        message: inquiryForm.message?.trim() || '',
        bot_field: inquiryForm.bot_field,
      });
      toast.success('আপনার বার্তা সফলভাবে গৃহীত হয়েছে! ভর্তি সেল হতে অতি দ্রুত যোগাযোগ করা হবে।');
      setInquiryForm({ name: '', phone: '', group: 'SCIENCE', message: '', bot_field: '' });
    } catch (err) {
      const errorMsg =
        err?.response?.data?.phone?.[0] ||
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        'বার্তা পাঠাতে সমস্যা হয়েছে। সঠিক মোবাইল নম্বর দিয়ে পুনরায় চেষ্টা করুন।';
      toast.error(errorMsg);
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-white via-[#F8FAFC] to-white py-14 sm:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6">
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          <div className="space-y-5 lg:col-span-5">
            <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3 py-1 text-xs font-black text-[#EA580C]">
              {content.badge || 'যোগাযোগ ও দিকনির্দেশনা'}
            </span>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-[#0F2C59] sm:text-3xl">
              {content.title || 'ক্যাম্পাস পরিদর্শন ও ভর্তি তথ্য সেল'}
            </h2>
            <p className="text-xs leading-relaxed sm:text-sm text-slate-500">
              {content.description || 'যেকোনো প্রশ্ন বা ভর্তি সংক্রান্ত পরামর্শের জন্য সরাসরি আমাদের ক্যাম্পাসে আসুন অথবা নিচের নম্বরে কল করুন।'}
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C] ring-1 ring-inset ring-orange-100 transition-colors group-hover:bg-[#EA580C] group-hover:text-white">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block font-extrabold text-[#0F2C59]">ক্যাম্পাস ঠিকানা</strong>
                  <span className="mt-1 block leading-relaxed text-slate-600">{campusAddress}</span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(campusAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-8 items-center gap-1 font-bold text-[#EA580C] transition-colors hover:text-orange-700"
                  >
                    মানচিত্র দেখুন <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block font-extrabold text-[#0F2C59]">হটলাইন ও ভর্তি হেল্পডেস্ক</strong>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {hotlineNumbers.map((number) => (
                      <a key={number} href={toTelephoneHref(number)} className="font-semibold text-slate-600 transition-colors hover:text-emerald-700">
                        {number}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block font-extrabold text-[#0F2C59]">অফিস সময়সূচি</strong>
                  <span className="mt-1 block leading-relaxed text-slate-600">{content.office_hours || 'শনিবার হতে বৃহস্পতিবার: সকাল ৮:০০ হতে বিকাল ৪:০০ পর্যন্ত'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_24px_70px_-44px_rgba(15,44,89,0.42)] sm:p-8">
              <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#EA580C] via-amber-400 to-[#0F2C59]" />
              <div className="mb-6 flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F2C59] text-white shadow-md shadow-blue-950/10">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black leading-snug text-[#0F2C59] sm:text-lg">
                    {content.form_title || 'ভর্তি সংক্রান্ত কোনো জিজ্ঞাসা আছে? আমাদের লিখুন'}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {content.form_description || 'আপনার তথ্য দিন, আমাদের ভর্তি অফিসার অতি দ্রুত আপনার সাথে ফোনে কথা বলবেন।'}
                  </p>
                </div>
                <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-100 sm:inline-flex">
                  ভর্তি সহায়তা
                </span>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4" aria-busy={sendingInquiry}>
                {/* Honeypot field for anti-spam */}
                <input
                  type="text"
                  name="bot_field"
                  value={inquiryForm.bot_field || ''}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, bot_field: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="group">
                    <label htmlFor="inquiry-name" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 transition-colors group-focus-within:text-[#EA580C]">
                      আপনার বা শিক্ষার্থীর পূর্ণ নাম <span className="text-[#EA580C]" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="inquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      required
                    />
                  </div>
                  <div className="group">
                    <label htmlFor="inquiry-phone" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 transition-colors group-focus-within:text-[#EA580C]">
                      মোবাইল নম্বর <span className="text-[#EA580C]" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="inquiry-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="০১৭xxxxxxxx"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="inquiry-group" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 transition-colors group-focus-within:text-[#EA580C]">
                    আগ্রহী বিভাগ
                  </label>
                  <select
                    id="inquiry-group"
                    name="group"
                    value={inquiryForm.group}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, group: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  >
                    <option value="SCIENCE">বিজ্ঞান বিভাগ (Science)</option>
                    <option value="BUSINESS">ব্যবসায় শিক্ষা (Business Studies)</option>
                    <option value="HUMANITIES">মানবিক বিভাগ (Humanities)</option>
                  </select>
                </div>

                <div className="group">
                  <label htmlFor="inquiry-message" className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 transition-colors group-focus-within:text-[#EA580C]">
                    আপনার জিজ্ঞাসা / মন্তব্য
                  </label>
                  <textarea
                    id="inquiry-message"
                    name="message"
                    rows="3"
                    maxLength={500}
                    placeholder="আপনার কোনো প্রশ্ন থাকলে সংক্ষেপে লিখুন..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full resize-y rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] px-7 py-3.5 text-sm font-black text-white shadow-md shadow-orange-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#EA580C] hover:to-amber-700 hover:shadow-lg active:scale-[0.98] sm:w-auto"
                >
                  {sendingInquiry ? (
                    <>
                      <span role="status" aria-label="বার্তা পাঠানো হচ্ছে" className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>বার্তা পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      <span>বার্তা পাঠান</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;