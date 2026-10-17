import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Plus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const SubjectsTab = ({ overrideRole = null }) => {
  const { user, isPrincipal } = useAuth();
  const canEdit = (isPrincipal || overrideRole === 'PRINCIPAL') && overrideRole !== 'TEACHER' && user?.role !== 'TEACHER';

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // মডাল স্টেট
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '', code: '', class_level: 'XI', group: 'SCI', default_teacher: ''
  });

  const [editSubjectTeacher, setEditSubjectTeacher] = useState(null);
  const [assignTeacherId, setAssignTeacherId] = useState('');

  const fetchSubjectsAndTeachers = async () => {
    try {
      const [subRes, teachRes] = await Promise.all([
        api.get('academics/subjects/'),
        api.get('auth/staff/?role=TEACHER')
      ]);
      setSubjects(subRes.data.results || subRes.data || []);
      setTeachers(teachRes.data.results || teachRes.data || []);
    } catch (err) {
      toast.error('বিষয়ের তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndTeachers();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...subjectForm,
        default_teacher: subjectForm.default_teacher || null
      };
      const res = await api.post('academics/subjects/', payload);
      if (res.status === 201) {
        toast.success(`'${res.data.name}' বিষয়টি সফলভাবে যুক্ত হয়েছে`);
        setShowSubjectModal(false);
        setSubjectForm({ name: '', code: '', class_level: 'XI', group: 'SCI', default_teacher: '' });
        fetchSubjectsAndTeachers();
      }
    } catch (err) {
      toast.error(err.response?.data?.code?.[0] || 'বিষয় তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleUpdateSubjectTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`academics/subjects/${editSubjectTeacher.id}/`, {
        default_teacher: assignTeacherId || null
      });
      toast.success('প্রভাষক সফলভাবে নির্ধারণ করা হয়েছে');
      setEditSubjectTeacher(null);
      fetchSubjectsAndTeachers();
    } catch (err) {
      toast.error('শিক্ষক আপডেট ব্যর্থ হয়েছে');
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
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
        <span className="text-xs font-bold text-slate-500">মোট পাঠ্য বিষয়: {subjects.length} টি</span>
        {canEdit && (
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন বিষয় যোগ</span>
          </button>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
            <tr>
              <th className="p-3">কোড</th>
              <th className="p-3">বিষয়ের নাম</th>
              <th className="p-3">শ্রেণি</th>
              <th className="p-3">বিভাগ / গ্রুপ</th>
              <th className="p-3">বিষয় শিক্ষক / প্রভাষক</th>
              <th className="p-3 text-center">স্ট্যাটাস</th>
              {canEdit && <th className="p-3 text-right">অ্যাকশন</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono text-brand-orange font-bold">[{sub.code}]</td>
                <td className="p-3 font-bold text-brand-navy">{sub.name}</td>
                <td className="p-3">{sub.class_level_display}</td>
                <td className="p-3">{sub.group_display}</td>
                <td className="p-3 text-slate-700">
                  {sub.default_teacher_name ? (
                    <span className="font-bold text-emerald-700">{sub.default_teacher_name}</span>
                  ) : (
                    <span className="text-slate-400">মনোনীত হয়নি</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold">
                    সচল
                  </span>
                </td>
                {canEdit && (
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setEditSubjectTeacher(sub);
                        setAssignTeacherId(sub.default_teacher || '');
                      }}
                      className="inline-flex items-center space-x-1 rounded-lg bg-slate-100 hover:bg-brand-sky hover:text-brand-navy px-2.5 py-1 text-[11px] font-bold text-slate-600 transition"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>প্রভাষক নির্ধারণ</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* বিষয় তৈরির মডাল */}
      {canEdit && showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-3">নতুন পাঠ্য বিষয় যুক্ত করুন</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিষয়ের নাম</label>
                <input
                  type="text" placeholder="যেমন: রসায়ন ১ম পত্র"
                  value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিষয় কোড</label>
                  <input
                    type="text" placeholder="যেমন: 176"
                    value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শ্রেণি</label>
                  <select
                    value={subjectForm.class_level} onChange={(e) => setSubjectForm({ ...subjectForm, class_level: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                  >
                    <option value="XI">একাদশ শ্রেণি (1st Year)</option>
                    <option value="XII">দ্বাদশ শ্রেণি (2nd Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিভাগ / গ্রুপ</label>
                <select
                  value={subjectForm.group} onChange={(e) => setSubjectForm({ ...subjectForm, group: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                >
                  <option value="SCI">বিজ্ঞান (Science)</option>
                  <option value="HUM">মানবিক (Humanities)</option>
                  <option value="BUS">ব্যবসায় শিক্ষা (Business Studies)</option>
                  <option value="GEN">সাধারণ (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">বিষয় শিক্ষক / প্রভাষক</label>
                <select
                  value={subjectForm.default_teacher} onChange={(e) => setSubjectForm({ ...subjectForm, default_teacher: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                >
                  <option value="">-- প্রভাষক নির্বাচন করুন --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name || t.username}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">যোগ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* প্রভাষক নির্ধারণ মডাল */}
      {canEdit && editSubjectTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy">প্রভাষক / বিষয় শিক্ষক নির্ধারণ</h3>
            <p className="text-xs text-slate-500 mt-1">বিষয়: {editSubjectTeacher.name} [{editSubjectTeacher.code}]</p>

            <form onSubmit={handleUpdateSubjectTeacher} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">প্রভাষক নির্বাচন করুন</label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                >
                  <option value="">-- কোনো শিক্ষক মনোনীত নয় --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setEditSubjectTeacher(null)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsTab;