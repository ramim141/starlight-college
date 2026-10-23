import React, { useState } from 'react';
import { useTeacherDashboard } from '../../hooks/useTeacherDashboard';
import TeacherProfileBanner from '../../components/teacher/dashboard/TeacherProfileBanner';
import TeacherMarkerAlert from '../../components/teacher/dashboard/TeacherMarkerAlert';
import TeacherInchargeBanner from '../../components/teacher/dashboard/TeacherInchargeBanner';
import TeacherKpiStrip from '../../components/teacher/dashboard/TeacherKpiStrip';
import TeacherUpcomingClassCard from '../../components/teacher/dashboard/TeacherUpcomingClassCard';
import RoutineTabContent from '../../components/teacher/dashboard/tabs/RoutineTabContent';
import InchargeTabContent from '../../components/teacher/dashboard/tabs/InchargeTabContent';
import ExamsTabContent from '../../components/teacher/dashboard/tabs/ExamsTabContent';
import LeavesTabContent from '../../components/teacher/dashboard/tabs/LeavesTabContent';
import FinanceTabContent from '../../components/teacher/dashboard/tabs/FinanceTabContent';
import NoticesTabContent from '../../components/teacher/dashboard/tabs/NoticesTabContent';
import TeacherCheckInModal from '../../components/teacher/dashboard/modals/TeacherCheckInModal';
import TeacherLeaveModal from '../../components/teacher/dashboard/modals/TeacherLeaveModal';
import TeacherMarkerModal from '../../components/teacher/dashboard/modals/TeacherMarkerModal';
import TeacherClaimModal from '../../components/teacher/dashboard/modals/TeacherClaimModal';
import { Clock, Sparkles, Award, Calendar, CreditCard, FileText } from 'lucide-react';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('routine'); // routine | incharge | exams | leaves | finance | notices

  const {
    user,
    isClassIncharge,
    schedule,
    todayAttendance,
    attendanceHistory,
    markers,
    leaves,
    proxyClasses,
    atRiskList,
    invigilations,
    payrolls,
    salaryClaims,
    notices,
    colleagueTeachers,
    exams,
    unacknowledgedMarkers,
    pendingStudentLeaves,
    upcomingClass,
    approvedLeavesCount,
    loading,
    refreshing,
    currentTime,
    submitting,
    showLeaveModal,
    setShowLeaveModal,
    showMarkerModal,
    setShowMarkerModal,
    showClaimModal,
    setShowClaimModal,
    showCheckInModal,
    setShowCheckInModal,
    checkInRemarks,
    setCheckInRemarks,
    leaveForm,
    setLeaveForm,
    markerForm,
    setMarkerForm,
    claimForm,
    setClaimForm,
    fetchDashboardData,
    handleCheckIn,
    handleCheckOut,
    handleAcknowledgeMarker,
    handleRequestMarker,
    handleApplyLeave,
    handleRecommendStudentLeave,
    handleSubmitClaim,
  } = useTeacherDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent shadow-lg"></div>
        <p className="text-sm font-bold text-slate-500">শিক্ষক ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ১. শিক্ষক স্বাগতম ও স্মার্ট ডিজিটাল পাঞ্চ প্যানেল */}
      <TeacherProfileBanner
        user={user}
        isClassIncharge={isClassIncharge}
        currentTime={currentTime}
        todayAttendance={todayAttendance}
        refreshing={refreshing}
        submitting={submitting}
        onRefresh={() => fetchDashboardData(true)}
        onOpenCheckIn={() => setShowCheckInModal(true)}
        onCheckOut={handleCheckOut}
        onOpenLeave={() => setShowLeaveModal(true)}
      />

      {/* ২. মার্কার বুঝে নেওয়ার জরুরি অ্যালার্ট */}
      <TeacherMarkerAlert
        unacknowledgedMarkers={unacknowledgedMarkers}
        onAcknowledgeMarker={handleAcknowledgeMarker}
      />

      {/* ২.১. ইনচার্জ স্পেশাল কমান্ড বার */}
      <TeacherInchargeBanner
        user={user}
        isClassIncharge={isClassIncharge}
        atRiskList={atRiskList}
        pendingStudentLeaves={pendingStudentLeaves}
        onSelectInchargeTab={() => setActiveTab('incharge')}
      />

      {/* ৩. চার কার্ড সম্বলিত এক্সিকিউটিভ কেপিআই স্ট্রিপ */}
      <TeacherKpiStrip
        schedule={schedule}
        attendanceHistory={attendanceHistory}
        proxyClasses={proxyClasses}
        approvedLeavesCount={approvedLeavesCount}
        markers={markers}
        onOpenMarkerModal={() => setShowMarkerModal(true)}
      />

      {/* ৪. আসন্ন পরবর্তী ক্লাসের স্পটলাইট স্পট */}
      <TeacherUpcomingClassCard upcomingClass={upcomingClass} />

      {/* ৫. শিক্ষক কন্ট্রোল সেন্টারের ট্যাব নেভিগেশন */}
      <div className="rounded-3xl bg-white p-2 border border-slate-100 shadow-soft">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto p-1">
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'routine'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>আজকের ক্লাস ও রুটিন</span>
          </button>

          {isClassIncharge && (
            <button
              onClick={() => setActiveTab('incharge')}
              className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'incharge'
                  ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>
                ইনচার্জ কমান্ড হাব (
                {pendingStudentLeaves.length > 0
                  ? `! ${pendingStudentLeaves.length}`
                  : 'সক্রিয়'}
                )
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>পরীক্ষা, মার্কস ও হল গার্ড ({invigilations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'leaves'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>ছুটি ও মার্কার রিকুইজিশন</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>বেতন স্লিপ ও ভাতা ক্লেইম ({salaryClaims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'notices'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>নোটিশ ও সার্কুলার ({notices.length})</span>
          </button>
        </div>
      </div>

      {/* ৬. ট্যাব ভিত্তিক বিস্তারিত কন্টেন্ট */}
      {activeTab === 'routine' && (
        <RoutineTabContent schedule={schedule} proxyClasses={proxyClasses} />
      )}

      {activeTab === 'incharge' && isClassIncharge && (
        <InchargeTabContent
          isClassIncharge={isClassIncharge}
          atRiskList={atRiskList}
          pendingStudentLeaves={pendingStudentLeaves}
          onRecommendStudentLeave={handleRecommendStudentLeave}
        />
      )}

      {activeTab === 'exams' && (
        <ExamsTabContent invigilations={invigilations} exams={exams} />
      )}

      {activeTab === 'leaves' && (
        <LeavesTabContent
          leaves={leaves}
          markers={markers}
          onOpenLeaveModal={() => setShowLeaveModal(true)}
          onOpenMarkerModal={() => setShowMarkerModal(true)}
          onAcknowledgeMarker={handleAcknowledgeMarker}
        />
      )}

      {activeTab === 'finance' && (
        <FinanceTabContent
          payrolls={payrolls}
          salaryClaims={salaryClaims}
          onOpenClaimModal={() => setShowClaimModal(true)}
        />
      )}

      {activeTab === 'notices' && (
        <NoticesTabContent notices={notices} />
      )}

      {/* ================= মডালসমূহ ================= */}
      <TeacherCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        currentTime={currentTime}
        checkInRemarks={checkInRemarks}
        setCheckInRemarks={setCheckInRemarks}
        onCheckIn={handleCheckIn}
        submitting={submitting}
      />

      <TeacherLeaveModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        leaveForm={leaveForm}
        setLeaveForm={setLeaveForm}
        colleagueTeachers={colleagueTeachers}
        onApplyLeave={handleApplyLeave}
        submitting={submitting}
      />

      <TeacherMarkerModal
        isOpen={showMarkerModal}
        onClose={() => setShowMarkerModal(false)}
        markerForm={markerForm}
        setMarkerForm={setMarkerForm}
        onRequestMarker={handleRequestMarker}
        submitting={submitting}
      />

      <TeacherClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        claimForm={claimForm}
        setClaimForm={setClaimForm}
        onSubmitClaim={handleSubmitClaim}
        submitting={submitting}
      />
    </div>
  );
};

export default TeacherDashboard;