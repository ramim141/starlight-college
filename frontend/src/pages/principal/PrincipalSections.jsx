import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { BookOpen, UserCheck, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalSections = () => {
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ইনচার্জ নিয়োগ মডাল স্টেট
  const [assignModalSec, setAssignModalSec] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // নতুন শাখা তৈরির মডাল স্টেট (Django Admin এর হুবহু ফর্ম)
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [createSectionForm, setCreateSectionForm] = useState({
    class_level: 'XI',
    group: 'SCI',
    section_name: 'A',
    session: '2025-2026',
    in_charge_teacher: '',
    is_active: true
  });
  const [submittingSection, setSubmittingSection] = useState(false);

  const fetchData = async () => {
    try {
      const [secRes, staffRes] = await Promise.all([
        api.get('academics/sections/'),
        api.get('auth/staff/?role=TEACHER')
      ]);
      setSections(secRes.data.results || secRes.data || []);
      setTeachers(staffRes.data.results || staffRes.data || []);
    } catch (err) {
      toast.error('সেকশন ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ইনচার্জ নিয়োগ সাবমিট
  const handleAssignIncharge = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`academics/sections/${assignModalSec.id}/assign-incharge/`, {
        teacher_id: selectedTeacherId
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setAssignModalSec(null);
        fetchData();
      }
    } catch (err) {
      toast.error('ইনচার্জ নিয়োগ ব্যর্থ হয়েছে');
    }
  };

  // নতুন সেকশন তৈরি সাবমিট
  const handleCreateSectionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSection(true);
    try {
      const payload = {
        ...createSectionForm,
        in_charge_teacher: createSectionForm.in_charge_teacher || null
      };
      const res = await api.post('academics/sections/', payload);
      if (res.status === 201) {
        toast.success(`নতুন শাখা '${res.data.class_level_display} - ${res.data.group_display} (${res.data.section_name})' তৈরি হয়েছে`);
        setShowCreateSectionModal(false);
        setCreateSectionForm({
          class_level: 'XI',
          group: 'SCI',
          section_name: 'A',
          session: '2025-2026',
          in_charge_teacher: '',
          is_active: true
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'শাখা তৈরি ব্যর্থ হয়েছে। এই সেশনে একই শাখা আগে থেকেই থাকতে পারে।');
    } finally {
      setSubmittingSection(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* হেডার ও নতুন শাখা তৈরি বাটন */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">একাডেমিক শ্রেণি, শাখা ও ইনচার্জ</h2>
          <p className="text-xs text-slate-500">নতুন শাখা তৈরি করুন এবং শিক্ষকদের শ্রেণি ইনচার্জ হিসেবে দায়িত্ব দিন।</p>
        </div>

        <button
          onClick={() => setShowCreateSectionModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন শাখা তৈরি করুন</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(sec => (
            <div key={sec.id} className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-extrabold text-brand-navy">
                    {sec.class_level_display} ({sec.group_display})
                  </span>
                  <span className="rounded-xl bg-orange-50 px-2.5 py-1 text-xs font-black text-brand-orange">
                    শাখা: {sec.section_name}
                  </span>
                </div>

                <div className="my-4 space-y-1.5 text-xs text-slate-600">
                  <p>সেশন: <strong className="text-slate-800">{sec.session}</strong></p>
                  <p>মোট শিক্ষার্থী: <strong className="text-brand-navy">{sec.total_students} জন</strong></p>
                  <p className="mt-2 text-xs">
                    বর্তমান ইনচার্জ: <strong className="text-emerald-700 block text-sm mt-0.5">{sec.in_charge_teacher_name || "মনোনীত করা হয়নি"}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAssignModalSec(sec);
                  setSelectedTeacherId(sec.in_charge_teacher || '');
                }}
                className="mt-2 flex items-center justify-center space-x-2 rounded-xl bg-brand-navy py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
              >
                <UserCheck className="h-4 w-4" />
                <span>ইনচার্জ পরিবর্তন / নিয়োগ</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* নতুন শাখা তৈরির মডাল (Add Academic Section) */}
      {showCreateSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy mb-1">নতুন একাডেমিক শাখা তৈরি (Add Section)</h3>
            <p className="text-xs text-slate-400 mb-4">শ্রেণি, বিভাগ ও সেশন উল্লেখ করে শাখা নির্ধারণ করুন।</p>

            <form onSubmit={handleCreateSectionSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class Level (শ্রেণি)</label>
                  <select
                    value={createSectionForm.class_level}
                    onChange={e => setCreateSectionForm({ ...createSectionForm, class_level: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  >
                    <option value="XI">একাদশ শ্রেণি (1st Year)</option>
                    <option value="XII">দ্বাদশ শ্রেণি (2nd Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Group (বিভাগ)</label>
                  <select
                    value={createSectionForm.group}
                    onChange={e => setCreateSectionForm({ ...createSectionForm, group: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  >
                    <option value="SCI">বিজ্ঞান (Science)</option>
                    <option value="HUM">মানবিক (Humanities)</option>
                    <option value="BUS">ব্যবসায় শিক্ষা (Business Studies)</option>
                    <option value="GEN">সাধারণ (General)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Section Name (শাখার নাম)</label>
                  <input
                    type="text"
                    placeholder="যেমন: A, B বা ক, খ বা Male, Female"
                    value={createSectionForm.section_name}
                    onChange={e => setCreateSectionForm({ ...createSectionForm, section_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">যেমন: A, B বা ক, খ</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Session (শিক্ষাবর্ষ)</label>
                  <input
                    type="text"
                    placeholder="যেমন: 2025-2026"
                    value={createSectionForm.session}
                    onChange={e => setCreateSectionForm({ ...createSectionForm, session: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">যেমন: 2025-2026</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">In charge teacher (শ্রেণি ইনচার্জ - ঐচ্ছিক)</label>
                <select
                  value={createSectionForm.in_charge_teacher}
                  onChange={e => setCreateSectionForm({ ...createSectionForm, in_charge_teacher: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                >
                  <option value="">-- কোনো শিক্ষক মনোনীত নয় --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="secIsActive"
                  checked={createSectionForm.is_active}
                  onChange={e => setCreateSectionForm({ ...createSectionForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-brand-orange rounded"
                />
                <label htmlFor="secIsActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Is active (শাখাটি বর্তমানে সক্রিয়)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateSectionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingSection}
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                >
                  {submittingSection ? 'সংরক্ষণ হচ্ছে...' : 'SAVE (শাখা তৈরি করুন)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ইনচার্জ অ্যাসাইন মডাল */}
      {assignModalSec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy">শ্রেণি ইনচার্জ নিয়োগ</h3>
            <p className="text-xs text-slate-500 mt-1">{assignModalSec.class_level_display} - {assignModalSec.group_display} (শাখা: {assignModalSec.section_name})</p>

            <form onSubmit={handleAssignIncharge} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শিক্ষক নির্বাচন করুন</label>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                  required
                >
                  <option value="">-- শিক্ষক সিলেক্ট করুন --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setAssignModalSec(null)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">নিশ্চিত করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalSections;