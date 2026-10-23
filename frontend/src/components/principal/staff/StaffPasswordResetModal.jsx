import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, X, Loader2, AlertCircle } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';
import { toast } from 'sonner';

const StaffPasswordResetModal = ({
  targetStaff,
  onClose,
  onConfirm,
  submitting = false,
}) => {
  const [newPassword, setNewPassword] = useState('');
  if (!targetStaff) return null;

  const handleAction = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    onConfirm(targetStaff, newPassword);
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
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-navy">পাসওয়ার্ড রিসেট</h3>
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
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 leading-relaxed text-[11px]">
              কর্মীর অ্যাকাউন্টের জন্য একটি নতুন সাময়িক পাসওয়ার্ড নির্ধারণ করুন। পরবর্তীতে তিনি লগইন করে পাসওয়ার্ড পরিবর্তন করতে পারবেন।
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              নতুন পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর) *
            </label>
            <input
              type="text"
              placeholder="যেমন: Staff#2026"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:border-brand-orange focus:outline-none"
              required
            />
          </div>

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
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-amber-600 text-white font-extrabold shadow-sm hover:bg-amber-500 transition disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>রিসেট হচ্ছে...</span>
                </>
              ) : (
                <span>পাসওয়ার্ড সেট করুন</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffPasswordResetModal;
