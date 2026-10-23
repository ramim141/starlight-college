import React, { useState } from 'react';
import { 
  Percent, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Layers, 
  Info,
  Clock
} from 'lucide-react';
import ExamSubjectConfigModal from '../modals/ExamSubjectConfigModal';

const SubjectConfigTab = ({
  exams = [],
  selectedExamId = '',
  onSelectExam,
  configs = [],
  subjects = [],
  loading = false,
  isPrincipal = false,
  onCreateConfig,
  onUpdateConfig,
  onDeleteConfig,
  isCreating = false,
  isUpdating = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkRows, setBulkRows] = useState({});
  const [savingBulk, setSavingBulk] = useState(false);

  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));

  const handleOpenCreate = () => {
    setEditingConfig(null);
    setShowModal(true);
  };

  const handleOpenEdit = (cfg) => {
    setEditingConfig(cfg);
    setShowModal(true);
  };

  const handleSaveModal = async (formData) => {
    if (editingConfig) {
      await onUpdateConfig({
        id: editingConfig.id,
        payload: {
          full_marks: formData.full_marks,
          cq_full_marks: formData.cq_full_marks,
          mcq_full_marks: formData.mcq_full_marks,
          practical_full_marks: formData.practical_full_marks,
          tutorial_full_marks: formData.tutorial_full_marks,
          pass_marks: formData.pass_marks,
        },
      });
    } else {
      await onCreateConfig({
        ...formData,
        exam: selectedExamId,
      });
    }
    setShowModal(false);
    setEditingConfig(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmConfig) {
      await onDeleteConfig(deleteConfirmConfig.id);
      setDeleteConfirmConfig(null);
    }
  };

  // বাল্ক এডিট মোড শুরু করা
  const toggleBulkEdit = () => {
    if (!bulkEditMode) {
      const initial = {};
      configs.forEach((c) => {
        initial[c.id] = {
          full_marks: Number(c.full_marks) || 100,
          cq_full_marks: Number(c.cq_full_marks) || 0,
          mcq_full_marks: Number(c.mcq_full_marks) || 0,
          practical_full_marks: Number(c.practical_full_marks) || 0,
          tutorial_full_marks: Number(c.tutorial_full_marks) || 20,
          pass_marks: Number(c.pass_marks) || 33,
        };
      });
      setBulkRows(initial);
      setBulkEditMode(true);
    } else {
      setBulkEditMode(false);
    }
  };

  const handleBulkInputChange = (id, field, value) => {
    setBulkRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: Number(value) || 0,
      },
    }));
  };

  const handleSaveBulk = async () => {
    setSavingBulk(true);
    try {
      for (const cfg of configs) {
        const row = bulkRows[cfg.id];
        if (row) {
          await onUpdateConfig({ id: cfg.id, payload: row });
        }
      }
      setBulkEditMode(false);
    } finally {
      setSavingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* টপ সিলেক্টর ও কন্ট্রোল বার */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center md:justify-between dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            পরীক্ষা নির্বাচন:
          </label>
          <select
            value={selectedExamId}
            onChange={(e) => onSelectExam(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.session} - {e.class_level_display || e.class_level})
              </option>
            ))}
          </select>

          {selectedExam && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-brand-orange border border-amber-200/50">
              মোট বিষয়: {configs.length} টি
            </span>
          )}
        </div>

        {isPrincipal && (
          <div className="flex items-center gap-2">
            {configs.length > 0 && (
              <button
                onClick={bulkEditMode ? handleSaveBulk : toggleBulkEdit}
                disabled={savingBulk || isUpdating}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                  bulkEditMode
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                {bulkEditMode ? (
                  <>
                    <Save className="w-4 h-4" />
                    {savingBulk ? 'সংরক্ষণ হচ্ছে...' : 'বাল্ক পরিবর্তন সেভ করুন'}
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" /> বাল্ক এডিট মোড
                  </>
                )}
              </button>
            )}

            {bulkEditMode && (
              <button
                onClick={() => setBulkEditMode(false)}
                className="px-3 py-2 text-xs font-semibold border rounded-xl text-slate-500 hover:bg-slate-100"
              >
                বাতিল
              </button>
            )}

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" /> নতুন বিষয় নম্বর কনফিগ
            </button>
          </div>
        )}
      </div>

      {/* পরীক্ষা সূচি নোট */}
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 text-blue-800 dark:text-blue-300 text-xs">
        <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          <strong>৮০-২০ রূপান্তর নিয়ম:</strong> সেমিস্টার পরীক্ষায় CQ + MCQ + ব্যবহারিক মিলিয়ে ১০০ নম্বর গণনা করা হবে এবং সিস্টেম স্বয়ংক্রিয়ভাবে তা ৮০%-এ রূপান্তর করে ২০ নম্বরের টিউটোরিয়াল যোগ করবে।
        </span>
      </div>

      {/* কনটেন্ট এরিয়া: স্কেলিটন বা লোডিং */}
      {loading ? (
        <div className="p-8 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
          <div className="w-full h-8 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-full h-12 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="w-full h-12 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="w-full h-12 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : configs.length === 0 ? (
        /* খালি অবস্থা */
        <div className="py-16 text-center bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-brand-orange">
            <Percent className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            এই পরীক্ষার জন্য কোনো বিষয় কনফিগার করা হয়নি
          </h3>
          <p className="max-w-md mx-auto text-xs text-slate-500">
            উপরের "নতুন বিষয় নম্বর কনফিগ" বাটনে ক্লিক করে পাঠ্য বিষয় ও তাদের পূর্ণমান বণ্টন সেট করুন।
          </p>
        </div>
      ) : (
        <>
          {/* ডেসকটপ টেবিল ভিউ (>= 768px) */}
          <div className="hidden md:block overflow-hidden bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 uppercase font-bold bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">পাঠ্য বিষয়</th>
                    <th className="py-3.5 px-3">মোট পূর্ণমান</th>
                    <th className="py-3.5 px-3">CQ (পূর্ণমান)</th>
                    <th className="py-3.5 px-3">MCQ (পূর্ণমান)</th>
                    <th className="py-3.5 px-3">ব্যবহারিক</th>
                    <th className="py-3.5 px-3">টিউটোরিয়াল (২০%)</th>
                    <th className="py-3.5 px-3">পাস নম্বর</th>
                    <th className="py-3.5 px-3">বিভাজন স্ট্যাটাস</th>
                    {isPrincipal && <th className="py-3.5 px-4 text-right">অ্যাকশন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {configs.map((c) => {
                    const rowData = bulkEditMode ? bulkRows[c.id] || c : c;
                    const cq = Number(rowData.cq_full_marks) || 0;
                    const mcq = Number(rowData.mcq_full_marks) || 0;
                    const pr = Number(rowData.practical_full_marks) || 0;
                    const full = Number(rowData.full_marks) || 100;
                    const writtenSum = cq + mcq + pr;
                    const isValid = writtenSum === full;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {c.subject_name || 'বিষয়'}
                          </span>
                          <span className="block text-[11px] text-slate-400 font-mono">
                            কোড: {c.subject_code || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold">
                          {bulkEditMode ? (
                            <input
                              type="number"
                              value={rowData.full_marks}
                              onChange={(e) => handleBulkInputChange(c.id, 'full_marks', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                            />
                          ) : (
                            <span>{c.full_marks}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          {bulkEditMode ? (
                            <input
                              type="number"
                              value={rowData.cq_full_marks}
                              onChange={(e) => handleBulkInputChange(c.id, 'cq_full_marks', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                            />
                          ) : (
                            <span>{c.cq_full_marks}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          {bulkEditMode ? (
                            <input
                              type="number"
                              value={rowData.mcq_full_marks}
                              onChange={(e) => handleBulkInputChange(c.id, 'mcq_full_marks', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                            />
                          ) : (
                            <span>{c.mcq_full_marks}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          {bulkEditMode ? (
                            <input
                              type="number"
                              value={rowData.practical_full_marks}
                              onChange={(e) => handleBulkInputChange(c.id, 'practical_full_marks', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                            />
                          ) : (
                            <span>{c.practical_full_marks}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-brand-orange font-bold">
                          {bulkEditMode ? (
                            <input
                              type="number"
                              value={rowData.tutorial_full_marks}
                              onChange={(e) => handleBulkInputChange(c.id, 'tutorial_full_marks', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono font-bold text-brand-orange"
                            />
                          ) : (
                            <span>{c.tutorial_full_marks}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          {bulkEditMode ? (
                            <input
                              type="number"
                              value={rowData.pass_marks}
                              onChange={(e) => handleBulkInputChange(c.id, 'pass_marks', e.target.value)}
                              className="w-16 px-2 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 font-mono"
                            />
                          ) : (
                            <span>{c.pass_marks}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isValid
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 border border-rose-200'
                          }`}>
                            {isValid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> সঠিক ({writtenSum})
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" /> অমিল ({writtenSum}/{full})
                              </>
                            )}
                          </span>
                        </td>

                        {isPrincipal && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="সম্পাদনা"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmConfig(c)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* মোবাইল কার্ড ভিউ (< 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {configs.map((c) => {
              const cq = Number(c.cq_full_marks) || 0;
              const mcq = Number(c.mcq_full_marks) || 0;
              const pr = Number(c.practical_full_marks) || 0;
              const full = Number(c.full_marks) || 100;
              const writtenSum = cq + mcq + pr;
              const isValid = writtenSum === full;

              return (
                <div
                  key={c.id}
                  className="p-5 bg-white border dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 shadow-soft space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {c.subject_name || 'বিষয়'}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">কোড: {c.subject_code}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      পূর্ণমান: {c.full_marks}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">CQ পূর্ণমান</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{c.cq_full_marks}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">MCQ পূর্ণমান</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{c.mcq_full_marks}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">ব্যবহারিক পূর্ণমান</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{c.practical_full_marks}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="block text-[10px] text-slate-400">টিউটোরিয়াল (২০%)</span>
                      <span className="font-bold text-brand-orange font-mono">{c.tutorial_full_marks}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 font-medium">পাস নম্বর: <strong>{c.pass_marks}</strong></span>
                    {isPrincipal && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 dark:bg-slate-800 hover:text-brand-orange"
                        >
                          সম্পাদনা
                        </button>
                        <button
                          onClick={() => setDeleteConfirmConfig(c)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100"
                        >
                          মুছুন
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ক্রিয়েট / এডিট মডাল */}
      <ExamSubjectConfigModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSaveModal}
        subjects={subjects}
        initialData={editingConfig}
        isSubmitting={isCreating || isUpdating}
      />

      {/* ডিলিট কনফার্মেশন মডাল */}
      {deleteConfirmConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                বিষয় কনফিগারেশন মুছতে চান?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                "{deleteConfirmConfig.subject_name}" এর নম্বর বিভাজন মুছে ফেলা হবে।
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmConfig(null)}
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
    </div>
  );
};

export default SubjectConfigTab;
