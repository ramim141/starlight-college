import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Sparkles, Loader2, Upload, AlertCircle } from 'lucide-react';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';
import { createStaffApi } from '../../../api/principal';
import { getFieldErrors } from '../../../api/errors';
import { toast } from 'sonner';

const EMPTY_FORM = {
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  role: 'TEACHER',
  is_library_manager: false,
  employee_id: '',
  designation: 'প্রভাষক',
  department: 'বিজ্ঞান',
  qualification: '',
  joining_date: '',
  base_salary: '',
  bio: '',
};

const StaffCreateEditModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData((prev) => ({ ...prev, phone: val }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateClient = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'ইউজারনেম দেওয়া আবশ্যক';
    if (!formData.password || formData.password.length < 6) errs.password = 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে';
    if (!formData.first_name.trim()) errs.first_name = 'নামের প্রথম অংশ দেওয়া আবশ্যক';
    
    // বাংলাদেশি মোবাইল নম্বর ভ্যালিডেশন
    if (!formData.phone) {
      errs.phone = 'ফোন নম্বর দেওয়া আবশ্যক';
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone)) {
      errs.phone = 'সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)';
    }

    if (formData.role === 'TEACHER') {
      if (!formData.employee_id.trim()) errs.employee_id = 'Employee ID দেওয়া আবশ্যক';
      if (!formData.designation.trim()) errs.designation = 'পদবি দেওয়া আবশ্যক';
      if (!formData.department.trim()) errs.department = 'বিভাগ দেওয়া আবশ্যক';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      toast.error('অনুগ্রহ করে ফর্মের ভুলগুলো সংশোধন করুন');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        base_salary: formData.base_salary ? parseFloat(formData.base_salary) : 0.0,
      };

      // যদি ফটো ফাইল থাকে তবে FormData তৈরি হবে
      let apiPayload = payload;
      if (photoFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
        fd.append('profile_photo', photoFile);
        apiPayload = fd;
      }

      await createStaffApi(apiPayload);
      toast.success('নতুন স্টাফ অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে!');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      const drfErrors = getFieldErrors(err);
      if (Object.keys(drfErrors).length > 0) {
        setFieldErrors(drfErrors);
      }
      toast.error(err.response?.data?.message || 'স্টাফ তৈরি ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* মোডাল হেডার */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#0A2147] to-[#0F2C59] p-5 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-brand-orange text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">নতুন স্টাফ ও শিক্ষক নিয়োগ</h3>
              <p className="text-xs text-slate-300">শিক্ষক বা হিসাবরক্ষক অ্যাকাউন্ট তৈরি ও রোল নির্ধারণ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ফর্ম বডি */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          
          {/* রোল সিলেকশন */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
              পদ বা ভূমিকা (Role) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'TEACHER' })}
                className={`p-3 rounded-2xl border font-bold text-center transition cursor-pointer ${
                  formData.role === 'TEACHER'
                    ? 'border-brand-navy bg-[#0F2C59] text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                শিক্ষক (Teacher)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ACCOUNTANT' })}
                className={`p-3 rounded-2xl border font-bold text-center transition cursor-pointer ${
                  formData.role === 'ACCOUNTANT'
                    ? 'border-brand-navy bg-[#0F2C59] text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                হিসাবরক্ষক (Accountant)
              </button>
            </div>
          </div>

          {/* ইউজারনেম ও পাসওয়ার্ড */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                ইউজারনেম (Username) *
              </label>
              <input
                type="text"
                placeholder="যেমন: arif.rahman"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-xs focus:bg-white focus:outline-none ${
                  fieldErrors.username ? 'border-rose-500' : 'border-slate-200 focus:border-brand-orange'
                }`}
                required
              />
              {fieldErrors.username && (
                <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
              </label>
              <input
                type="password"
                placeholder="গোপন পাসওয়ার্ড দিন"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-xs focus:bg-white focus:outline-none ${
                  fieldErrors.password ? 'border-rose-500' : 'border-slate-200 focus:border-brand-orange'
                }`}
                required
              />
              {fieldErrors.password && (
                <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          {/* নাম */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নামের প্রথম অংশ (First Name) *
              </label>
              <input
                type="text"
                placeholder="যেমন: আরিফুর"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-xs focus:bg-white focus:outline-none ${
                  fieldErrors.first_name ? 'border-rose-500' : 'border-slate-200 focus:border-brand-orange'
                }`}
                required
              />
              {fieldErrors.first_name && (
                <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fieldErrors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                নামের শেষ অংশ (Last Name)
              </label>
              <input
                type="text"
                placeholder="যেমন: রহমান"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>

          {/* ফোন ও ইমেইল */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                মোবাইল নম্বর (১১ ডিজিট) *
              </label>
              <input
                type="text"
                placeholder="01712345678"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono text-xs focus:bg-white focus:outline-none ${
                  fieldErrors.phone ? 'border-rose-500' : 'border-slate-200 focus:border-brand-orange'
                }`}
                required
              />
              {fieldErrors.phone && (
                <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                ইমেইল ঠিকানা (ঐচ্ছিক)
              </label>
              <input
                type="email"
                placeholder="arif@starlight.edu.bd"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>

          {/* লাইব্রেরি ম্যানেজার চেকবক্স */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3">
            <input
              type="checkbox"
              id="library_manager"
              checked={formData.is_library_manager}
              onChange={(e) => setFormData({ ...formData, is_library_manager: e.target.checked })}
              className="w-4 h-4 text-brand-orange rounded border-slate-300 focus:ring-brand-orange cursor-pointer"
            />
            <label htmlFor="library_manager" className="text-xs font-bold text-slate-700 cursor-pointer">
              এই কর্মী কেন্দ্রীয় লাইব্রেরি পরিচালনার দায়িত্বে থাকবেন (Library Manager Access)
            </label>
          </div>

          {/* শিক্ষক সম্পর্কিত অতিরিক্ত ফিল্ডস (যদি TEACHER নির্বাচিত থাকে) */}
          {formData.role === 'TEACHER' && (
            <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-900">
                শিক্ষক প্রোফাইল ও বেতন তথ্য
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: T-2026-01"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className={`w-full p-2 bg-white border rounded-xl font-mono text-xs focus:outline-none ${
                      fieldErrors.employee_id ? 'border-rose-500' : 'border-slate-200 focus:border-brand-orange'
                    }`}
                  />
                  {fieldErrors.employee_id && (
                    <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fieldErrors.employee_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    পদবি (Designation) *
                  </label>
                  <input
                    type="text"
                    placeholder="প্রভাষক / সহ-অধ্যাপক"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-brand-orange focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    বিভাগ (Department) *
                  </label>
                  <input
                    type="text"
                    placeholder="পদার্থবিজ্ঞান / বাংলা"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-brand-orange focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    মূল মাসিক বেতন (Base Salary ৳)
                  </label>
                  <input
                    type="number"
                    placeholder="যেমন: 35000"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    শিক্ষাগত যোগ্যতা (Degree)
                  </label>
                  <input
                    type="text"
                    placeholder="M.Sc. in Physics, SUST"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* প্রোফাইল ফটো আপলোড */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              প্রোফাইল ছবি (সর্বোচ্চ ৫ মেগাবাইট PNG, JPG, WebP)
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer min-h-[42px]">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>ছবি নির্বাচন করুন</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
              )}
            </div>
          </div>

          {/* মোডাল ফুটার */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition min-h-[44px] cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-orange text-xs font-extrabold text-white shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 transition disabled:opacity-50 min-h-[44px] cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>অ্যাকাউন্ট তৈরি নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffCreateEditModal;
