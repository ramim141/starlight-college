import React, { useState } from 'react';
import api from '../../api/client';
import { DollarSign, Send, X } from 'lucide-react';
import { toast } from 'sonner';

const TeacherSalaryClaimModal = ({ isOpen, onClose, onSuccess }) => {
  const now = new Date();
  const [formData, setFormData] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    claim_type: 'REGULAR',
    requested_amount: '28000.00',
    reason: 'চলতি মাসের নিয়মিত বেতন ছাড়করণ প্রসঙ্গে',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('finance/salary-claims/', formData);
      if (res.status === 201) {
        toast.success('বেতনের দাবি সফলভাবে অধ্যক্ষের অনুমোদনের জন্য পাঠানো হয়েছে');
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('দাবি প্রেরণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-brand-navy">বেতন রিকোয়েস্ট (Salary Claim)</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">মাস</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বছর</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">দাবির ধরন</label>
            <select
              value={formData.claim_type}
              onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold"
            >
              <option value="REGULAR">মাসিক নিয়মিত বেতন (Regular Monthly Salary)</option>
              <option value="ADVANCE">অগ্রিম বেতন দাবি (Salary Advance)</option>
              <option value="SPECIAL">বিশেষ সম্মানী বা বোনাস (Special Allowance)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">দাবিকৃত টাকার পরিমাণ (BDT)</label>
            <input
              type="number"
              step="0.01"
              value={formData.requested_amount}
              onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">আবেদনের কারণ বা বিবরণ</label>
            <textarea
              rows="2"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">
              {submitting ? 'পাঠানো হচ্ছে...' : 'দাবি প্রেরণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherSalaryClaimModal;