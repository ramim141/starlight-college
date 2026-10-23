import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Calendar, 
  FileText, 
  Paperclip, 
  AlertTriangle, 
  CheckCircle2, 
  UploadCloud, 
  X, 
  Info,
  Loader2,
  Send
} from 'lucide-react';
import { submitLeaveApplicationApi } from '../../../api/student';

// সংখ্যাকে বাংলায় রূপান্তর
export const toBanglaNumber = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

const LEAVE_TYPES = [
  { id: 'চিকিৎসাজনিত / মেডিকেল', label: 'চিকিৎসাজনিত / মেডিকেল', badge: 'অসুস্থতা বা ডাক্তারের পরামর্শ' },
  { id: 'জরুরি পারিবারিক প্রয়োজন', label: 'জরুরি পারিবারিক প্রয়োজন', badge: 'পারিবারিক জরুরি বিষয়' },
  { id: 'পারিবারিক অনুষ্ঠান', label: 'পারিবারিক/সামাজিক অনুষ্ঠান', badge: 'বিবাহ বা ধর্মীয় অনুষ্ঠান' },
  { id: 'অন্যান্য বিশেষ ছুটি', label: 'অন্যান্য বিশেষ ছুটি', badge: 'অন্যান্য উপযুক্ত কারণ' },
];

const LeaveApplicationForm = ({ onSuccess, existingLeaves = [], holidays = [] }) => {
  const queryClient = useQueryClient();

  // ফর্ম স্টেট
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0].id);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // তারিখের বৈধ সীমা (সর্বোচ্চ ৭ দিন আগে থেকে পরবর্তী ৬০ দিন)
  const today = new Date();
  const minStartDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  }, []);

  // কার্যদিবস ও ছুটির হিসেব
  const dateCalculation = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return { isValid: false, error: 'ছুটির শেষ তারিখ শুরুর তারিখের আগের হতে পারে না।' };

    const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    let holidayCount = 0;
    let fridayCount = 0;

    const cur = new Date(start);
    while (cur <= end) {
      const curStr = cur.toISOString().split('T')[0];
      const isFriday = cur.getDay() === 5;
      if (isFriday) fridayCount++;

      const isHoliday = holidays.some((h) => {
        if (!h.start_date || !h.end_date) return false;
        return curStr >= h.start_date && curStr <= h.end_date;
      });

      if (isHoliday && !isFriday) {
        holidayCount++;
      }

      cur.setDate(cur.getDate() + 1);
    }

    const nonWorkingDays = fridayCount + holidayCount;
    const effectiveAcademicDays = Math.max(0, totalDays - nonWorkingDays);

    return {
      isValid: true,
      totalDays,
      fridayCount,
      holidayCount,
      nonWorkingDays,
      effectiveAcademicDays,
    };
  }, [startDate, endDate, holidays]);

  // পূর্ববর্তী আবেদনের সাথে ওভারল্যাপ পরীক্ষা
  const overlappingLeave = useMemo(() => {
    if (!startDate || !endDate || !dateCalculation?.isValid) return null;
    return existingLeaves.find((item) => {
      // বাতিলকৃত আবেদন ওভারল্যাপ ধরা হবে না
      if (item.principal_status === 'REJECTED' || item.incharge_status === 'REJECTED') {
        return false;
      }
      return startDate <= item.end_date && endDate >= item.start_date;
    });
  }, [startDate, endDate, existingLeaves, dateCalculation]);

  // ফাইল হ্যান্ডলার
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('শুধুমাত্র PDF, JPG বা PNG ফাইল আপলোড করা যাবে।');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।');
      return;
    }
    setAttachment(file);
  };

  // ড্র্যাগ অ্যান্ড ড্রপ
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // সাবমিশন মিউটেশন
  const submitMutation = useMutation({
    mutationFn: submitLeaveApplicationApi,
    onSuccess: (data) => {
      toast.success('ছুটির আবেদন সফলভাবে দাখিল হয়েছে!');
      queryClient.invalidateQueries({ queryKey: ['student-leaves'] });
      // ফর্ম রিসেট
      setStartDate('');
      setEndDate('');
      setReason('');
      setAttachment(null);
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'আবেদন দাখিলে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('ছুটি শুরুর এবং শেষের তারিখ নির্বাচন করুন।');
      return;
    }
    if (dateCalculation && !dateCalculation.isValid) {
      toast.error(dateCalculation.error);
      return;
    }
    if (overlappingLeave) {
      toast.error('নির্বাচিত তারিখের মধ্যে পূর্বের আবেদন থাকায় আবেদন করা যাচ্ছে না।');
      return;
    }
    if (reason.trim().length < 10) {
      toast.error('ছুটির কারণ ন্যূনতম ১০ অক্ষরে বিস্তারিত লিখুন।');
      return;
    }

    const formData = new FormData();
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    // ব্যাকএন্ড স্কিমা অক্ষুণ্ণ রেখে ছুটির ধরন প্রিফিক্স করা হচ্ছে
    const formattedReason = `[ধরণ: ${leaveType}] ${reason.trim()}`;
    formData.append('reason', formattedReason);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    submitMutation.mutate(formData);
  };

  const isSubmitDisabled = 
    !startDate || 
    !endDate || 
    (dateCalculation && !dateCalculation.isValid) || 
    Boolean(overlappingLeave) || 
    reason.trim().length < 10 || 
    submitMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ১. ছুটির ধরণ নির্বাচন */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
          <FileText className="h-4 w-4 text-brand-orange" />
          <span>ছুটির ধরণ নির্বাচন করুন *</span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LEAVE_TYPES.map((type) => {
            const isSelected = leaveType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setLeaveType(type.id)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition min-h-[56px] ${
                  isSelected
                    ? 'border-brand-orange bg-brand-orange/5 text-brand-navy shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 w-full justify-between">
                  <span className="text-xs font-bold leading-tight">{type.label}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-brand-orange shrink-0" />}
                </div>
                <span className="text-[11px] text-slate-400 mt-1">{type.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ২. তারিখ নির্বাচন ও কার্যদিবস প্রিভিউ */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-4">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
          <Calendar className="h-4 w-4 text-brand-orange" />
          <span>ছুটির সময়সীমা ও তারিখ *</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">ছুটি শুরু *</span>
            <input
              type="date"
              value={startDate}
              min={minStartDateStr}
              max={maxDateStr}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!endDate || e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-bold text-brand-navy focus:border-brand-orange focus:bg-white focus:outline-none transition min-h-[48px]"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">ছুটি শেষ *</span>
            <input
              type="date"
              value={endDate}
              min={startDate || minStartDateStr}
              max={maxDateStr}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-bold text-brand-navy focus:border-brand-orange focus:bg-white focus:outline-none transition min-h-[48px]"
            />
          </div>
        </div>

        {/* তারিখ গণনা ও একাডেমিক ছুটির স্মার্ট প্রিভিউ */}
        {dateCalculation && (
          <div>
            {dateCalculation.isValid ? (
              <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 flex items-start space-x-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-amber-900">
                    মোট ছুটির ব্যাপ্তি: {toBanglaNumber(dateCalculation.totalDays)} দিন
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {dateCalculation.nonWorkingDays > 0 ? (
                      <>
                        এর মধ্যে {toBanglaNumber(dateCalculation.nonWorkingDays)} দিন সরকারি/সাপ্তাহিক ছুটি অন্তর্ভুক্ত।
                        কার্যকর একাডেমিক অনুপস্থিতি গণনা হবে <strong>{toBanglaNumber(dateCalculation.effectiveAcademicDays)} কার্যদিবস</strong>।
                      </>
                    ) : (
                      'এই মেয়াদে কোনো সরকারি বা সাপ্তাহিক ছুটি পড়েনি। মোট কার্যদিবস হিসাব করা হবে।'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-xs font-bold text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{dateCalculation.error}</span>
              </div>
            )}
          </div>
        )}

        {/* ওভারল্যাপ অ্যালার্ট গার্ড */}
        {overlappingLeave && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-rose-900">
              <span className="font-black">তারিখের বিরোধ (Overlap Detected)!</span>
              <p className="text-[11px] leading-relaxed text-rose-800">
                এই সময়সীমায় আপনার পূর্ববর্তী একটি আবেদন (আবেদন #{overlappingLeave.id}, {overlappingLeave.start_date} থেকে {overlappingLeave.end_date}) রয়েছে। একই সময়ে একাধিক আবেদন করা যাবে না।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ৩. ছুটির কারণ */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500">
            ছুটির সুনির্দিষ্ট কারণ ও বিবরণ *
          </label>
          <span className={`text-[11px] font-bold ${reason.trim().length >= 10 ? 'text-slate-400' : 'text-amber-600'}`}>
            {toBanglaNumber(reason.length)} / ৫০০ অক্ষর
          </span>
        </div>

        <textarea
          rows={4}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ছুটি নেওয়ার কারণ বিস্তারিত লিখুন (যেমন: ডাক্তার কর্তৃক ৩ দিন পূর্ণ বিশ্রামের পরামর্শ দেওয়া হয়েছে...)"
          required
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-brand-navy focus:border-brand-orange focus:bg-white focus:outline-none transition leading-relaxed"
        />
        {reason.trim().length > 0 && reason.trim().length < 10 && (
          <p className="text-[11px] text-amber-600 font-bold">
            ন্যূনতম ১০ অক্ষর লিখুন (আরো {toBanglaNumber(10 - reason.trim().length)} অক্ষর প্রয়োজন)।
          </p>
        )}
      </div>

      {/* ৪. প্রমাণক / সংযুক্তি (Optional) */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Paperclip className="h-4 w-4 text-brand-orange" />
            <span>প্রমাণক বা প্রেসক্রিপশন সংযুক্তি (ঐচ্ছিক)</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">PDF/JPG/PNG (সর্বোচ্চ 5MB)</span>
        </div>

        {attachment ? (
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-brand-navy truncate">{attachment.name}</p>
                <p className="text-[11px] text-slate-400">
                  {toBanglaNumber((attachment.size / (1024 * 1024)).toFixed(2))} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
              title="ফাইল মুছে ফেলুন"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition ${
              dragActive 
                ? 'border-brand-orange bg-brand-orange/5' 
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                ফাইল ড্রপ করুন অথবা <span className="text-brand-orange underline">ব্রাউজ করুন</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ডাক্তারের প্রেসক্রিপশন বা কোনো দরকারি প্রমাণ থাকলে এখানে যুক্ত করুন
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ৫. স্বয়ংক্রিয় হাজিরা তথ্য ও রিঅ্যাসুরেন্স */}
      <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80 flex items-start space-x-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 space-y-1">
          <span className="font-black text-emerald-900">হাজিরা বিষয়ক সুবিধা:</span>
          <p className="text-[11px] leading-relaxed text-emerald-800">
            ছুটি চূড়ান্ত অনুমোদিত হলে কলেজের কেন্দ্রীয় হাজিরা তালিকায় সংশ্লিষ্ট তারিখগুলোতে <strong>'ছুটি (LEAVE)'</strong> হিসেবে গণ্য হবে, ফলে অনুপস্থিতির কোনো জরিমানা হবে না এবং অ্যাডমিট কার্ডে কোনো বাধা আসবে না।
          </p>
        </div>
      </div>

      {/* ৬. সাবমিট বাটন */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={`w-full py-3.5 px-6 rounded-2xl text-xs font-black shadow-lg flex items-center justify-center space-x-2 transition min-h-[48px] ${
          isSubmitDisabled
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-brand-navy hover:bg-brand-navy-light text-white shadow-brand-navy/20 active:scale-[0.99]'
        }`}
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>দাখিল হচ্ছে...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>আবেদন দাখিল করুন</span>
          </>
        )}
      </button>
    </form>
  );
};

export default LeaveApplicationForm;
