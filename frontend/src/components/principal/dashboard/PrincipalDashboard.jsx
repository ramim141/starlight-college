import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainerVariants, staggerCardVariants } from '../../../utils/motion';
import { usePrincipalDashboard } from '../../../hooks/usePrincipalDashboard';

import DashboardHeroHeader from './DashboardHeroHeader';
import DashboardVitalSigns from './DashboardVitalSigns';
import DashboardPendingApprovals from './DashboardPendingApprovals';
import DashboardSectionsOverview from './DashboardSectionsOverview';
import DashboardComplaintsOverview from './DashboardComplaintsOverview';
import DashboardQuickLinks from './DashboardQuickLinks';

const PrincipalDashboard = () => {
  const reduceMotion = useReducedMotion();
  const {
    currentTime,
    refreshing,
    onRefresh,
    summary,
    dailyCashData,
    sections,
    complaints,
    exams,
    transportAlert,
    pendingApprovalsList,
    totalPendingApprovals,
    totalStudentsEnrolled,
    studentAttendanceRate,
    teacherAttendanceStats,
    selectedExamForProcess,
    setSelectedExamForProcess,
    onProcessResult,
    processingResult,
    revealedComplaintIds,
    toggleRevealIdentity,
    onResolveComplaint,
    resolvingId,
    loadingBalanceSheet,
    loadingDailyCash,
    loadingStaff,
    loadingTeacherAttendance,
    loadingStudentAttendance,
    loadingSections,
    loadingComplaints,
    loadingPendingApprovals,
  } = usePrincipalDashboard();

  const isVitalSignsLoading =
    loadingBalanceSheet ||
    loadingDailyCash ||
    loadingStaff ||
    loadingTeacherAttendance ||
    loadingStudentAttendance;

  return (
    <motion.div
      variants={reduceMotion ? undefined : staggerContainerVariants}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      className="pb-12 space-y-6 selection:bg-brand-orange selection:text-white"
    >
      {/* ১. হেডবোর্ড, জরুরি সতর্কতা ও দ্রুত অ্যাকশন */}
      <motion.div
        variants={reduceMotion ? undefined : staggerCardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <DashboardHeroHeader
          transportAlert={transportAlert}
          currentTime={currentTime}
          refreshing={refreshing}
          onRefresh={onRefresh}
          exams={exams}
          selectedExamForProcess={selectedExamForProcess}
          onSelectExam={setSelectedExamForProcess}
          onProcessResult={onProcessResult}
          processingResult={processingResult}
        />
      </motion.div>

      {/* ২. ৫টি প্রধান অপারেশনাল ভাইটাল সাইনস (5 Smart Bento Metric Tiles) */}
      <motion.div
        variants={reduceMotion ? undefined : staggerCardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <DashboardVitalSigns
          totalStudentsEnrolled={totalStudentsEnrolled}
          studentAttendanceRate={studentAttendanceRate}
          teacherAttendanceStats={teacherAttendanceStats}
          summary={summary}
          dailyCashData={dailyCashData}
          totalPendingApprovals={totalPendingApprovals}
          loading={isVitalSignsLoading}
        />
      </motion.div>

      {/* ৩. অনুমোদনের অপেক্ষায় (১১টি বিভাগের সমান্তরাল লাইভ স্ট্রিপ) */}
      <motion.div
        variants={reduceMotion ? undefined : staggerCardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <DashboardPendingApprovals
          pendingApprovalsList={pendingApprovalsList}
          loading={loadingPendingApprovals}
        />
      </motion.div>

      {/* ৪. একাডেমিক শাখা ও ইনচার্জ ওভারভিউ */}
      <motion.div
        variants={reduceMotion ? undefined : staggerCardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <DashboardSectionsOverview
          sections={sections}
          loading={loadingSections}
        />
      </motion.div>

      {/* ৫. সুরক্ষিত গোপন অভিযোগ ও পরামর্শ বক্স (অধ্যক্ষ প্রিভিউ) */}
      <motion.div
        variants={reduceMotion ? undefined : staggerCardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <DashboardComplaintsOverview
          complaints={complaints}
          revealedComplaintIds={revealedComplaintIds}
          onToggleRevealIdentity={toggleRevealIdentity}
          onResolveComplaint={onResolveComplaint}
          resolvingId={resolvingId}
          loading={loadingComplaints}
        />
      </motion.div>

      {/* ৬. ৮টি সর্বাধিক ব্যবহৃত প্রশাসনিক কমান্ড পোর্টাল */}
      <motion.div
        variants={reduceMotion ? undefined : staggerCardVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
      >
        <DashboardQuickLinks />
      </motion.div>
    </motion.div>
  );
};

export default PrincipalDashboard;