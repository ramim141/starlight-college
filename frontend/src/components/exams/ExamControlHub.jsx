import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getExamsListApi, 
  createExamApi, 
  getExamSubjectConfigsApi, 
  createExamSubjectConfigApi, 
  getExamRoomsApi, 
  createExamRoomApi, 
  getQuestionPaperSubmissionsApi 
} from '../../api/principal';
import { getSubjectsApi } from '../../api/teacher';
import api from '../../api/client';
import { 
  Award, 
  Layers, 
  Plus, 
  Calendar, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Percent,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * ExamControlHub - বহু-ব্যবহারযোগ্য পরীক্ষা, নম্বর বণ্টন ও প্রশ্নপত্র হাব
 * প্রিন্সিপাল এবং শিক্ষক উভয়ের জন্যই প্রযোজ্য।
 */
const ExamControlHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isTeacher: authIsTeacher } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;

  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'configs' | 'rooms' | 'questions'
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loading, setLoading] = useState(true);

  // ১. নতুন পরীক্ষা তৈরি মডাল (প্রিন্সিপাল)
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    exam_type: 'SEMESTER',
    academic_year: '2025-2026',
    start_date: '',
    end_date: '',
    is_published: false,
  });

  // ২. নতুন সাবজেক্ট কনফিগ মডাল
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [newConfig, setNewConfig] = useState({
    exam: '',
    subject: '',
    cq_full: 70,
    cq_pass: 23,
    mcq_full: 30,
    mcq_pass: 10,
    practical_full: 0,
    practical_pass: 0,
    tutorial_full: 20,
    has_80_20_conversion: true,
  });

  // ৩. নতুন রুম মডাল
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    capacity: 40,
    bench_count: 20,
  });

  // ৪. শিক্ষকের প্রশ্নপত্র আপলোড মডাল
  const [showUploadPaperModal, setShowUploadPaperModal] = useState(false);
  const [paperUploadData, setPaperUploadData] = useState({
    exam: '',
    subject: '',
    file: null,
  });
  const [submittingPaper, setSubmittingPaper] = useState(false);

  const fetchExamData = async () => {
    setLoading(true);
    try {
      const [exRes, subRes] = await Promise.allSettled([
        getExamsListApi(),
        getSubjectsApi()
      ]);
      if (exRes.status === 'fulfilled') {
        const eList = exRes.value.results || exRes.value;
        const examArray = Array.isArray(eList) ? eList : [];
        setExams(examArray);
        if (examArray.length > 0 && !selectedExamId) {
          setSelectedExamId(examArray[0].id);
        }
      }
      if (subRes.status === 'fulfilled') {
        const sList = subRes.value.results || subRes.value;
        setSubjects(Array.isArray(sList) ? sList : []);
      }

      if (activeTab === 'configs' && selectedExamId) {
        const res = await getExamSubjectConfigsApi(selectedExamId);
        const list = res.results || res;
        setConfigs(Array.isArray(list) ? list : []);
      } else if (activeTab === 'rooms') {
        const res = await getExamRoomsApi();
        const list = res.results || res;
        setRooms(Array.isArray(list) ? list : []);
      } else if (activeTab === 'questions') {
        const res = await getQuestionPaperSubmissionsApi();
        const list = res.results || res;
        setQuestionPapers(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      toast.error('পরীক্ষা সংক্রান্ত তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, [activeTab, selectedExamId]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await createExamApi(newExam);
      if (res.id || res.success) {
        toast.success('নতুন পরীক্ষা সফলভাবে তৈরি হয়েছে');
        setShowAddExamModal(false);
        setNewExam({ name: '', exam_type: 'SEMESTER', academic_year: '2025-2026', start_date: '', end_date: '', is_published: false });
        fetchExamData();
      }
    } catch (err) {
      toast.error('পরীক্ষা তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleCreateConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await createExamSubjectConfigApi({
        ...newConfig,
        exam: selectedExamId,
      });
      if (res.id || res.success) {
        toast.success('বিষয়ভিত্তিক নম্বর বণ্টন কনফিগারেশন সংরক্ষিত হয়েছে');
        setShowAddConfigModal(false);
        fetchExamData();
      }
    } catch (err) {
      toast.error('কনফিগারেশন সেভ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await createExamRoomApi(newRoom);
      if (res.id || res.success) {
        toast.success('নতুন পরীক্ষা কক্ষ যুক্ত হয়েছে');
        setShowAddRoomModal(false);
        setNewRoom({ room_number: '', capacity: 40, bench_count: 20 });
        fetchExamData();
      }
    } catch (err) {
      toast.error('কক্ষ যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  // শিক্ষক কর্তৃক প্রশ্নপত্র জমা
  const handleUploadPaperSubmit = async (e) => {
    e.preventDefault();
    if (!paperUploadData.file) {
      toast.error('প্রশ্নপত্র ফাইল নির্বাচন করুন');
      return;
    }
    setSubmittingPaper(true);
    try {
      const formData = new FormData();
      formData.append('exam', paperUploadData.exam || selectedExamId);
      formData.append('subject', paperUploadData.subject);
      formData.append('file', paperUploadData.file);

      const res = await api.post('examination/questions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.id || res.data.success) {
        toast.success('প্রশ্নপত্র সফলভাবে সংরক্ষণাগারে জমা দেওয়া হয়েছে');
        setShowUploadPaperModal(false);
        fetchExamData();
      }
    } catch (err) {
      toast.error('প্রশ্নপত্র আপলোড ব্যর্থ হয়েছে');
    } finally {
      setSubmittingPaper(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0F2C59] p-6 rounded-2xl border border-white/10 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">পরীক্ষা ও প্রশ্নপত্র নিয়ন্ত্রণ কেন্দ্র</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              পরীক্ষা কনফিগারেশন, ৮০-২০ রূপান্তর কাঠামো, পরীক্ষা হল ও প্রশ্নপত্র মহাফেজখানা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            {[
              { id: 'exams', label: 'পরীক্ষা তালিকা' },
              { id: 'configs', label: '৮০-২০ নম্বর বণ্টন' },
              { id: 'rooms', label: 'পরীক্ষা হল ও সিট' },
              { id: 'questions', label: 'প্রশ্নপত্র সংরক্ষণাগার' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.id ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isPrincipal && activeTab === 'exams' && (
            <button
              onClick={() => setShowAddExamModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> নতুন পরীক্ষা
            </button>
          )}

          {isPrincipal && activeTab === 'configs' && (
            <button
              onClick={() => setShowAddConfigModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> নম্বর কনফিগ
            </button>
          )}

          {isPrincipal && activeTab === 'rooms' && (
            <button
              onClick={() => setShowAddRoomModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> নতুন রুম
            </button>
          )}

          {isTeacher && activeTab === 'questions' && (
            <button
              onClick={() => setShowUploadPaperModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Upload className="w-4 h-4" /> প্রশ্নপত্র জমা দিন
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'exams' ? (
        /* ================= ১. পরীক্ষা তালিকা ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((ex) => (
            <div
              key={ex.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-brand-orange">
                  {ex.academic_year}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                  ex.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {ex.is_published ? 'প্রকাশিত' : 'ড্রাফট'}
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-3">{ex.name}</h3>
              <p className="text-xs text-slate-500 mt-1">ধরন: {ex.exam_type_display || ex.exam_type}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                  <span>সময়কাল: {ex.start_date} হতে {ex.end_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'configs' ? (
        /* ================= ২. ৮০-২০ নম্বর বণ্টন ================= */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase">পরীক্ষা নির্বাচন:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">পাঠ্য বিষয়</th>
                    <th className="py-3 px-4">CQ (পূর্ণমান / পাস)</th>
                    <th className="py-3 px-4">MCQ (পূর্ণমান / পাস)</th>
                    <th className="py-3 px-4">ব্যবহারিক</th>
                    <th className="py-3 px-4">টিউটোরিয়াল (২০%)</th>
                    <th className="py-3 px-4">৮০-২০ রূপান্তর</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {configs.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{c.subject_name}</td>
                      <td className="py-3 px-4">{c.cq_full} (পাস: {c.cq_pass})</td>
                      <td className="py-3 px-4">{c.mcq_full} (পাস: {c.mcq_pass})</td>
                      <td className="py-3 px-4">{c.practical_full} (পাস: {c.practical_pass})</td>
                      <td className="py-3 px-4 font-bold text-brand-orange">{c.tutorial_full} নম্বর</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-500">
                          {c.has_80_20_conversion ? 'সক্রিয় (80% + 20%)' : 'সরাসরি ১০০%'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'rooms' ? (
        /* ================= ৩. পরীক্ষা হল ও রুম ================= */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="p-3 w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-brand-orange flex items-center justify-center font-black text-lg">
                {r.room_number}
              </div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mt-3">রুম {r.room_number}</h3>
              <p className="text-xs text-slate-500 mt-1">ধারণক্ষমতা: {r.capacity} জন</p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                মোট বেঞ্চ: {r.bench_count || Math.floor(r.capacity / 2)} টি
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= ৪. প্রশ্নপত্র সংরক্ষণাগার ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              প্রশ্নপত্রের নিরাপদ মহাফেজখানা ({questionPapers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">বিষয় ও পরীক্ষা</th>
                  <th className="py-3 px-4">জমা দেওয়া শিক্ষক</th>
                  <th className="py-3 px-4">জমার তারিখ</th>
                  <th className="py-3 px-4">প্রশ্নপত্র ফাইল</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {questionPapers.map((q) => (
                  <tr key={q.id}>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{q.subject_name}</span>
                      <span className="block text-xs text-slate-400">{q.exam_name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {q.teacher_name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">{q.submitted_at}</td>
                    <td className="py-3 px-4">
                      {q.file ? (
                        <a
                          href={q.file}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-bold"
                        >
                          ডাউনলোড <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">ফাইল নেই</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                        {q.status || 'জমাকৃত'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* নতুন পরীক্ষা তৈরি মডাল */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-orange" />
              নতুন পরীক্ষা সূচি তৈরি
            </h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">পরীক্ষার নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: একাদশ শ্রেণি ১ম সেমিস্টার ফাইনাল ২০২৬"
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">পরীক্ষার ধরন</label>
                  <select
                    value={newExam.exam_type}
                    onChange={(e) => setNewExam({ ...newExam, exam_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <option value="SEMESTER">সেমিস্টার</option>
                    <option value="MODEL_TEST">মডেল টেস্ট</option>
                    <option value="PRETEST">প্রি-টেস্ট</option>
                    <option value="TEST">টেস্ট</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">শিক্ষাবর্ষ</label>
                  <input
                    type="text"
                    value={newExam.academic_year}
                    onChange={(e) => setNewExam({ ...newExam, academic_year: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newExam.start_date}
                    onChange={(e) => setNewExam({ ...newExam, start_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    required
                    value={newExam.end_date}
                    onChange={(e) => setNewExam({ ...newExam, end_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  পরীক্ষা সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* নতুন নম্বর কনফিগ মডাল */}
      {showAddConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Percent className="w-5 h-5 text-brand-orange" />
              ৮০-২০ নম্বর বণ্টন কনফিগারেশন
            </h3>
            <form onSubmit={handleCreateConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">পাঠ্য বিষয় নির্বাচন</label>
                <select
                  required
                  value={newConfig.subject}
                  onChange={(e) => setNewConfig({ ...newConfig, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="">বিষয় বেছে নিন</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CQ পূর্ণমান</label>
                  <input
                    type="number"
                    value={newConfig.cq_full}
                    onChange={(e) => setNewConfig({ ...newConfig, cq_full: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CQ পাস নম্বর</label>
                  <input
                    type="number"
                    value={newConfig.cq_pass}
                    onChange={(e) => setNewConfig({ ...newConfig, cq_pass: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">MCQ পূর্ণমান</label>
                  <input
                    type="number"
                    value={newConfig.mcq_full}
                    onChange={(e) => setNewConfig({ ...newConfig, mcq_full: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">MCQ পাস নম্বর</label>
                  <input
                    type="number"
                    value={newConfig.mcq_pass}
                    onChange={(e) => setNewConfig({ ...newConfig, mcq_pass: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">টিউটোরিয়াল পূর্ণমান (২০%)</label>
                  <input
                    type="number"
                    value={newConfig.tutorial_full}
                    onChange={(e) => setNewConfig({ ...newConfig, tutorial_full: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ব্যবহারিক পূর্ণমান</label>
                  <input
                    type="number"
                    value={newConfig.practical_full}
                    onChange={(e) => setNewConfig({ ...newConfig, practical_full: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  কনফিগারেশন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* নতুন রুম মডাল */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-orange" />
              নতুন পরীক্ষা কক্ষ সংযোজন
            </h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">রুম নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="১০১, ২০২, ল্যাব-১"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ধারণক্ষমতা (সিট)</label>
                  <input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">বেঞ্চের সংখ্যা</label>
                  <input
                    type="number"
                    value={newRoom.bench_count}
                    onChange={(e) => setNewRoom({ ...newRoom, bench_count: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  রুম সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* শিক্ষক প্রশ্নপত্র আপলোড মডাল */}
      {showUploadPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-brand-orange" />
              প্রশ্নপত্র আপলোড ও জমা
            </h3>
            <form onSubmit={handleUploadPaperSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">পরীক্ষা</label>
                <select
                  required
                  value={paperUploadData.exam || selectedExamId}
                  onChange={(e) => setPaperUploadData({ ...paperUploadData, exam: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বিষয়</label>
                <select
                  required
                  value={paperUploadData.subject}
                  onChange={(e) => setPaperUploadData({ ...paperUploadData, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="">বিষয় নির্বাচন করুন</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">প্রশ্নপত্র ফাইল (PDF বা DOCX)</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setPaperUploadData({ ...paperUploadData, file: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-orange file:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadPaperModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingPaper}
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  {submittingPaper ? 'আপলোড হচ্ছে...' : 'জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamControlHub;
