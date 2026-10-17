import React, { useState } from 'react';
import api from '../../api/client';
import { Send, X, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const CashHandoverModal = ({ isOpen, onClose, totalCollectedToday, onSuccess }) => {
  const [amount, setAmount] = useState(totalCollectedToday?.toString() || '');
  const [notes, setNotes] = useState('আজকের আদায়কৃত নগদ টাকা বুঝিয়ে দেওয়া হলো');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('finance/cash-handovers/', {
        amount: amount,
        notes: notes,
      });
      if (res.status === 201) {
        toast.success(`৳${amount} টাকা অ্যাকাউন্ট্যান্টের নিকট হস্তান্তরের আবেদন পাঠানো হয়েছে। অ্যাকাউন্ট্যান্ট রিসিভ করলে এটি সম্পন্ন হবে।`);
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('ক্যাশ হ্যান্ডওভার রিকোয়েস্ট ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-brand-navy">ক্যাশ হস্তান্তর (Cash Handover to Accounts)</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">হস্তান্তরযোগ্য নগদ টাকার পরিমাণ (BDT)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-base font-black text-emerald-600 focus:border-brand-orange focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">মন্তব্য বা নোট</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'পাঠানো হচ্ছে...' : 'হস্তান্তর রিকোয়েস্ট পাঠান'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashHandoverModal;