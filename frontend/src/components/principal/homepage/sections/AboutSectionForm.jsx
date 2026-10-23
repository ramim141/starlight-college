import React, { useState, useEffect } from 'react';
import { Save, Loader2, UserCheck } from 'lucide-react';
import ImageUploadField from '../common/ImageUploadField';

const AboutSectionForm = ({ data = {}, onSave, saving = false, onMarkDirty }) => {
  const [formData, setFormData] = useState({
    badge: '',
    principal_name: '',
    principal_role: '',
    principal_credentials: '',
    title: '',
    first_paragraph: '',
    second_paragraph: '',
    principal_photo: null,
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
      if (key === 'principal_photo') {
        if (value instanceof File) {
          payload.append('principal_photo', value);
        }
      } else if (value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });
    onSave('about', payload, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 ">
        <div>
          <h2 className="text-base font-bold text-brand-navy  flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-orange" />
            অধ্যক্ষের বাণী ও কলেজ পরিচিতি (About Section)
          </h2>
          <p className="text-xs text-slate-500">
            ওয়েবসাইটের 'অধ্যক্ষের বার্তা' এবং কলেজের সার্বিক পরিচিতিমূলক অংশ
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
            সেকশন ব্যাজ
          </label>
          <input
            type="text"
            value={formData.badge || ''}
            onChange={(e) => handleChange('badge', e.target.value)}
            placeholder="যেমন: অধ্যক্ষের বার্তা"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            সেকশন শিরোনাম (Title)
          </label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="যেমন: ঐতিহ্য ও আধুনিক শিক্ষার সমন্বয়ে শ্রেষ্ঠত্ব"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-bold focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            অধ্যক্ষের পূর্ণ নাম
          </label>
          <input
            type="text"
            required
            value={formData.principal_name || ''}
            onChange={(e) => handleChange('principal_name', e.target.value)}
            placeholder="যেমন: অধ্যাপক আতিকুর রহমান"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-bold focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            পদবি (Role)
          </label>
          <input
            type="text"
            value={formData.principal_role || ''}
            onChange={(e) => handleChange('principal_role', e.target.value)}
            placeholder="যেমন: অধ্যক্ষ, স্টারলাইট কলেজ"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            শিক্ষাগত যোগ্যতা / ক্রেডেনশিয়াল
          </label>
          <input
            type="text"
            value={formData.principal_credentials || ''}
            onChange={(e) => handleChange('principal_credentials', e.target.value)}
            placeholder="যেমন: এম.এ (ঢাকা বিশ্ববিদ্যালয়), বি.এড"
            className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3.5 text-xs font-medium focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            প্রথম অনুচ্ছেদ (First Paragraph)
          </label>
          <textarea
            rows={4}
            required
            value={formData.first_paragraph || ''}
            onChange={(e) => handleChange('first_paragraph', e.target.value)}
            placeholder="অধ্যক্ষের বাণীর মূল অংশ..."
            className="w-full rounded-xl border border-slate-300  bg-white  p-3 text-xs leading-relaxed focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700  mb-1">
            দ্বিতীয় অনুচ্ছেদ (Second Paragraph - ঐচ্ছিক)
          </label>
          <textarea
            rows={3}
            value={formData.second_paragraph || ''}
            onChange={(e) => handleChange('second_paragraph', e.target.value)}
            placeholder="অতিরিক্ত বিস্তারিত বা আহ্বান..."
            className="w-full rounded-xl border border-slate-300  bg-white  p-3 text-xs leading-relaxed focus:ring-2 focus:ring-brand-orange focus:outline-none"
          />
        </div>
      </div>

      <ImageUploadField
        label="অধ্যক্ষের অফিসিয়াল ছবি (Principal Photo)"
        currentValue={formData.principal_photo}
        onChange={(file) => handleChange('principal_photo', file)}
      />
    </form>
  );
};

export default AboutSectionForm;
