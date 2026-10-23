import React, { useState, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  RotateCw, 
  ClipboardCheck, 
  BarChart3, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { useResultsManagement } from '../../hooks/useResultsManagement';

import MeritListTab from './tabs/MeritListTab';
import PreProcessingChecklistTab from './tabs/PreProcessingChecklistTab';
import SubjectAnalysisTab from './tabs/SubjectAnalysisTab';
import FailedStatisticsTab from './tabs/FailedStatisticsTab';
import ProcessResultsModal from './modals/ProcessResultsModal';

const TABS = [
  { id: 'merit', label: 'অফিশিয়াল মেধা তালিকা', icon: Award },
  { id: 'checklist', label: 'প্রাক-প্রসেসিং চেকলিস্ট', icon: ClipboardCheck },
  { id: 'analysis', label: 'বিষয়ভিত্তিক পাশের হার', icon: BarChart3 },
  { id: 'failed', label: 'অকৃতকার্য পরিসংখ্যান', icon: ShieldAlert },
];

/**
 * ResultManagementHub - আধুনিক ফলাফল, মেধা তালিকা ও অকৃতকার্য পরিসংখ্যান কেন্দ্র
 * আর্কিটেকচার: TanStack Query, Sliding-Pill Tabs, URL (?tab=) সিঙ্ক, মোবাইল ফার্স্ট।
 */
const ResultManagementHub = ({ 
  overrideRole = null, 
  defaultTab = 'merit' 
}) => {
  const { isPrincipal: authIsPrincipal } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || defaultTab;
  const [, startTransition] = useTransition();
  const [showProcessModal, setShowProcessModal] = useState(false);

  const handleTabChange = (tabId) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tabId);
        return next;
      });
    });
  };

  const {
    exams,
    selectedExamId,
    setSelectedExamId,
    selectedExam,
    isExamPublished,
    sections,
    selectedSectionId,
    setSelectedSectionId,
    selectedGroup,
    setSelectedGroup,
    failedGender,
    setFailedGender,
    meritList,
    analysisList,
    failedList,
    checklistAudit,
    loadingExams,
    loadingMerit,
    loadingAnalysis,
    loadingFailed,
    loadingChecklist,
    refetchAll,
    processResults,
    isProcessing,
    togglePublish,
    isTogglingPublish,
  } = useResultsManagement();

  const handleConfirmProcess = async () => {
    await processResults({
      examId: selectedExamId,
      sectionId: selectedSectionId || null,
    });
    setShowProcessModal(false);
  };

  const isGlobalLoading = loadingExams || loadingMerit || loadingAnalysis || loadingFailed || loadingChecklist;

  return (
    <div className="space-y-6 pb-12">
      {/* হেডার ও ট্যাব সুইচিং বার */}
      <div className="no-print relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 border rounded-2xl bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                ফলাফল, মেধা তালিকা ও মার্কশিট নিয়ন্ত্রণ কেন্দ্র
              </h1>
              <p className="mt-0.5 text-xs md:text-sm text-slate-300">
                বাংলাদেশ শিক্ষা বোর্ড স্ট্যান্ডার্ড GPA ৫.০০ স্কেল, মেধা অবস্থান ও প্রাক-প্রসেসিং অডিট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={refetchAll}
              disabled={isGlobalLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-slate-200"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isGlobalLoading ? 'animate-spin text-brand-orange' : ''}`} />
              রিফ্রেশ
            </button>

            {isPrincipal && (
              <button
                onClick={() => setShowProcessModal(true)}
                disabled={isProcessing || !selectedExamId}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>রেজাল্ট প্রসেস করুন</span>
              </button>
            )}
          </div>
        </div>

        {/* স্লাইডিং পিল ট্যাব বার */}
        <div className="flex items-center p-1.5 overflow-x-auto border rounded-2xl bg-slate-900/80 border-white/10 scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-brand-orange text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* প্যানেলসমূহ (ফর্ম ও সর্টিং স্টেট অক্ষুণ্ণ রাখতে মাউন্টেড রাখা হয়েছে) */}
      <div className={activeTab === 'merit' ? 'block' : 'hidden'} data-tab-panel="true">
        <MeritListTab
          exams={exams}
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          meritList={meritList}
          loading={loadingMerit}
          isPrincipal={isPrincipal}
          isExamPublished={isExamPublished}
          onTogglePublish={togglePublish}
          isTogglingPublish={isTogglingPublish}
          onProcessResults={processResults}
          isProcessing={isProcessing}
        />
      </div>

      <div className={activeTab === 'checklist' ? 'block' : 'hidden'} data-tab-panel="true">
        <PreProcessingChecklistTab
          exams={exams}
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          checklistAudit={checklistAudit}
          loading={loadingChecklist}
          onOpenProcessModal={() => setShowProcessModal(true)}
          isProcessing={isProcessing}
        />
      </div>

      <div className={activeTab === 'analysis' ? 'block' : 'hidden'} data-tab-panel="true">
        <SubjectAnalysisTab
          exams={exams}
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          analysisList={analysisList}
          loading={loadingAnalysis}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      </div>

      <div className={activeTab === 'failed' ? 'block' : 'hidden'} data-tab-panel="true">
        <FailedStatisticsTab
          exams={exams}
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          failedList={failedList}
          loading={loadingFailed}
          failedGender={failedGender}
          onSelectGender={setFailedGender}
        />
      </div>

      {/* রেজাল্ট প্রসেসিং টু-ফেজ কনফার্মেশন মডাল */}
      <ProcessResultsModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        onConfirm={handleConfirmProcess}
        exam={selectedExam}
        section={sections.find((s) => String(s.id) === String(selectedSectionId))}
        isProcessing={isProcessing}
        hasPendingChecklist={!checklistAudit.allCompleted && checklistAudit.pendingSubjectCount > 0}
        pendingCount={checklistAudit.pendingSubjectCount}
      />
    </div>
  );
};

export default ResultManagementHub;



