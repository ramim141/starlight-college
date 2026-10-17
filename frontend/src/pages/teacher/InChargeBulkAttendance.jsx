import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSectionsApi, getSectionAttendanceSheetApi, submitBulkAttendanceApi } from '../../api/teacher';
import {
  CalendarCheck,
  Save,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Printer,
  Search,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

const InChargeBulkAttendance = () => {
  const { user, refreshUser } = useAuth();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  // ফিল্টার ও সার্চ স্টেট
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | PRESENT | ABSENT | LATE

  useEffect(() => {
    const fetchSections = async () => {
      setSectionsLoading(true);
      try {
        if (refreshUser) await refreshUser();
        const res = await getSectionsApi();
        const list = res.results || res || [];

        // If teacher, filter to sections where they are in-charge
        let eligible = list;
        if (user?.role === 'TEACHER') {
          eligible = list.filter(
            (sec) =>
              sec.in_charge_teacher === user.id ||
              user?.incharge_sections?.some((s) => s.id === sec.id)
          );
        }

        setSections(eligible);
        if (eligible.length > 0) {
          setSelectedSection(eligible[0].id);
        }
      } catch (err) {
        toast.error('শাখার তালিকা লোড করা যায়নি');
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, [user?.id]);

  const fetchSheet = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const res = await getSectionAttendanceSheetApi(selectedSection, date);
      if (res.success) {
        setStudents(res.students || []);
        setIsAlreadySubmitted(Boolean(res.is_submitted));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'হাজিরা শিট পাওয়া যায়নি');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheet();
  }, [selectedSection, date]);

  // স্ট্যাটাস পরিবর্তন
  const setStatus = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status } : s))
    );
  };

  // মন্তব্য পরিবর্তন
  const setRemarks = (studentId, remarks) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, remarks } : s))
    );
  };

  // বাল্ক অ্যাকশন
  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })));
    toast.success('সকল শিক্ষার্থীকে উপস্থিত (Present) মার্ক করা হয়েছে');
  };

  const handleMarkAllAbsent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'ABSENT' })));
    toast.info('সকল শিক্ষার্থীকে অনুপস্থিত (Absent) মার্ক করা হয়েছে');
  };

  // মেট্রিক্স গণনা
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === 'PRESENT').length;
    const absent = students.filter((s) => s.status === 'ABSENT').length;
    const late = students.filter((s) => s.status === 'LATE').length;
    const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, pct };
  }, [students]);

  // সার্চ ও ফিল্টার অনুযায়ী ফিল্টার করা শিক্ষার্থী
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const matchesSearch =
        stu.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stu.roll_number?.toString().includes(searchTerm) ||
        stu.student_unique_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || stu.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const handleSubmit = async () => {
    if (!selectedSection) {
      toast.error('অনুগ্রহ করে শাখা নির্বাচন করুন');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        section_id: selectedSection,
        date: date,
        attendance_records: students.map((s) => ({
          student_id: s.student_id,
          status: s.status,
          remarks: s.remarks || '',
        })),
      };

      const res = await submitBulkAttendanceApi(payload);
      if (res.success) {
        toast.success(res.message || 'হাজিরা সফলভাবে সংরক্ষিত হয়েছে');
        setIsAlreadySubmitted(true);
        fetchSheet();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'হাজিরা সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const activeSecObj = sections.find((s) => s.id === selectedSection);

  return (
    <div className="space-y-6">
      
      {/* ১. হেডার ও তারিখ কন্ট্রোল */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-lg bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-black text-brand-orange">
                ইনচার্জ স্পেশাল
              </span>
              <h2 className="text-xl font-extrabold text-brand-navy">শ্রেণি ইনচার্জ বাল্ক হাজিরা শিট</h2>
              {isAlreadySubmitted && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3 inline mr-0.5" /> সংরক্ষিত
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              এক ক্লিকে আপনার দায়িত্বপ্রাপ্ত শাখার শিক্ষার্থীদের দৈনিক ডিজিটাল হাজিরা গ্রহণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {sections.length > 1 ? (
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class_level_display || sec.class_level} - {sec.group_display || sec.group} ({sec.section_name}) [{sec.session}]
                  </option>
                ))}
              </select>
            ) : activeSecObj ? (
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2 text-xs font-black text-brand-orange">
                শাখা: {activeSecObj.class_level_display || activeSecObj.class_level} - {activeSecObj.group_display || activeSecObj.group} ({activeSecObj.section_name})
              </div>
            ) : null}

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            />

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              title="হাজিরা শিট প্রিন্ট করুন"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>

      {/* শাখা না থাকার নোটিশ */}
      {!sectionsLoading && sections.length === 0 && (
        <div className="rounded-3xl bg-amber-50 p-8 border border-amber-200 text-center">
          <Clock className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <h3 className="text-base font-bold text-amber-900">আপনি এখনও কোনো সক্রিয় শাখার শ্রেণি ইনচার্জ নন</h3>
          <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
            প্রিন্সিপাল ড্যাশবোর্ড থেকে আপনাকে কোনো শাখার শ্রেণি ইনচার্জ হিসেবে নিয়োগ দিলে এই পাতায় সেই শাখার সকল শিক্ষার্থীর স্বয়ংক্রিয় হাজিরা শিট প্রদর্শিত হবে।
          </p>
        </div>
      )}

      {/* ২. রিয়েল-টাইম হাজিরা কেপিআই স্ট্রিপ */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400">মোট শিক্ষার্থী</span>
            <h3 className="text-xl font-black text-brand-navy mt-1">{stats.total} জন</h3>
          </div>
          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200 shadow-soft">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-emerald-700">উপস্থিত (Present)</span>
              <span className="text-[10px] font-black bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded">
                {stats.pct}%
              </span>
            </div>
            <h3 className="text-xl font-black text-emerald-800 mt-1">{stats.present} জন</h3>
          </div>
          <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-200 shadow-soft">
            <span className="text-[11px] font-bold text-rose-700">অনুপস্থিত (Absent)</span>
            <h3 className="text-xl font-black text-rose-800 mt-1">{stats.absent} জন</h3>
          </div>
          <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200 shadow-soft">
            <span className="text-[11px] font-bold text-amber-700">দেরি (Late)</span>
            <h3 className="text-xl font-black text-amber-800 mt-1">{stats.late} জন</h3>
          </div>
        </div>
      )}

      {/* ৩. হাজিরা তালিকা কার্ড ও দ্রুত অ্যাকশন */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : students.length === 0 && sections.length > 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-100">
          <CalendarCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">এই শাখায় কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1">শিক্ষার্থী ভর্তি ট্যাব থেকে নতুন শিক্ষার্থী যুক্ত করুন।</p>
        </div>
      ) : students.length > 0 ? (
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft space-y-4">
          
          {/* সার্চ, ফিল্টার ও বাল্ক অ্যাকশন বার */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="রোল বা নাম খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-white text-brand-navy shadow-sm' : ''}`}
                >
                  সব ({students.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PRESENT')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'PRESENT' ? 'bg-emerald-600 text-white shadow-sm' : ''}`}
                >
                  উপস্থিত ({stats.present})
                </button>
                <button
                  onClick={() => setStatusFilter('ABSENT')}
                  className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'ABSENT' ? 'bg-red-600 text-white shadow-sm' : ''}`}
                >
                  অনুপস্থিত ({stats.absent})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-xs font-bold hover:bg-emerald-100 transition"
              >
                ✓ সবাইকে উপস্থিত করুন
              </button>
              <button
                type="button"
                onClick={handleMarkAllAbsent}
                className="rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-xs font-bold hover:bg-rose-100 transition"
              >
                ✕ সবাইকে অনুপস্থিত করুন
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center space-x-2 rounded-xl bg-brand-orange px-5 py-2 text-xs font-black text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'হাজিরা নিশ্চিত করুন'}</span>
              </button>
            </div>
          </div>

          {/* শিক্ষার্থী কার্ড গ্রিড */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStudents.map((stu) => (
              <div
                key={stu.student_id}
                className={`flex flex-col justify-between rounded-2xl p-4 border transition ${
                  stu.status === 'PRESENT'
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : stu.status === 'ABSENT'
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-yellow-200 bg-yellow-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-brand-orange block">
                      রোল: {stu.roll_number}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-[170px]">
                      {stu.student_name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{stu.student_unique_id}</span>
                  </div>

                  {/* হাজিরা স্ট্যাটাস টগল বাটনসমূহ */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setStatus(stu.student_id, 'PRESENT')}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition ${
                        stu.status === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="উপস্থিত (Present)"
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(stu.student_id, 'ABSENT')}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition ${
                        stu.status === 'ABSENT'
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="অনুপস্থিত (Absent)"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(stu.student_id, 'LATE')}
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs transition ${
                        stu.status === 'LATE'
                          ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                      title="দেরিতে এসেছে (Late)"
                    >
                      L
                    </button>
                  </div>
                </div>

                {/* ঐচ্ছিক মন্তব্য ইনপুট */}
                <div className="mt-3 pt-2 border-t border-slate-200/50">
                  <input
                    type="text"
                    placeholder="ঐচ্ছিক মন্তব্য (যেমন: অসুস্থ)"
                    value={stu.remarks || ''}
                    onChange={(e) => setRemarks(stu.student_id, e.target.value)}
                    className="w-full rounded-lg bg-white/70 px-2.5 py-1 text-[11px] text-slate-700 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ফুটার নিশ্চিতকরণ বাটন */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center space-x-2 rounded-xl bg-brand-orange px-6 py-2.5 text-xs font-black text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'হাজিরা নিশ্চিত করুন'}</span>
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
};

export default InChargeBulkAttendance;