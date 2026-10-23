import React from 'react';
import { Search, Plus, Filter, BookOpen } from 'lucide-react';

const SubjectFilterBar = ({
  searchTerm,
  setSearchTerm,
  classFilter,
  setClassFilter,
  groupFilter,
  setGroupFilter,
  statusFilter,
  setStatusFilter,
  stats,
  canEdit,
  onAddNew,
}) => {
  return (
    <div className="space-y-3">
      {/* স্ট্যাটাস ও সামারি কাউন্ট */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange border border-orange-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-brand-navy">পাঠ্য বিষয় ডিরেক্টরি</h3>
            <p className="text-xs text-slate-500 font-medium">
              মোট বিষয়: <strong className="text-brand-orange font-bold">{stats.total} টি</strong> (সচল: {stats.active} টি
              {stats.withoutTeacher > 0 && (
                <span className="text-rose-600 font-bold ml-1">· শিক্ষকহীন: {stats.withoutTeacher} টি</span>
              )})
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-orange-hover min-h-[44px] transition active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন বিষয় যোগ</span>
          </button>
        )}
      </div>

      {/* ফিল্টার ও সার্চ বার */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
        {/* সার্চ ইনপুট */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, কোড বা শিক্ষক দিয়ে খুঁজুন..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:outline-none min-h-[40px]"
          />
        </div>

        {/* শ্রেণি ফিল্টার */}
        <div className="relative">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[40px]"
          >
            <option value="ALL">সকল শ্রেণি (XI & XII)</option>
            <option value="XI">একাদশ শ্রেণি (XI)</option>
            <option value="XII">দ্বাদশ শ্রেণি (XII)</option>
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* বিভাগ ফিল্টার */}
        <div className="relative">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[40px]"
          >
            <option value="ALL">সকল বিভাগ / গ্রুপ</option>
            <option value="SCI">বিজ্ঞান (Science)</option>
            <option value="HUM">মানবিক (Humanities)</option>
            <option value="BUS">ব্যবসায় শিক্ষা (Business)</option>
            <option value="GEN">সাধারণ (General)</option>
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* স্ট্যাটাস ফিল্টার */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[40px]"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="ACTIVE">সচল বিষয়সমূহ</option>
            <option value="INACTIVE">নিষ্ক্রিয় বিষয়সমূহ</option>
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default SubjectFilterBar;
