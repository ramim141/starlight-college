import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainerVariants, staggerCardVariants } from '../../utils/motion';
import { useStudentManagement } from '../../hooks/useStudentManagement';

import StudentFilterBar from './students/StudentFilterBar';
import StudentTableDesktop from './students/StudentTableDesktop';
import StudentCardGridMobile from './students/StudentCardGridMobile';
import StudentBulkImportModal from './students/StudentBulkImportModal';
import StudentTemporaryPinModal from './students/StudentTemporaryPinModal';
import StudentTransferModal from './students/StudentTransferModal';
import Student360Modal from './Student360Modal';
import EnrollmentModal from '../incharge/EnrollmentModal';
import PrincipalPageHero from './PrincipalPageHero';

const StudentManagementPanel = () => {
  const {
    filteredStudents,
    paginatedStudents,
    sections,
    availableSessions,
    loadingStudents,
    searchTerm,
    setSearchTerm,
    sessionFilter,
    setSessionFilter,
    classFilter,
    setClassFilter,
    groupFilter,
    setGroupFilter,
    sectionFilter,
    setSectionFilter,
    genderFilter,
    setGenderFilter,
    transportFilter,
    setTransportFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    handleResetFilters,
    selectedStudentFor360,
    setSelectedStudentFor360,
    bulkImportOpen,
    setBulkImportOpen,
    enrollmentOpen,
    setEnrollmentOpen,
    temporaryPinTarget,
    setTemporaryPinTarget,
    transferTarget,
    setTransferTarget,
    deactivateTarget,
    setDeactivateTarget,
    submittingAction,
    handleTransferStudent,
    handleToggleStudentActive,
  } = useStudentManagement();

  // এনরোলমেন্টের জন্য নির্বাচিত সেকশন
  const enrollmentSection =
    sections.find((s) => String(s.id) === String(sectionFilter)) || sections[0] || null;

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="pb-12 space-y-6 selection:bg-brand-orange selection:text-white"
    >
      <motion.div variants={staggerCardVariants}><PrincipalPageHero eyebrow="শিক্ষার্থী প্রশাসন" title="শিক্ষার্থী ব্যবস্থাপনা" englishTitle="Student Directory" description="শিক্ষার্থীর ভর্তি, পরিচিতি, শ্রেণি ও সক্রিয় অবস্থা এক জায়গা থেকে পরিচালনা করুন।" /></motion.div>

      {/* ১. মাল্টি-ফিল্টার ও অ্যাকশন বার */}
      <motion.div variants={staggerCardVariants}>
        <StudentFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sessionFilter={sessionFilter}
          onSessionFilterChange={setSessionFilter}
          classFilter={classFilter}
          onClassFilterChange={setClassFilter}
          groupFilter={groupFilter}
          onGroupFilterChange={setGroupFilter}
          sectionFilter={sectionFilter}
          onSectionFilterChange={setSectionFilter}
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderFilter}
          transportFilter={transportFilter}
          onTransportFilterChange={setTransportFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sections={sections}
          availableSessions={availableSessions}
          onResetFilters={handleResetFilters}
          onOpenEnrollment={() => setEnrollmentOpen(true)}
          onOpenBulkImport={() => setBulkImportOpen(true)}
          totalCount={totalCount}
        />
      </motion.div>

      {/* ২. শিক্ষার্থী তালিকা (ডেস্কটপ টেবিল ও মোবাইল কার্ড) */}
      <motion.div variants={staggerCardVariants}>
        {loadingStudents ? (
          <div className="p-8 bg-white border rounded-3xl border-slate-200 shadow-soft animate-pulse space-y-4">
            <div className="w-48 h-5 rounded bg-slate-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center bg-white border rounded-3xl border-slate-200 shadow-soft">
            <p className="text-sm font-bold text-slate-500">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
            <p className="text-xs text-slate-400 mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন বা নতুন সার্চ করুন।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* মোবাইল ভিউ (< sm) */}
            <div className="block sm:hidden">
              <StudentCardGridMobile
                students={paginatedStudents}
                onSelectStudent360={setSelectedStudentFor360}
                onPinViewClick={setTemporaryPinTarget}
                onTransferClick={setTransferTarget}
                onDeactivateClick={setDeactivateTarget}
              />
            </div>

            {/* ডেস্কটপ টেবিল ভিউ (>= sm) */}
            <div className="hidden sm:block">
              <StudentTableDesktop
                students={paginatedStudents}
                onSelectStudent360={setSelectedStudentFor360}
                onPinViewClick={setTemporaryPinTarget}
                onTransferClick={setTransferTarget}
                onDeactivateClick={setDeactivateTarget}
              />
            </div>

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
      </motion.div>

      {/* ৩. শিক্ষার্থী ৩৬০° মোডাল */}
      <AnimatePresence>
        {selectedStudentFor360 && (
          <Student360Modal
            student={selectedStudentFor360}
            onClose={() => setSelectedStudentFor360(null)}
          />
        )}
      </AnimatePresence>

      {/* ৪. সাময়িক PIN প্রদর্শন মোডাল */}
      <AnimatePresence>
        {temporaryPinTarget && (
          <StudentTemporaryPinModal
            student={temporaryPinTarget}
            onClose={() => setTemporaryPinTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* ৫. শাখা স্থানান্তর মোডাল */}
      <AnimatePresence>
        {transferTarget && (
          <StudentTransferModal
            student={transferTarget}
            sections={sections}
            onClose={() => setTransferTarget(null)}
            onConfirm={handleTransferStudent}
            submitting={submittingAction}
          />
        )}
      </AnimatePresence>

      {/* ৬. এক্সেল বাল্ক ইমপোর্ট মোডাল */}
      <AnimatePresence>
        {bulkImportOpen && (
          <StudentBulkImportModal
            isOpen={bulkImportOpen}
            onClose={() => setBulkImportOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ৭. একক নতুন শিক্ষার্থী ভর্তি মোডাল */}
      <AnimatePresence>
        {enrollmentOpen && enrollmentSection && (
          <EnrollmentModal
            isOpen={enrollmentOpen}
            onClose={() => setEnrollmentOpen(false)}
            section={enrollmentSection}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentManagementPanel;

