import React, { useState } from 'react';
import { BarChart3, Printer, Filter } from 'lucide-react';

const SubjectAnalysisTab = ({
  exams = [],
  selectedExamId = '',
  onSelectExam,
  analysisList = [],
  loading = false,
  selectedGroup = '',
  onSelectGroup,
}) => {
  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));

  return (
    <div className="space-y-6">
      {/* ফিল্টার ও হেডার বার */}
      <div className="no-print flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center md:justify-between dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft">
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
            <label className="text-xs font-bold text-slate-500 uppercase">গ্রুপ:</label>
            <select
              value={selectedGroup}
              onChange={(e) => onSelectGroup(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            >
              <option value="">সকল গ্রুপ</option>
              <option value="SCIENCE">বিজ্ঞান (Science)</option>
              <option value="HUMANITIES">মানবিক (Humanities)</option>
              <option value="BUSINESS_STUDIES">ব্যবসায় শিক্ষা (Business Studies)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          disabled={analysisList.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 disabled:opacity-40"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট রিপোর্ট</span>
        </button>
      </div>

      {/* অ্যানালাইসিস টেবিল */}
      <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft overflow-x-auto print:p-0 print:border-none print:shadow-none">
        <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-black text-brand-navy dark:text-slate-100 uppercase tracking-wide">
            STARLIGHT COLLEGE, SYLHET
          </h2>
          <h3 className="text-xs font-extrabold text-brand-orange uppercase">
            SUBJECT WISE RESULT ANALYSIS - {selectedExam?.name} ({selectedExam?.session})
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            প্রতিটি বিষয়ের মোট পরীক্ষার্থী, পাশের হার ও অকৃতকার্যতার শতকরা হার
          </p>
        </div>

        {loading ? (
          <div className="p-12 space-y-3 animate-pulse">
            <div className="w-full h-8 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-10 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="w-full h-10 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : analysisList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <BarChart3 className="w-12 h-12 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              কোনো পরিসংখ্যান ডেটা পাওয়া যায়নি
            </h4>
            <p className="text-xs text-slate-400">
              ফলাফল প্রসেস সম্পন্ন হলে বিষয়ভিত্তিক বিশ্লেষণ প্রদর্শিত হবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3">ক্রমিক</th>
                  <th className="p-3 text-left">বিষয়</th>
                  <th className="p-3">বিষয় কোড</th>
                  <th className="p-3">মোট পরীক্ষার্থী</th>
                  <th className="p-3 text-emerald-300">উত্তীর্ণ</th>
                  <th className="p-3 text-emerald-300">পাশের হার</th>
                  <th className="p-3 text-rose-300">অকৃতকার্য</th>
                  <th className="p-3 text-rose-300">অকৃতকার্য হার</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {analysisList.map((a, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono">{a.sl || idx + 1}</td>
                    <td className="p-3 text-left font-bold text-brand-navy dark:text-blue-400">
                      {a.subject_name}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{a.subject_code}</td>
                    <td className="p-3 font-mono font-bold">{a.total_students}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {a.number_of_student_passed}
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">
                      {a.pass_percentage}
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-600">
                      {a.number_of_student_failed}
                    </td>
                    <td className="p-3 font-mono font-black text-rose-600 bg-rose-50/50 dark:bg-rose-950/20">
                      {a.failed_percentage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectAnalysisTab;
