import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  DollarSign,
  FileText,
  Sliders,
  ChevronRight,
  UserCheck,
  Edit2
} from 'lucide-react';

const SectionCard = ({
  sec,
  teachers = [],
  parentCalls = [],
  leaves = [],
  handovers = [],
  onOpenSupervision,
  onAssignIncharge,
  onEditSection,
}) => {
  const hasIncharge = Boolean(sec.in_charge_teacher);
  const teacherProfile = teachers.find((t) => t.id === sec.in_charge_teacher);

  // Operational metrics
  const secCallsCount = parentCalls.filter((c) => c.section === sec.id || c.roll_number).length;
  const secLeavesCount = leaves.filter((l) => l.section === sec.id).length;
  const secHandoversCount = handovers.filter((h) => h.in_charge === sec.in_charge_teacher).length;

  // Occupancy rate calculation
  const capacity = sec.capacity || 60;
  const enrolled = sec.total_students || 0;
  const occupancyPct = Math.min(100, Math.round((enrolled / capacity) * 100));

  return (
    <div className="group relative rounded-3xl bg-white p-6 border border-slate-200/90 shadow-soft hover:shadow-xl transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* কার্ড হেডার: শ্রেণি, বিভাগ ও শাখা */}
        <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-brand-navy group-hover:text-brand-orange transition-colors">
                {sec.class_level_display || sec.class_level}
              </h3>
              <button
                onClick={() => onEditSection(sec)}
                className="p-1 rounded-lg text-slate-300 hover:text-brand-navy hover:bg-slate-100 transition"
                title="শাখার তথ্য সম্পাদনা করুন"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {sec.group_display || sec.group}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="rounded-xl bg-orange-50 px-3 py-1 text-xs font-black text-brand-orange border border-orange-200/60 shadow-xs">
              শাখা: {sec.section_name}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              সেশন {sec.session}
            </span>
          </div>
        </div>

        {/* সিট অকুপেন্সি প্রগ্রেস বার */}
        <div className="my-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500">আসন পূরণ (Occupancy)</span>
            <span className="text-brand-navy font-black">{enrolled}/{capacity} জন ({occupancyPct}%)</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-brand-orange' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>

        {/* ইনচার্জ শিক্ষক শোকেস বক্স */}
        <div className="my-3">
          {hasIncharge ? (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/30 p-3.5 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-navy flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0">
                  {sec.in_charge_teacher_name?.[0] || 'T'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-brand-navy truncate">
                      {sec.in_charge_teacher_name}
                    </p>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {teacherProfile?.teacher_profile?.department ? `${teacherProfile.teacher_profile.department} বিভাগ` : 'দায়িত্বপ্রাপ্ত শিক্ষক'}
                  </p>
                  <span className="inline-block mt-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800">
                    সক্রিয় শ্রেণি ইনচার্জ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-amber-900">শ্রেণি ইনচার্জ শূন্য</p>
                  <p className="text-[11px] text-amber-700 leading-tight mt-0.5">
                    হাজিরা, অভিভাবক কল ও ফি তদারকির জন্য একজন শিক্ষক নিয়োগ দিন।
                  </p>
                  <button
                    onClick={() => onAssignIncharge(sec)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    + শিক্ষক মনোনয়ন করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ৪টি ইনচার্জ দায়িত্ব ও মেট্রিক্স কুইক প্রিভিউ গ্রিড */}
        <div className="grid grid-cols-2 gap-2 text-xs my-4">
          {/* হাজিরা ও শিক্ষার্থী */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-1">
              <Users className="h-3.5 w-3.5 text-brand-orange" />
              <span>শিক্ষার্থী সংখ্যা</span>
            </div>
            <p className="text-sm font-black text-brand-navy">
              {enrolled} জন
            </p>
            <span className="text-[10px] text-slate-400">হাজিরা রেকর্ড সক্রিয়</span>
          </div>

          {/* অভিভাবক কল লগ */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-1">
              <PhoneCall className="h-3.5 w-3.5 text-brand-orange" />
              <span>অভিভাবক যোগাযোগ</span>
            </div>
            <p className="text-sm font-black text-brand-navy">
              {secCallsCount > 0 ? `${secCallsCount} টি কল` : 'ডায়েরি চালু'}
            </p>
            <span className="text-[10px] text-slate-400">কল হিস্ট্রি সংরক্ষিত</span>
          </div>

          {/* ফি ও ক্যাশ হস্তান্তর */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span>ক্যাশ হস্তান্তর</span>
            </div>
            <p className="text-sm font-black text-emerald-700">
              {secHandoversCount > 0 ? `${secHandoversCount} টি জমা` : 'ক্যাশ ট্র্যাকিং'}
            </p>
            <span className="text-[10px] text-slate-400">হিসাবরক্ষককে হস্তান্তর</span>
          </div>

          {/* ছুটি ও জরিমানা সুপারিশ */}
          <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold mb-1">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>ছুটি ও মওকুফ</span>
            </div>
            <p className="text-sm font-black text-blue-800">
              {secLeavesCount > 0 ? `${secLeavesCount} টি আবেদন` : '২-ধাপ অনুমোদন'}
            </p>
            <span className="text-[10px] text-slate-400">সুপারিশ কার্যক্রম</span>
          </div>
        </div>
      </div>

      {/* কার্ড ফুটার বাটনস */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onOpenSupervision(sec)}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-navy py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
        >
          <Sliders className="h-3.5 w-3.5 text-brand-orange" />
          <span>ইনচার্জ দায়িত্ব ও ৩৬০° হাব</span>
          <ChevronRight className="h-3 w-3 text-white/50" />
        </button>

        <button
          onClick={() => onAssignIncharge(sec)}
          className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <UserCheck className="h-3.5 w-3.5 text-slate-500" />
          <span>{hasIncharge ? 'ইনচার্জ পরিবর্তন' : 'ইনচার্জ নিয়োগ'}</span>
        </button>
      </div>
    </div>
  );
};

export default SectionCard;
