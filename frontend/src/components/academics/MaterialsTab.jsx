import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Download, Plus, FileText, BookOpen, User, Calendar, Upload } from 'lucide-react';
import { toast } from 'sonner';

const MaterialsTab = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ১. Add Syllabus ফর্ম স্টেট
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabusForm, setSyllabusForm] = useState({
    subject: '',
    session: '2025-2026',
    title: '',
    file: null
  });
  const [submittingSyllabus, setSubmittingSyllabus] = useState(false);

  // ২. Add Homework ফর্ম স্টেট
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({
    section: '',
    subject: '',
    teacher: '',
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    attachment: null
  });
  const [submittingHomework, setSubmittingHomework] = useState(false);

  const fetchAllData = async () => {
    try {
      const [sylRes, hwRes, subRes, secRes, teachRes] = await Promise.all([
        api.get('academics/syllabi/'),
        api.get('academics/homeworks/'),
        api.get('academics/subjects/'),
        api.get('academics/sections/'),
        api.get('auth/staff/?role=TEACHER')
      ]);
      setSyllabi(sylRes.data.results || sylRes.data || []);
      setHomeworks(hwRes.data.results || hwRes.data || []);
      
      const subList = subRes.data.results || subRes.data || [];
      const secList = secRes.data.results || secRes.data || [];
      const teachList = teachRes.data.results || teachRes.data || [];
      
      setSubjects(subList);
      setSections(secList);
      setTeachers(teachList);

      if (subList.length > 0) setSyllabusForm(prev => ({ ...prev, subject: subList[0].id }));
      if (secList.length > 0 && subList.length > 0) {
        setHomeworkForm(prev => ({
          ...prev,
          section: secList[0].id,
          subject: subList[0].id,
          teacher: teachList[0]?.id || ''
        }));
      }
    } catch (err) {
      toast.error('ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // সিলেবাস আপলোড সাবমিট (Multipart Form-Data)
  const handleSyllabusSubmit = async (e) => {
    e.preventDefault();
    if (!syllabusForm.file) {
      toast.error('সিলেবাসের ফাইল নির্বাচন করুন');
      return;
    }

    setSubmittingSyllabus(true);
    try {
      const formData = new FormData();
      formData.append('subject', syllabusForm.subject);
      formData.append('session', syllabusForm.session);
      formData.append('title', syllabusForm.title);
      formData.append('file', syllabusForm.file);

      const res = await api.post('academics/syllabi/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201) {
        toast.success(`'${syllabusForm.title}' সিলেবাস সফলভাবে আপলোড হয়েছে`);
        setShowSyllabusModal(false);
        setSyllabusForm(prev => ({ ...prev, title: '', file: null }));
        fetchAllData();
      }
    } catch (err) {
      toast.error('সিলেবাস আপলোড ব্যর্থ হয়েছে');
    } finally {
      setSubmittingSyllabus(false);
    }
  };

  // হোমওয়ার্ক পোস্ট সাবমিট
  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    setSubmittingHomework(true);
    try {
      const formData = new FormData();
      formData.append('section', homeworkForm.section);
      formData.append('subject', homeworkForm.subject);
      formData.append('teacher', homeworkForm.teacher);
      formData.append('title', homeworkForm.title);
      formData.append('description', homeworkForm.description);
      formData.append('due_date', homeworkForm.due_date);
      if (homeworkForm.attachment) {
        formData.append('attachment', homeworkForm.attachment);
      }

      const res = await api.post('academics/homeworks/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201) {
        toast.success(`হোমওয়ার্ক '${homeworkForm.title}' সফলভাবে পোস্ট হয়েছে`);
        setShowHomeworkModal(false);
        setHomeworkForm(prev => ({ ...prev, title: '', description: '', attachment: null }));
        fetchAllData();
      }
    } catch (err) {
      toast.error('হোমওয়ার্ক পোস্ট ব্যর্থ হয়েছে');
    } finally {
      setSubmittingHomework(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ১. সিলেবাস সেকশন */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-brand-navy">অনুমোদিত সিলেবাস ফাইল</h3>
                <span className="text-xs text-slate-400">মোট ফাইল: {syllabi.length} টি</span>
              </div>
              
              <button
                onClick={() => setShowSyllabusModal(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন সিলেবাস</span>
              </button>
            </div>

            <div className="space-y-3">
              {syllabi.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো সিলেবাস আপলোড করা হয়নি।</p>
              ) : (
                syllabi.map(syl => (
                  <div key={syl.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{syl.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{syl.subject_name} | সেশন: {syl.session}</p>
                    </div>
                    <a 
                      href={syl.file} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center space-x-1 rounded-xl bg-[#0F2C59] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ২. হোমওয়ার্ক সেকশন */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-brand-navy">শিক্ষকদের দেওয়া হোমওয়ার্ক</h3>
                <span className="text-xs text-slate-400">মোট হোমওয়ার্ক: {homeworks.length} টি</span>
              </div>

              <button
                onClick={() => setShowHomeworkModal(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
              >
                <Plus className="h-4 w-4 text-brand-orange" />
                <span>নতুন হোমওয়ার্ক</span>
              </button>
            </div>

            <div className="space-y-3">
              {homeworks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো হোমওয়ার্ক দেওয়া হয়নি।</p>
              ) : (
                homeworks.map(hw => (
                  <div key={hw.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-brand-navy">{hw.title}</h4>
                      <span className="text-[10px] font-extrabold text-brand-orange bg-orange-50 px-2 py-0.5 rounded">
                        জমার তারিখ: {hw.due_date}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{hw.description}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                      <span>বিষয়: {hw.subject_name} ({hw.section_display})</span>
                      <span>শিক্ষক: {hw.teacher_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ================= ১. নতুন সিলেবাস আপলোড মডাল (Add Syllabus) ================= */}
      {showSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-1">Add Syllabus (নতুন সিলেবাস আপলোড)</h3>
            <p className="text-xs text-slate-400 mb-4">পাঠ্য বিষয় ও সেশন নির্বাচন করে সিলেবাসের ফাইল আপলোড করুন।</p>

            <form onSubmit={handleSyllabusSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject (বিষয়)</label>
                <select
                  value={syllabusForm.subject}
                  onChange={e => setSyllabusForm({ ...syllabusForm, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>[{s.code}] {s.name} ({s.class_level_display})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Session (সেশন)</label>
                <input
                  type="text"
                  placeholder="যেমন: 2025-2026"
                  value={syllabusForm.session}
                  onChange={e => setSyllabusForm({ ...syllabusForm, session: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">যেমন: 2025-2026</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Title (শিরোনাম)</label>
                <input
                  type="text"
                  placeholder="যেমন: একাদশ বিজ্ঞান - বার্ষিক পরীক্ষার পূর্ণাঙ্গ সিলেবাস"
                  value={syllabusForm.title}
                  onChange={e => setSyllabusForm({ ...syllabusForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">যেমন: একাদশ বিজ্ঞান - বার্ষিক পরীক্ষার পূর্ণাঙ্গ সিলেবাস</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">File (পিডিএফ বা ওয়ার্ড ফাইল)</label>
                <input
                  type="file"
                  onChange={e => setSyllabusForm({ ...syllabusForm, file: e.target.files[0] })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-700 bg-slate-50 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-navy file:text-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSyllabusModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingSyllabus}
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                >
                  {submittingSyllabus ? 'আপলোড হচ্ছে...' : 'SAVE (সিলেবাস সংরক্ষণ করুন)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ২. নতুন হোমওয়ার্ক তৈরির মডাল (Add Homework) ================= */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-brand-navy mb-1">Add Homework (হোমওয়ার্ক প্রদান করুন)</h3>
            <p className="text-xs text-slate-400 mb-4">শাখা, বিষয় ও জমার শেষ তারিখ উল্লেখ করে শিক্ষার্থীদের জন্য হোমওয়ার্ক পোস্ট করুন।</p>

            <form onSubmit={handleHomeworkSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Section (শাখা)</label>
                  <select
                    value={homeworkForm.section}
                    onChange={e => setHomeworkForm({ ...homeworkForm, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  >
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.class_level} - {sec.group} ({sec.section_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject (বিষয়)</label>
                  <select
                    value={homeworkForm.subject}
                    onChange={e => setHomeworkForm({ ...homeworkForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teacher (শিক্ষক)</label>
                  <select
                    value={homeworkForm.teacher}
                    onChange={e => setHomeworkForm({ ...homeworkForm, teacher: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name || t.username}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Due Date (জমার তারিখ)</label>
                  <input
                    type="date"
                    value={homeworkForm.due_date}
                    onChange={e => setHomeworkForm({ ...homeworkForm, due_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Title (শিরোনাম)</label>
                <input
                  type="text"
                  placeholder="যেমন: অধ্যায় ৩ এর ১ হতে ৫ নং সৃজনশীল প্রশ্নের সমাধান"
                  value={homeworkForm.title}
                  onChange={e => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description (বিস্তারিত বিবরণ)</label>
                <textarea
                  rows="3"
                  placeholder="শিক্ষার্থীদের জন্য বিস্তারিত নির্দেশনা লিখুন..."
                  value={homeworkForm.description}
                  onChange={e => setHomeworkForm({ ...homeworkForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Attachment (ঐচ্ছিক প্রশ্ন বা অ্যাসাইনমেন্ট ফাইল)</label>
                <input
                  type="file"
                  onChange={e => setHomeworkForm({ ...homeworkForm, attachment: e.target.files[0] })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-700 bg-slate-50 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0F2C59] file:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingHomework}
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                >
                  {submittingHomework ? 'পোস্ট হচ্ছে...' : 'SAVE (হোমওয়ার্ক পোস্ট করুন)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaterialsTab;