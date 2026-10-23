import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCw,
} from 'lucide-react';
import useTeacherAttendanceMonitor from '../../../hooks/useTeacherAttendanceMonitor';
import TodayLiveAttendanceTab from './TodayLiveAttendanceTab';
import MonthlyAttendanceSummaryTab from './MonthlyAttendanceSummaryTab';
import TeacherDayAttendanceModal from './TeacherDayAttendanceModal';
import TeacherMonthlyDetailSheet from './TeacherMonthlyDetailSheet';
import PrincipalPageHero from '../PrincipalPageHero';

const TeacherAttendanceMonitorHub = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    activeTab,
    setActiveTab,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    todayKpi,
    filteredTodaySheet,
    monthlyTeachersData,
    monthlyLockState,
    loading,
    todayError,
    monthlyError,
    monthlyLoading,
    verifyingId,
    isApprovingMonth,
    handleVerifyDayAttendance,
    handleApproveMonth,
    refetchToday,
  } = useTeacherAttendanceMonitor();

  // মোডাল ও শীট স্টেট
  const [verifyRecord, setVerifyRecord] = useState(null);
  const [detailTeacher, setDetailTeacher] = useState(null);

  return (
    <div className="space-y-6">
      <PrincipalPageHero
        icon={CalendarCheck}
        eyebrow="শিক্ষক উপস্থিতি ও অনুমোদন"
        title="শিক্ষক হাজিরা ও মাসিক অনুমোদন"
        englishTitle="Attendance Monitor"
        description="শিক্ষকদের ডিজিটাল চেক-ইন মনিটরিং, বিলম্ব চিহ্নিতকরণ এবং মাস শেষে বেতনপূর্ব চূড়ান্ত অনুমোদন"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-white/90 backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /><span>লাইভ ৬০সে. অটো-রিফ্রেশ</span>
        </div>
        <button type="button" onClick={refetchToday} className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange">
          <RotateCw className="h-4 w-4" /><span>রিফ্রেশ</span>
        </button>
      </PrincipalPageHero>
      {/* কেপিআই সামারি স্ট্রিপ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_-12px_rgba(15,44,89,0.3)] motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">মোট শিক্ষক</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-brand-navy mt-1">{loading || todayError ? <span className="inline-block h-7 w-8 rounded-md bg-slate-100 motion-safe:animate-pulse" aria-label="লোড হচ্ছে" /> : todayKpi.total}</p>
        </div>

        <div className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_-12px_rgba(15,44,89,0.3)] motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600">মোট উপস্থিত</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{loading || todayError ? <span className="inline-block h-7 w-8 rounded-md bg-slate-100 motion-safe:animate-pulse" aria-label="লোড হচ্ছে" /> : todayKpi.present}</p>
        </div>

        <div className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_-12px_rgba(15,44,89,0.3)] motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-600">সময়ে উপস্থিত</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-teal-600 mt-1">{loading || todayError ? <span className="inline-block h-7 w-8 rounded-md bg-slate-100 motion-safe:animate-pulse" aria-label="লোড হচ্ছে" /> : todayKpi.onTime}</p>
        </div>

        <div className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_-12px_rgba(15,44,89,0.3)] motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600">বিলম্বিত (Late)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{loading || todayError ? <span className="inline-block h-7 w-8 rounded-md bg-slate-100 motion-safe:animate-pulse" aria-label="লোড হচ্ছে" /> : todayKpi.late}</p>
        </div>

        <div className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_-12px_rgba(15,44,89,0.3)] motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600">ছুটিতে</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-1">{loading || todayError ? <span className="inline-block h-7 w-8 rounded-md bg-slate-100 motion-safe:animate-pulse" aria-label="লোড হচ্ছে" /> : todayKpi.leave}</p>
        </div>

        <div className="group p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_16px_-12px_rgba(15,44,89,0.3)] motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none hover:border-slate-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600">অনুপস্থিত</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{loading || todayError ? <span className="inline-block h-7 w-8 rounded-md bg-slate-100 motion-safe:animate-pulse" aria-label="লোড হচ্ছে" /> : todayKpi.absent}</p>
        </div>
      </div>

      {/* মেইন ট্যাব বার */}
      <div role="tablist" aria-label="হাজিরা ভিউ নির্বাচন" className="flex w-full sm:w-fit items-center gap-1.5 p-1.5 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <button
          type="button"
          role="tab"
          id="attendance-today-tab"
          aria-selected={activeTab === 'today'}
          onClick={() => setActiveTab('today')}
          className={`min-h-[44px] px-4 sm:px-5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'today'
              ? 'bg-brand-navy text-white shadow-sm '
              : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2C59] '
          }`}
        >
          আজকের লাইভ শিট (Today Live)
        </button>

        <button
          type="button"
          role="tab"
          id="attendance-monthly-tab"
          aria-selected={activeTab === 'monthly'}
          onClick={() => setActiveTab('monthly')}
          className={`min-h-[44px] px-4 sm:px-5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'monthly'
              ? 'bg-brand-navy text-white shadow-sm '
              : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F2C59] '
          }`}
        >
          মাসিক ভিউ ও অনুমোদন (Monthly Approval)
        </button>
      </div>

      {/* ট্যাব কন্টেন্ট */}
      {activeTab === 'today' && (
        <TodayLiveAttendanceTab
          teachers={todayError ? [] : filteredTodaySheet}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          filterType={filterType}
          onFilterChange={setFilterType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={refetchToday}
          onOpenVerifyModal={(rec) => setVerifyRecord(rec)}
          loading={loading}
          error={todayError}
          totalTeachers={todayKpi.total}
        />
      )}

      {activeTab === 'monthly' && (
        <MonthlyAttendanceSummaryTab
          teachers={monthlyError || monthlyLoading ? [] : monthlyTeachersData}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          lockState={monthlyLockState}
          onApproveMonth={handleApproveMonth}
          isApproving={isApprovingMonth}
          loading={monthlyLoading}
          error={monthlyError}
          onRefresh={refetchToday}
          onSelectTeacherDetail={(t) => setDetailTeacher(t)}
        />
      )}

      {/* ডে ভেরিফিকেশন মডাল */}
      <TeacherDayAttendanceModal
        isOpen={!!verifyRecord}
        onClose={() => setVerifyRecord(null)}
        attendanceRecord={verifyRecord}
        onVerify={handleVerifyDayAttendance}
        loading={verifyingId !== null}
      />

      {/* মোবাইল বটম-শীট / বিস্তারিত দিনপঞ্জি */}
      <TeacherMonthlyDetailSheet
        isOpen={!!detailTeacher}
        onClose={() => setDetailTeacher(null)}
        teacher={detailTeacher}
        month={selectedMonth}
        year={selectedYear}
        onOpenVerifyModal={(rec) => {
          setDetailTeacher(null);
          setVerifyRecord(rec);
        }}
      />
    </div>
  );
};

export default TeacherAttendanceMonitorHub;




