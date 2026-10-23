import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2, Lock } from 'lucide-react';

const HolidayCreateEditModal = ({
  isOpen,
  onClose,
  onSave,
  holiday,
  initialDate,
  submitting,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    holiday_type: 'GOVERNMENT',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    is_attendance_locked: true,
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        title: holiday.title || '',
        holiday_type: holiday.holiday_type || 'GOVERNMENT',
        start_date: holiday.start_date || new Date().toISOString().split('T')[0],
        end_date: holiday.end_date || new Date().toISOString().split('T')[0],
        is_attendance_locked: holiday.is_attendance_locked !== false,
      });
    } else if (initialDate) {
      setFormData({
        title: '',
        holiday_type: 'GOVERNMENT',
        start_date: initialDate,
        end_date: initialDate,
        is_attendance_locked: true,
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        holiday_type: 'GOVERNMENT',
        start_date: today,
        end_date: today,
        is_attendance_locked: true,
      });
    }
  }, [holiday, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">
                {holiday ? 'ছুটির তথ্য সম্পাদনা' : 'নতুন ছুটি নির্ধারণ'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">একাডেমিক ক্যালেন্ডারে ছুটির দিন যুক্ত করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              ছুটির শিরোনাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: ঈদুল ফিতর / বিজয় দিবস"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              ছুটির ধরন <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.holiday_type}
              onChange={(e) => setFormData({ ...formData, holiday_type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
            >
              <option value="GOVERNMENT">সরকারি ছুটি (Government Holiday)</option>
              <option value="RELIGIOUS">ধর্মীয় ছুটি (Religious Holiday)</option>
              <option value="WEEKEND">সাপ্তাহিক ছুটি (Weekend)</option>
              <option value="COLLEGE">কলেজ নিজস্ব ছুটি (College Holiday)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শুরুর তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শেষের তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
            <input
              type="checkbox"
              id="is_attendance_locked"
              checked={formData.is_attendance_locked}
              onChange={(e) => setFormData({ ...formData, is_attendance_locked: e.target.checked })}
              className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="is_attendance_locked" className="text-xs font-bold text-rose-900 cursor-pointer flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-rose-600" />
              <span>উক্ত ছুটির দিনে শিক্ষক ও শিক্ষার্থীদের ডিজিটাল হাজিরা বন্ধ (লক) থাকবে</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-orange-hover min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{holiday ? 'হালনাগাদ করুন' : 'নির্ধারণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HolidayCreateEditModal;
