import React, { useState, useEffect } from 'react';
import { getExamsListApi, getMyProgressReportApi } from '../../api/student';
import { Printer, GraduationCap, AlertCircle, Award } from 'lucide-react';
import { toast } from 'sonner';

const StudentResults = () => {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExamsListApi();
        const list = res.results || res;
        if (Array.isArray(list) && list.length > 0) {
          setExams(list);
          setSelectedExamId(list[0].id);
        }
      } catch (err) {
        toast.error('পরীক্ষার তালিকা লোড করা যায়নি');
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await getMyProgressReportApi(selectedExamId);
        if (res.success) {
          setReport(res);
        }
      } catch (err) {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedExamId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* অ্যাকশন কন্ট্রোল বার (প্রিন্টের সময় লুকানো থাকবে) */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">পরীক্ষার ফলাফল ও মার্কশিট</h2>
          <p className="text-xs text-slate-500">আপনার প্রকাশিত সেমিস্টার বা বার্ষিক পরীক্ষার প্রগ্রেস রিপোর্ট ডাউনলোড বা প্রিন্ট করুন।</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-brand-orange focus:outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.session})
              </option>
            ))}
          </select>

          {report && (
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover"
            >
              <Printer className="h-4 w-4" />
              <span>প্রিন্ট</span>
            </button>
          )}
        </div>
      </div>

      {/* ২. মার্কশিট কন্টেইনার (হুবহু পিডিএফ ১ এর লেআউট) */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : !report ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-100 shadow-soft">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">ফলাফল এখনো প্রকাশিত হয়নি</h3>
          <p className="text-xs text-slate-400 mt-1">অধ্যক্ষ কর্তৃক পরীক্ষার চূড়ান্ত ফলাফল অনুমোদনের পর এখানে ট্রান্সক্রিপ্ট দৃশ্যমান হবে।</p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 sm:p-10 shadow-premium border border-slate-200 print:shadow-none print:border-none print:p-0">
          
          {/* ইনস্টিটিউশন হেডার */}
          <div className="text-center pb-6 border-b border-slate-200">
            <h1 className="text-2xl font-black tracking-tight text-[#0F2C59]">{report.institution?.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{report.institution?.address}</p>
            <p className="text-xs font-bold text-brand-orange mt-0.5">EIIN : {report.institution?.eiin}</p>
            <div className="mt-4 inline-block rounded-xl bg-slate-100 px-5 py-1.5">
              <h2 className="text-sm font-extrabold text-slate-800 tracking-wide">
                {report.exam_info?.report_title}
              </h2>
              <p className="text-xs text-slate-600 font-semibold">{report.exam_info?.exam_name}</p>
            </div>
          </div>

          {/* শিক্ষার্থী পরিচিতি ও গ্রেডিং স্কেল গ্রিড */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 text-xs">
            {/* শিক্ষার্থীর তথ্য */}
            <div className="md:col-span-8 grid grid-cols-2 gap-y-2 text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div><span className="text-slate-400">Student Name:</span> <span className="font-bold text-slate-900">{report.student_info?.student_name}</span></div>
              <div><span className="text-slate-400">Student ID:</span> <span className="font-bold text-slate-900">{report.student_info?.student_id}</span></div>
              <div><span className="text-slate-400">Student Roll:</span> <span className="font-bold text-slate-900">{report.student_info?.student_roll}</span></div>
              <div><span className="text-slate-400">Class:</span> <span className="font-bold text-slate-900">{report.student_info?.class_level}</span></div>
              <div><span className="text-slate-400">Section:</span> <span className="font-bold text-slate-900">{report.student_info?.section}</span></div>
              <div><span className="text-slate-400">Group:</span> <span className="font-bold text-slate-900">{report.student_info?.group}</span></div>
            </div>

            {/* গ্রেডিং স্কেল বক্স */}
            <div className="md:col-span-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <table className="w-full text-[10px] text-center border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-1 font-bold">Mark Range</th>
                    <th className="pb-1 font-bold">Grade</th>
                    <th className="pb-1 font-bold">Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-semibold">
                  {report.grading_scale?.map((g, idx) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="py-0.5">{g.mark_range}</td>
                      <td className="py-0.5 font-bold text-brand-navy">{g.letter_grade}</td>
                      <td className="py-0.5">{g.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* প্রধান নম্বর বিবরণী টেবিল (পিডিএফ ১-এর হুবহু কলাম) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-center text-xs border-collapse">
              <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2">Full</th>
                  <th className="p-2">CQ</th>
                  <th className="p-2">MCQ</th>
                  <th className="p-2">Practi</th>
                  <th className="p-2">Sem. Obtained</th>
                  <th className="p-2">Sem. Converted</th>
                  <th className="p-2">Tutorial</th>
                  <th className="p-2 bg-orange-600">Total Marks</th>
                  <th className="p-2">GP</th>
                  <th className="p-2">GPA</th>
                  <th className="p-2">Highest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {report.subjects?.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-2 text-left font-bold text-brand-navy">{sub.subject_name}</td>
                    <td className="p-2 text-slate-500">{sub.full_marks}</td>
                    <td className="p-2">{sub.cq}</td>
                    <td className="p-2">{sub.mcq}</td>
                    <td className="p-2">{sub.practical}</td>
                    <td className="p-2 text-slate-600">{sub.semester_obtained.toFixed(1)}</td>
                    <td className="p-2 text-slate-600">{sub.semester_converted.toFixed(1)}</td>
                    <td className="p-2">{sub.tutorial.toFixed(1)}</td>
                    <td className="p-2 font-bold text-brand-orange bg-orange-50/30">{sub.total_marks.toFixed(1)}</td>
                    <td className={`p-2 font-bold ${sub.letter_grade === 'F' ? 'text-red-600' : 'text-slate-900'}`}>{sub.letter_grade}</td>
                    <td className="p-2">{sub.grade_point.toFixed(1)}</td>
                    <td className="p-2 text-slate-500">{sub.highest_marks.toFixed(1)}</td>
                  </tr>
                ))}

                {/* কো-কারিকুলার সারি (১২৪ নম্বর) */}
                {report.co_curricular && (
                  <tr className="bg-blue-50/40 text-blue-900 font-bold">
                    <td className="p-2 text-left">{report.co_curricular.title}</td>
                    <td className="p-2">{report.co_curricular.full_marks}</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2">{report.co_curricular.total_marks.toFixed(1)}</td>
                    <td className="p-2">{report.co_curricular.converted.toFixed(1)}</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2 font-extrabold text-brand-orange">{report.co_curricular.total_marks.toFixed(1)}</td>
                    <td className="p-2">{report.co_curricular.letter_grade}</td>
                    <td className="p-2">{report.co_curricular.grade_point.toFixed(1)}</td>
                    <td className="p-2">{report.co_curricular.highest_marks.toFixed(1)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* নিচের ফলাফল সামারি বক্স (পিডিএফ ১-এর বটম বক্স) */}
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-200">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 text-center text-xs">
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Working Days</span>
                <span className="font-extrabold text-slate-800">{report.overall_summary?.working_days}</span>
              </div>
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Present</span>
                <span className="font-extrabold text-emerald-600">{report.overall_summary?.present_days}</span>
              </div>
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Absent</span>
                <span className="font-extrabold text-rose-600">{report.overall_summary?.absent_days}</span>
              </div>
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Marks</span>
                <span className="font-extrabold text-slate-800">{report.overall_summary?.total_marks}</span>
              </div>
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Obtained</span>
                <span className="font-extrabold text-brand-orange">{report.overall_summary?.total_obtained.toFixed(1)}</span>
              </div>
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Grade</span>
                <span className={`font-black text-sm ${report.overall_summary?.grade === 'F' ? 'text-red-600' : 'text-brand-navy'}`}>
                  {report.overall_summary?.grade}
                </span>
              </div>
              <div className="border-r border-slate-200/80">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">GPA</span>
                <span className="font-black text-sm text-brand-navy">{report.overall_summary?.gpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Section / Class Pos.</span>
                <span className="font-extrabold text-slate-800">
                  {report.overall_summary?.section_position ? `${report.overall_summary.section_position} / ${report.overall_summary.class_position}` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* স্বাক্ষর লাইন */}
          <div className="mt-16 pt-8 flex justify-between text-xs font-bold text-slate-600 border-t border-slate-200">
            <div>
              <div className="h-0.5 w-32 bg-slate-300 mb-1"></div>
              <span>Exam Controller Signature</span>
            </div>
            <div>
              <div className="h-0.5 w-32 bg-slate-300 mb-1"></div>
              <span>Principal Signature</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default StudentResults;