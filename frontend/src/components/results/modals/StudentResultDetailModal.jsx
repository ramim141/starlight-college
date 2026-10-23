import React, { useState, useEffect } from 'react';
import { 
  Award, 
  X, 
  Printer, 
  User, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';
import { getStudentProgressReportApi } from '../../../api/principal';

const StudentResultDetailModal = ({
  isOpen,
  onClose,
  examId,
  studentId,
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !examId || !studentId) {
      setReport(null);
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getStudentProgressReportApi(examId, studentId);
        if (res.success) {
          setReport(res);
        } else {
          setError(res.message || 'মার্কশিট লোড করা যায়নি');
        }
      } catch (err) {
        setError('মার্কশিট লোড করতে সমস্যা হয়েছে');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, examId, studentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl my-6 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* মডাল অ্যাকশন বার (প্রিন্টে লুকানো থাকবে) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-orange" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              শিক্ষার্থীর পূর্ণাঙ্গ নম্বরপত্র ও প্রগ্রেস রিপোর্ট
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
            >
              <Printer className="w-3.5 h-3.5" /> প্রিন্ট মার্কশিট
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* কনটেন্ট বডি */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs font-bold text-rose-500">
              {error}
            </div>
          ) : report ? (
            <div className="space-y-5">
              {/* প্রাতিষ্ঠানিক হেডার */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-black text-brand-navy dark:text-slate-100 uppercase tracking-wide">
                  {report.institution?.name || 'STARLIGHT COLLEGE'}
                </h2>
                <p className="text-xs text-slate-500">
                  {report.institution?.address} | EIIN: {report.institution?.eiin}
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/20 text-brand-orange font-bold text-xs uppercase border border-orange-200 dark:border-orange-900/30">
                  {report.exam_info?.report_title || 'Progress Report'} - {report.exam_info?.exam_name} ({report.exam_info?.session})
                </div>
              </div>

              {/* শিক্ষার্থীর তথ্য বিবরণী */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">শিক্ষার্থীর নাম:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{report.student_info?.student_name}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Student ID:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{report.student_info?.student_id}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">রোল ও শ্রেণি:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {report.student_info?.student_roll} | {report.student_info?.class_level}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">শাখা ও গ্রুপ:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {report.student_info?.section} | {report.student_info?.group}
                  </strong>
                </div>
              </div>

              {/* বিষয়ভিত্তিক নম্বর বিভাজন টেবিল */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                    <tr>
                      <th className="p-2.5 text-left">বিষয়</th>
                      <th className="p-2.5">পূর্ণমান</th>
                      <th className="p-2.5">CQ</th>
                      <th className="p-2.5">MCQ</th>
                      <th className="p-2.5">ব্যবহারিক</th>
                      <th className="p-2.5">৮০% রূপান্তর</th>
                      <th className="p-2.5">টিউটোরিয়াল (২০%)</th>
                      <th className="p-2.5">সর্বমোট</th>
                      <th className="p-2.5">সর্বোচ্চ</th>
                      <th className="p-2.5">গ্রেড</th>
                      <th className="p-2.5">GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {report.subjects?.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 text-left font-bold text-slate-900 dark:text-slate-100">
                          {s.subject_name}
                        </td>
                        <td className="p-2.5 font-mono">{s.full_marks}</td>
                        <td className="p-2.5 font-mono">{s.cq}</td>
                        <td className="p-2.5 font-mono">{s.mcq}</td>
                        <td className="p-2.5 font-mono">{s.practical}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{s.semester_converted}</td>
                        <td className="p-2.5 font-mono font-bold text-brand-orange">{s.tutorial}</td>
                        <td className="p-2.5 font-mono font-black text-slate-900 dark:text-slate-100">{s.total_marks}</td>
                        <td className="p-2.5 font-mono text-slate-400">{s.highest_marks}</td>
                        <td className="p-2.5 font-black text-emerald-600">{s.letter_grade}</td>
                        <td className="p-2.5 font-bold font-mono">{s.grade_point.toFixed(2)}</td>
                      </tr>
                    ))}

                    {/* সহ-পাঠ্যক্রমিক কার্যক্রম রো */}
                    {report.co_curricular && (
                      <tr className="bg-amber-50/50 dark:bg-amber-950/10 font-bold">
                        <td className="p-2.5 text-left text-brand-orange">
                          {report.co_curricular.title}
                        </td>
                        <td className="p-2.5 font-mono">{report.co_curricular.full_marks}</td>
                        <td className="p-2.5" colSpan={3}>
                          হাজিরা: {report.co_curricular.attn} + নৈতিকতা: {report.co_curricular.ethics}
                        </td>
                        <td className="p-2.5 font-mono">-</td>
                        <td className="p-2.5 font-mono">-</td>
                        <td className="p-2.5 font-mono font-black text-brand-orange">{report.co_curricular.total_marks}</td>
                        <td className="p-2.5 font-mono text-slate-400">{report.co_curricular.highest_marks}</td>
                        <td className="p-2.5 font-black text-emerald-600">{report.co_curricular.letter_grade}</td>
                        <td className="p-2.5 font-bold font-mono">{report.co_curricular.grade_point.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* চূড়ান্ত ফলাফল সারসংক্ষেপ কার্ড */}
              {report.overall_summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F2C59] text-white text-xs">
                  <div>
                    <span className="text-[11px] text-slate-300 block">মোট প্রাপ্ত নম্বর:</span>
                    <strong className="text-base font-black font-mono">
                      {report.overall_summary.total_obtained} / {report.overall_summary.total_marks}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-300 block">GPA ও গ্রেড:</span>
                    <strong className="text-base font-black font-mono text-amber-400">
                      {report.overall_summary.gpa.toFixed(2)} ({report.overall_summary.grade})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-300 block">মেধা স্থান:</span>
                    <strong className="text-base font-black text-emerald-400">
                      শ্রেণি: {report.overall_summary.class_position || '-'} | শাখা: {report.overall_summary.section_position || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-300 block">উপস্থিতি বিবরণ:</span>
                    <span className="text-slate-200">
                      মোট: {report.overall_summary.working_days} | উপস্থিতি: {report.overall_summary.present_days}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StudentResultDetailModal;
