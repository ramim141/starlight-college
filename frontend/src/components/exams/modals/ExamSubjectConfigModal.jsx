import React, { useState, useEffect } from 'react';
import { Percent, X, AlertCircle, CheckCircle2 } from 'lucide-react';

const ExamSubjectConfigModal = ({
  isOpen,
  onClose,
  onSubmit,
  subjects = [],
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    full_marks: 100,
    cq_full_marks: 70,
    mcq_full_marks: 30,
    practical_full_marks: 0,
    tutorial_full_marks: 20,
    pass_marks: 33,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        subject: initialData.subject || '',
        full_marks: Number(initialData.full_marks) || 100,
        cq_full_marks: Number(initialData.cq_full_marks) || 0,
        mcq_full_marks: Number(initialData.mcq_full_marks) || 0,
        practical_full_marks: Number(initialData.practical_full_marks) || 0,
        tutorial_full_marks: Number(initialData.tutorial_full_marks) || 20,
        pass_marks: Number(initialData.pass_marks) || 33,
      });
    } else {
      setFormData({
        subject: subjects.length > 0 ? subjects[0].id : '',
        full_marks: 100,
        cq_full_marks: 70,
        mcq_full_marks: 30,
        practical_full_marks: 0,
        tutorial_full_marks: 20,
        pass_marks: 33,
      });
    }
  }, [initialData, isOpen, subjects]);

  if (!isOpen) return null;

  // লাইভ ভ্যালিডেশন
  const writtenSum =
    (Number(formData.cq_full_marks) || 0) +
    (Number(formData.mcq_full_marks) || 0) +
    (Number(formData.practical_full_marks) || 0);

  const isSplitValid = writtenSum === Number(formData.full_marks);

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
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'নম্বর বণ্টন সম্পাদনা' : 'নতুন বিষয় নম্বর কনফিগারেশন'}
              </h3>
              <p className="text-xs text-slate-500">
                CQ, MCQ, ব্যবহারিক ও টিউটোরিয়াল পূর্ণমান ও পাস নম্বর নির্ধারণ
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
              পাঠ্য বিষয় নির্বাচন *
            </label>
            <select
              required
              disabled={!!initialData}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange disabled:opacity-60"
            >
              <option value="">বিষয় বেছে নিন</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.class_level_display || s.class_level}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                মোট পূর্ণমান (Full Marks) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={formData.full_marks}
                onChange={(e) => setFormData({ ...formData, full_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                পাস নম্বর (Pass Marks) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={formData.pass_marks}
                onChange={(e) => setFormData({ ...formData, pass_marks: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 border rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                নম্বর বিভাজন কাঠামো
              </span>
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isSplitValid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}>
                {isSplitValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>মোট লিখিত: {writtenSum} (সঠিক)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>মোট লিখিত: {writtenSum} (পূর্ণমান {formData.full_marks} এর অসঙ্গতি)</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  CQ পূর্ণমান
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.cq_full_marks}
                  onChange={(e) => setFormData({ ...formData, cq_full_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  MCQ পূর্ণমান
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.mcq_full_marks}
                  onChange={(e) => setFormData({ ...formData, mcq_full_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  ব্যবহারিক
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.practical_full_marks}
                  onChange={(e) => setFormData({ ...formData, practical_full_marks: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    টিউটোরিয়াল পূর্ণমান (২০%)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    সেমিস্টার পরীক্ষার রূপান্তরের সাথে যোগ হবে
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.tutorial_full_marks}
                  onChange={(e) => setFormData({ ...formData, tutorial_full_marks: Number(e.target.value) })}
                  className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono text-right"
                />
              </div>
            </div>
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
              disabled={isSubmitting || !formData.subject}
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialData ? 'হালনাগাদ সংরক্ষণ' : 'কনফিগারেশন সংরক্ষণ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamSubjectConfigModal;
