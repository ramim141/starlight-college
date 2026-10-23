import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Power, AlertTriangle, X, Loader2 } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';

const StaffDeactivateModal = ({
  targetStaff,
  onClose,
  onConfirm,
  submitting = false,
}) => {
  const [reason, setReason] = useState('');
  if (!targetStaff) return null;

  const isInactive = targetStaff.is_active === false;

  const handleAction = (e) => {
    e.preventDefault();
    onConfirm(targetStaff, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <motion.div
        variants={modalDialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2.5 rounded-2xl ${
                isInactive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isInactive ? <Power className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-navy">
                {isInactive ? 'অ্যাকাউন্ট সক্রিয়করণ' : 'অ্যাকাউন্ট নিষ্ক্রিয়করণ'}
              </h3>
              <p className="text-xs text-slate-400">
                {targetStaff.full_name || targetStaff.username} ({targetStaff.role_display || targetStaff.role})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAction} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            {isInactive
              ? 'আপনি কি এই কর্মী অ্যাকাউন্টটি পুনরায় সক্রিয় করতে চান? সক্রিয় করার পর কর্মী আবার পোর্টালে লগইন করতে পারবেন।'
              : 'আপনি কি নিশ্চিতভাবে এই কর্মীর অ্যাকাউন্টটি নিষ্ক্রিয় করতে চান? নিষ্ক্রিয় অবস্থায় তিনি পোর্টালে লগইন করতে পারবেন না।'}
          </p>

          {!isInactive && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নিষ্ক্রিয়করণের কারণ (ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                placeholder="যেমন: সাময়িক ছুটি বা পদত্যাগ"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-orange focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-white font-extrabold shadow-sm transition disabled:opacity-50 min-h-[44px] cursor-pointer ${
                isInactive ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <span>{isInactive ? 'হ্যাঁ, সক্রিয় করুন' : 'হ্যাঁ, নিষ্ক্রিয় করুন'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffDeactivateModal;
