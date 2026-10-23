import React from 'react';
import { X } from 'lucide-react';

const TeacherClaimModal = ({
  isOpen,
  onClose,
  claimForm,
  setClaimForm,
  onSubmitClaim,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-brand-navy">ভাতা ও ভাউচার ক্লেইম আবেদন</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmitClaim} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ভাতার ধরন *</label>
            <select
              value={claimForm.claim_type}
              onChange={(e) => setClaimForm({ ...claimForm, claim_type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            >
              <option value="EXAM_EVALUATION">পরীক্ষার খাতা মূল্যায়ন ভাতা</option>
              <option value="INVIGILATION">পরীক্ষার হল গার্ড অনারিয়াম</option>
              <option value="CONVEYANCE">যাতায়াত ও ভ্রমণ ভাতা (Conveyance)</option>
              <option value="CLASSROOM_SUPPLY">ক্লাসরুম বা ল্যাব জরুরি ব্যয়</option>
              <option value="OTHER">অন্যান্য প্রাতিষ্ঠানিক ভাতা</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">দাবিকৃত টাকার পরিমাণ (BDT) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="যেমন: ১৫০০.০০"
              value={claimForm.amount}
              onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ ও রেফারেন্স *</label>
            <textarea
              rows="3"
              required
              placeholder="পরীক্ষার নাম, খাতার সংখ্যা বা ভাউচার বিস্তারিত..."
              value={claimForm.description}
              onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
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
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-500 shadow-md cursor-pointer"
            >
              {submitting ? 'জমা হচ্ছে...' : 'ক্লেইম ভাউচার পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherClaimModal;
