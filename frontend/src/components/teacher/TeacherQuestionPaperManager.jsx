import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { getExamsListApi } from '../../api/student';
import { Lock, Upload, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const TeacherQuestionPaperManager = () => {
  const [papers, setPapers] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    exam: '',
    subject: '',
    question_file: null,
    file_password_hint: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, exRes, subRes] = await Promise.all([
        api.get('examination/questions/'),
        getExamsListApi(),
        api.get('academics/subjects/'),
      ]);
      setPapers(pRes.data.results || pRes.data || []);
      const exList = exRes.results || exRes || [];
      const subList = subRes.data.results || subRes.data || [];
      setExams(exList);
      setSubjects(subList);
      if (exList.length > 0) setForm(prev => ({ ...prev, exam: exList[0].id }));
      if (subList.length > 0) setForm(prev => ({ ...prev, subject: subList[0].id }));
    } catch (e) {
      toast.error('প্রশ্নপত্র তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question_file) {
      toast.error('প্রশ্নপত্রের ফাইল সংযুক্ত করুন');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('exam', form.exam);
      formData.append('subject', form.subject);
      formData.append('question_file', form.question_file);
      formData.append('file_password_hint', form.file_password_hint);

      const res = await api.post('examination/questions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201) {
        toast.success('প্রশ্নপত্র সফলভাবে জমা দেওয়া হয়েছে');
        setShowModal(false);
        setForm(prev => ({ ...prev, question_file: null, file_password_hint: '' }));
        fetchData();
      }
    } catch (err) {
      toast.error('প্রশ্নপত্র জমা দেওয়া ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <div>
          <span className="text-xs font-bold text-brand-navy">সুরক্ষিত প্রশ্নপত্র জমা (Question Paper Submission)</span>
          <p className="text-[11px] text-slate-400">পাসওয়ার্ড-প্রটেক্টেড PDF সরাসরি প্রিন্সিপাল প্যানেলে জমা দিন</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-[#0F2C59] px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800"
        >
          <Lock className="h-4 w-4 text-brand-orange" />
          <span>প্রশ্নপত্র জমা দিন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center col-span-2">আপনার জমা দেওয়া কোনো প্রশ্নপত্র নেই।</p>
        ) : (
          papers.map((p) => (
            <div key={p.id} className="rounded-3xl bg-white p-5 border border-slate-200 shadow-soft">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-brand-navy">{p.subject_name}</span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                  {p.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">পরীক্ষা: {p.exam_name || 'পরীক্ষার নাম'}</p>
              {p.file_password_hint && (
                <div className="mt-2 rounded-xl bg-slate-50 p-2 text-[11px] text-slate-600 font-mono">
                  পাসওয়ার্ড হিন্ট: ••••••••
                </div>
              )}
              <div className="mt-3 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                জমার তারিখ: {new Date(p.created_at).toLocaleDateString('bn-BD')}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-3">প্রশ্নপত্র আপলোড করুন</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">পরীক্ষা নির্বাচন</label>
                <select
                  value={form.exam}
                  onChange={(e) => setForm({ ...form, exam: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                  required
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিষয় নির্বাচন</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">প্রশ্নপত্র ফাইল (PDF / Doc)</label>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, question_file: e.target.files[0] })}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0F2C59] file:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  ফাইল পাসওয়ার্ড / হিন্ট (শুধুমাত্র অধ্যক্ষ দেখতে পাবেন)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: Chem@Sylhet2026"
                  value={form.file_password_hint}
                  onChange={(e) => setForm({ ...form, file_password_hint: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">
                  {submitting ? 'আপলোড হচ্ছে...' : 'প্রশ্নপত্র জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionPaperManager;