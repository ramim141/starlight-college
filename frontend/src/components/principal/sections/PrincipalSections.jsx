import React from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Users,
  AlertTriangle,
  Calendar,
  PhoneCall,
  DollarSign,
  FileText,
  Eye
} from 'lucide-react';
import { useSectionManagement } from '../../../hooks/useSectionManagement';
import SectionFilterBar from './SectionFilterBar';
import SectionHierarchyList from './SectionHierarchyList';
import AssignInchargeModal from './AssignInchargeModal';
import SectionCreateEditModal from './SectionCreateEditModal';
import InchargeSectionSupervisionModal from './InchargeSectionSupervisionModal';

const PrincipalSections = () => {
  const {
    teachers,
    parentCalls,
    leaves,
    handovers,
    loading,
    stats,
    teacherAssignedSectionMap,
    availableSessions,
    // Filters
    filterSession,
    setFilterSession,
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
    // Data
    filteredSections,
    hierarchyData,
    // Modals
    assignModalSec,
    setAssignModalSec,
    createModalOpen,
    setCreateModalOpen,
    editingSection,
    setEditingSection,
    supervisingSection,
    setSupervisingSection,
    submitting,
    // Actions
    handleAssignIncharge,
    handleCreateSection,
    handleUpdateSection,
  } = useSectionManagement();

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* ১. ইউনিফাইড হিরো ব্যানার (REFERENCE DESIGN)                     */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#143B75] p-6 text-white shadow-2xl sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#F27405]/15 blur-3xl"
        />

        {/* Curved Swoosh SVG on the right */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-16 h-72 w-72 text-brand-orange/20 sm:h-96 sm:w-96"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 180 C 70 80, 130 50, 190 20"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M40 190 C 90 100, 140 70, 200 40"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between pb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-brand-orange backdrop-blur-md">
              <GraduationCap className="h-4 w-4 text-brand-orange" />
              <span>একাডেমিক শাখা ও ইনচার্জ প্রশাসন</span>
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              একাডেমিক শ্রেণি, শাখা ও{' '}
              <span className="relative inline-block text-brand-orange">
                শ্রেণি ইনচার্জ হাব
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 100 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5"
                    stroke="#F27405"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              শ্রেণি শাখা বরাদ্দ, শিক্ষককে শ্রেণি ইনচার্জ নিয়োগ এবং দৈনিক বাল্ক হাজিরা, অভিভাবক কল, মাসিক ফি আদায় ও ছুটির সুপারিশ কেন্দ্রীয়ভাবে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="press-tactile group inline-flex cursor-pointer min-h-[48px] items-center gap-2.5 rounded-full bg-brand-orange px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/40 transition hover:brightness-110 active:scale-95"
            >
              <Plus className="h-5 w-5 spring-physics group-hover:rotate-90" />
              <span>নতুন শাখা তৈরি করুন</span>
            </button>
          </div>
        </div>

        {/* 4 Live Stats Cards */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4 relative z-10">
          <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-5 sm:first:border-l-0 sm:first:pl-0">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-orange ring-1 ring-white/10">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <dt className="truncate text-xs text-white/65">মোট একাডেমিক শাখা</dt>
              <dd className="text-lg font-extrabold tabular-nums text-white">{stats.totalSections} টি শাখা</dd>
              <dd className="truncate text-xs text-white/50">একাদশ ও দ্বাদশ শ্রেণি</dd>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <dt className="truncate text-xs text-white/65">ইনচার্জ নিযুক্ত শাখা</dt>
              <dd className="text-lg font-extrabold tabular-nums text-white">{stats.assignedCount} টি শাখা</dd>
              <dd className="truncate text-xs text-emerald-300/80">দায়িত্বপ্রাপ্ত শিক্ষক সক্রিয়</dd>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-5">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ring-1 ${
              stats.unassignedCount > 0 ? 'bg-amber-500/20 text-amber-400 ring-amber-500/30' : 'bg-white/10 text-white/50 ring-white/10'
            }`}>
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <dt className="truncate text-xs text-white/65">ইনচার্জ শূন্য শাখা</dt>
              <dd className={`text-lg font-extrabold tabular-nums ${stats.unassignedCount > 0 ? 'text-amber-300' : 'text-white'}`}>
                {stats.unassignedCount} টি শাখা
              </dd>
              <dd className="truncate text-xs text-white/50">শিক্ষক মনোনয়ন প্রয়োজন</dd>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-orange ring-1 ring-white/10">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <dt className="truncate text-xs text-white/65">মোট শিক্ষার্থী</dt>
              <dd className="text-lg font-extrabold tabular-nums text-white">{stats.totalStudents} জন</dd>
              <dd className="truncate text-xs text-white/50">শাখাগুলোতে নিবন্ধিত</dd>
            </div>
          </div>
        </dl>
      </section>

      {/* ============================================================== */}
      {/* ২. ইনচার্জের ৫টি কেন্দ্রীয় দায়িত্ব নির্দেশিকা                  */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/60 p-5 sm:p-6 border border-orange-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-brand-orange" />
          <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider">
            স্টারলাইট শ্রেণি ইনচার্জ (Class In-Charge) পরিচালনার ৫টি কেন্দ্রীয় দায়িত্ব
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-2xl bg-white p-3.5 border border-orange-100 shadow-soft">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs mb-1">
              <Calendar className="h-4 w-4" />
              <span>১. দৈনিক বাল্ক হাজিরা</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              প্রতিদিন ক্লাসের হাজিরা গ্রহণ, অনুপস্থিতদের শনাক্তকরণ এবং অভিভাবকদের WhatsApp-এ নোটিফিকেশন।
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 border border-orange-100 shadow-soft">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs mb-1">
              <PhoneCall className="h-4 w-4" />
              <span>২. অভিভাবক কল ডায়েরি</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              ৭০% কম হাজিরা বা দুর্বল শিক্ষার্থীদের অভিভাবকদের কল করা এবং আলোচনার সারসংক্ষেপ নথিবদ্ধ করা।
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 border border-orange-100 shadow-soft">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs mb-1">
              <DollarSign className="h-4 w-4" />
              <span>৩. ফি ও ক্যাশ হস্তান্তর</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              ক্লাসের টিউশন/পরিবহন ফি সরাসরি নগদ গ্রহণ এবং হিসাবরক্ষককে ভেরিফাইড হস্তান্তর (CashHandover)।
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 border border-orange-100 shadow-soft">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs mb-1">
              <FileText className="h-4 w-4" />
              <span>৪. ছুটি ও জরিমানা সুপারিশ</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              শিক্ষার্থীদের ছুটির আবেদন ও দৈনিক ১০০/- টাকা অনুপস্থিতি জরিমানা মওকুফের সুপারিশ প্রদান।
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3.5 border border-orange-100 shadow-soft">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs mb-1">
              <Eye className="h-4 w-4" />
              <span>৫. শিক্ষার্থী ৩৬০° কেয়ার</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              পরীক্ষার মার্কশিট এন্ট্রি পর্যবেক্ষণ, বিষয়ভিত্তিক দুর্বলতা চিহ্নিতকরণ ও বিশেষ কাউন্সিলিং।
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ৩. ফিল্টার ও সার্চ টুলবার                                      */}
      {/* ============================================================== */}
      <SectionFilterBar
        filterSession={filterSession}
        setFilterSession={setFilterSession}
        availableSessions={availableSessions}
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        filterIncharge={filterIncharge}
        setFilterIncharge={setFilterIncharge}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* ============================================================== */}
      {/* ৪. সেকশন অনুক্রম ও কার্ডস তালিকা                               */}
      {/* ============================================================== */}
      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
        </div>
      ) : (
        <SectionHierarchyList
          hierarchyData={hierarchyData}
          filteredSections={filteredSections}
          viewMode={viewMode}
          teachers={teachers}
          parentCalls={parentCalls}
          leaves={leaves}
          handovers={handovers}
          onOpenSupervision={(sec) => setSupervisingSection(sec)}
          onAssignIncharge={(sec) => setAssignModalSec(sec)}
          onEditSection={(sec) => setEditingSection(sec)}
        />
      )}

      {/* ============================================================== */}
      {/* ৫. মোডালসমূহ                                                  */}
      {/* ============================================================== */}
      {supervisingSection && (
        <InchargeSectionSupervisionModal
          section={supervisingSection}
          teachers={teachers}
          onClose={() => setSupervisingSection(null)}
          onAssignClick={() => {
            setAssignModalSec(supervisingSection);
          }}
        />
      )}

      {assignModalSec && (
        <AssignInchargeModal
          section={assignModalSec}
          teachers={teachers}
          teacherAssignedSectionMap={teacherAssignedSectionMap}
          onClose={() => setAssignModalSec(null)}
          onAssign={handleAssignIncharge}
          submitting={submitting}
        />
      )}

      {(createModalOpen || editingSection) && (
        <SectionCreateEditModal
          isOpen={Boolean(createModalOpen || editingSection)}
          initialData={editingSection}
          teachers={teachers}
          teacherAssignedSectionMap={teacherAssignedSectionMap}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingSection(null);
          }}
          onSubmit={(data) => {
            if (editingSection) {
              handleUpdateSection(editingSection.id, data);
            } else {
              handleCreateSection(data);
            }
          }}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default PrincipalSections;