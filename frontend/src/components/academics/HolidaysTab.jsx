import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademicHolidays } from '../../hooks/useAcademicHolidays';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from 'lucide-react';
import HolidayEffectNoteBanner from './holidays/HolidayEffectNoteBanner';
import HolidayCalendarView from './holidays/HolidayCalendarView';
import HolidayListView from './holidays/HolidayListView';
import HolidayCreateEditModal from './holidays/HolidayCreateEditModal';
import HolidayDeleteModal from './holidays/HolidayDeleteModal';

/**
 * HolidaysTab - ছুটির দিন ও একাডেমিক ক্যালেন্ডার
 * নীতি ব্যানার, ক্যালেন্ডার/লিস্ট মোড ও স্বয়ংক্রিয় হাজিরা লক ব্যবস্থাপনা।
 */
const HolidaysTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit =
    (isPrincipal || overrideRole === 'PRINCIPAL') &&
    overrideRole !== 'TEACHER' &&
    user?.role !== 'TEACHER';

  const {
    holidays,
    loading,
    calendarViewMode,
    setCalendarViewMode,
    currentCalendarDate,
    banglaMonths,
    banglaWeekdays,
    calendarDays,
    findHolidayForDate,
    handlePrevMonth,
    handleNextMonth,
    calculateDuration,
    createEditModalOpen,
    setCreateEditModalOpen,
    editingHoliday,
    setEditingHoliday,
    deleteModalOpen,
    setDeleteModalOpen,
    deletingHoliday,
    setDeletingHoliday,
    submitting,
    handleSaveHoliday,
    handleDeleteHoliday,
  } = useAcademicHolidays();

  const [dateForNewHoliday, setDateForNewHoliday] = useState(null);

  const handleOpenCreateModal = (specificDate = null) => {
    setEditingHoliday(null);
    setDateForNewHoliday(specificDate);
    setCreateEditModalOpen(true);
  };

  const handleOpenEditModal = (holiday) => {
    setEditingHoliday(holiday);
    setDateForNewHoliday(null);
    setCreateEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ১. হাজিরা স্বয়ংক্রিয় লক নীতি ব্যানার */}
      <HolidayEffectNoteBanner />

      {/* ২. কন্ট্রোল বার: ভিউ টগল ও নতুন ছুটি বাটন */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        {calendarViewMode === 'calendar' ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs transition min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                title="পূর্ববর্তী মাস"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs transition min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                title="পরবর্তী মাস"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-brand-navy">
                {banglaMonths[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </h3>
              <span className="text-xs text-slate-400 font-medium">মাসিক ক্যালেন্ডার ভিউ</span>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-black text-brand-navy">সকল ছুটির তালিকা</h3>
            <span className="text-xs text-slate-500 font-bold">
              মোট নির্ধারিত ছুটি: <strong className="text-brand-orange">{holidays.length} টি</strong>
            </span>
          </div>
        )}

        {/* ডানপাশ: ভিউ সুইচ ও নতুন ছুটি বাটন */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setCalendarViewMode('table')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition min-h-[40px] cursor-pointer ${
                calendarViewMode === 'table'
                  ? 'bg-[#0F2C59] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span>তালিকা ভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition min-h-[40px] cursor-pointer ${
                calendarViewMode === 'calendar'
                  ? 'bg-[#0F2C59] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>ক্যালেন্ডার ভিউ</span>
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition min-h-[44px] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন ছুটি নির্ধারণ</span>
            </button>
          )}
        </div>
      </div>

      {/* ৩. ভিউ অনুযায়ী ক্যালেন্ডার অথবা লিস্ট রেন্ডার */}
      {calendarViewMode === 'calendar' ? (
        <HolidayCalendarView
          calendarDays={calendarDays}
          banglaWeekdays={banglaWeekdays}
          findHolidayForDate={findHolidayForDate}
          canEdit={canEdit}
          onDateClick={handleOpenCreateModal}
        />
      ) : (
        <HolidayListView
          holidays={holidays}
          canEdit={canEdit}
          calculateDuration={calculateDuration}
          onEditHoliday={handleOpenEditModal}
          onDeleteHoliday={(h) => {
            setDeletingHoliday(h);
            setDeleteModalOpen(true);
          }}
        />
      )}

      {/* ৪. ছুটি তৈরি ও সম্পাদনা মডাল */}
      {canEdit && (
        <HolidayCreateEditModal
          isOpen={createEditModalOpen}
          onClose={() => {
            setCreateEditModalOpen(false);
            setEditingHoliday(null);
            setDateForNewHoliday(null);
          }}
          onSave={handleSaveHoliday}
          holiday={editingHoliday}
          initialDate={dateForNewHoliday}
          submitting={submitting}
        />
      )}

      {/* ৫. ছুটি ডিলিট কনফার্মেশন মডাল */}
      {canEdit && (
        <HolidayDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeletingHoliday(null);
          }}
          onConfirm={handleDeleteHoliday}
          holiday={deletingHoliday}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default HolidaysTab;