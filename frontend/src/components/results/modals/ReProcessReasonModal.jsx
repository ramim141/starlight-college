import React, { useState } from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';

const ReProcessReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  examName = '',
  isProcessing = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('পুনঃপ্রসেসের কারণ কমপক্ষে ৫ অক্ষরে বিস্তারিত লিখুন।');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                ফলাফল পুনঃপ্রসেস (Re-process)
              </h3>
              <p className="text-xs text-slate-500">
                {examName} এর ফলাফল পুনরায় গণনা ও মেধা স্থান নির্ধারণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border rounded-2xl bg-amber-50/70 border-amber-200/60 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            পুনঃপ্রসেস সম্পন্ন হলে সকল শিক্ষার্থীর গ্রেড ও মেধা তালিকা নতুন করে আপডেট হবে। অনুগ্রহ করে এর কারণ লিপিবদ্ধ করুন।
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              পুনঃপ্রসেসের কারণ / রেফারেন্স নোট *
            </label>
            <textarea
              rows={3}
              required
              placeholder="যেমন: খাতা পুনঃনিরীক্ষণের নম্বর সংযোজন বা টিউটোরিয়াল সংশোধন..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="w-full p-3 text-xs border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            {error && <p className="mt-1 text-xs font-bold text-rose-500">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {isProcessing ? 'প্রসেসিং...' : 'পুনঃপ্রসেস নিশ্চিত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReProcessReasonModal;
