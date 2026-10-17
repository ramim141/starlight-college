import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Users, UserPlus, Phone, Mail, Award, CheckCircle2, Upload, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    role: 'TEACHER',
    employee_id: '',
    designation: 'Lecturer',
    department: 'Chemistry',
    base_salary: '28000.00',
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('auth/staff/');
      const list = res.data.results || res.data;
      setStaffList(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('স্টাফ তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('auth/staff/', formData);
      if (res.data.success || res.status === 201) {
        toast.success('নতুন স্টাফ সফলভাবে তৈরি হয়েছে');
        setShowModal(false);
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.username?.[0] || 'স্টাফ তৈরি ব্যর্থ হয়েছে');
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setImporting(true);
    try {
      const res = await api.post('academics/students/bulk-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResults(res.data.data || []);
      toast.success(res.data.message || 'Student import সফল হয়েছে');
      fetchStaff();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const detail = Array.isArray(errors) ? ` Row ${errors[0]?.row}: ${JSON.stringify(errors[0]?.error)}` : '';
      toast.error((err.response?.data?.message || 'Excel import ব্যর্থ হয়েছে') + detail);
    } finally {
      setImporting(false);
    }
  };

  const whatsappUrl = (student) => {
    const number = (student.guardian_whatsapp_number || student.student_whatsapp_number || '').replace(/\D/g, '');
    if (!number) return '';
    const normalized = number.startsWith('0') ? `88${number}` : number;
    const message = `Starlight College Portal Login\nSSC Roll: ${student.ssc_roll}\nPassing Year: ${student.passing_year}\nTemporary PIN: ${student.pin}`;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">শিক্ষক ও স্টাফ তালিকা</h2>
          <p className="text-xs text-slate-500">কলেজের সমস্ত শিক্ষক, শ্রেণি ইনচার্জ ও অ্যাকাউন্ট্যান্টদের নিয়ন্ত্রণ করুন।</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>নতুন শিক্ষক / স্টাফ যোগ করুন</span>
        </button>
        <label className="flex cursor-pointer items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition">
          <Upload className="h-4 w-4" />
          <span>{importing ? 'Import হচ্ছে...' : 'Excel দিয়ে Student Import'}</span>
          <input type="file" accept=".xlsx,.xlsm" className="hidden" onChange={handleBulkImport} disabled={importing} />
        </label>
      </div>

      {importResults.length > 0 && (
        <div className="rounded-3xl bg-emerald-50 p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-900">Import সফল — Temporary PIN পাঠান</h3>
            <button onClick={() => setImportResults([])} className="text-xs text-emerald-700">বন্ধ করুন</button>
          </div>
          <div className="mt-3 space-y-2">
            {importResults.map((student) => (
              <div key={student.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-slate-700">{student.name} · SSC {student.ssc_roll} · PIN {student.pin}</span>
                {whatsappUrl(student) ? (
                  <a href={whatsappUrl(student)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 font-bold text-white">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                ) : (
                  <span className="text-amber-700">WhatsApp নম্বর নেই</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : staffList.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-100">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">কোনো স্টাফ পাওয়া যায়নি</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((s) => (
            <div key={s.id} className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-soft">
              <div className="flex items-center space-x-3.5 pb-3 border-b border-slate-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white text-lg font-bold">
                  {s.first_name?.[0] || s.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">{s.full_name || s.username}</h4>
                  <span className="text-[10px] font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    {s.role_display}
                  </span>
                </div>
              </div>

              <div className="my-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center"><Phone className="mr-2 h-3.5 w-3.5 text-slate-400" /> {s.phone || "ফোন নেই"}</p>
                <p className="flex items-center"><Mail className="mr-2 h-3.5 w-3.5 text-slate-400" /> {s.email || "ইমেইল নেই"}</p>
                {s.teacher_profile && (
                  <p className="flex items-center"><Award className="mr-2 h-3.5 w-3.5 text-slate-400" /> {s.teacher_profile.designation} ({s.teacher_profile.department})</p>
                )}
              </div>

              {s.is_class_incharge && (
                <div className="mt-2 rounded-xl bg-emerald-50 p-2 text-center text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  ✨ শ্রেণি ইনচার্জ দায়িত্বপ্রাপ্ত
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* স্টাফ তৈরির মডাল */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-brand-navy mb-3">নতুন স্টাফ বা শিক্ষক অ্যাকাউন্ট</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" placeholder="ইউজারনেম (যেমন: teacher_phy)"
                  value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                  className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                />
                <input
                  type="password" placeholder="পাসওয়ার্ড"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                />
                <input
                  type="text" placeholder="নামের প্রথম অংশ"
                  value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})}
                  className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                />
                <input
                  type="text" placeholder="নামের শেষ অংশ"
                  value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})}
                  className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
                <input
                  type="text" placeholder="ফোন নম্বর"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                />
                <select
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold bg-slate-50"
                >
                  <option value="TEACHER">শিক্ষক (Teacher)</option>
                  <option value="ACCOUNTANT">অ্যাকাউন্ট্যান্ট (Accountant)</option>
                </select>
              </div>

              {formData.role === 'TEACHER' && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <input
                    type="text" placeholder="Employee ID (যেমন: TCH-2026-02)"
                    value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})}
                    className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                  />
                  <input
                    type="text" placeholder="বিভাগ (যেমন: পদার্থবিজ্ঞান)"
                    value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                    className="rounded-xl border border-slate-200 p-2.5 text-xs font-bold" required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
                <button type="submit" className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">তৈরি করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalStaff;