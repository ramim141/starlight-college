import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CalendarOff, FileText, GraduationCap } from 'lucide-react';
import SubjectsTab from './SubjectsTab';
import RoutineTab from './RoutineTab';
import HolidaysTab from './HolidaysTab';
import MaterialsTab from './MaterialsTab';
import { SPRING } from '../../utils/motion';

/**
 * AcademicControlHub - রুটিন, বিষয়, ছুটির তালিকা ও স্টাডি মেটেরিয়াল হাব
 * প্রিন্সিপাল, ইনচার্জ ও শিক্ষক যে কারো পোর্টালে অনায়াসে ব্যবহার করা যায়।
 * স্লাইডিং পিল ইন্ডিকেটর ও পারসিস্টেন্ট ডোম মাউন্ট (keep-alive) সমর্থিত।
 */
const AcademicControlHub = ({ 
  overrideRole = null, 
  defaultTab = 'routines',
  allowedTabs = ['routines', 'subjects', 'holidays', 'materials']
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'routines', label: 'ক্লাস রুটিন টাইমটেবিল', icon: Clock },
    { id: 'subjects', label: 'পাঠ্য বিষয়সমূহ', icon: BookOpen },
    { id: 'holidays', label: 'ছুটির দিন ও ক্যালেন্ডার', icon: CalendarOff },
    { id: 'materials', label: 'সিলেবাস ও হোমওয়ার্ক', icon: FileText },
  ].filter((t) => allowedTabs.includes(t.id));

  return (
    <div className="space-y-6">
      {/* ১. টপ হেডার ও ন্যাভ ট্যাব */}
      <section className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#143B75] px-5 py-6 text-white shadow-xl shadow-blue-900/20 sm:px-8 sm:py-8 space-y-6">
        {/* ব্যাকগ্রাউন্ড অরেঞ্জ আর্চ সোউশ SVG */}
        <svg
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3"
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="academic-hero-swoosh" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FF6A1A" stopOpacity="0" />
              <stop offset="0.55" stopColor="#FF6A1A" stopOpacity="0.95" />
              <stop offset="1" stopColor="#FFB067" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M0 300 C 160 130, 380 40, 600 18" fill="none" stroke="url(#academic-hero-swoosh)" strokeWidth="3" />
          <path d="M0 300 C 200 170, 400 90, 600 64" fill="none" stroke="url(#academic-hero-swoosh)" strokeWidth="1.5" opacity="0.45" />
        </svg>

        {/* টপ-রাইট সফট অরেঞ্জ গ্লো */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" aria-hidden="true" />

        <div className="relative z-10">
          {/* টপ পিল ব্যাজ */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <GraduationCap className="h-4 w-4 text-brand-orange" aria-hidden="true" />
            {overrideRole === 'TEACHER' ? 'শিক্ষক একাডেমিক ডেস্ক' : 'অধ্যক্ষ একাডেমিক কমান্ড'}
          </span>

          {/* প্রধান শিরোনাম ও স্টাইলাইজড ওয়েভি আন্ডারলাইন */}
          <h2 className="mt-4 text-3xl font-extrabold leading-[1.35] text-white sm:text-4xl">
            {overrideRole === 'TEACHER' ? 'একাডেমিক রুটিন ও' : 'একাডেমিক কন্ট্রোল সেন্টার'}
            <span className="block text-brand-orange">
              {overrideRole === 'TEACHER' ? 'ক্লাস রিসোর্স' : 'Academics Hub'}
            </span>
          </h2>
          <svg viewBox="0 0 300 12" className="mt-1 h-3 w-56" aria-hidden="true">
            <path d="M2 8 C 80 2, 200 2, 298 8" stroke="#FF6A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          {/* সাবটাইটেল ডেসক্রিপশন */}
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            পাঠদান রুটিন, বিষয়, ছুটির ক্যালেন্ডার ও সিলেবাস তদারকি করুন।
          </p>
        </div>

        {/* ন্যাভ ট্যাব বাটনসমূহ (হার্ডওয়্যার অ্যাকসেলেরেটেড স্লাইডিং পিল) */}
        <div className="flex flex-wrap gap-2.5 pt-5 border-t border-white/10 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-colors min-h-[44px] cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? 'text-white'
                    : 'border border-white/20 bg-white/5 text-white/85 hover:bg-white/15 hover:text-white backdrop-blur-sm'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="academic_tab_pill"
                    className="absolute inset-0 rounded-full bg-brand-orange shadow-lg shadow-orange-500/35 ring-2 ring-white/20"
                    transition={SPRING.snappy}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-brand-orange'}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ২. সাব-কম্পোনেন্ট রেন্ডারিং (Persistent DOM Keep-Alive) */}
      <div>
        <div className={activeTab === 'routines' ? 'block' : 'hidden'} data-tab-panel="true">
          <RoutineTab overrideRole={overrideRole} />
        </div>
        <div className={activeTab === 'subjects' ? 'block' : 'hidden'} data-tab-panel="true">
          <SubjectsTab overrideRole={overrideRole} />
        </div>
        <div className={activeTab === 'holidays' ? 'block' : 'hidden'} data-tab-panel="true">
          <HolidaysTab overrideRole={overrideRole} />
        </div>
        <div className={activeTab === 'materials' ? 'block' : 'hidden'} data-tab-panel="true">
          <MaterialsTab overrideRole={overrideRole} />
        </div>
      </div>
    </div>
  );
};

export default AcademicControlHub;


