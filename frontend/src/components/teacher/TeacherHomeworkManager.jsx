import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Plus, FileText, Calendar, Upload } from 'lucide-react';
import { toast } from 'sonner';

const TeacherHomeworkManager = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    section: '',
    subject: '',
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    attachment: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [hwRes, secRes, subRes] = await Promise.all([
        api.get('academics/homeworks/'),
        api.get('academics/sections/'),
        api.get('academics/subjects/'),
      ]);
      setHomeworks(hwRes.data.results || hwRes.data || []);
      const sList = secRes.data.results || secRes.data || [];
      const subList = subRes.data.results || subRes.data || [];
      setSections(sList);
      setSubjects(subList);
      if (sList.length > 0) setForm(prev => ({ ...prev, section: sList[0].id }));
      if (subList.length > 0) setForm(prev => ({ ...prev, subject: subList[0].id }));
    } catch (e) {
      toast.error('হোমওয়ার্ক ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('section', form.section);
      formData.append('subject', form.subject);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('due_date', form.due_date);
      if (form.attachment) {
        formData.append('attachment', form.attachment);
      }

      const res = await api.post('academics/homeworks/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201) {
        toast.success('হোমওয়ার্ক সফলভাবে পোস্ট করা হয়েছে');
        setShowModal(false);
        setForm(prev => ({ ...prev, title: '', description: '', attachment: null }));
        fetchData();
      }
    } catch (err) {
      toast.error('হোমওয়ার্ক পোস্ট ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <span className="text-xs font-bold text-slate-500">আপনার পোস্টকৃত হোমওয়ার্ক: {homeworks.length} টি</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন হোমওয়ার্ক প্রদান</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center col-span-2">কোনো হোমওয়ার্ক পোস্ট করা নেই।</p>
        ) : (
          homeworks.map((hw) => (
            <div key={hw.id} className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-soft">
              <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-brand-navy">{hw.title}</h4>
                <span className="text-[10px] font-extrabold text-brand-orange bg-orange-50 px-2 py-0.5 rounded">
                  জমা: {hw.due_date}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 line-clamp-3">{hw.description}</p>
              <div className="mt-3 flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>শাখা: <strong className="text-slate-700">{hw.section_display}</strong></span>
                <span>বিষয়: <strong className="text-slate-700">{hw.subject_name}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-3">নতুন হোমওয়ার্ক পোস্ট করুন</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শাখা</label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                    required
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>{s.class_level} - {s.group} ({s.section_name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিষয়</label>
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
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শিরোনাম</label>
                <input
                  type="text"
                  placeholder="যেমন: অধ্যায় ৩ এর সৃজনশীল প্রশ্ন ১ ও ২"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">জমার শেষ তারিখ</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিস্তারিত নির্দেশনা</label>
                <textarea
                  rows="3"
                  placeholder="হোমওয়ার্কের প্রয়োজনীয় নির্দেশাবলী..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ফাইল সংযুক্তি (ঐচ্ছিক)</label>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, attachment: e.target.files[0] })}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0F2C59] file:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">
                  {submitting ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHomeworkManager;