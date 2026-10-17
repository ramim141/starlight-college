import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, MessageCircle, Search, Upload, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/client';
import Student360Modal from './Student360Modal';

const StudentManagementPanel = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('academics/students/');
      const list = response.data.results || response.data;
      setStudents(Array.isArray(list) ? list : []);
    } catch {
      toast.error('শিক্ষার্থী তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setImporting(true);
    try {
      const response = await api.post('academics/students/bulk-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResults(response.data.data || []);
      toast.success(response.data.message || 'Student import সফল হয়েছে');
      fetchStudents();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = Array.isArray(errors) && errors[0]
        ? ` Row ${errors[0].row}: ${JSON.stringify(errors[0].error)}`
        : '';
      toast.error((error.response?.data?.message || 'Excel import ব্যর্থ হয়েছে') + firstError);
    } finally {
      setImporting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => [
      student.full_name,
      student.student_unique_id,
      student.ssc_roll,
      student.guardian_phone,
      student.roll_number,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [searchTerm, students]);

  const getWhatsAppUrl = (student) => {
    const number = (student.guardian_whatsapp_number || student.student_whatsapp_number || '')
      .replace(/\D/g, '');
    if (!number) return '';
    const normalized = number.startsWith('0') ? `88${number}` : number;
    const message = [
      'Starlight College Portal Login',
      `SSC Roll: ${student.ssc_roll || ''}`,
      `Passing Year: ${student.passing_year || ''}`,
      `Temporary PIN: ${student.pin || student.temporary_pin || ''}`,
    ].join('\n');
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#0F2C59] to-[#1A365D] p-6 text-white shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Student Management</h1>
              <p className="mt-1 text-xs text-slate-300">Student account, profile ও temporary PIN পরিচালনা করুন</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/student_import_template.xlsx"
              download="student_import_template.xlsx"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-xs font-bold text-white shadow-lg transition"
            >
              <Download className="h-4 w-4 text-brand-orange" />
              টেমপ্লেট ডাউনলোড
            </a>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold shadow-lg transition hover:bg-emerald-700">
              <Upload className="h-4 w-4" />
              {importing ? 'Import হচ্ছে...' : 'Excel Upload'}
              <input type="file" accept=".xlsx,.xlsm" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
          </div>
        </div>
      </section>

      {importResults.length > 0 && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-900">Import সফল — WhatsApp-এ PIN পাঠান</h2>
            <button type="button" onClick={() => setImportResults([])} className="text-xs font-semibold text-emerald-700">বন্ধ করুন</button>
          </div>
          <div className="mt-3 grid gap-2">
            {importResults.map((student) => (
              <div key={student.id} className="flex flex-col gap-2 rounded-xl bg-white p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-slate-700">
                  {student.name} · SSC {student.ssc_roll} · PIN {student.pin}
                </span>
                {getWhatsAppUrl(student) ? (
                  <a href={getWhatsAppUrl(student)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 font-bold text-white">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                ) : <span className="text-amber-700">WhatsApp নম্বর নেই</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-orange" />
            <h2 className="text-sm font-bold text-brand-navy">শিক্ষার্থী তালিকা ({students.length})</h2>
          </div>
          <div className="relative sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="নাম, SSC Roll, রোল বা ফোন দিয়ে খুঁজুন"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs focus:border-brand-orange focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-400">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[850px] border-collapse text-left text-xs">
              <thead className="bg-[#0F2C59] text-[11px] font-bold text-white">
                <tr>
                  <th className="p-3">রোল</th>
                  <th className="p-3">নাম</th>
                  <th className="p-3">SSC Roll</th>
                  <th className="p-3">Passing Year</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Guardian Phone</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} onClick={() => setSelectedStudent(student)} className="cursor-pointer hover:bg-slate-50">
                    <td className="p-3 font-bold text-brand-orange">{student.roll_number}</td>
                    <td className="p-3 text-slate-900">{student.full_name}</td>
                    <td className="p-3 font-mono">{student.ssc_roll || '-'}</td>
                    <td className="p-3">{student.passing_year || '-'}</td>
                    <td className="p-3">{student.section_name_display || student.section || '-'}</td>
                    <td className="p-3">{student.guardian_phone || '-'}</td>
                    <td className="p-3" onClick={(event) => event.stopPropagation()}>
                      {getWhatsAppUrl(student) ? (
                        <a href={getWhatsAppUrl(student)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-2.5 py-1.5 text-green-700 hover:bg-green-200">
                          <MessageCircle className="h-3.5 w-3.5" /> Send PIN
                        </a>
                      ) : <span className="text-slate-400">No WhatsApp</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selectedStudent && <Student360Modal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
    </div>
  );
};

export default StudentManagementPanel;
