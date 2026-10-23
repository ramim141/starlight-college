import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Camera, Phone, Mail, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfileApi } from '../../../api/auth';

const EditContactModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setPhotoFile(null);
      setPhotoPreview(user.profile_photo || null);
      setErrors({});
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ৫ মেগাবাইট সাইজ লিমিট চেক
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('শুধুমাত্র JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করা যাবে।');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const newErrors = {};

    if (phone && !/^01[3-9]\d{8}$/.test(phone.trim())) {
      newErrors.phone = 'সঠিক ১১ সংখ্যার মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'সঠিক ইমেইল ঠিকানা প্রদান করুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let res;
      if (photoFile) {
        const formData = new FormData();
        formData.append('phone', phone.trim());
        formData.append('email', email.trim());
        formData.append('profile_photo', photoFile);
        res = await updateProfileApi(formData);
      } else {
        res = await updateProfileApi({
          phone: phone.trim(),
          email: email.trim(),
        });
      }

      toast.success(res.message || 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে।');
      if (onProfileUpdated) {
        await onProfileUpdated();
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'তথ্য আপডেট করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* ড্রয়ার হ্যান্ডেল (মোবাইলের জন্য) */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

        {/* হেডার */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-brand-navy">যোগাযোগের তথ্য ও ছবি পরিবর্তন</h3>
            <p className="text-xs text-slate-400">আপনার মোবাইল নম্বর, ইমেইল ও প্রোফাইল ছবি হালনাগাদ করুন</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ফর্ম বডি */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* প্রোফাইল ফটো প্রিভিউ ও আপলোড */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                  ছবি নেই
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-brand-navy mb-1">
                প্রোফাইল ছবি পরিবর্তন
              </label>
              <label className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer min-h-[44px]">
                <Upload className="h-3.5 w-3.5 text-brand-orange" />
                <span>নতুন ছবি বাছুন</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <span className="block text-[10px] text-slate-400 mt-1">সর্বোচ্চ ৫ মেগাবাইট (JPG, PNG)</span>
            </div>
          </div>

          {/* মোবাইল নম্বর */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              শিক্ষার্থীর মোবাইল নম্বর
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={`w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-bold text-brand-navy border min-h-[44px] transition ${
                  errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-navy focus:bg-white'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.phone}
              </p>
            )}
          </div>

          {/* ইমেইল ঠিকানা */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ইমেইল ঠিকানা (ঐচ্ছিক)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="example@student.com"
                className={`w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 text-sm font-bold text-brand-navy border min-h-[44px] transition ${
                  errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-brand-navy focus:bg-white'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.email}
              </p>
            )}
          </div>

          {/* ফুটার বাটন */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer min-h-[44px]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>তথ্য আপডেট করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactModal;
