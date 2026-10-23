import React, { useState, useEffect } from 'react';
import { changePasswordApi } from '../../api/auth';
import { getErrorMessage, getFieldErrors, getRetryAfterSeconds } from '../../api/errors';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

const ChangePassword = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error on field typing
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

      // Reset form on success, keep session active
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      const retryAfter = getRetryAfterSeconds(err);
      if (retryAfter) {
        setCooldownSeconds(retryAfter);
      }

      const extractedFieldErrors = getFieldErrors(err);
      if (Object.keys(extractedFieldErrors).length > 0) {
        setFieldErrors(extractedFieldErrors);
      } else {
        const message = getErrorMessage(err, 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
        setGeneralError(message);
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Banner Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-soft relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange shrink-0">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
              পাসওয়ার্ড পরিবর্তন
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              আপনার অ্যাকাউন্টের নিরাপত্তা সুনিশ্চিত করতে নিয়মিত শক্তিশালী ও নির্ভরযোগ্য পাসওয়ার্ড ব্যবহার করুন।
            </p>
          </div>
        </div>

        {/* Security Recommendation Pill */}
        <div className="mt-6 flex items-center space-x-2 rounded-2xl bg-emerald-50 border border-emerald-200/70 p-3.5 text-xs text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>পাসওয়ার্ডে বর্ণ, সংখ্যা ও প্রতীকের সংমিশ্রণ রাখুন এবং অন্য কোথাও ব্যবহৃত পাসওয়ার্ড পরিহার করুন।</span>
        </div>
      </div>

      {/* Main Password Change Form Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-soft">
        {generalError && (
          <div className="mb-6 flex items-center space-x-3 rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-xs font-bold text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ১. বর্তমান পাসওয়ার্ড */}
          <div>
            <label
              htmlFor="old_password"
              className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2"
            >
              বর্তমান পাসওয়ার্ড <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="old_password"
                name="old_password"
                type={showOldPassword ? 'text' : 'password'}
                value={formData.old_password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="আপনার বর্তমান অ্যাকাউন্টের পাসওয়ার্ড লিখুন"
                className={`w-full rounded-2xl border bg-slate-50/70 py-3.5 pl-4 pr-11 text-sm font-bold text-slate-900 transition placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
                  fieldErrors.old_password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200/90 focus:border-brand-orange focus:ring-brand-orange/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                aria-label={showOldPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.old_password && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {fieldErrors.old_password}
              </p>
            )}
          </div>

          {/* ২. নতুন পাসওয়ার্ড */}
          <div>
            <label
              htmlFor="new_password"
              className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2"
            >
              নতুন পাসওয়ার্ড <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="new_password"
                name="new_password"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.new_password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                className={`w-full rounded-2xl border bg-slate-50/70 py-3.5 pl-4 pr-11 text-sm font-bold text-slate-900 transition placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
                  fieldErrors.new_password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200/90 focus:border-brand-orange focus:ring-brand-orange/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.new_password ? (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {fieldErrors.new_password}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-400 font-medium">
                নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।
              </p>
            )}
          </div>

          {/* ৩. নতুন পাসওয়ার্ড নিশ্চিতকরণ */}
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2"
            >
              নতুন পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="নতুন পাসওয়ার্ডটি পুনরায় টাইপ করুন"
                className={`w-full rounded-2xl border bg-slate-50/70 py-3.5 pl-4 pr-11 text-sm font-bold text-slate-900 transition placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:bg-white focus:outline-none focus:ring-4 ${
                  fieldErrors.confirm_password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200/90 focus:border-brand-orange focus:ring-brand-orange/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirm_password && (
              <p className="mt-1.5 text-xs font-semibold text-rose-600">
                {fieldErrors.confirm_password}
              </p>
            )}
          </div>

          {/* সাবমিট অ্যাকশন বাটন */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || cooldownSeconds > 0}
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-[#EA580C] to-amber-600 hover:from-[#D9460F] hover:to-amber-700 py-3.5 px-8 text-sm font-black text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer group"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2.5">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>সংরক্ষণ করা হচ্ছে...</span>
                </div>
              ) : cooldownSeconds > 0 ? (
                <span>অপেক্ষা করুন ({cooldownSeconds}s)</span>
              ) : (
                <>
                  <span>পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
