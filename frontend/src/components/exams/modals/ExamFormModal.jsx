import React, { useState, useEffect } from 'react';
import { Award, X, Calendar, Layers, Clock } from 'lucide-react';

const ExamFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    exam_type: 'SEMESTER',
    session: '2025-2026',
    class_level: 'XI',
    start_date: '',
    end_date: '',
    has_tutorial_conversion: true,
    exam_weight_percentage: 80.00,
    tutorial_weight_percentage: 20.00,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        exam_type: initialData.exam_type || 'SEMESTER',
        session: initialData.session || '2025-2026',
        class_level: initialData.class_level || 'XI',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        has_tutorial_conversion: initialData.has_tutorial_conversion ?? true,
        exam_weight_percentage: initialData.exam_weight_percentage ?? 80.00,
        tutorial_weight_percentage: initialData.tutorial_weight_percentage ?? 20.00,
      });
    } else {
      setFormData({
        name: '',
        exam_type: 'SEMESTER',
        session: '2025-2026',
        class_level: 'XI',
        start_date: '',
        end_date: '',
        has_tutorial_conversion: true,
        exam_weight_percentage: 80.00,
        tutorial_weight_percentage: 20.00,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-brand-orange">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'পরীক্ষার বিবরণ সম্পাদনা' : 'নতুন পরীক্ষা তৈরি'}
              </h3>
              <p className="text-xs text-slate-500">
                পরীক্ষার নাম, শ্রেণি, সেশন এবং সময়সীমা নির্ধারণ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              পরীক্ষার নাম *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: একাদশ শ্রেণি ১ম সেমিস্টার ফাইনাল ২০২৬"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                পরীক্ষার ধরন
              </label>
              <select
                value={formData.exam_type}
                onChange={(e) => {
                  const type = e.target.value;
                  const isModelTest = type === 'MODEL_TEST';
                  setFormData({
                    ...formData,
                    exam_type: type,
                    has_tutorial_conversion: !isModelTest,
                    exam_weight_percentage: isModelTest ? 100 : 80,
                    tutorial_weight_percentage: isModelTest ? 0 : 20,
                  });
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              >
                <option value="SEMESTER">সেমিস্টার পরীক্ষা</option>
                <option value="MODEL_TEST">মডেল টেস্ট (টিউটোরিয়াল ছাড়া)</option>
                <option value="ANNUAL">বার্ষিক পরীক্ষা</option>
                <option value="PRE_TEST">প্রাক-নির্বাচনী (Pre-Test)</option>
                <option value="TEST">নির্বাচনী (Test)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                শ্রেণি (Class Level)
              </label>
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              >
                <option value="XI">একাদশ শ্রেণি (XI)</option>
                <option value="XII">দ্বাদশ শ্রেণি (XII)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                শিক্ষাবর্ষ / সেশন *
              </label>
              <input
                type="text"
                required
                placeholder="2025-2026"
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                শুরুর তারিখ *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                শেষের তারিখ *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>

          <div className="p-3 border rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_tutorial_conversion}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData({
                    ...formData,
                    has_tutorial_conversion: checked,
                    exam_weight_percentage: checked ? 80.00 : 100.00,
                    tutorial_weight_percentage: checked ? 20.00 : 0.00,
                  });
                }}
                className="w-4 h-4 text-brand-orange rounded focus:ring-brand-orange"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                ৮০% সেমিস্টার + ২০% টিউটোরিয়াল রূপান্তর কাঠামো সক্রিয় করুন
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              {formData.has_tutorial_conversion
                ? 'লিখিত/ব্যবহারিক ১০০ নম্বরকে ৮০%-এ রূপান্তর করে টিউটোরিয়ালের ২০ যোগ করা হবে।'
                : 'কোনো টিউটোরিয়াল রূপান্তর হবে না; ১০০% মূল পরীক্ষার নম্বর চূড়ান্ত হিসেবে বিবেচিত হবে।'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialData ? 'হালনাগাদ সংরক্ষণ' : 'পরীক্ষা তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamFormModal;
