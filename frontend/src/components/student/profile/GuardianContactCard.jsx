import React from 'react';
import { Users, Phone, Mail, MapPin, Edit3, Lock, MessageSquare } from 'lucide-react';
import { toBanglaNumber } from './ProfileHeaderCard';

const GuardianContactCard = ({ user, onOpenEditModal }) => {
  const student = user?.student_profile;

  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm space-y-6">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-brand-navy">অভিভাবক ও যোগাযোগের তথ্য</h3>
            <p className="text-xs text-slate-400">জরুরি যোগাযোগ ও নোটিফিকেশন পাঠানোর ঠিকানা</p>
          </div>
        </div>

        {/* তথ্য সম্পাদন বাটন */}
        <button
          type="button"
          onClick={onOpenEditModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-brand-navy border border-slate-200 px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer min-h-[44px] shrink-0 self-start sm:self-auto"
        >
          <Edit3 className="h-3.5 w-3.5 text-brand-orange" />
          <span>যোগাযোগ নম্বর পরিবর্তন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* অংশ ১: অভিভাবক তথ্য (লকড) */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>পিতা-মাতা ও অভিভাবক</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 lowercase font-normal">
              <Lock className="h-2.5 w-2.5" /> অফিশিয়াল রেকর্ড
            </span>
          </h4>

          <div className="space-y-2.5">
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
              <span className="text-[11px] text-slate-500 block">পিতার নাম</span>
              <p className="text-sm font-bold text-brand-navy mt-0.5">
                {student?.father_name || 'রেকর্ড করা হয়নি'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
              <span className="text-[11px] text-slate-500 block">মাতার নাম</span>
              <p className="text-sm font-bold text-brand-navy mt-0.5">
                {student?.mother_name || 'রেকর্ড করা হয়নি'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">অভিভাবকের মোবাইল</span>
                <p className="text-sm font-bold text-brand-navy mt-0.5 font-mono">
                  {student?.guardian_phone ? toBanglaNumber(student.guardian_phone) : 'রেকর্ড করা হয়নি'}
                </p>
              </div>
              <Phone className="h-4 w-4 text-slate-400" />
            </div>

            {student?.guardian_whatsapp_number && (
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">অভিভাবকের হোয়াটসঅ্যাপ</span>
                  <p className="text-sm font-bold text-brand-navy mt-0.5 font-mono">
                    {toBanglaNumber(student.guardian_whatsapp_number)}
                  </p>
                </div>
                <MessageSquare className="h-4 w-4 text-emerald-600" />
              </div>
            )}
          </div>
        </div>

        {/* অংশ ২: শিক্ষার্থীর যোগাযোগের তথ্য ও ঠিকানা */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>শিক্ষার্থীর নিজস্ব যোগাযোগ</span>
            <span className="text-[10px] text-brand-orange font-bold">সম্পাদনাযোগ্য</span>
          </h4>

          <div className="space-y-2.5">
            {/* ফোন নম্বর (সম্পাদনাযোগ্য) */}
            <div
              onClick={onOpenEditModal}
              className="rounded-2xl bg-orange-50/50 p-3.5 border border-orange-200/70 hover:border-brand-orange transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">শিক্ষার্থীর মোবাইল নম্বর</span>
                  <span className="text-[9px] font-bold bg-white text-brand-orange px-1.5 py-0.2 rounded border border-orange-200">পরিবর্তনযোগ্য</span>
                </div>
                <p className="text-sm font-bold text-brand-navy mt-0.5 font-mono">
                  {user?.phone ? toBanglaNumber(user.phone) : 'নম্বর যুক্ত নেই'}
                </p>
              </div>
              <Edit3 className="h-4 w-4 text-brand-orange group-hover:scale-110 transition" />
            </div>

            {/* ইমেইল ঠিকানা (সম্পাদনাযোগ্য) */}
            <div
              onClick={onOpenEditModal}
              className="rounded-2xl bg-orange-50/50 p-3.5 border border-orange-200/70 hover:border-brand-orange transition cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">ইমেইল ঠিকানা</span>
                  <span className="text-[9px] font-bold bg-white text-brand-orange px-1.5 py-0.2 rounded border border-orange-200">পরিবর্তনযোগ্য</span>
                </div>
                <p className="text-sm font-bold text-brand-navy mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                  {user?.email || 'ইমেইল যুক্ত নেই'}
                </p>
              </div>
              <Mail className="h-4 w-4 text-brand-orange group-hover:scale-110 transition" />
            </div>

            {/* বর্তমান ঠিকানা (লকড) */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">বর্তমান ঠিকানা</span>
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-brand-navy mt-1 leading-relaxed">
                {student?.present_address || 'কলেজ ডাটাবেজে ঠিকানা লিপিবদ্ধ নেই'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianContactCard;
