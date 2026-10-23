import React, { useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  RotateCw, 
  Layers, 
  Percent, 
  Building2, 
  FileText 
} from 'lucide-react';
import { useExamManagement } from '../../hooks/useExamManagement';
import { useQuestionPaperReview } from '../../hooks/useQuestionPaperReview';

import ExamsTab from './tabs/ExamsTab';
import SubjectConfigTab from './tabs/SubjectConfigTab';
import ExamRoomsTab from './tabs/ExamRoomsTab';
import QuestionPapersTab from './tabs/QuestionPapersTab';

const TABS = [
  { id: 'exams', label: 'পরীক্ষা তালিকা', icon: Award },
  { id: 'configs', label: '৮০-২০ নম্বর বণ্টন', icon: Percent },
  { id: 'rooms', label: 'পরীক্ষা হল ও সিট', icon: Building2 },
  { id: 'questions', label: 'প্রশ্নপত্র মহাফেজখানা', icon: FileText },
];

/**
 * ExamControlHub - আধুনিক পরীক্ষা, নম্বর বিভাজন ও প্রশ্নপত্র নিয়ন্ত্রণ কেন্দ্র
 * আর্কিটেকচার: TanStack Query, Sliding-Pill Tabs, URL (?tab=) সিঙ্ক, মোবাইল ফার্স্ট।
 */
const ExamControlHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isTeacher: authIsTeacher } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'exams';
  const [, startTransition] = useTransition();

  const handleTabChange = (tabId) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tabId);
        return next;
      });
    });
  };

  // ১. পরীক্ষা, নম্বর বণ্টন ও রুম ম্যানেজমেন্ট হুক
  const {
    exams,
    selectedExamId,
    setSelectedExamId,
    selectedExam,
    subjects,
    configs,
    rooms,
    loadingExams,
    loadingConfigs,
    loadingRooms,
    refetchExams,
    refetchConfigs,
    refetchRooms,
    createExam,
    updateExam,
    deleteExam,
    processResults,
    isProcessingResults,
    togglePublish,
    isTogglingPublish,
    createConfig,
    updateConfig,
    deleteConfig,
    isCreatingConfig,
    isUpdatingConfig,
    createRoom,
    updateRoom,
    deleteRoom,
    isCreatingRoom,
    isUpdatingRoom,
  } = useExamManagement();

  // ২. প্রশ্নপত্র রিভিউ ও ডেডলাইন ট্র্যাকিং হুক
  const {
    questionPapers,
    loadingQuestions,
    refetchQuestions,
    reviewPaper,
    isReviewing,
    submissionTracking,
  } = useQuestionPaperReview(selectedExam, configs);

  const handleRefreshAll = () => {
    refetchExams();
    refetchConfigs();
    refetchRooms();
    refetchQuestions();
  };

  const isGlobalLoading = loadingExams || loadingConfigs || loadingRooms || loadingQuestions;

  return (
    <div className="space-y-6 pb-12">
      {/* হেডার ও ট্যাব সুইচিং বার */}
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 border rounded-2xl bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
                পরীক্ষা ও প্রশ্নপত্র নিয়ন্ত্রণ কেন্দ্র
              </h1>
              <p className="mt-0.5 text-xs md:text-sm text-slate-300">
                পরীক্ষা সূচি, ৮০-২০ রূপান্তর কাঠামো, পরীক্ষা কক্ষ ও প্রশ্নপত্র মহাফেজখানা
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshAll}
            disabled={isGlobalLoading}
            className="flex items-center self-start sm:self-auto gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-slate-200"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGlobalLoading ? 'animate-spin text-brand-orange' : ''}`} />
            রিফ্রেশ
          </button>
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

      {/* প্যানেলসমূহ (ফর্ম ও স্টেট ধরে রাখার জন্য মাউন্টেড রাখা হয়েছে) */}
      <div className={activeTab === 'exams' ? 'block' : 'hidden'} data-tab-panel="true">
        <ExamsTab
          exams={exams}
          loading={loadingExams}
          isPrincipal={isPrincipal}
          onCreateExam={createExam}
          onUpdateExam={updateExam}
          onDeleteExam={deleteExam}
          onProcessResults={processResults}
          onTogglePublish={togglePublish}
          isProcessingResults={isProcessingResults}
          isTogglingPublish={isTogglingPublish}
        />
      </div>

      <div className={activeTab === 'configs' ? 'block' : 'hidden'} data-tab-panel="true">
        <SubjectConfigTab
          exams={exams}
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          configs={configs}
          subjects={subjects}
          loading={loadingConfigs}
          isPrincipal={isPrincipal}
          onCreateConfig={createConfig}
          onUpdateConfig={updateConfig}
          onDeleteConfig={deleteConfig}
          isCreating={isCreatingConfig}
          isUpdating={isUpdatingConfig}
        />
      </div>

      <div className={activeTab === 'rooms' ? 'block' : 'hidden'} data-tab-panel="true">
        <ExamRoomsTab
          rooms={rooms}
          loading={loadingRooms}
          isPrincipal={isPrincipal}
          onCreateRoom={createRoom}
          onUpdateRoom={updateRoom}
          onDeleteRoom={deleteRoom}
          isCreating={isCreatingRoom}
          isUpdating={isUpdatingRoom}
        />
      </div>

      <div className={activeTab === 'questions' ? 'block' : 'hidden'} data-tab-panel="true">
        <QuestionPapersTab
          questionPapers={questionPapers}
          submissionTracking={submissionTracking}
          selectedExam={selectedExam}
          loading={loadingQuestions}
          isPrincipal={isPrincipal}
          isTeacher={isTeacher}
          onReviewPaper={reviewPaper}
          isReviewing={isReviewing}
        />
      </div>
    </div>
  );
};

export default ExamControlHub;



