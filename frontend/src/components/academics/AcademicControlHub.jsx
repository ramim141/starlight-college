import React, { useState } from 'react';
import { BookOpen, Clock, CalendarOff, FileText } from 'lucide-react';
import SubjectsTab from './SubjectsTab';
import RoutineTab from './RoutineTab';
import HolidaysTab from './HolidaysTab';
import MaterialsTab from './MaterialsTab';

/**
 * AcademicControlHub - রুটিন, বিষয়, ছুটির তালিকা ও স্টাডি মেটেরিয়াল হাব
 * প্রিন্সিপাল, ইনচার্জ ও শিক্ষক যে কারো পোর্টালে অনায়াসে ব্যবহার করা যায়।
 */
const AcademicControlHub = ({ 
  overrideRole = null, 
  defaultTab = 'routines',
  allowedTabs = ['routines', 'subjects', 'holidays', 'materials']
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'routines', label: 'ক্লাস রুটিন টাইমটেবিল', icon: Clock, color: 'text-orange-400' },
    { id: 'subjects', label: 'পাঠ্য বিষয়সমূহ', icon: BookOpen, color: '' },
    { id: 'holidays', label: 'ছুটির দিন ও ক্যালেন্ডার', icon: CalendarOff, color: '' },
    { id: 'materials', label: 'সিলেবাস ও হোমওয়ার্ক', icon: FileText, color: '' },
  ].filter(t => allowedTabs.includes(t.id));

  return (
    <div className="space-y-6">
      {/* ১. টপ হেডার ও ন্যাভ ট্যাব */}
      <div className="no-print rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-brand-navy dark:text-slate-100">
            {overrideRole === 'TEACHER' ? 'একাডেমিক রুটিন ও ক্লাস রিসোর্স' : 'একাডেমিক কন্ট্রোল সেন্টার (Academics Hub)'}
          </h2>
          <p className="text-xs text-slate-500">পাঠদান রুটিন, বিষয়, ছুটির ক্যালেন্ডার ও সিলেবাস তদারকি করুন।</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isActive 
                    ? 'bg-[#0F2C59] text-white shadow' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ২. সাব-কম্পোনেন্ট রেন্ডারিং */}
      <div>
        {activeTab === 'routines' && <RoutineTab overrideRole={overrideRole} />}
        {activeTab === 'subjects' && <SubjectsTab overrideRole={overrideRole} />}
        {activeTab === 'holidays' && <HolidaysTab overrideRole={overrideRole} />}
        {activeTab === 'materials' && <MaterialsTab overrideRole={overrideRole} />}
      </div>
    </div>
  );
};

export default AcademicControlHub;
