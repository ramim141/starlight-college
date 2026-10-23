import React, { useState, useEffect } from 'react';
import { X, Loader2, BookOpen } from 'lucide-react';

const SubjectCreateEditModal = ({
  isOpen,
  onClose,
  onSave,
  subject,
  teachers,
  submitting,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    class_level: 'XI',
    group: 'SCI',
    default_teacher: '',
    is_active: true,
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        class_level: subject.class_level || 'XI',
        group: subject.group || 'SCI',
        default_teacher: subject.default_teacher ? String(subject.default_teacher) : '',
        is_active: subject.is_active !== false,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        class_level: 'XI',
        group: 'SCI',
        default_teacher: '',
        is_active: true,
      });
    }
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* মডাল হেডার */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">
                {subject ? 'পাঠ্য বিষয় সম্পাদনা' : 'নতুন পাঠ্য বিষয় যোগ'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                বিষয়ের কোড, নাম, গ্রুপ ও শ্রেণি তথ্য প্রদান করুন
              </p>
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

        {/* ফর্ম */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              বিষয়ের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: রসায়ন ১ম পত্র"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none min-h-[42px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                বিষয় কোড <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: 176"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 font-mono placeholder-slate-400 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শ্রেণি <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              >
                <option value="XI">একাদশ শ্রেণি (1st Year)</option>
                <option value="XII">দ্বাদশ শ্রেণি (2nd Year)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                বিভাগ / গ্রুপ <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              >
                <option value="SCI">বিজ্ঞান (Science)</option>
                <option value="HUM">মানবিক (Humanities)</option>
                <option value="BUS">ব্যবসায় শিক্ষা (Business Studies)</option>
                <option value="GEN">সাধারণ (General)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                মনোনীত বিষয় শিক্ষক
              </label>
              <select
                value={formData.default_teacher}
                onChange={(e) => setFormData({ ...formData, default_teacher: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              >
                <option value="">-- কোনো শিক্ষক মনোনীত নয় --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="subject_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded text-brand-orange focus:ring-brand-orange border-slate-300 cursor-pointer"
            />
            <label htmlFor="subject_is_active" className="text-xs font-bold text-slate-700 cursor-pointer">
              বিষয়টি সক্রিয় ও শিক্ষার্থীদের জন্য পাঠ্য হিসেবে প্রযোজ্য রাখুন
            </label>
          </div>

          {/* অ্যাকশন বাটন */}
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
              <span>{subject ? 'হালনাগাদ করুন' : 'যোগ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectCreateEditModal;
