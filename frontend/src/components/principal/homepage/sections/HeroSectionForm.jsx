import React, { useState, useEffect } from 'react';
import { Save, Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';
import ImageUploadField from '../common/ImageUploadField';

const HeroSectionForm = ({ data = {}, onSave, saving = false, onMarkDirty }) => {
  const [formData, setFormData] = useState({
    badge: '',
    title: '',
    highlighted_title: '',
    description: '',
    primary_button_text: '',
    primary_button_url: '',
    secondary_button_text: '',
    secondary_button_url: '',
    ticker_text: '',
    background_image: null,
    ...data,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (onMarkDirty) onMarkDirty();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'background_image') {
        if (value instanceof File) {
          payload.append('background_image', value);
        }
      } else if (value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });
    onSave('hero', payload, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 ">
        <div>
          <h2 className="text-base font-bold text-brand-navy  flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-orange" />
            হিরো সেকশন ও ব্রেকিং টিকার
          </h2>
          <p className="text-xs text-slate-500">
            ওয়েবসাইটের শীর্ষভাগের প্রধান ব্যানার, টাইটেল, বোতাম ও স্ক্রলিং নোটিশ টিকার
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 px-6 text-xs font-bold text-white shadow-md transition disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>সংরক্ষণ হচ্ছে...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            টপ ব্যাজ / লেবেল
          </label>
          <input
            type="text"
            value={formData.badge || ''}
            onChange={(e) => handleChange('badge', e.target.value)}
            placeholder="যেমন: ভর্তি চলছে ২০২৬"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            ব্রেকিং টিকার টেক্সট
          </label>
          <input
            type="text"
            value={formData.ticker_text || ''}
            onChange={(e) => handleChange('ticker_text', e.target.value)}
            placeholder="যেমন: এইচএসসি পরীক্ষার ফরম পূরণ সংক্রান্ত জরুরি বিজ্ঞপ্তি..."
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            মূল শিরোনাম (Main Title)
          </label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="যেমন: আগামী দিনের নেতৃত্ব গড়ে তুলছে"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-bold focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            হাইলাইটেড অংশ (Highlighted Title)
          </label>
          <input
            type="text"
            value={formData.highlighted_title || ''}
            onChange={(e) => handleChange('highlighted_title', e.target.value)}
            placeholder="যেমন: স্টারলাইট কলেজ সিলেট"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-bold text-brand-orange focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700  mb-1">
          বর্ণনা (Hero Description)
        </label>
        <textarea
          rows={3}
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="হিরো সেকশনের সংক্ষিপ্ত ভূমিকা..."
          className="w-full rounded-xl border border-slate-300  bg-white  p-3 text-xs leading-relaxed focus:ring-2 focus:ring-brand-orange focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50  border border-slate-200 ">
          <span className="block text-xs font-bold text-brand-navy ">
            প্রধান বোতাম (Primary Button)
          </span>
          <input
            type="text"
            placeholder="বোতামের লেখা (যেমন: পোর্টাল প্রবেশ করুন)"
            value={formData.primary_button_text || ''}
            onChange={(e) => handleChange('primary_button_text', e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
          />
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="লিংক URL (যেমন: /login)"
              value={formData.primary_button_url || ''}
              onChange={(e) => handleChange('primary_button_url', e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-slate-300  bg-white  text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-2xl bg-slate-50  border border-slate-200 ">
          <span className="block text-xs font-bold text-brand-navy ">
            দ্বিতীয় বোতাম (Secondary Button)
          </span>
          <input
            type="text"
            placeholder="বোতামের লেখা (যেমন: ভর্তি নির্দেশিকা)"
            value={formData.secondary_button_text || ''}
            onChange={(e) => handleChange('secondary_button_text', e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
          />
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="লিংক URL (যেমন: #admission)"
              value={formData.secondary_button_url || ''}
              onChange={(e) => handleChange('secondary_button_url', e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-slate-300  bg-white  text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <ImageUploadField
        label="হিরো ব্যাকগ্রাউন্ড ইমেজ (Background Image)"
        currentValue={formData.background_image}
        onChange={(file) => handleChange('background_image', file)}
      />
    </form>
  );
};

export default HeroSectionForm;
