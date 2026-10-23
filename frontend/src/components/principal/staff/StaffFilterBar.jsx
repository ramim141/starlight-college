import React from 'react';
import { 
  Search, 
  UserPlus, 
  LayoutGrid, 
  List, 
  Users, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';

export const StaffRoleTabs = ({ roleFilter, onRoleFilterChange, summaryCounts }) => (
  <div className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-2xl border border-white/15 bg-white/[0.06] p-1.5 scrollbar-none">
    <button type="button" onClick={() => onRoleFilterChange('ALL')} aria-pressed={roleFilter === 'ALL'} className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-white/10 ${roleFilter === 'ALL' ? 'bg-brand-orange text-white shadow-sm' : 'text-white/80'}`}><Users className="h-3.5 w-3.5" /><span>সকল স্টাফ ({summaryCounts.total})</span></button>
    <button type="button" onClick={() => onRoleFilterChange('TEACHER')} aria-pressed={roleFilter === 'TEACHER'} className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-white/10 ${roleFilter === 'TEACHER' ? 'bg-brand-orange text-white shadow-sm' : 'text-white/80'}`}><GraduationCap className="h-3.5 w-3.5" /><span>শিক্ষক ({summaryCounts.teachers})</span></button>
    <button type="button" onClick={() => onRoleFilterChange('INCHARGE')} aria-pressed={roleFilter === 'INCHARGE'} className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-white/10 ${roleFilter === 'INCHARGE' ? 'bg-brand-orange text-white shadow-sm' : 'text-white/80'}`}><span>শ্রেণি ইনচার্জ ({summaryCounts.incharges})</span></button>
    <button type="button" onClick={() => onRoleFilterChange('ACCOUNTANT')} aria-pressed={roleFilter === 'ACCOUNTANT'} className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-white/10 ${roleFilter === 'ACCOUNTANT' ? 'bg-brand-orange text-white shadow-sm' : 'text-white/80'}`}><Briefcase className="h-3.5 w-3.5" /><span>হিসাবরক্ষক ({summaryCounts.accountants})</span></button>
  </div>
);
const StaffFilterBar = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  summaryCounts,
  onOpenCreate,
  hideTopRow = false,
}) => {
  return (
    <div className="space-y-3">
      {!hideTopRow && (<>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm scrollbar-none">
          <button
            type="button"
            onClick={() => onRoleFilterChange('ALL')}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-2 text-xs font-bold rounded-xl transition min-h-[44px] cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>সকল স্টাফ ({summaryCounts.total})</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleFilterChange('TEACHER')}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-2 text-xs font-bold rounded-xl transition min-h-[44px] cursor-pointer ${
              roleFilter === 'TEACHER'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>শিক্ষক ({summaryCounts.teachers})</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleFilterChange('INCHARGE')}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-2 text-xs font-bold rounded-xl transition min-h-[44px] cursor-pointer ${
              roleFilter === 'INCHARGE'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <span>শ্রেণি ইনচার্জ ({summaryCounts.incharges})</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleFilterChange('ACCOUNTANT')}
            className={`flex items-center gap-1.5 shrink-0 px-3 py-2 text-xs font-bold rounded-xl transition min-h-[44px] cursor-pointer ${
              roleFilter === 'ACCOUNTANT'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>হিসাবরক্ষক ({summaryCounts.accountants})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-xs font-extrabold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন স্টাফ নিয়োগ</span>
        </button>
      </div> </>)}
      {/* সার্চ ও ফিল্টার কন্ট্রোল রো */}
      <div className="flex flex-col gap-3 p-3 sm:p-4 bg-white border rounded-2xl border-slate-200/90 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        {/* সার্চ ইনপুট */}
        <div className="relative w-full min-w-0 flex-1 lg:min-w-[240px]">
          <Search className="absolute w-4 h-4 -translate-y-1/2 text-slate-400 left-3.5 top-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="নাম, ফোন, Employee ID বা বিভাগ দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-orange focus:outline-none min-h-[42px]"
          />
        </div>

        {/* ড্রপডাউন ও সুইচসমূহ */}
        <div className="flex flex-wrap items-center gap-2">
          {/* স্ট্যাটাস ফিল্টার */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 cursor-pointer min-h-[44px]"
          >
            <option value="ACTIVE">সক্রিয় স্টাফ ({summaryCounts.active})</option>
            <option value="INACTIVE">নিষ্ক্রিয় স্টাফ ({summaryCounts.inactive})</option>
            <option value="ALL">সকল স্ট্যাটাস</option>
          </select>

          {/* সর্ট ড্রপডাউন */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 cursor-pointer min-h-[44px]"
          >
            <option value="pending">অপেক্ষমাণ কাজ আগে</option>
            <option value="name">নাম অনুযায়ী</option>
          </select>

          {/* ভিউ মোড টগল (ডেস্কটপ) */}
          <div className="items-center hidden p-1 bg-slate-100 rounded-xl sm:flex border border-slate-200">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex min-h-[40px] min-w-[40px] items-center justify-center p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="টেবিল ভিউ" aria-label="টেবিল ভিউ" aria-pressed={viewMode === 'table'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex min-h-[40px] min-w-[40px] items-center justify-center p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-brand-navy shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="কার্ড গ্রিড ভিউ" aria-label="কার্ড গ্রিড ভিউ" aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffFilterBar;



