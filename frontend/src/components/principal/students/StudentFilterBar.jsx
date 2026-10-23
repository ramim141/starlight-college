import React from 'react';
import { 
  Search, 
  Upload, 
  UserPlus, 
  Download, 
  RotateCcw, 
  Bus, 
  Users 
} from 'lucide-react';

const StudentFilterBar = ({
  searchTerm,
  onSearchChange,
  sessionFilter,
  onSessionFilterChange,
  classFilter,
  onClassFilterChange,
  groupFilter,
  onGroupFilterChange,
  sectionFilter,
  onSectionFilterChange,
  genderFilter,
  onGenderFilterChange,
  transportFilter,
  onTransportFilterChange,
  statusFilter,
  onStatusFilterChange,
  sections = [],
  availableSessions = [],
  onResetFilters,
  onOpenEnrollment,
  onOpenBulkImport,
  totalCount = 0,
}) => {
  return (
    <div className="space-y-4">
      {/* টপ রো: টাইটেল ও অ্যাকশন বাটনসমূহ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2.5 rounded-2xl bg-[#0F2C59] text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-brand-navy">
              শিক্ষার্থী পরিচালনা ও ৩৬০° হাব
            </h3>
            <p className="text-xs text-slate-400">
              মোট শিক্ষার্থী: <strong className="text-brand-orange">{totalCount} জন</strong> ফিল্টার অনুসারে প্রদর্শিত
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* এক্সেল টেমপ্লেট ডাউনলোড */}
          <a
            href="/student_import_template.xlsx"
            download
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Excel টেমপ্লেট</span>
          </a>

          {/* এক্সেল বাল্ক ইমপোর্ট বাটন */}
          <button
            type="button"
            onClick={onOpenBulkImport}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-brand-orange" />
            <span>এক্সেলে বাল্ক ভর্তি</span>
          </button>

          {/* নতুন শিক্ষার্থী ভর্তি বাটন */}
          <button
            type="button"
            onClick={onOpenEnrollment}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-2xl bg-brand-orange px-4 text-xs font-extrabold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন ভর্তি</span>
          </button>
        </div>
      </div>

      {/* মাল্টি-ফিল্টার কন্ট্রোল বার */}
      <div className="p-3.5 bg-white border rounded-2xl border-slate-200/90 shadow-xs space-y-3">
        {/* সার্চ বার */}
        <div className="relative w-full">
          <Search className="absolute w-4 h-4 -translate-y-1/2 text-slate-400 left-3.5 top-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="শিক্ষার্থীর নাম, আইডি, রোল, এসএসসি রোল বা অভিভাবকের ফোন দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-orange focus:outline-none min-h-[42px]"
          />
        </div>

        {/* ড্রপডাউন ফিল্টার গ্রিড */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7 text-xs">
          {/* সেশন */}
          <select
            value={sessionFilter}
            onChange={(e) => onSessionFilterChange(e.target.value)}
            className="px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
          >
            <option value="ALL">সকল সেশন</option>
            {availableSessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* শ্রেণি */}
          <select
            value={classFilter}
            onChange={(e) => onClassFilterChange(e.target.value)}
            className="px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
          >
            <option value="ALL">সকল শ্রেণি</option>
            <option value="11">একাদশ শ্রেণি (XI)</option>
            <option value="12">দ্বাদশ শ্রেণি (XII)</option>
          </select>

          {/* বিভাগ */}
          <select
            value={groupFilter}
            onChange={(e) => onGroupFilterChange(e.target.value)}
            className="px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
          >
            <option value="ALL">সকল বিভাগ</option>
            <option value="SCIENCE">বিজ্ঞান</option>
            <option value="HUMANITIES">মানবিক</option>
            <option value="COMMERCE">ব্যবসায় শিক্ষা</option>
          </select>

          {/* নির্দিষ্ট শাখা */}
          <select
            value={sectionFilter}
            onChange={(e) => onSectionFilterChange(e.target.value)}
            className="px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
          >
            <option value="ALL">সকল শাখা</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.class_level} - {sec.section_name} ({sec.session})
              </option>
            ))}
          </select>

          {/* লিঙ্গ */}
          <select
            value={genderFilter}
            onChange={(e) => onGenderFilterChange(e.target.value)}
            className="px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
          >
            <option value="ALL">উভয় লিঙ্গ</option>
            <option value="MALE">ছাত্র (Male)</option>
            <option value="FEMALE">ছাত্রী (Female)</option>
          </select>

          {/* পরিবহন */}
          <select
            value={transportFilter}
            onChange={(e) => onTransportFilterChange(e.target.value)}
            className="px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
          >
            <option value="ALL">সকল শিক্ষার্থী</option>
            <option value="YES">বাস ব্যবহারকারী</option>
            <option value="NO">বাস ব্যবহার করে না</option>
          </select>

          {/* স্ট্যাটাস ও রিসেট */}
          <div className="flex items-center space-x-1.5 col-span-2 sm:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="flex-1 px-2.5 py-2 font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange cursor-pointer min-h-[38px]"
            >
              <option value="ACTIVE">সক্রিয়</option>
              <option value="INACTIVE">নিষ্ক্রিয়</option>
              <option value="ALL">সব</option>
            </select>

            <button
              type="button"
              onClick={onResetFilters}
              title="ফিল্টার রিসেট"
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-brand-orange cursor-pointer min-h-[38px] flex items-center justify-center shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFilterBar;
