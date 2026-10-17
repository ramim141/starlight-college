import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getExamsListApi } from '../../api/student';
import { useAuth } from '../../context/AuthContext';
import { Award, RefreshCw, Printer, Users, BarChart3, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ResultManagementHub - ফলাফল, মেধা তালিকা ও বিষয়ভিত্তিক পরিসংখ্যার হাব
 * অধ্যক্ষ, ইনচার্জ ও শিক্ষক সবার জন্য বহু-ব্যবহারযোগ্য।
 */
const ResultManagementHub = ({ 
  overrideRole = null, 
  defaultTab = 'merit' 
}) => {
  const { isPrincipal: authIsPrincipal, isTeacher: authIsTeacher } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab); // merit, analysis, failed_male, failed_female
  
  const [meritList, setMeritList] = useState([]);
  const [analysisList, setAnalysisList] = useState([]);
  const [failedMale, setFailedMale] = useState([]);
  const [failedFemale, setFailedFemale] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await getExamsListApi();
        const list = res.results || res;
        if (Array.isArray(list) && list.length > 0) {
          setExams(list);
          setSelectedExam(list[0].id);
        }
      } catch (e) {
        toast.error('পরীক্ষার তালিকা লোড করা যায়নি');
      }
    };
    fetchExams();
  }, []);

  const fetchTabReports = async () => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      if (activeTab === 'merit') {
        const res = await api.get(`examination/reports/merit-list/?exam=${selectedExam}`);
        setMeritList(res.data.data || []);
      } else if (activeTab === 'analysis') {
        const res = await api.get(`examination/reports/subject-analysis/?exam=${selectedExam}`);
        setAnalysisList(res.data.data || []);
      } else if (activeTab === 'failed_male') {
        const res = await api.get(`examination/reports/failed-statistics/?exam=${selectedExam}&gender=MALE`);
        setFailedMale(res.data.data || []);
      } else if (activeTab === 'failed_female') {
        const res = await api.get(`examination/reports/failed-statistics/?exam=${selectedExam}&gender=FEMALE`);
        setFailedFemale(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabReports();
  }, [selectedExam, activeTab]);

  const handleProcessResults = async () => {
    setProcessing(true);
    try {
      const res = await api.post('examination/results/process/', { exam_id: selectedExam });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTabReports();
      }
    } catch (err) {
      toast.error('রেজাল্ট প্রসেসিং ব্যর্থ হয়েছে');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* কন্ট্রোল হেডার */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy dark:text-slate-100">ফলাফল, মেধা তালিকা ও অকৃতকার্য বিবরণী</h2>
          <p className="text-xs text-slate-500">বাংলাদেশ শিক্ষা বোর্ড স্ট্যান্ডার্ড জিপিএ ৫.০০ স্কেলে মেধা তালিকা ও বিষয়ভিত্তিক পরিসংখ্যান।</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full sm:w-60 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-brand-orange focus:outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {isPrincipal && (
            <button
              onClick={handleProcessResults}
              disabled={processing}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
              <span>{processing ? 'প্রসেস হচ্ছে...' : '১-ক্লিকে রেজাল্ট প্রসেস'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ট্যাব নেভিগেশন */}
      <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('merit')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'merit' ? 'bg-[#0F2C59] text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>অফিশিয়াল মেধা তালিকা (Merit List)</span>
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'analysis' ? 'bg-[#0F2C59] text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>বিষয়ভিত্তিক পাশের হার (Subject Analysis)</span>
        </button>

        <button
          onClick={() => setActiveTab('failed_male')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'failed_male' ? 'bg-[#0F2C59] text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <span>অকৃতকার্য বিবরণী (ছাত্র)</span>
        </button>

        <button
          onClick={() => setActiveTab('failed_female')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'failed_female' ? 'bg-[#0F2C59] text-white shadow' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <span>অকৃতকার্য বিবরণী (ছাত্রী)</span>
        </button>

        <button
          onClick={() => window.print()}
          className="ml-auto flex items-center space-x-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
        >
          <Printer className="h-4 w-4" />
          <span>প্রিন্ট রিপোর্ট</span>
        </button>
      </div>

      {/* রিপোর্ট কন্টেন্ট ডিসপ্লে */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-soft overflow-x-auto print:border-none print:shadow-none print:p-0">
          
          {/* ১. মেধা তালিকা টেবিল */}
          {activeTab === 'merit' && (
            <div>
              <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-brand-navy dark:text-slate-100">STARLIGHT COLLEGE, SYLHET</h3>
                <h4 className="text-xs font-extrabold text-brand-orange uppercase">OFFICIAL MERIT LIST</h4>
              </div>

              {meritList.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">কোনো মেধা তালিকা ডেটা পাওয়া যায়নি। আগে রেজাল্ট প্রসেস করুন।</p>
              ) : (
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                    <tr>
                      <th className="p-2.5">SL</th>
                      <th className="p-2.5 text-left">শিক্ষার্থীর নাম</th>
                      <th className="p-2.5">Student ID</th>
                      <th className="p-2.5">রোল</th>
                      <th className="p-2.5">শাখা</th>
                      <th className="p-2.5">প্রাপ্ত নম্বর</th>
                      <th className="p-2.5">গ্রেড</th>
                      <th className="p-2.5">GPA</th>
                      <th className="p-2.5 bg-orange-600">সেকশন স্থান</th>
                      <th className="p-2.5 bg-orange-700">ক্লাস স্থান</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                    {meritList.map((m) => (
                      <tr key={m.sl} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5">{m.sl}</td>
                        <td className="p-2.5 text-left font-bold text-brand-navy dark:text-blue-400">{m.student_name}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{m.student_id}</td>
                        <td className="p-2.5 font-bold">{m.roll}</td>
                        <td className="p-2.5">{m.section}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{m.obtained_marks.toFixed(1)}</td>
                        <td className="p-2.5 font-black text-emerald-600">{m.grade}</td>
                        <td className="p-2.5 font-black text-brand-navy dark:text-blue-400">{m.gpa.toFixed(2)}</td>
                        <td className="p-2.5 font-black text-brand-orange">{m.section_position || "-"}</td>
                        <td className="p-2.5 font-black text-brand-orange">{m.class_position || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ২. বিষয়ভিত্তিক অ্যানালাইসিস টেবিল */}
          {activeTab === 'analysis' && (
            <div>
              <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-brand-navy dark:text-slate-100">SUBJECT WISE RESULT ANALYSIS</h3>
                <p className="text-xs text-slate-500">প্রতিটি বিষয়ের মোট পরীক্ষার্থী, পাশের হার ও অকৃতকার্যতার শতকরা হার</p>
              </div>

              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                  <tr>
                    <th className="p-2.5">SL</th>
                    <th className="p-2.5 text-left">Subject Name</th>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Total Examinees</th>
                    <th className="p-2.5 text-emerald-300">Passed</th>
                    <th className="p-2.5 text-emerald-300">Pass %</th>
                    <th className="p-2.5 text-rose-300">Failed</th>
                    <th className="p-2.5 text-rose-300">Failed %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                  {analysisList.map((a) => (
                    <tr key={a.sl} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5">{a.sl}</td>
                      <td className="p-2.5 text-left font-bold text-brand-navy dark:text-blue-400">{a.subject_name}</td>
                      <td className="p-2.5 font-mono text-slate-500">{a.subject_code}</td>
                      <td className="p-2.5 font-bold">{a.total_students}</td>
                      <td className="p-2.5 font-bold text-emerald-600">{a.number_of_student_passed}</td>
                      <td className="p-2.5 font-black text-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20">{a.pass_percentage}</td>
                      <td className="p-2.5 font-bold text-rose-600">{a.number_of_student_failed}</td>
                      <td className="p-2.5 font-black text-rose-600 bg-rose-50/40 dark:bg-rose-950/20">{a.failed_percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ৩ ও ৪. অকৃতকার্য বিবরণী */}
          {(activeTab === 'failed_male' || activeTab === 'failed_female') && (
            <div>
              <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-red-700 dark:text-red-400">
                  বিষয় ভিত্তিক অকৃতকার্য বিবরণী ({activeTab === 'failed_male' ? 'ছাত্র-সকল গ্রুপ' : 'ছাত্রী-সকল গ্রুপ'})
                </h3>
                <p className="text-xs text-slate-500">FAILED STATISTICS BY COURSE</p>
              </div>

              {((activeTab === 'failed_male' ? failedMale : failedFemale).length === 0) ? (
                <p className="text-xs text-emerald-600 font-bold py-8 text-center">🎉 এই ক্যাটাগরিতে কোনো শিক্ষার্থী অকৃতকার্য হয়নি!</p>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-red-900 text-white text-[11px] font-bold">
                    <tr>
                      <th className="p-2.5 w-12 text-center">SL</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Student ID</th>
                      <th className="p-2.5">Roll</th>
                      <th className="p-2.5">Subjects Failed</th>
                      <th className="p-2.5 w-20 text-center">Total Failed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {(activeTab === 'failed_male' ? failedMale : failedFemale).map((f) => (
                      <tr key={f.sl} className="hover:bg-red-50/30">
                        <td className="p-2.5 text-center font-bold">{f.sl}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{f.student_name}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">{f.student_id}</td>
                        <td className="p-2.5 font-bold text-brand-navy dark:text-blue-400">{f.roll}</td>
                        <td className="p-2.5 text-red-700 dark:text-red-400 font-semibold">{f.failed_subjects}</td>
                        <td className="p-2.5 text-center font-black text-rose-600 bg-red-50 dark:bg-red-950/30">{f.total_failed_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default ResultManagementHub;
