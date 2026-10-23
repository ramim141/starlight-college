import React, { useState } from 'react';
import { Camera, Copy, Check, ShieldCheck, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export const toBanglaNumber = (num) => {
  if (num === null || num === undefined) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => banglaDigits[Number(d)]);
};

const ProfileHeaderCard = ({ user, onOpenEditModal }) => {
  const [copied, setCopied] = useState(false);
  const student = user?.student_profile;
  const section = student?.section_details;

  const handleCopyId = () => {
    if (!student?.student_unique_id) return;
    navigator.clipboard.writeText(student.student_unique_id);
    setCopied(true);
    toast.success('স্টুডেন্ট আইডি ক্লিপবোর্ডে কপি করা হয়েছে।');
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-6 sm:p-8 shadow-sm">
      {/* ব্যাকগ্রাউন্ড ডেকোরেটিভ গ্রেডিয়েন্ট অ্যাকসেন্ট */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-gradient-to-br from-brand-orange/10 via-amber-500/5 to-transparent blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* প্রোফাইল ছবি ও এডিট অ্যাকশন */}
        <div className="relative shrink-0">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden bg-slate-100 ring-4 ring-brand-navy/5 shadow-inner flex items-center justify-center">
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-brand-navy text-white text-3xl font-black">
                {displayName ? displayName.charAt(0) : 'S'}
              </div>
            )}
          </div>

          {/* ফটো আপলোড/পরিবর্তন বাটন */}
          <button
            type="button"
            onClick={onOpenEditModal}
            className="absolute -bottom-1.5 -right-1.5 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-brand-navy hover:bg-slate-800 text-white shadow-md transition cursor-pointer border-2 border-white"
            title="ছবি পরিবর্তন করুন"
            aria-label="ছবি পরিবর্তন করুন"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* পরিচিতি ও তথ্য */}
        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>অ্যাক্টিভ শিক্ষার্থী</span>
            </span>

            {section?.class_level_display && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{section.class_level_display}</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight leading-snug">
            {displayName}
          </h2>

          {/* আইডি ও কপি বাটন */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
            {student?.student_unique_id && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
                <span className="text-slate-400 font-sans">আইডি:</span>
                <span className="font-bold text-brand-navy">{student.student_unique_id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="ml-1 text-slate-400 hover:text-brand-orange transition cursor-pointer"
                  title="আইডি কপি করুন"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {student?.roll_number && (
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400">রোল:</span>{' '}
                <span className="font-bold text-brand-navy">{toBanglaNumber(student.roll_number)}</span>
              </div>
            )}

            {section?.section_name && (
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400">শাখা:</span>{' '}
                <span className="font-bold text-brand-navy">{section.section_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderCard;
