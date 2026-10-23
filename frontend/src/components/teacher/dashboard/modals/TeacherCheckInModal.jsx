import React from 'react';
import { X } from 'lucide-react';

const TeacherCheckInModal = ({
  isOpen,
  onClose,
  currentTime,
  checkInRemarks,
  setCheckInRemarks,
  onCheckIn,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-brand-navy">আজকের ডিজিটাল চেক-ইন</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-600">
            বর্তমান সময়: <strong className="font-mono text-brand-navy">{currentTime.toLocaleTimeString('bn-BD')}</strong>
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="যেমন: অন-টাইম উপস্থিতি"
              value={checkInRemarks}
              onChange={(e) => setCheckInRemarks(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              onClick={onCheckIn}
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-500 shadow-md cursor-pointer"
            >
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'চেক-ইন নিশ্চিত করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCheckInModal;
