import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClassRoutine } from '../../hooks/useClassRoutine';
import { Settings, Printer, Plus, Layers } from 'lucide-react';
import RoutineWeeklyGrid from './routine/RoutineWeeklyGrid';
import RoutineMobileDayList from './routine/RoutineMobileDayList';
import RoutineSlotModal from './routine/RoutineSlotModal';
import RoutinePeriodConfigModal from './routine/RoutinePeriodConfigModal';

/**
 * RoutineTab - ক্লাস রুটিন টাইমটেবিল ও সাপ্তাহিক গ্রিড
 * সেকশনভিত্তিক সাপ্তাহিক গ্রিড, মোবাইল ডে-বাই-ডে চিপস এবং ব্যাকএন্ড কনফ্লিক্ট ফিডব্যাক।
 */
const RoutineTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit =
    (isPrincipal || overrideRole === 'PRINCIPAL') &&
    overrideRole !== 'TEACHER' &&
    user?.role !== 'TEACHER';

  const {
    sections,
    selectedSection,
    selectedSectionId,
    setSelectedSectionId,
    teachers,
    subjects,
    routines,
    loading,
    routineGender,
    setRoutineGender,
    activePeriods,
    selectedMobileDay,
    setSelectedMobileDay,
    slotModalOpen,
    setSlotModalOpen,
    editingSlot,
    setEditingSlot,
    periodConfigModalOpen,
    setPeriodConfigModalOpen,
    submitting,
    backendConflictError,
    setBackendConflictError,
    handleSaveSlot,
    handleDeleteSlot,
    handleSavePeriods,
    handleResetDefaultPeriods,
  } = useClassRoutine();

  const [activeSlotDay, setActiveSlotDay] = useState(1);
  const [activeSlotPeriod, setActiveSlotPeriod] = useState(null);

  const handleOpenAddSlot = (dayId, period) => {
    setEditingSlot(null);
    setActiveSlotDay(dayId);
    setActiveSlotPeriod(period);
    setBackendConflictError(null);
    setSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot) => {
    setEditingSlot(slot);
    setBackendConflictError(null);
    setSlotModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && sections.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ১. কন্ট্রোল ও সেকশন সিলেক্টর বার */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        {/* সেকশন নির্বাচন ও শিফট বাটন */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-orange" />
            <span className="text-xs font-bold text-slate-700">শাখা নির্বাচন:</span>
          </div>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black text-brand-navy focus:border-brand-orange focus:outline-none min-h-[42px]"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.section_name} ({sec.class_level_display || sec.class_level} - {sec.group_display || sec.group})
              </option>
            ))}
          </select>

          {/* শিফট সিলেক্টর */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRoutineGender('FEMALE')}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] cursor-pointer ${
                routineGender === 'FEMALE' ? 'bg-[#0F2C59] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ছাত্রী শিফট
            </button>
            <button
              type="button"
              onClick={() => setRoutineGender('MALE')}
              className={`px-3 py-1.5 rounded-lg transition min-h-[36px] cursor-pointer ${
                routineGender === 'MALE' ? 'bg-[#0F2C59] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ছাত্র শিফট
            </button>
          </div>
        </div>

        {/* ডানদিকের অ্যাকশনসমূহ */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => setPeriodConfigModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[42px] cursor-pointer"
              title="পিরিয়ড সময়সূচি পরিবর্তন"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="hidden sm:inline">পিরিয়ড সময়সূচি</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[42px] cursor-pointer"
            title="রুটিন প্রিন্ট করুন"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">প্রিন্ট</span>
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => handleOpenAddSlot(selectedMobileDay, activePeriods[0])}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover min-h-[42px] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>স্লট যোগ</span>
            </button>
          )}
        </div>
      </div>

      {/* ২. ডেস্কটপ সাপ্তাহিক গ্রিড ভিউ */}
      <RoutineWeeklyGrid
        periods={activePeriods}
        routines={routines}
        canEdit={canEdit}
        onAddSlot={handleOpenAddSlot}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={handleDeleteSlot}
      />

      {/* ৩. মোবাইল ডে-বাই-ডে তালিকা ভিউ */}
      <RoutineMobileDayList
        periods={activePeriods}
        routines={routines}
        selectedDay={selectedMobileDay}
        setSelectedDay={setSelectedMobileDay}
        canEdit={canEdit}
        onAddSlot={handleOpenAddSlot}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={handleDeleteSlot}
      />

      {/* ৪. স্লট তৈরি ও সম্পাদনা মডাল */}
      {canEdit && (
        <RoutineSlotModal
          isOpen={slotModalOpen}
          onClose={() => {
            setSlotModalOpen(false);
            setEditingSlot(null);
            setBackendConflictError(null);
          }}
          onSave={handleSaveSlot}
          slot={editingSlot}
          initialDay={activeSlotDay}
          initialPeriod={activeSlotPeriod}
          teachers={teachers}
          subjects={subjects}
          sectionName={selectedSection?.section_name}
          submitting={submitting}
          backendConflictError={backendConflictError}
          setBackendConflictError={setBackendConflictError}
        />
      )}

      {/* ৫. পিরিয়ড সময়সূচি কনফিগারেশন মডাল */}
      {canEdit && (
        <RoutinePeriodConfigModal
          isOpen={periodConfigModalOpen}
          onClose={() => setPeriodConfigModalOpen(false)}
          periods={activePeriods}
          routineGender={routineGender}
          onSave={handleSavePeriods}
          onReset={handleResetDefaultPeriods}
        />
      )}
    </div>
  );
};

export default RoutineTab;