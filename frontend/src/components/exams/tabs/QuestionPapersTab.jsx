import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Search, 
  Upload, 
  Key, 
  UserCheck, 
  AlertCircle,
  Calendar,
  Users
} from 'lucide-react';
import QuestionPaperReviewModal from '../modals/QuestionPaperReviewModal';

const QuestionPapersTab = ({
  questionPapers = [],
  submissionTracking = {},
  selectedExam = null,
  loading = false,
  isPrincipal = false,
  isTeacher = false,
  onReviewPaper,
  isReviewing = false,
  onUploadPaper, // শিক্ষক কর্তৃক আপলোড
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [reviewModalData, setReviewModalData] = useState({
    isOpen: false,
    paper: null,
    actionType: 'APPROVE',
  });

  // শিক্ষক আপলোড ফর্ম স্টেট (যদি টিচার লগইন থাকে)
  const [showUploadModal, setShowUploadModal] = useState(false);

  const togglePasswordReveal = (id) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPapers = questionPapers.filter((qp) => {
    const matchesSearch =
      qp.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qp.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || qp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (paper, actionType) => {
    setReviewModalData({
      isOpen: true,
      paper,
      actionType,
    });
  };

  const handleConfirmReview = async ({ id, status, feedback }) => {
    await onReviewPaper({ id, status, feedback });
    setReviewModalData({ isOpen: false, paper: null, actionType: 'APPROVE' });
  };

  const {
    totalSubjects = 0,
    submittedCount = 0,
    pendingCount = 0,
    unsubmittedItems = [],
    submissionRate = 0,
    isOverdue = false,
    daysRemaining = null,
  } = submissionTracking;

  return (
    <div className="space-y-6">
      {/* ১. স্পেসিফিকেশন ৫: ১০০% ব্যাকএন্ড ডেটা থেকে ডেডলাইন ও যেসব শিক্ষক জমা দেননি */}
      {selectedExam && (
        <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 font-bold rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-brand-orange shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  প্রশ্নপত্র জমার অগ্রগতি ও ডেডলাইন ট্র্যাকিং
                </h3>
                <p className="text-xs text-slate-500">
                  পরীক্ষা: <strong>{selectedExam.name}</strong> | জমার শেষ সময়: <strong>{selectedExam.start_date || 'N/A'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isOverdue
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : daysRemaining !== null
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isOverdue
                  ? `⚠️ ডেডলাইন অতিক্রান্ত (${Math.abs(daysRemaining)} দিন পূর্বে)`
                  : daysRemaining !== null
                  ? `⏳ ${daysRemaining} দিন বাকি`
                  : 'সময়সীমা নির্ধারিত নেই'}
              </span>

              <span className="px-3 py-1 font-bold text-xs rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                গৃহীত: {submittedCount}/{totalSubjects} ({submissionRate}%)
              </span>
            </div>
          </div>

          {/* প্রগ্রেস বার */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>অনুমোদন সম্পন্ন হয়েছে:</span>
              <span className="font-mono">{submissionRate}%</span>
            </div>
            <div className="w-full h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                style={{ width: `${submissionRate}%` }}
              />
            </div>
          </div>

          {/* যেসব বিষয় বা শিক্ষক এখনো জমা দেননি */}
          {unsubmittedItems.length > 0 ? (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  অপেক্ষমাণ বা জমাহীন বিষয় ও সংশ্লিষ্ট শিক্ষক ({unsubmittedItems.length} টি)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-56 overflow-auto p-1">
                {unsubmittedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.subjectName} ({item.subjectCode})
                      </h5>
                      <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                        {item.teacherName}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'NOT_SUBMITTED'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : item.status === 'REVISION'
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {item.statusLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              এই পরীক্ষার সকল বিষয়ের প্রশ্নপত্র সফলভাবে অনুমোদিত হয়েছে!
            </div>
          )}
        </div>
      )}

      {/* ২. স্পেসিফিকেশন ৪: জমাকৃত প্রশ্নপত্র তালিকা ও প্রিন্সিপাল রিভিউ */}
      <div className="p-5 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        {/* ফিল্টার ও সার্চ বার */}
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="absolute w-4 h-4 text-slate-400 left-3 top-2.5" />
              <input
                type="text"
                placeholder="বিষয় বা শিক্ষকের নাম..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL', label: 'সকল' },
                { id: 'SUBMITTED', label: 'অনুমোদনের অপেক্ষায়' },
                { id: 'ACCEPTED', label: 'গৃহীত' },
                { id: 'REVISION', label: 'সংশোধন প্রয়োজন' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === tab.id
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-md shrink-0"
            >
              <Upload className="w-4 h-4" /> প্রশ্নপত্র জমা দিন
            </button>
          )}
        </div>

        {/* স্কেলিটন বা লোডিং */}
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="w-full h-10 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-12 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="w-full h-12 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              কোনো প্রশ্নপত্র জমা পাওয়া যায়নি
            </h4>
            <p className="text-xs text-slate-400">
              শিক্ষক কর্তৃক প্রশ্নপত্র আপলোড হলে এখানে দৃশ্যমান হবে।
            </p>
          </div>
        ) : (
          <>
            {/* ডেসকটপ টেবিল ভিউ (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 uppercase font-bold bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">বিষয় ও পরীক্ষা</th>
                    <th className="py-3.5 px-3">শিক্ষক</th>
                    <th className="py-3.5 px-3">জমার তারিখ</th>
                    <th className="py-3.5 px-3">পাসওয়ার্ড হিন্ট</th>
                    <th className="py-3.5 px-3">প্রশ্নপত্র ফাইল</th>
                    <th className="py-3.5 px-3">স্ট্যাটাস</th>
                    {isPrincipal && <th className="py-3.5 px-4 text-right">রিভিউ অ্যাকশন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {filteredPapers.map((qp) => {
                    const isRevealed = !!revealedPasswords[qp.id];
                    const isAccepted = qp.status === 'ACCEPTED';
                    const isRevision = qp.status === 'REVISION';

                    return (
                      <tr key={qp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {qp.subject_name || 'বিষয়'}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {qp.exam_name || selectedExam?.name || 'পরীক্ষা'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {qp.teacher_name || 'শিক্ষক'}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-slate-500">
                          {qp.created_at ? new Date(qp.created_at).toLocaleDateString('bn-BD') : 'N/A'}
                        </td>

                        <td className="py-3.5 px-3">
                          {qp.file_password_hint ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-brand-orange">
                                {isRevealed ? qp.file_password_hint : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordReveal(qp.id)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                                title="পাসওয়ার্ড দেখুন"
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">নেই</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {qp.question_file ? (
                            <a
                              href={qp.question_file}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:underline font-bold"
                            >
                              <Download className="w-3.5 h-3.5" /> ডাউনলোড <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">ফাইল নেই</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-600'
                              : isRevision
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}>
                            {isAccepted ? 'গৃহীত' : isRevision ? 'সংশোধন আবশ্যক' : 'অপেক্ষমাণ'}
                          </span>
                          {qp.principal_remarks && (
                            <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]" title={qp.principal_remarks}>
                              নোট: {qp.principal_remarks}
                            </span>
                          )}
                        </td>

                        {isPrincipal && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isAccepted && (
                                <button
                                  onClick={() => handleOpenReview(qp, 'APPROVE')}
                                  disabled={isReviewing}
                                  className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                                >
                                  অনুমোদন
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenReview(qp, 'REQUEST_CHANGES')}
                                disabled={isReviewing}
                                className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
                              >
                                সংশোধন
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

            {/* মোবাইল কার্ড ভিউ (< 768px) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredPapers.map((qp) => {
                const isAccepted = qp.status === 'ACCEPTED';
                const isRevision = qp.status === 'REVISION';

                return (
                  <div
                    key={qp.id}
                    className="p-4 border rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {qp.subject_name || 'বিষয়'}
                        </h4>
                        <span className="text-[11px] text-slate-500">শিক্ষক: {qp.teacher_name}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isAccepted
                          ? 'bg-emerald-50 text-emerald-600'
                          : isRevision
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {isAccepted ? 'গৃহীত' : isRevision ? 'সংশোধন আবশ্যক' : 'অপেক্ষমাণ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      {qp.question_file ? (
                        <a
                          href={qp.question_file}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-600"
                        >
                          <Download className="w-3.5 h-3.5" /> ফাইল ডাউনলোড
                        </a>
                      ) : (
                        <span className="text-slate-400">ফাইল নেই</span>
                      )}

                      {qp.file_password_hint && (
                        <span className="font-mono text-xs text-brand-orange font-bold">
                          পাসওয়ার্ড: {qp.file_password_hint}
                        </span>
                      )}
                    </div>

                    {isPrincipal && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {!isAccepted && (
                          <button
                            onClick={() => handleOpenReview(qp, 'APPROVE')}
                            className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg"
                          >
                            অনুমোদন
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenReview(qp, 'REQUEST_CHANGES')}
                          className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg"
                        >
                          সংশোধন অনুরোধ
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* প্রশ্নপত্র অনুমোদন বা সংশোধন অনুরোধ মডাল */}
      <QuestionPaperReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={() => setReviewModalData({ isOpen: false, paper: null, actionType: 'APPROVE' })}
        paper={reviewModalData.paper}
        actionType={reviewModalData.actionType}
        onConfirm={handleConfirmReview}
        isSubmitting={isReviewing}
      />
    </div>
  );
};

export default QuestionPapersTab;
