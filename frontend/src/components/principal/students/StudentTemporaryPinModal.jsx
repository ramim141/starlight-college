import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, X, Copy, Check, ShieldAlert } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';
import { toast } from 'sonner';

const StudentTemporaryPinModal = ({ student, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!student) return null;

  const pin = student.temporary_pin || '******';

  const handleCopy = () => {
    if (student.temporary_pin) {
      navigator.clipboard.writeText(student.temporary_pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('PIN সফলভাবে কপি করা হয়েছে');
    } else {
      toast.info('এই শিক্ষার্থীর জন্য সংরক্ষিত কোনো সাময়িক পিন নেই।');
    }
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
        className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-brand-navy">স্টুডেন্ট লগইন পিন</h3>
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

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 leading-relaxed text-[11px]">
              নিরাপত্তার স্বার্থে এই পিন কোথাও স্থায়ীভাবে সংরক্ষণ করা হয় না। অভিভাবক বা শিক্ষার্থীকে জানাতে কপি করে নিন।
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ৬-ডিজিট সাময়িক PIN
            </span>
            <div className="text-3xl font-black font-mono tracking-widest text-brand-orange py-1">
              {pin}
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              ইউজারনেম: {student.student_unique_id || student.username}
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!student.temporary_pin}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-brand-navy text-white font-bold hover:bg-slate-800 transition min-h-[44px] cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'PIN কপি করুন'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 min-h-[44px] cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentTemporaryPinModal;
