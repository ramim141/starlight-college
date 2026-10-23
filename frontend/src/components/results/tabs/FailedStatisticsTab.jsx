import React from 'react';
import { ShieldAlert, Printer, Users, CheckCircle2 } from 'lucide-react';

const FailedStatisticsTab = ({
  exams = [],
  selectedExamId = '',
  onSelectExam,
  failedList = [],
  loading = false,
  failedGender = 'MALE',
  onSelectGender,
}) => {
  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));
  const genderLabel = failedGender === 'MALE' ? 'ছাত্র-সকল গ্রুপ' : 'ছাত্রী-সকল গ্রুপ';

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

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onSelectGender('MALE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                failedGender === 'MALE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              ছাত্র (Male)
            </button>
            <button
              onClick={() => onSelectGender('FEMALE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                failedGender === 'FEMALE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              ছাত্রী (Female)
            </button>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          disabled={failedList.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 disabled:opacity-40"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট অকৃতকার্য বিবরণী</span>
        </button>
      </div>

      {/* অকৃতকার্য বিবরণী টেবিল */}
      <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft overflow-x-auto print:p-0 print:border-none print:shadow-none">
        <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
            বিষয়ভিত্তিক অকৃতকার্য বিবরণী ({genderLabel})
          </h2>
          <h3 className="text-xs font-extrabold text-slate-500 uppercase">
            FAILED STATISTICS BY COURSE - {selectedExam?.name} ({selectedExam?.session})
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            মোট অকৃতকার্য শিক্ষার্থী: {failedList.length} জন
          </p>
        </div>

        {loading ? (
          <div className="p-12 space-y-3 animate-pulse">
            <div className="w-full h-8 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-10 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="w-full h-10 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : failedList.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-200/50">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h4 className="text-base font-bold text-emerald-700 dark:text-emerald-400">
              🎉 এই ক্যাটাগরিতে কোনো শিক্ষার্থী অকৃতকার্য হয়নি!
            </h4>
            <p className="text-xs text-slate-500">
              {genderLabel} ক্যাটাগরির সকল শিক্ষার্থী পরীক্ষায় সফলভাবে উত্তীর্ণ হয়েছে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-rose-900 text-white text-[11px] font-bold text-center">
                <tr>
                  <th className="p-3 w-14">ক্রমিক</th>
                  <th className="p-3 text-left">শিক্ষার্থীর নাম</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3 w-16">রোল</th>
                  <th className="p-3 text-left">অকৃতকার্য বিষয়সমূহ</th>
                  <th className="p-3 w-28 bg-rose-950">মোট অকৃতকার্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {failedList.map((f, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-slate-500">{f.sl || idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{f.student_name}</td>
                    <td className="p-3 text-center font-mono text-[11px] text-slate-500">{f.student_id}</td>
                    <td className="p-3 text-center font-mono font-bold">{f.roll}</td>
                    <td className="p-3 font-semibold text-rose-700 dark:text-rose-400">
                      {f.failed_subjects || 'N/A'}
                    </td>
                    <td className="p-3 text-center font-mono font-black text-rose-600 bg-rose-50/60 dark:bg-rose-950/20">
                      {f.total_failed_count || 1} টি
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

export default FailedStatisticsTab;
