import React from 'react';
import { Search, Filter, Layers, LayoutGrid } from 'lucide-react';

const SectionFilterBar = ({
  filterSession,
  setFilterSession,
  availableSessions = [],
  filterClass,
  setFilterClass,
  filterGroup,
  setFilterGroup,
  filterIncharge,
  setFilterIncharge,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
}) => {
  const hasActiveFilters =
    filterSession !== 'ALL' ||
    filterClass !== 'ALL' ||
    filterGroup !== 'ALL' ||
    filterIncharge !== 'ALL' ||
    searchTerm.trim() !== '';

  const handleReset = () => {
    setFilterSession('ALL');
    setFilterClass('ALL');
    setFilterGroup('ALL');
    setFilterIncharge('ALL');
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
      {/* ড্রপডাউন ফিল্টারসমূহ */}
      <div className="flex flex-wrap items-center gap-2">
        {/* সেশন */}
        {availableSessions.length > 1 && (
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-brand-orange focus:outline-none"
          >
            <option value="ALL">সব সেশন (All Sessions)</option>
            {availableSessions.map((sess) => (
              <option key={sess} value={sess}>
                সেশন {sess}
              </option>
            ))}
          </select>
        )}

        {/* শ্রেণি */}
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-brand-orange focus:outline-none"
        >
          <option value="ALL">সব শ্রেণি (All Classes)</option>
          <option value="XI">একাদশ শ্রেণি (1st Year - XI)</option>
          <option value="XII">দ্বাদশ শ্রেণি (2nd Year - XII)</option>
        </select>

        {/* বিভাগ */}
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-brand-orange focus:outline-none"
        >
          <option value="ALL">সব বিভাগ (All Groups)</option>
          <option value="SCI">বিজ্ঞান (Science)</option>
          <option value="HUM">মানবিক (Humanities)</option>
          <option value="BUS">ব্যবসায় শিক্ষা (Business)</option>
        </select>

        {/* ইনচার্জ স্ট্যাটাস */}
        <select
          value={filterIncharge}
          onChange={(e) => setFilterIncharge(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-brand-orange focus:outline-none"
        >
          <option value="ALL">সব ইনচার্জ স্ট্যাটাস</option>
          <option value="ASSIGNED">ইনচার্জ নিযুক্ত শাখা</option>
          <option value="UNASSIGNED">ইনচার্জ শূন্য শাখা</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs font-bold text-rose-600 hover:underline px-2"
          >
            রিসেট
          </button>
        )}
      </div>

      {/* ডানপাশের কন্ট্রোলস: সার্চ বার ও ভিউ টগল */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="শাখা বা শিক্ষকের নাম..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-brand-orange focus:bg-white focus:outline-none"
          />
        </div>

        {/* ভিউ মোড বাটন (Hierarchy vs Grid) */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              viewMode === 'hierarchy' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="শ্রেণি ও বিভাগ অনুক্রম ভিউ"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              viewMode === 'cards' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="ফ্ল্যাট গ্রিড ভিউ"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionFilterBar;
