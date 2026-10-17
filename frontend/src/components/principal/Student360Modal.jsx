import React, { useEffect, useState } from 'react';
import { Activity, Award, CreditCard, GraduationCap, User, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/client';

const tabs = [
  ['profile', 'Information', User],
  ['fees', 'Fees & Transactions', CreditCard],
  ['attendance', 'Attendance', Activity],
  ['exams', 'Exam Performance', Award],
];

const money = (value) => `৳ ${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

const Student360Modal = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await api.get(`academics/students/${student.id}/360/`);
        setDetails(response.data.data);
      } catch {
        toast.error('শিক্ষার্থীর পূর্ণ তথ্য লোড করা যায়নি');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [student.id]);

  const profile = details?.profile || student;
  const attendance = details?.attendance;
  const fees = details?.fees;
  const exams = details?.exams;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-premium">
        <div className="flex items-center justify-between bg-[#0F2C59] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">{profile.full_name}</h2>
              <p className="text-xs text-slate-300">SSC Roll: {profile.ssc_roll || '-'} · Student 360° Profile</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-300 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activeTab === key ? 'bg-brand-navy text-white' : 'text-slate-500 hover:bg-white'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="min-h-[360px] overflow-y-auto p-5">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ['Full name', profile.full_name],
                    ['Username', profile.username],
                    ['Gender', profile.gender_display || profile.gender],
                    ['SSC Roll', profile.ssc_roll],
                    ['Passing Year', profile.passing_year],
                    ['Class / Section', profile.section_name_display || profile.section],
                    ['Roll number', profile.roll_number],
                    ['Session', profile.session],
                    ['Father', profile.father_name],
                    ['Mother', profile.mother_name],
                    ['Guardian phone', profile.guardian_phone],
                    ['Guardian WhatsApp', profile.guardian_whatsapp_number],
                    ['Student WhatsApp', profile.student_whatsapp_number],
                    ['Address', profile.present_address],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{value || '-'}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {Object.entries(fees.summary).map(([label, value]) => (
                      <div key={label} className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold capitalize text-slate-500">{label}</p>
                        <p className="mt-1 text-xl font-black text-brand-navy">{money(value)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[700px] text-left text-xs">
                      <thead className="bg-slate-100"><tr><th className="p-3">Invoice</th><th className="p-3">Period</th><th className="p-3">Total</th><th className="p-3">Paid</th><th className="p-3">Due</th><th className="p-3">Status</th></tr></thead>
                      <tbody className="divide-y divide-slate-200">{fees.invoices.map((invoice) => <tr key={invoice.id}><td className="p-3 font-semibold">{invoice.invoice_number}</td><td className="p-3">{invoice.month}/{invoice.year}</td><td className="p-3">{money(invoice.total_amount)}</td><td className="p-3">{money(invoice.paid_amount)}</td><td className="p-3 text-red-600">{money(invoice.due_amount)}</td><td className="p-3">{invoice.status}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">{Object.entries(attendance.summary).map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-brand-navy">{value}</p></div>)}</div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{attendance.records.map((record) => <div key={record.date} className="flex justify-between rounded-xl border border-slate-200 p-3 text-xs"><span>{record.date}</span><span className="font-bold">{record.status_display}</span></div>)}</div>
                </div>
              )}

              {activeTab === 'exams' && (
                <div className="space-y-5">
                  <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-slate-100"><tr><th className="p-3">Exam</th><th className="p-3">Marks</th><th className="p-3">GPA</th><th className="p-3">Grade</th><th className="p-3">Position</th><th className="p-3">Result</th></tr></thead><tbody className="divide-y divide-slate-200">{exams.results.map((result) => <tr key={result.exam_id}><td className="p-3 font-semibold">{result.exam}</td><td className="p-3">{result.total_obtained_marks}/{result.total_full_marks}</td><td className="p-3">{result.gpa}</td><td className="p-3">{result.grade_letter}</td><td className="p-3">Section {result.section_position || '-'} / Class {result.class_position || '-'}</td><td className="p-3">{result.is_passed ? 'Passed' : 'Failed'}</td></tr>)}</tbody></table></div>
                  <h3 className="text-sm font-bold text-brand-navy">Subject-wise marks</h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{exams.subject_marks.map((mark, index) => <div key={`${mark.exam}-${mark.subject}-${index}`} className="rounded-xl border border-slate-200 p-3 text-xs"><p className="font-bold">{mark.subject}</p><p className="mt-1 text-slate-500">{mark.exam} · {mark.final_total_marks} · {mark.grade_letter} ({mark.grade_point})</p></div>)}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student360Modal;
