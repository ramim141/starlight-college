import React from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  CreditCard, 
  Sparkles, 
  RotateCw,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const PreProcessingChecklistTab = ({
  exams = [],
  selectedExamId = '',
  onSelectExam,
  sections = [],
  selectedSectionId = '',
  onSelectSection,
  checklistAudit = {},
  loading = false,
  onOpenProcessModal,
  isProcessing = false,
}) => {
  const {
    marksAudit = [],
    feeDueStudents = [],
    totalConfigured = 0,
    allCompleted = false,
    pendingSubjectCount = 0,
  } = checklistAudit;

  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));
  const selectedSection = sections.find((s) => String(s.id) === String(selectedSectionId));

  return (
    <div className="space-y-6">
      {/* ফিল্টার ও সিলেক্টর বার */}
      <div className="flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center md:justify-between dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">পরীক্ষা:</label>
            <select
              value={selectedExamId}
              onChange={(e) => onSelectExam(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.session})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">শাখা:</label>
            <select
              value={selectedSectionId}
              onChange={(e) => onSelectSection(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="">শাখা নির্বাচন করুন</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.section_name} ({s.class_level_display || s.class_level} - {s.group_display || s.group})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSectionId && (
          <button
            onClick={onOpenProcessModal}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>ফলাফল প্রসেস করুন</span>
          </button>
        )}
      </div>

      {!selectedSectionId ? (
        <div className="p-12 text-center bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 space-y-3">
          <ClipboardCheck className="w-12 h-12 mx-auto text-brand-orange/60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            শাখা নির্বাচন করুন
          </h3>
          <p className="max-w-md mx-auto text-xs text-slate-500">
            নম্বর এন্ট্রি সমাপ্তি, কো-কারিকুলার কার্যক্রম ও বকেয়া ফি অডিট দেখতে উপরের ড্রপডাউন থেকে নির্দিষ্ট শাখা নির্বাচন করুন।
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="w-1/2 h-5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-3/4 h-4 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* চেকলিস্ট হেডবোর্ড কার্ড */}
          <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${
            allCompleted
              ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${
                allCompleted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {allCompleted ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-base font-bold">
                  {allCompleted
                    ? 'প্রাক-প্রসেসিং চেকলিস্ট সম্পূর্ণ — ফলাফল প্রসেসের জন্য প্রস্তুত!'
                    : `প্রাক-প্রসেসিং চেকলিস্টে ${pendingSubjectCount}টি বিষয়ের নম্বর অসম্পূর্ণ রয়েছে`}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  শাখা: <strong>{selectedSection?.section_name}</strong> | মোট কনফিগার করা বিষয়: <strong>{totalConfigured} টি</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onOpenProcessModal}
              disabled={isProcessing}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-slate-800 shrink-0"
            >
              <span>প্রসেসিং কনফার্মেশন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ১. বিষয়ভিত্তিক নম্বর এন্ট্রি সম্পন্নতা টেবিল */}
          <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-orange" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  ১. বিষয় ও শিক্ষকভিত্তিক নম্বর এন্ট্রি সমাপ্তি
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                সম্পূর্ণ: {marksAudit.filter((m) => m.status === 'COMPLETE').length}/{marksAudit.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">পাঠ্য বিষয়</th>
                    <th className="py-3 px-4">দায়িত্বপ্রাপ্ত শিক্ষক</th>
                    <th className="py-3 px-4">মোট শিক্ষার্থী</th>
                    <th className="py-3 px-4">নম্বর এন্ট্রি হয়েছে</th>
                    <th className="py-3 px-4">বাকি রয়েছে</th>
                    <th className="py-3 px-4">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {marksAudit.map((m, idx) => {
                    const isDone = m.status === 'COMPLETE';
                    const isNone = m.status === 'NOT_STARTED';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {m.subjectName} ({m.subjectCode})
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {m.teacherName}
                        </td>
                        <td className="py-3 px-4 font-mono">{m.totalStudents}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">{m.enteredCount}</td>
                        <td className="py-3 px-4 font-mono font-bold text-rose-600">{m.pendingCount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : isNone
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {isDone ? 'সম্পূর্ণ' : isNone ? 'শুরু হয়নি' : 'আংশিক বাকি'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ২ ও ৩. সহ-পাঠ্যক্রমিক ও ফি বকেয়া অডিট গ্রিড */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* সহ-পাঠ্যক্রমিক কার্যক্রম কার্ড */}
            <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Users className="w-5 h-5 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  ২. সহ-পাঠ্যক্রমিক কার্যক্রম (১২৪ নম্বর)
                </h4>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                  <span>ডিজিタル হাজিরা হিসাব:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> স্বয়ংক্রিয় সিঙ্ক সক্রিয়
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                  <span>শ্রেণি ইনচার্জের নৈতিকতা নম্বর:</span>
                  <span className="font-bold text-indigo-600">ইনচার্জ মার্কশিট থেকে সিঙ্ক হবে</span>
                </div>
              </div>
            </div>

            {/* ফি বকেয়া ও অ্যাডমিট কার্ড কার্ড */}
            <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    ৩. ফি বকেয়া ও ডিউ-লক অডিট
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600">
                  {feeDueStudents.length} জন বকেয়া
                </span>
              </div>

              {feeDueStudents.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  এই শাখার কোনো শিক্ষার্থীর ফি বকেয়া নেই! সকলের অ্যাডমিট কার্ড উন্মুক্ত ছিল।
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-500">
                    যেসব শিক্ষার্থীর ফি বকেয়া থাকায় অ্যাডমিট কার্ড লক ছিল ({feeDueStudents.length} জন):
                  </p>
                  <div className="max-h-36 overflow-auto space-y-1.5 p-1">
                    {feeDueStudents.slice(0, 10).map((inv, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                        <span className="font-semibold">{inv.student_name || `রোল ${inv.student_roll || idx + 1}`}</span>
                        <span className="font-mono font-bold text-rose-600">বকেয়া: ৳{inv.due_amount || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreProcessingChecklistTab;
