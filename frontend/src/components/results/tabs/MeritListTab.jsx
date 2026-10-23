import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Printer, 
  Download, 
  Search, 
  RotateCcw, 
  CheckCircle, 
  Eye, 
  Filter, 
  Layers, 
  ArrowUpDown, 
  TrendingUp, 
  Lock,
  Sparkles,
  Users
} from 'lucide-react';
import StudentResultDetailModal from '../modals/StudentResultDetailModal';
import ReProcessReasonModal from '../modals/ReProcessReasonModal';

const MeritListTab = ({
  exams = [],
  selectedExamId = '',
  onSelectExam,
  sections = [],
  selectedSectionId = '',
  onSelectSection,
  meritList = [],
  loading = false,
  isPrincipal = false,
  isExamPublished = false,
  onTogglePublish,
  isTogglingPublish = false,
  onProcessResults,
  isProcessing = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('rank'); // 'rank' | 'roll' | 'name' | 'marks' | 'gpa'
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [showReProcessModal, setShowReProcessModal] = useState(false);
  const [publishConfirmModal, setPublishConfirmModal] = useState(null); // 'PUBLISH' | 'UNPUBLISH'

  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId));

  // সর্টিং ও ফিল্টারিং
  const filteredAndSortedList = useMemo(() => {
    let list = meritList.filter((m) => {
      const name = m.student_name?.toLowerCase() || '';
      const roll = String(m.roll || '');
      const id = m.student_id?.toLowerCase() || '';
      const query = searchTerm.toLowerCase();
      return name.includes(query) || roll.includes(query) || id.includes(query);
    });

    list.sort((a, b) => {
      let valA, valB;
      if (sortField === 'roll') {
        valA = Number(a.roll) || 0;
        valB = Number(b.roll) || 0;
      } else if (sortField === 'name') {
        valA = (a.student_name || '').localeCompare(b.student_name || '');
        return sortAsc ? valA : -valA;
      } else if (sortField === 'marks') {
        valA = Number(a.obtained_marks) || 0;
        valB = Number(b.obtained_marks) || 0;
      } else if (sortField === 'gpa') {
        valA = Number(a.gpa) || 0;
        valB = Number(b.gpa) || 0;
      } else {
        // default: rank (class_position or section_position or sl)
        valA = Number(a.class_position || a.section_position || a.sl) || 9999;
        valB = Number(b.class_position || b.section_position || b.sl) || 9999;
      }

      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [meritList, searchTerm, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // সামারি বেঞ্চমার্ক মেট্রিক্স (শুধুমাত্র ব্যাকএন্ড ডেটা থেকে সামারি)
  const totalPassed = meritList.length;
  const aPlusCount = meritList.filter((m) => m.grade === 'A+' || Number(m.gpa) === 5.0).length;
  const avgGpa = totalPassed > 0
    ? (meritList.reduce((acc, curr) => acc + (Number(curr.gpa) || 0), 0) / totalPassed).toFixed(2)
    : '0.00';

  // এক্সেল / CSV ডাউনলোড (UTF-8 BOM সহ বাংলা অক্ষরের জন্য)
  const handleExportCSV = () => {
    if (!meritList || meritList.length === 0) return;

    const headers = [
      'মেধা স্থান (শ্রেণি)',
      'মেধা স্থান (শাখা)',
      'রোল',
      'শিক্ষার্থীর নাম',
      'Student ID',
      'শাখা',
      'মোট প্রাপ্ত নম্বর',
      'লেটার গ্রেড',
      'GPA'
    ];

    const rows = filteredAndSortedList.map((m) => [
      m.class_position || '-',
      m.section_position || '-',
      m.roll || '',
      `"${(m.student_name || '').replace(/"/g, '""')}"`,
      m.student_id || '',
      m.section || '',
      m.obtained_marks || '',
      m.grade || '',
      m.gpa || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Merit_List_${selectedExam?.name || 'Exam'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReProcessConfirm = async (reason) => {
    await onProcessResults({
      examId: selectedExamId,
      sectionId: selectedSectionId || null,
      reason,
    });
    setShowReProcessModal(false);
  };

  const handlePublishToggleConfirm = async () => {
    if (publishConfirmModal) {
      await onTogglePublish({
        examId: selectedExamId,
        isPublished: publishConfirmModal === 'PUBLISH',
      });
      setPublishConfirmModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ১. পাবলিশ / আনপাবলিশ স্ট্যাটাস স্ট্রিপ ও কন্ট্রোল বার */}
      {selectedExam && (
        <div className={`no-print p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          isExamPublished
            ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40'
            : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isExamPublished ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {isExamPublished ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isExamPublished
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}>
                  {isExamPublished ? 'ফলাফল প্রকাশিত' : 'খসড়া (অপ্রকাশিত)'}
                </span>
                <span className="text-xs text-slate-500">
                  {isExamPublished
                    ? 'শিক্ষার্থীরা তাদের ড্যাশবোর্ড ও প্রগ্রেস রিপোর্টে ফলাফল দেখতে পাচ্ছে।'
                    : 'ফলাফল শুধুমাত্র প্রশাসনিক প্রিভিউ মোডে রয়েছে।'}
                </span>
              </div>
            </div>
          </div>

          {isPrincipal && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReProcessModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span>ফলাফল পুনঃপ্রসেস</span>
              </button>

              <button
                onClick={() => setPublishConfirmModal(isExamPublished ? 'UNPUBLISH' : 'PUBLISH')}
                disabled={isTogglingPublish}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                  isExamPublished
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {isExamPublished ? 'ফলাফল প্রত্যাহার করুন' : 'ফলাফল প্রকাশ করুন'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ২. ফিল্টার ও অ্যাকশন বার */}
      <div className="no-print flex flex-col gap-4 p-5 bg-white border md:flex-row md:items-center md:justify-between dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">পরীক্ষা:</label>
            <select
              value={selectedExamId}
              onChange={(e) => onSelectExam(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.session})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">শাখা:</label>
            <select
              value={selectedSectionId}
              onChange={(e) => onSelectSection(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            >
              <option value="">সকল শাখা (শ্রেণি মেধা তালিকা)</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  শাখা: {s.section_name} ({s.class_level_display || s.class_level})
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="absolute w-4 h-4 text-slate-400 left-3 top-2.5" />
            <input
              type="text"
              placeholder="নাম, রোল বা আইডি..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
            />
          </div>
        </div>

        {/* এক্সপোর্ট বাটনস */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={meritList.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>এক্সেল (CSV)</span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={meritList.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট মেধা তালিকা</span>
          </button>
        </div>
      </div>

      {/* ৩. সামারি বেন্টো মেট্রিক টাইলস */}
      {meritList.length > 0 && (
        <div className="no-print grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">মোট উত্তীর্ণ</span>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
              {totalPassed} জন
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">এ+ (GPA 5.00)</span>
            <span className="text-xl font-black text-emerald-600 font-mono mt-0.5 block">
              {aPlusCount} জন
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">গড় জিপিএ (Average GPA)</span>
            <span className="text-xl font-black text-brand-navy dark:text-blue-400 font-mono mt-0.5 block">
              {avgGpa}
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">মেধা পরিধি</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 block">
              {selectedSectionId ? 'শাখাভিত্তিক মেধা' : 'সমগ্র শ্রেণির মেধা'}
            </span>
          </div>
        </div>
      )}

      {/* ৪. মেধা তালিকা টেবিল */}
      <div className="p-6 bg-white border dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 shadow-soft overflow-x-auto print:p-0 print:border-none print:shadow-none">
        {/* প্রিন্ট হেডার */}
        <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-black text-brand-navy dark:text-slate-100 uppercase tracking-wide">
            STARLIGHT COLLEGE, SYLHET
          </h2>
          <h3 className="text-xs font-extrabold text-brand-orange uppercase">
            OFFICIAL MERIT LIST - {selectedExam?.name} ({selectedExam?.session})
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {selectedSectionId ? `শাখা: ${sections.find((s) => s.id === selectedSectionId)?.section_name}` : 'সমগ্র শ্রেণির মেধা তালিকা'}
          </p>
        </div>

        {loading ? (
          <div className="p-12 space-y-3 animate-pulse">
            <div className="w-full h-8 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-10 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="w-full h-10 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : filteredAndSortedList.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Award className="w-12 h-12 mx-auto text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              কোনো মেধা তালিকা ডেটা পাওয়া যায়নি
            </h4>
            <p className="text-xs text-slate-400">
              রেজাল্ট প্রসেস করা না থাকলে "প্রাক-প্রসেসিং চেকলিস্ট" ট্যাব থেকে ফলাফল প্রসেস করুন।
            </p>
          </div>
        ) : (
          <>
            {/* ডেসকটপ টেবিল ভিউ */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                  <tr>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('rank')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>স্থান</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 text-left cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>শিক্ষার্থীর নাম</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('roll')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>রোল</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">শাখা</th>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('marks')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>মোট নম্বর</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">গ্রেড</th>
                    <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('gpa')}>
                      <div className="flex items-center justify-center gap-1">
                        <span>GPA</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 bg-orange-600">শাখা স্থান</th>
                    <th className="p-3 bg-orange-700">শ্রেণি স্থান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {filteredAndSortedList.map((m, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 text-left">
                        <button
                          onClick={() => setSelectedStudentForModal(m)}
                          className="font-bold text-brand-navy dark:text-blue-400 hover:text-brand-orange hover:underline text-left"
                          title="বিস্তারিত মার্কশিট দেখুন"
                        >
                          {m.student_name}
                        </button>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{m.student_id}</td>
                      <td className="p-3 font-mono font-bold">{m.roll}</td>
                      <td className="p-3">{m.section}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {Number(m.obtained_marks).toFixed(1)}
                      </td>
                      <td className="p-3 font-black text-emerald-600">{m.grade}</td>
                      <td className="p-3 font-mono font-black text-brand-navy dark:text-blue-400 text-sm">
                        {Number(m.gpa).toFixed(2)}
                      </td>
                      <td className="p-3 font-mono font-black text-brand-orange">
                        {m.section_position || '-'}
                      </td>
                      <td className="p-3 font-mono font-black text-brand-orange">
                        {m.class_position || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* প্রিন্ট সিগনেচার ব্লক */}
            <div className="hidden print:flex justify-between items-center pt-24 text-xs font-bold text-slate-800">
              <div className="text-center">
                <div className="w-40 border-t border-slate-400 pt-1">পরীক্ষা কমিটির আহ্বায়ক</div>
              </div>
              <div className="text-center">
                <div className="w-40 border-t border-slate-400 pt-1">অধ্যক্ষের স্বাক্ষর ও সিল</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* বিস্তারিত স্টুডেন্ট মার্কশিট মডাল */}
      {selectedStudentForModal && (
        <StudentResultDetailModal
          isOpen={!!selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          examId={selectedExamId}
          studentId={selectedStudentForModal.student || selectedStudentForModal.student_id}
        />
      )}

      {/* ফলাফল পুনঃপ্রসেস মডাল */}
      <ReProcessReasonModal
        isOpen={showReProcessModal}
        onClose={() => setShowReProcessModal(false)}
        onConfirm={handleReProcessConfirm}
        examName={selectedExam?.name || ''}
        isProcessing={isProcessing}
      />

      {/* ফলাফল প্রকাশ বা প্রত্যাহার কনফার্মেশন মডাল */}
      {publishConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800 text-center">
            <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-2xl ${
              publishConfirmModal === 'PUBLISH' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {publishConfirmModal === 'PUBLISH' ? <CheckCircle className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {publishConfirmModal === 'PUBLISH' ? 'ফলাফল প্রকাশ করতে নিশ্চিত?' : 'ফলাফল প্রত্যাহার (Unpublish) করতে চান?'}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {publishConfirmModal === 'PUBLISH'
                  ? 'প্রকাশিত হলে শিক্ষার্থীরা তাৎক্ষণিকভাবে তাদের পোর্টাল ও মার্কশিটে ফলাফল দেখতে পাবে।'
                  : 'প্রত্যাহার করা হলে শিক্ষার্থীদের পোর্টাল থেকে ফলাফল সাময়িকভাবে অদৃশ্য হয়ে যাবে।'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPublishConfirmModal(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                onClick={handlePublishToggleConfirm}
                disabled={isTogglingPublish}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md ${
                  publishConfirmModal === 'PUBLISH'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isTogglingPublish ? 'সংরক্ষণ...' : 'নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeritListTab;
