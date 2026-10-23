import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { changePasswordApi } from '../../../api/auth';
import { getErrorMessage, getFieldErrors, getRetryAfterSeconds } from '../../../api/errors';

const ChangePasswordSection = ({ onPasswordChanged }) => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // 429 Rate Limit Cooldown Countdown Timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // পাসওয়ার্ডের শক্তি নিরূপণ (Strength Meter)
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: 'দুর্বল পাসওয়ার্ড', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, text: 'মাঝারি পাসওয়ার্ড', color: 'bg-amber-500' };
    return { score: 3, text: 'শক্তিশালী পাসওয়ার্ড', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(formData.new_password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.old_password.trim()) {
      errors.old_password = 'বর্তমান পাসওয়ার্ড প্রদান করা আবশ্যক।';
    }

    if (!formData.new_password.trim()) {
      errors.new_password = 'নতুন পাসওয়ার্ড প্রদান করা আবশ্যক।';
    } else if (formData.new_password.length < 6) {
      errors.new_password = 'নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।';
    }

    if (!formData.confirm_password.trim()) {
      errors.confirm_password = 'নতুন পাসওয়ার্ডটি পুনরায় নিশ্চিত করুন।';
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cooldownSeconds > 0) {
      toast.error(`দয়া করে আরও ${cooldownSeconds} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    setGeneralError('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const payload = {
        old_password: formData.old_password,
        new_password: formData.new_password,
      };

      const res = await changePasswordApi(payload);
      toast.success(res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।');

      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });

      if (onPasswordChanged) {
        onPasswordChanged();
      }
    } catch (err) {
      const retryAfter = getRetryAfterSeconds(err);
      if (retryAfter) {
        setCooldownSeconds(retryAfter);
      }

      const extractedFieldErrors = getFieldErrors(err);
      if (Object.keys(extractedFieldErrors).length > 0) {
        setFieldErrors(extractedFieldErrors);
      } else {
        const message = getErrorMessage(err, 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। বর্তমান পাসওয়ার্ডটি পুনরায় পরীক্ষা করুন।');
        setGeneralError(message);
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm space-y-6">
      {/* হেডার */}
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-brand-navy">পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা</h3>
          <p className="text-xs text-slate-400">নিয়মিত পাসওয়ার্ড পরিবর্তন করে অ্যাকাউন্ট সুরক্ষিত রাখুন</p>
        </div>
      </div>

      {generalError && (
        <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* বর্তমান পাসওয়ার্ড */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            বর্তমান পাসওয়ার্ড / অস্থায়ী পিন <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? 'text' : 'password'}
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="বর্তমান পাসওয়ার্ড লিখুন"
              className={`w-full rounded-xl bg-slate-50 px-4 py-2.5 pr-11 text-sm font-bold text-brand-navy border min-h-[44px] transition ${
                fieldErrors.old_password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-navy focus:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="পাসওয়ার্ড দেখুন"
            >
              {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.old_password && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.old_password}</p>
          )}
        </div>

        {/* নতুন পাসওয়ার্ড */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            নতুন পাসওয়ার্ড <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
              className={`w-full rounded-xl bg-slate-50 px-4 py-2.5 pr-11 text-sm font-bold text-brand-navy border min-h-[44px] transition ${
                fieldErrors.new_password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-navy focus:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="পাসওয়ার্ড দেখুন"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* স্ট্রেংথ মিটার */}
          {formData.new_password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strength.score / 3) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>পাসওয়ার্ড শক্তি: {strength.text}</span>
                <span className="text-[10px] text-slate-400 font-normal">সংখ্যা ও চিহ্ন ব্যবহার করুন</span>
              </div>
            </div>
          )}

          {fieldErrors.new_password && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.new_password}</p>
          )}
        </div>

        {/* নিশ্চিতকরণ পাসওয়ার্ড */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            নতুন পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
              className={`w-full rounded-xl bg-slate-50 px-4 py-2.5 pr-11 text-sm font-bold text-brand-navy border min-h-[44px] transition ${
                fieldErrors.confirm_password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-navy focus:bg-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="পাসওয়ার্ড দেখুন"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.confirm_password && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{fieldErrors.confirm_password}</p>
          )}
        </div>

        {/* সাবমিট বাটন */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || cooldownSeconds > 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 shadow-sm transition min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>পরিবর্তন হচ্ছে...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <span>অপেক্ষা করুন ({cooldownSeconds} সে.)</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordSection;
