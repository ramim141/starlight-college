import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Award, 
  CreditCard, 
  GraduationCap, 
  User, 
  X, 
  Bus, 
  AlertTriangle, 
  Phone, 
  Calendar, 
  CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/client';
import { modalBackdropVariants, modalDialogVariants } from '../../utils/motion';

const tabs = [
  ['profile', 'প্রোফাইল ও তথ্য', User],
  ['attendance', 'হাজিরা ও ট্রেন্ড', Activity],
  ['fees', 'ফি ও বকেয়া', CreditCard],
  ['exams', 'পরীক্ষার ফলাফল', Award],
  ['transport', 'পরিবহন ও রুট', Bus],
  ['atrisk', 'ঝুঁকি ও সতর্কতা', AlertTriangle],
];

const money = (value) => `৳ ${Number(value || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

const Student360Modal = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const { data: details = null, isLoading: loading } = useQuery({
    queryKey: ['student-360', student?.id],
    queryFn: async () => {
      try {
        const response = await api.get(`academics/students/${student.id}/360/`);
        return response.data?.data || null;
      } catch {
        toast.error('শিক্ষার্থীর পূর্ণ তথ্য লোড করা যায়নি');
        return null;
      }
    },
    enabled: !!student?.id,
    staleTime: 1000 * 60 * 5,
  });

  if (!student) return null;

  const profile = details?.profile || student;
  const attendance = details?.attendance;
  const fees = details?.fees;
  const exams = details?.exams;

  // ক্যালকুলেটেড রিস্ক ফ্যাক্টর
  const attendancePct = attendance?.total > 0
    ? Math.round(((attendance.summary?.PRESENT || 0) + (attendance.summary?.LATE || 0)) / attendance.total * 100)
    : 100;
  const isAtRiskAttendance = attendancePct < 70;
  const failedExams = exams?.results?.filter((r) => !r.is_passed) || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <motion.div
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <motion.div
        variants={modalDialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
      >
        {/* হেডার */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#0A2147] to-[#0F2C59] p-5 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-sm font-bold text-base">
              {profile.first_name ? profile.first_name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold">{profile.full_name || profile.student_unique_id}</h2>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase">
                  রোল {profile.roll_number}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                ID: {profile.student_unique_id} · {profile.section_name_display || profile.section} ({profile.session})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-300 hover:bg-white/10 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ট্যাব নেভিগেশন */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 shrink-0">
          {tabs.map(([key, label, Icon]) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition min-h-[40px] cursor-pointer ${
                  active ? 'text-white bg-brand-navy shadow-sm' : 'text-slate-600 hover:bg-white/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* বডি */}
        <div className="min-h-[360px] flex-1 overflow-y-auto p-6 text-xs">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
            </div>
          ) : (
            <div>
              {/* ট্যাব ১: প্রোফাইল ও অভিভাবক */}
              {activeTab === 'profile' && (
                <div data-tab-panel="true" className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ['পুরো নাম', profile.full_name],
                      ['ইউনিক আইডি', profile.student_unique_id],
                      ['শ্রেণি ও শাখা', `${profile.class_level_display || profile.class_level} - ${profile.section_name_display || ''}`],
                      ['বিভাগ', profile.group_display || profile.group],
                      ['সেশন', profile.session],
                      ['ক্লাস রোল', profile.roll_number],
                      ['এসএসসি রোল', profile.ssc_roll || '—'],
                      ['পাসিং ইয়ার', profile.passing_year || '—'],
                      ['রেজিস্ট্রেশন নম্বর', profile.hsc_registration_no || '—'],
                      ['পিতার নাম', profile.father_name || '—'],
                      ['মাতার নাম', profile.mother_name || '—'],
                      ['অভিভাবক ফোন', profile.guardian_phone || '—'],
                      ['বর্তমান ঠিকানা', profile.present_address || '—'],
                      ['মাসিক টিউশন ফি', `৳${profile.monthly_tuition_fee || 0}`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                        <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                        <p className="mt-1 text-xs font-extrabold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ট্যাব ২: হাজিরা ও ট্রেন্ড */}
              {activeTab === 'attendance' && (
                <div data-tab-panel="true" className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                      <p className="text-[11px] font-bold text-emerald-700">উপস্থিতি হার</p>
                      <p className="mt-1 text-2xl font-black text-emerald-800">{attendancePct}%</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                      <p className="text-[11px] font-bold text-blue-700">মোট কার্যদিবস</p>
                      <p className="mt-1 text-2xl font-black text-blue-800">{attendance?.total || 0} দিন</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <p className="text-[11px] font-bold text-slate-600">উপস্থিত</p>
                      <p className="mt-1 text-2xl font-black text-slate-800">{attendance?.summary?.PRESENT || 0} দিন</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                      <p className="text-[11px] font-bold text-amber-700">দেরিতে</p>
                      <p className="mt-1 text-2xl font-black text-amber-800">{attendance?.summary?.LATE || 0} দিন</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-brand-navy pt-2">সাম্প্রতিক হাজিরা লগ</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-60 overflow-y-auto">
                    {attendance?.records?.map((record, i) => (
                      <div key={i} className="flex justify-between items-center rounded-xl border border-slate-200 p-3 text-xs bg-slate-50">
                        <span className="font-mono text-slate-700">{record.date}</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {record.status_display || record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ট্যাব ৩: ফি ও বকেয়া */}
              {activeTab === 'fees' && (
                <div data-tab-panel="true" className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                      <p className="text-[11px] font-bold text-blue-700">মোট ধার্যকৃত ফি</p>
                      <p className="mt-1 text-xl font-black text-blue-900">{money(fees?.summary?.total)}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                      <p className="text-[11px] font-bold text-emerald-700">পরিশোধিত টাকা</p>
                      <p className="mt-1 text-xl font-black text-emerald-800">{money(fees?.summary?.paid)}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
                      <p className="text-[11px] font-bold text-rose-700">মোট বকেয়া</p>
                      <p className="mt-1 text-xl font-black text-rose-800">{money(fees?.summary?.due)}</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-brand-navy pt-2">ইনভয়েস তালিকা</h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <tr>
                          <th className="p-3">ইনভয়েস নম্বর</th>
                          <th className="p-3">মাস/বছর</th>
                          <th className="p-3">মোট</th>
                          <th className="p-3">পরিশোধিত</th>
                          <th className="p-3">বকেয়া</th>
                          <th className="p-3">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fees?.invoices?.map((inv) => (
                          <tr key={inv.id}>
                            <td className="p-3 font-mono font-bold text-brand-navy">{inv.invoice_number}</td>
                            <td className="p-3 font-mono">{inv.month}/{inv.year}</td>
                            <td className="p-3">{money(inv.total_amount)}</td>
                            <td className="p-3 text-emerald-700 font-bold">{money(inv.paid_amount)}</td>
                            <td className="p-3 text-rose-600 font-bold">{money(inv.due_amount)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ট্যাব ৪: পরীক্ষার ফলাফল */}
              {activeTab === 'exams' && (
                <div data-tab-panel="true" className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <tr>
                          <th className="p-3">পরীক্ষা</th>
                          <th className="p-3">প্রাপ্ত নম্বর</th>
                          <th className="p-3">GPA</th>
                          <th className="p-3">গ্রেড</th>
                          <th className="p-3">মেধা স্থান</th>
                          <th className="p-3">ফলাফল</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {exams?.results?.map((res) => (
                          <tr key={res.exam_id}>
                            <td className="p-3 font-bold text-slate-800">{res.exam}</td>
                            <td className="p-3 font-mono">{res.total_obtained_marks}/{res.total_full_marks}</td>
                            <td className="p-3 font-black text-brand-orange">{res.gpa}</td>
                            <td className="p-3 font-bold">{res.grade_letter}</td>
                            <td className="p-3">শাখা {res.section_position || '—'} / শ্রেণি {res.class_position || '—'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                res.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {res.is_passed ? 'উত্তীর্ণ' : 'অকৃতকার্য'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h4 className="font-bold text-brand-navy pt-2">বিষয়ভিত্তিক নম্বর তালিকা</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-52 overflow-y-auto">
                    {exams?.subject_marks?.map((sub, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <p className="font-bold text-slate-800">{sub.subject}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {sub.exam} · {sub.final_total_marks} নম্বর · গ্রেড {sub.grade_letter} ({sub.grade_point})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ট্যাব ৫: পরিবহন ও রুট */}
              {activeTab === 'transport' && (
                <div data-tab-panel="true" className="space-y-4">
                  {profile.uses_transport ? (
                    <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-600 text-white rounded-xl">
                          <Bus className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-blue-900">কলেজ বাস যাত্রী</h4>
                          <p className="text-xs text-blue-700">শিক্ষার্থী নিয়মিত পরিবহন সুবিধা গ্রহণ করছেন</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-blue-100">
                          <span className="text-[10px] text-slate-400 block font-bold">নির্ধারিত গাড়ি নম্বর:</span>
                          <strong className="text-slate-800 font-mono">{profile.assigned_vehicle_number || 'গাড়ি নং ১'}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-blue-100">
                          <span className="text-[10px] text-slate-400 block font-bold">মাসিক পরিবহন ফি:</span>
                          <strong className="text-brand-orange font-mono">৳{profile.monthly_transport_fee || '০.০০'}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                      <Bus className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-50" />
                      <p className="text-xs font-bold text-slate-600">এই শিক্ষার্থী পরিবহন সেবা ব্যবহার করছেন না।</p>
                    </div>
                  )}
                </div>
              )}

              {/* ট্যাব ৬: ঝুঁকি ও সতর্কতা */}
              {activeTab === 'atrisk' && (
                <div data-tab-panel="true" className="space-y-3">
                  {isAtRiskAttendance || failedExams.length > 0 ? (
                    <div className="space-y-3">
                      {isAtRiskAttendance && (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                          <h5 className="font-bold text-rose-800 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            <span>কম উপস্থিতির সতর্কতা</span>
                          </h5>
                          <p className="text-xs text-rose-700">
                            শিক্ষার্থীর সামগ্রিক উপস্থিতি মাত্র {attendancePct}%, যা সর্বনিম্ন ৭০% সীমার নিচে। অভিভাবককে অবগত করা প্রয়োজন।
                          </p>
                        </div>
                      )}

                      {failedExams.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                          <h5 className="font-bold text-amber-800 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            <span>একাডেমিক ফলাফল ঝুঁকি</span>
                          </h5>
                          <p className="text-xs text-amber-700">
                            শিক্ষার্থী {failedExams.length}টি পরীক্ষায় অকৃতকার্য হয়েছেন। বিশেষ কেয়ার নেওয়া আবশ্যক।
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600 opacity-70" />
                      <p className="text-xs font-bold text-emerald-800">কোনো সক্রিয় একাডেমিক বা উপস্থিতির ঝুঁকি নেই। শিক্ষার্থী স্বাভাবিক গতিতে পাঠ গ্রহণ করছেন।</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Student360Modal;


