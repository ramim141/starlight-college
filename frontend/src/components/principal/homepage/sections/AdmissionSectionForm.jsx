import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import AdmissionStepsSubTab from './admission/AdmissionStepsSubTab';
import AdmissionFaqsSubTab from './admission/AdmissionFaqsSubTab';

const AdmissionSectionForm = ({
  data = {},
  steps = [],
  faqs = [],
  onSaveHeader,
  onSaveStep,
  onDeleteStep,
  onReorderSteps,
  onSaveFaq,
  onDeleteFaq,
  onReorderFaqs,
  saving = false,
  onMarkDirty,
}) => {
  const [headerForm, setHeaderForm] = useState({
    badge: '',
    title: '',
    description: '',
    ...data,
  });

  const [activeSubTab, setActiveSubTab] = useState('header'); // 'header' | 'steps' | 'faqs'

  useEffect(() => {
    setHeaderForm((prev) => ({ ...prev, ...data }));
  }, [data]);

  const handleHeaderChange = (field, value) => {
    setHeaderForm((prev) => ({ ...prev, [field]: value }));
    if (onMarkDirty) onMarkDirty();
  };

  const handleHeaderSubmit = (e) => {
    e.preventDefault();
    onSaveHeader('admission', headerForm);
  };

  return (
    <div className="space-y-6">
      {/* সাব-ট্যাব ন্যাভিগেশন */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 ">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 ">
          <button
            type="button"
            onClick={() => setActiveSubTab('header')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'header'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-slate-600  hover:text-slate-900 '
            }`}
          >
            ভর্তি হেডার
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('steps')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'steps'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-slate-600  hover:text-slate-900 '
            }`}
          >
            ভর্তি ধাপসমূহ ({steps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('faqs')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'faqs'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-slate-600  hover:text-slate-900 '
            }`}
          >
            সাধারণ প্রশ্নোত্তর ({faqs.length})
          </button>
        </div>
      </div>

      {/* ১. ভর্তি হেডার ফর্ম */}
      {activeSubTab === 'header' && (
        <form onSubmit={handleHeaderSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700  mb-1">ব্যাজ</label>
              <input
                type="text"
                value={headerForm.badge || ''}
                onChange={(e) => handleHeaderChange('badge', e.target.value)}
                placeholder="যেমন: একাদশ শ্রেণিতে ভর্তি"
                className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700  mb-1">শিরোনাম</label>
              <input
                type="text"
                required
                value={headerForm.title || ''}
                onChange={(e) => handleHeaderChange('title', e.target.value)}
                placeholder="যেমন: ভর্তি নির্দেশিকা ও সময়সূচি"
                className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-bold focus:ring-2 focus:ring-brand-orange focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  mb-1">বিবরণ</label>
            <textarea
              rows={3}
              value={headerForm.description || ''}
              onChange={(e) => handleHeaderChange('description', e.target.value)}
              className="w-full rounded-xl border border-slate-300  bg-white  p-3 text-xs leading-relaxed focus:ring-2 focus:ring-brand-orange focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 px-6 text-xs font-bold text-white shadow-md transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>হেডার সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* ২. ভর্তি ধাপসমূহ (Admission Steps) */}
      {activeSubTab === 'steps' && (
        <AdmissionStepsSubTab
          steps={steps}
          onSaveStep={onSaveStep}
          onDeleteStep={onDeleteStep}
          onReorderSteps={onReorderSteps}
          saving={saving}
        />
      )}

      {/* ৩. সাধারণ প্রশ্নোত্তর (Admission FAQs) */}
      {activeSubTab === 'faqs' && (
        <AdmissionFaqsSubTab
          faqs={faqs}
          onSaveFaq={onSaveFaq}
          onDeleteFaq={onDeleteFaq}
          onReorderFaqs={onReorderFaqs}
          saving={saving}
        />
      )}
    </div>
  );
};

export default AdmissionSectionForm;
