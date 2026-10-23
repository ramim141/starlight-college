import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { staggerContainerVariants, staggerCardVariants } from '../../../utils/motion';
import { useStaffManagement } from '../../../hooks/useStaffManagement';

import StaffFilterBar, { StaffRoleTabs } from './StaffFilterBar';
import StaffListTable from './StaffListTable';
import StaffCardGridMobile from './StaffCardGridMobile';
import StaffCreateEditModal from './StaffCreateEditModal';
import StaffDeactivateModal from './StaffDeactivateModal';
import StaffPasswordResetModal from './StaffPasswordResetModal';
import Staff360Modal from './Staff360Modal';
import PrincipalPageHero from '../PrincipalPageHero';

const PrincipalStaff = () => {  const reduceMotion = useReducedMotion();
  const {
    filteredStaff,
    paginatedStaff,
    metricsById,
    summaryCounts,
    loadingStaff,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    createModalOpen,
    setCreateModalOpen,
    selectedStaffFor360,
    setSelectedStaffFor360,
    deactivateStaffTarget,
    setDeactivateStaffTarget,
    passwordResetTarget,
    setPasswordResetTarget,
    submittingAction,
    handleToggleActive,
    handleResetPassword,
  } = useStaffManagement();

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[1680px] pb-12 space-y-5 selection:bg-brand-orange selection:text-white"
    >
      <motion.div variants={staggerCardVariants}>
        <PrincipalPageHero
          eyebrow="প্রশাসনিক ব্যবস্থাপনা"
          title="শিক্ষক ও স্টাফ"
          englishTitle="Staff Directory"
          description="কর্মীদের তথ্য, উপস্থিতি ও অ্যাক্সেস এক জায়গা থেকে পরিচালনা করুন।"
          topActions={<>
            <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white/90 backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-emerald-400" />মোট <span className="tabular-nums text-white">{totalCount}</span> জন</div>
            <button type="button" onClick={() => setCreateModalOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-xs font-extrabold text-white shadow-md shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 motion-reduce:transform-none motion-reduce:transition-none"><span aria-hidden="true">＋</span>নতুন স্টাফ নিয়োগ</button>
          </>}
          footer={<StaffRoleTabs roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} summaryCounts={summaryCounts} />}
        />
      </motion.div>

      {/* ১. ফিল্টার ও অ্যাকশন বার */}
      <motion.div variants={staggerCardVariants}>
        <StaffFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          summaryCounts={summaryCounts}
          onOpenCreate={() => setCreateModalOpen(true)}
          hideTopRow
        />
      </motion.div>

      {/* ২. তালিকা ডিসপ্লে (ডেস্কটপ টেবিল ও মোবাইল কার্ড) */}
      <motion.div variants={staggerCardVariants}>        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${roleFilter}-${statusFilter}-${sortBy}-${viewMode}-${currentPage}`}
            layout
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut', layout: { duration: 0.24, ease: 'easeOut' } }}
          >
        {loadingStaff ? (
          <div className="p-5 sm:p-6 bg-white border rounded-3xl border-slate-200 shadow-soft motion-safe:animate-pulse space-y-4">
            <div className="w-48 h-5 rounded bg-slate-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center bg-white border rounded-3xl border-slate-200 shadow-soft">
            <p className="text-sm font-bold text-slate-500">কোনো স্টাফ বা শিক্ষক পাওয়া যায়নি।</p>
            <p className="text-xs text-slate-400 mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন বা নতুন সার্চ করুন।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* কার্ড গ্রিড; ছোট স্ক্রিনে টেবিলের বিকল্প */}
            <div className={viewMode === 'grid' ? 'block' : 'block lg:hidden'}>
              <StaffCardGridMobile
                staffList={paginatedStaff}
                metricsById={metricsById}
                onSelectStaff360={setSelectedStaffFor360}
                onDeactivateClick={setDeactivateStaffTarget}
                onPasswordResetClick={setPasswordResetTarget}
              />
            </div>

            {/* বড় স্ক্রিনে টেবিল ভিউ */}
            {viewMode === 'table' && (
              <div className="hidden lg:block">
                <StaffListTable
                  staffList={paginatedStaff}
                  metricsById={metricsById}
                  onSelectStaff360={setSelectedStaffFor360}
                  onDeactivateClick={setDeactivateStaffTarget}
                  onPasswordResetClick={setPasswordResetTarget}
                />
              </div>
            )}

            {/* পেজিনেশন বার */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-white border rounded-2xl border-slate-200 text-xs">
                <span className="text-slate-500 font-bold">
                  মোট {totalCount} জনের মধ্যে {((currentPage - 1) * 20) + 1}–{Math.min(currentPage * 20, totalCount)} প্রদর্শিত
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 min-h-[38px] cursor-pointer"
                  >
                    আগের পাতা
                  </button>
                  <span className="font-bold text-brand-navy px-2">
                    পাতা {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 min-h-[38px] cursor-pointer"
                  >
                    পরের পাতা
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
          </motion.div>        </AnimatePresence>      </motion.div>      {/* ৩. স্টাফ তৈরি মোডাল */}
      <AnimatePresence>
        {createModalOpen && (
          <StaffCreateEditModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ৪. সক্রিয় / নিষ্ক্রিয় কনফার্মেশন মোডাল */}
      <AnimatePresence>
        {deactivateStaffTarget && (
          <StaffDeactivateModal
            targetStaff={deactivateStaffTarget}
            onClose={() => setDeactivateStaffTarget(null)}
            onConfirm={handleToggleActive}
            submitting={submittingAction}
          />
        )}
      </AnimatePresence>

      {/* ৫. পাসওয়ার্ড রিসেট মোডাল */}
      <AnimatePresence>
        {passwordResetTarget && (
          <StaffPasswordResetModal
            targetStaff={passwordResetTarget}
            onClose={() => setPasswordResetTarget(null)}
            onConfirm={handleResetPassword}
            submitting={submittingAction}
          />
        )}
      </AnimatePresence>

      {/* ৬. স্টাফ ৩৬০° ফুল ভিউ মোডাল */}
      <AnimatePresence>
        {selectedStaffFor360 && (
          <Staff360Modal
            staff={selectedStaffFor360}
            isOpen={Boolean(selectedStaffFor360)}
            onClose={() => setSelectedStaffFor360(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PrincipalStaff;




