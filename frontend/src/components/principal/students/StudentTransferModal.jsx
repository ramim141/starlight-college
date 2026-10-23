import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, X, Loader2 } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';
import { toast } from 'sonner';

const StudentTransferModal = ({
  student,
  sections = [],
  onClose,
  onConfirm,
  submitting = false,
}) => {
  const [targetSectionId, setTargetSectionId] = useState('');
  if (!student) return null;

  const handleAction = (e) => {
    e.preventDefault();
    if (!targetSectionId) {
      toast.error('অনুগ্রহ করে গন্তব্য শাখা নির্বাচন করুন');
      return;
    }
    if (String(targetSectionId) === String(student.section)) {
      toast.error('শিক্ষার্থী ইতিমধ্যে এই শাখাতেই রয়েছে');
      return;
    }
    onConfirm(student.id, targetSectionId);
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
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-navy">শাখা স্থানান্তর (Transfer)</h3>
              <p className="text-xs text-slate-400">
                {student.full_name || student.student_unique_id}
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
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block">বর্তমান শাখা:</span>
            <p className="font-bold text-slate-800">
              {student.class_level_display || student.class_level} ({student.section_name_display || 'A'}) · সেশন: {student.session}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">রোল: {student.roll_number}</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              স্থানান্তরের নতুন শাখা নির্বাচন করুন *
            </label>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:border-brand-orange focus:outline-none cursor-pointer"
              required
            >
              <option value="">শাখা বেছে নিন...</option>
              {sections
                .filter((s) => String(s.id) !== String(student.section))
                .map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class_level_display || sec.class_level} - {sec.section_name} ({sec.group_display || sec.group}) [{sec.session}]
                  </option>
                ))}
            </select>
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
              disabled={submitting || !targetSectionId}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>স্থানান্তর হচ্ছে...</span>
                </>
              ) : (
                <span>স্থানান্তর নিশ্চিত করুন</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudentTransferModal;
