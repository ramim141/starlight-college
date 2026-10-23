import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  CheckCircle, 
  Clock, 
  ArrowRightCircle, 
  RotateCcw,
  Sparkles,
  Share2
} from 'lucide-react';
import ExamFormModal from '../modals/ExamFormModal';
import { getExamLifecycleInfo } from '../../../hooks/useExamManagement';

const ExamsTab = ({
  exams = [],
  loading = false,
  isPrincipal = false,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
  onProcessResults,
  onTogglePublish,
  isProcessingResults = false,
  isTogglingPublish = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState(null);
  const [processConfirmExam, setProcessConfirmExam] = useState(null);

  // ফিল্টারিং
  const filteredExams = exams.filter((ex) => {
    const matchesSearch =
      ex.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.session?.includes(searchTerm);
    const matchesClass = filterClass === 'ALL' || ex.class_level === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleOpenCreate = () => {
    setEditingExam(null);
    setShowModal(true);
  };

  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  const handleSaveExam = async (formData) => {
    if (editingExam) {
      await onUpdateExam({ id: editingExam.id, payload: formData });
    } else {
      await onCreateExam(formData);
    }
    setShowModal(false);
    setEditingExam(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmExam) {
      await onDeleteExam(deleteConfirmExam.id);
      setDeleteConfirmExam(null);
    }
  };

  const handleProcessConfirm = async () => {
    if (processConfirmExam) {
      await onProcessResults(processConfirmExam.id);
      setProcessConfirmExam(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* অ্যাকশন ও ফিল্টার বার */}
      <div className="flex flex-col gap-3 p-4 bg-white border sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute w-4 h-4 text-slate-400 left-3 top-2.5" />
            <input
              type="text"
              placeholder="পরীক্ষার নাম বা সেশন খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value="ALL">সকল শ্রেণি</option>
            <option value="XI">একাদশ শ্রেণি (XI)</option>
            <option value="XII">দ্বাদশ শ্রেণি (XII)</option>
          </select>
        </div>

        {isPrincipal && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> নতুন পরীক্ষা তৈরি
          </button>
        )}
      </div>

      {/* স্কেলিটন বা লোডিং অবস্থা */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="w-20 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="w-16 h-5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-3/4 h-6 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-1/2 h-4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="w-full h-10 pt-3 border-t border-slate-100 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        /* খালি তালিকা অবস্থা */
        <div className="py-16 text-center bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-brand-orange">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            কোনো পরীক্ষা পাওয়া যায়নি
          </h3>
          <p className="max-w-md mx-auto text-xs text-slate-500">
            {searchTerm || filterClass !== 'ALL'
              ? 'আপনার ফিল্টারের সাথে মিলে এমন কোনো পরীক্ষা নেই।'
              : 'নতুন শিক্ষাবর্ষের পরীক্ষা সূচি তৈরি করতে "নতুন পরীক্ষা তৈরি" বাটনে ক্লিক করুন।'}
          </p>
        </div>
      ) : (
        /* পরীক্ষা কার্ড গ্রিড */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((ex) => {
            const lifecycle = getExamLifecycleInfo(ex);

            return (
              <div
                key={ex.id}
                className="relative flex flex-col justify-between p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-md transition-all group"
              >
                <div>
                  {/* টপ মেটা বার */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-brand-orange border border-amber-200/40">
                      সেশন {ex.session}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${lifecycle.badgeClass}`}>
                      {lifecycle.label}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                    {ex.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ex.exam_type_display || ex.exam_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
                      {ex.class_level_display || `শ্রেণি ${ex.class_level}`}
                    </span>
                    {ex.has_tutorial_conversion && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
                        ৮০%+২০%
                      </span>
                    )}
                  </div>

                  {/* তারিখ ও সময়সূচি */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span>{ex.start_date || 'N/A'} হতে {ex.end_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* প্রিন্সিপাল অ্যাকশন ও লাইফসাইকেল ট্রানজিশন বাটন */}
                {isPrincipal && (
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEdit(ex)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> সম্পাদনা
                      </button>

                      <button
                        onClick={() => setDeleteConfirmExam(ex)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> মুছুন
                      </button>
                    </div>

                    {/* লাইফসাইকেল ট্রানজিশন বাটন */}
                    <div className="flex items-center gap-2 pt-1">
                      {lifecycle.allowedTransitions.includes('PROCESS_RESULTS') && (
                        <button
                          onClick={() => setProcessConfirmExam(ex)}
                          disabled={isProcessingResults}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-bold rounded-xl"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> ফলাফল প্রসেস করুন
                        </button>
                      )}

                      {lifecycle.allowedTransitions.includes('PUBLISH') && (
                        <button
                          onClick={() => onTogglePublish({ id: ex.id, isPublished: true })}
                          disabled={isTogglingPublish}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> ফলাফল প্রকাশ করুন
                        </button>
                      )}

                      {lifecycle.allowedTransitions.includes('UNPUBLISH') && (
                        <button
                          onClick={() => onTogglePublish({ id: ex.id, isPublished: false })}
                          disabled={isTogglingPublish}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-bold rounded-xl"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> ফলাফল প্রত্যাহার (Unpublish)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ক্রিয়েট / এডিট মডাল */}
      <ExamFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSaveExam}
        initialData={editingExam}
      />

      {/* ডিলিট কনফার্মেশন টু-ফেজ মডাল */}
      {deleteConfirmExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                পরীক্ষা মুছে ফেলতে নিশ্চিত?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                "{deleteConfirmExam.name}" মুছে ফেলা হলে এর সাথে সংশ্লিষ্ট সকল কনফিগারেশন প্রভাবিত হতে পারে।
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmExam(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ফলাফল প্রসেস কনফার্মেশন মডাল */}
      {processConfirmExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                পরীক্ষার ফলাফল তৈরি ও প্রসেস করুন
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                "{processConfirmExam.name}" এর সকল শাখার শিক্ষার্থীদের প্রাপ্ত নম্বর, ৮০-২০ রূপান্তর ও ডিজিটাল উপস্থিতি মিলিয়ে মেধা তালিকা ও ফলাফল জেনারেট করা হবে।
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setProcessConfirmExam(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleProcessConfirm}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                প্রসেস শুরু করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsTab;
