import React from 'react';
import { X } from 'lucide-react';

const TeacherLeaveModal = ({
  isOpen,
  onClose,
  leaveForm,
  setLeaveForm,
  colleagueTeachers = [],
  onApplyLeave,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-brand-navy">শিক্ষক ছুটির আবেদন ফর্ম</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onApplyLeave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ছুটির ধরন *</label>
            <select
              value={leaveForm.leave_type}
              onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            >
              <option value="CASUAL">নৈমিত্তিক ছুটি (Casual Leave)</option>
              <option value="MEDICAL">চিকিৎসাজনিত ছুটি (Medical Leave)</option>
              <option value="DUTY">দাপ্তরিক দায়িত্বজনিত ছুটি (Duty Leave)</option>
              <option value="MATERNITY">মাতৃত্বকালীন ছুটি (Maternity Leave)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">শুরুর তারিখ *</label>
              <input
                type="date"
                required
                value={leaveForm.start_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">শেষ তারিখ *</label>
              <input
                type="date"
                required
                value={leaveForm.end_date}
                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">প্রক্সি শিক্ষক নির্ধারণ (ঐচ্ছিক)</label>
            <select
              value={leaveForm.proxy_teacher}
              onChange={(e) => setLeaveForm({ ...leaveForm, proxy_teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            >
              <option value="">সহকর্মী শিক্ষক নির্বাচন করুন</option>
              {colleagueTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">ছুটি চলাকালে আপনার ক্লাসগুলো যে শিক্ষক পরিচালনা করবেন।</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ছুটির কারণ ও বিস্তারিত *</label>
            <textarea
              rows="3"
              required
              placeholder="ছুটির যৌক্তিক কারণ উল্লেখ করুন..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-black text-white hover:bg-purple-500 shadow-md cursor-pointer"
            >
              {submitting ? 'পাঠানো হচ্ছে...' : 'আবেদন জমা দিন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLeaveModal;
