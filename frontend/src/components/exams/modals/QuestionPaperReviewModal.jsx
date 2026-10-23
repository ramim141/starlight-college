import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X, FileText, ExternalLink, Key, Eye, EyeOff } from 'lucide-react';

const QuestionPaperReviewModal = ({
  isOpen,
  onClose,
  paper = null,
  actionType = 'APPROVE', // 'APPROVE' | 'REQUEST_CHANGES'
  onConfirm,
  isSubmitting = false,
}) => {
  const [feedback, setFeedback] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const isApprove = actionType === 'APPROVE';

  useEffect(() => {
    setFeedback('');
    setShowPassword(false);
    setValidationError('');
  }, [paper, actionType, isOpen]);

  if (!isOpen || !paper) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApprove && (!feedback || feedback.trim().length < 5)) {
      setValidationError('সংশোধনের কারণ বা নির্দেশনা কমপক্ষে ৫ অক্ষরে বিস্তারিত লিখুন।');
      return;
    }

    onConfirm({
      id: paper.id,
      status: isApprove ? 'ACCEPTED' : 'REVISION',
      feedback: feedback.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isApprove ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {isApprove ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isApprove ? 'প্রশ্নপত্র চূড়ান্ত অনুমোদন' : 'প্রশ্নপত্র সংশোধন অনুরোধ'}
              </h3>
              <p className="text-xs text-slate-500">
                {isApprove
                  ? 'প্রশ্নপত্রটি পরীক্ষা নেওয়ার জন্য চূড়ান্তভাবে গৃহীত হবে'
                  : 'শিক্ষকের কাছে সংশোধনের নির্দেশনা পাঠানো হবে'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* প্রশ্নপত্রের সারসংক্ষেপ কার্ড */}
        <div className="p-3.5 border rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">পাঠ্য বিষয়:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {paper.subject_name || 'বিষয়'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">জমা দেওয়া শিক্ষক:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {paper.teacher_name || 'শিক্ষক'}
            </span>
          </div>

          {paper.file_password_hint && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1 text-slate-500">
                <Key className="w-3.5 h-3.5 text-amber-500" /> পাসওয়ার্ড হিন্ট:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-brand-orange">
                  {showPassword ? paper.file_password_hint : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {paper.question_file && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-500">সংযুক্ত ফাইল:</span>
              <a
                href={paper.question_file}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" /> ফাইল দেখুন / ডাউনলোড <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              {isApprove ? 'অধ্যক্ষের মন্তব্য (ঐচ্ছিক)' : 'সংশোধনের বিবরণ / নির্দেশনা *'}
            </label>
            <textarea
              rows={3}
              required={!isApprove}
              placeholder={
                isApprove
                  ? 'প্রয়োজনে মন্তব্য লিখুন (যেমন: মানসম্মত প্রশ্নপত্র)'
                  : 'কোন কোন প্রশ্নে ভুল রয়েছে বা কী পরিবর্তন করা প্রয়োজন তা বিস্তারিত লিখুন...'
              }
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (validationError) setValidationError('');
              }}
              className="w-full p-3 text-xs border rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            {validationError && (
              <p className="mt-1 text-xs font-bold text-rose-500">{validationError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md disabled:opacity-50 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {isSubmitting
                ? 'সংরক্ষণ হচ্ছে...'
                : isApprove
                ? 'অনুমোদন নিশ্চিত করুন'
                : 'সংশোধনের নির্দেশ পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionPaperReviewModal;
