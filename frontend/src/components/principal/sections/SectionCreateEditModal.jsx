import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertTriangle } from 'lucide-react';

const SectionCreateEditModal = ({
  isOpen,
  onClose,
  initialData = null,
  teachers = [],
  teacherAssignedSectionMap = new Map(),
  onSubmit,
  submitting = false,
}) => {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    class_level: 'XI',
    group: 'SCI',
    section_name: 'A',
    session: '2025-2026',
    in_charge_teacher: '',
    room_number: '',
    capacity: 60,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        class_level: initialData.class_level || 'XI',
        group: initialData.group || 'SCI',
        section_name: initialData.section_name || 'A',
        session: initialData.session || '2025-2026',
        in_charge_teacher: initialData.in_charge_teacher ? String(initialData.in_charge_teacher) : '',
        room_number: initialData.room_number || '',
        capacity: initialData.capacity || 60,
        is_active: initialData.is_active !== false,
      });
    } else {
      setFormData({
        class_level: 'XI',
        group: 'SCI',
        section_name: 'A',
        session: '2025-2026',
        in_charge_teacher: '',
        room_number: '',
        capacity: 60,
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Selected teacher collision detection
  const selectedTeacherId = formData.in_charge_teacher;
  const existingAssignments = selectedTeacherId
    ? teacherAssignedSectionMap.get(Number(selectedTeacherId)) || teacherAssignedSectionMap.get(selectedTeacherId) || []
    : [];
  const conflictingSections = existingAssignments.filter((s) => !initialData || s.id !== initialData.id);
  const hasCollision = conflictingSections.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-navy">
                {isEdit ? 'শাখার তথ্য সম্পাদনা (Edit Section)' : 'নতুন একাডেমিক শাখা তৈরি (Add Section)'}
              </h3>
              <p className="text-xs text-slate-400">
                শ্রেণি, বিভাগ, সেশন ও ইনচার্জ শিক্ষক নির্ধারণ করুন।
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                শ্রেণি (Class Level)
              </label>
              <select
                value={formData.class_level}
                onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              >
                <option value="XI">একাদশ শ্রেণি (1st Year - XI)</option>
                <option value="XII">দ্বাদশ শ্রেণি (2nd Year - XII)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                বিভাগ (Group)
              </label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              >
                <option value="SCI">বিজ্ঞান (Science)</option>
                <option value="HUM">মানবিক (Humanities)</option>
                <option value="BUS">ব্যবসায় শিক্ষা (Business Studies)</option>
                <option value="GEN">সাধারণ (General)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                শাখার নাম (Section Name)
              </label>
              <input
                type="text"
                placeholder="যেমন: A, B বা মেঘনা"
                value={formData.section_name}
                onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                শিক্ষাবর্ষ (Session)
              </label>
              <input
                type="text"
                placeholder="যেমন: 2025-2026"
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              শ্রেণি ইনচার্জ (Class In-Charge - ঐচ্ছিক)
            </label>
            <select
              value={formData.in_charge_teacher}
              onChange={(e) => setFormData({ ...formData, in_charge_teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              <option value="">-- কোনো শিক্ষক মনোনীত নয় --</option>
              {teachers.map((t) => {
                const assigned = teacherAssignedSectionMap.get(t.id) || [];
                const other = assigned.filter((s) => !initialData || s.id !== initialData.id);
                return (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                    {other.length > 0 ? ` ⚠️ [ইতিমধ্যে ${other[0].section_name} এর ইনচার্জ]` : ''}
                  </option>
                );
              })}
            </select>
            {hasCollision && (
              <p className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>সতর্কতা: এই শিক্ষক ইতিমধ্যেই অন্য শাখার ইনচার্জ হিসেবে নিযুক্ত আছেন।</span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="secActiveCheck"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-brand-orange rounded"
            />
            <label htmlFor="secActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
              Is active (শাখাটি বর্তমানে সক্রিয়)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:brightness-110 transition"
            >
              {submitting ? 'সংরক্ষণ হচ্ছে...' : isEdit ? 'আপডেট করুন' : 'শাখা তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SectionCreateEditModal;
