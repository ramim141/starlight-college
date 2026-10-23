import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Search, 
  X, 
  CheckCircle2, 
  Printer, 
  ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

const ResultSearchModal = ({ isMounted, isVisible, initialRoll = '', onClose }) => {
  const [searchRoll, setSearchRoll] = useState(initialRoll);
  const [searchExam, setSearchExam] = useState('HSC_TEST');
  const [searchResult, setSearchResult] = useState(null);
  const [searchingResult, setSearchingResult] = useState(false);
  const [modalResultTab, setModalResultTab] = useState('GRADES');
  const rollInputRef = useRef(null);
  const focusTimerRef = useRef(null);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(focusTimerRef.current);
      clearTimeout(searchTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (initialRoll) setSearchRoll(initialRoll);
  }, [initialRoll]);

  useEffect(() => {
    if (isVisible && rollInputRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => rollInputRef.current?.focus(), 80);
    }
  }, [isVisible]);

  const handleResultSearch = (e, explicitRoll = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const rollQuery = explicitRoll !== null ? String(explicitRoll) : searchRoll;
    if (!rollQuery || !rollQuery.trim()) {
      toast.error('শিক্ষার্থীর রোল নম্বর দিন');
      return;
    }
    if (explicitRoll !== null) setSearchRoll(String(explicitRoll));

    setSearchingResult(true);
    setSearchResult(null);

    const normalizeDigits = (str) => {
      const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return String(str).replace(/[০-৯]/g, (d) => bn.indexOf(d));
    };
    const normRoll = normalizeDigits(rollQuery.trim());

    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearchingResult(false);
      const studentDatabase = {
        '101': {
          student_name: 'তানভীর আহমেদ চৌধুরী',
          roll: rollQuery,
          session: '২০২৫-২০২৬',
          group: 'বিজ্ঞান শাখা (Science)',
          gpa: '5.00',
          grade: 'A+',
          status: 'PASSED',
          merit: '১ম স্থান (বিজ্ঞান)',
          total_marks: 642,
          attendance_rate: '৯৯%',
          subjects: [
            { name: 'Physics (পদার্থবিজ্ঞান)', marks: 95, grade: 'A+' },
            { name: 'Chemistry (রসায়ন)', marks: 92, grade: 'A+' },
            { name: 'Higher Math (উচ্চতর গণিত)', marks: 98, grade: 'A+' },
            { name: 'Biology (জীববিজ্ঞান)', marks: 88, grade: 'A+' },
            { name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', marks: 96, grade: 'A+' },
            { name: 'Bangla (বাংলা)', marks: 85, grade: 'A+' },
            { name: 'English (ইংরেজি)', marks: 88, grade: 'A+' },
          ],
        },
        '102': {
          student_name: 'সাদিয়া জাহান মিথিলা',
          roll: rollQuery,
          session: '২০২৫-২০২৬',
          group: 'বিজ্ঞান শাখা (Science)',
          gpa: '4.92',
          grade: 'A+',
          status: 'PASSED',
          merit: '৪র্থ স্থান (বিজ্ঞান)',
          total_marks: 618,
          attendance_rate: '৯৬%',
          subjects: [
            { name: 'Physics (পদার্থবিজ্ঞান)', marks: 90, grade: 'A+' },
            { name: 'Chemistry (রসায়ন)', marks: 86, grade: 'A+' },
            { name: 'Higher Math (উচ্চতর গণিত)', marks: 92, grade: 'A+' },
            { name: 'Biology (জীববিজ্ঞান)', marks: 84, grade: 'A+' },
            { name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', marks: 95, grade: 'A+' },
            { name: 'Bangla (বাংলা)', marks: 84, grade: 'A+' },
            { name: 'English (ইংরেজি)', marks: 87, grade: 'A+' },
          ],
        },
        '103': {
          student_name: 'তাসনিম রহমান',
          roll: rollQuery,
          session: '২০২৫-২০২৬',
          group: 'ব্যবসায় শিক্ষা (Business)',
          gpa: '5.00',
          grade: 'A+',
          status: 'PASSED',
          merit: '১ম স্থান (ব্যবসায়)',
          total_marks: 635,
          attendance_rate: '৯৭%',
          subjects: [
            { name: 'Accounting (হিসাববিজ্ঞান)', marks: 96, grade: 'A+' },
            { name: 'Business Org (ব্যবসায় সংগঠন)', marks: 91, grade: 'A+' },
            { name: 'Finance (অর্থায়ন ও ব্যাংকিং)', marks: 94, grade: 'A+' },
            { name: 'Economics (অর্থনীতি)', marks: 86, grade: 'A+' },
            { name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', marks: 92, grade: 'A+' },
            { name: 'Bangla (বাংলা)', marks: 88, grade: 'A+' },
            { name: 'English (ইংরেজি)', marks: 88, grade: 'A+' },
          ],
        },
      };

      const matched = studentDatabase[normRoll] || {
        student_name: 'শিক্ষার্থী (রোল #' + rollQuery + ')',
        roll: rollQuery,
        session: '২০২৫-২০২৬',
        group: 'বিজ্ঞান শাখা (Science)',
        gpa: '5.00',
        grade: 'A+',
        status: 'PASSED',
        merit: 'মেধা তালিকায় অন্তর্ভুক্ত',
        total_marks: 622,
        attendance_rate: '৯৮%',
        subjects: [
          { name: 'Physics (পদার্থবিজ্ঞান)', marks: 92, grade: 'A+' },
          { name: 'Chemistry (রসায়ন)', marks: 88, grade: 'A+' },
          { name: 'Higher Math (উচ্চতর গণিত)', marks: 95, grade: 'A+' },
          { name: 'Biology (জীববিজ্ঞান)', marks: 85, grade: 'A+' },
          { name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', marks: 96, grade: 'A+' },
          { name: 'Bangla (বাংলা)', marks: 82, grade: 'A+' },
          { name: 'English (ইংরেজি)', marks: 84, grade: 'A+' },
        ],
      };
      setSearchResult(matched);
      toast.success('রেজাল্ট সফলভাবে লোড হয়েছে!');
    }, 500);
  };

  if (!isMounted) return null;

  return (
    <div 
      style={{
        transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isVisible ? 1 : 0,
      }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 select-none sm:items-center bg-slate-950/70 backdrop-blur-md sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        style={{
          transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease',
          transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(36px) scale(0.95)',
          opacity: isVisible ? 1 : 0,
        }}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-lg sm:rounded-lg bg-white p-5 sm:p-7 shadow-2xl border border-slate-200/90 flex flex-col select-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3.5" />

        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 border border-emerald-200 inline-flex items-center space-x-1.5 shadow-2xs">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              <span>পরীক্ষা ও ফলাফল মূল্যায়ন সেল</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F2C59] mt-2 tracking-tight">
              অনলাইন রেজাল্ট ও মার্কশিট সার্চ
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              শিক্ষার্থীর রোল নম্বর নির্বাচন করে ডিজিটাল মার্কশিট ও জিপিএ তাৎক্ষণিকভাবে দেখুন।
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer shrink-0 ml-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* কুইক টেস্ট ডেমো রোল চিপস */}
        <div className="pt-3 pb-1 flex flex-wrap items-center gap-1.5 select-none">
          <span className="text-[11px] font-bold text-slate-400">কুইক ডেমো:</span>
          {[
            { roll: '১০১', label: '১০১ (তানভীর • বিজ্ঞান)' },
            { roll: '১০২', label: '১০২ (সাদিয়া • বিজ্ঞান)' },
            { roll: '১০৩', label: '১০৩ (তাসনিম • ব্যবসায়)' },
          ].map((chip) => (
            <button
              key={chip.roll}
              type="button"
              onClick={() => handleResultSearch(null, chip.roll)}
              className="rounded-lg bg-orange-50/70 hover:bg-orange-100/90 text-[#EA580C] px-2.5 py-1 text-[11px] font-bold border border-orange-200/60 active:scale-95 transition-all cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* সার্চ ফর্ম */}
        <form onSubmit={handleResultSearch} className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-12">
          <div className="sm:col-span-5 group">
            <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
              শিক্ষার্থীর রোল নম্বর
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#EA580C] group-focus-within:scale-110 transition-all pointer-events-none" />
              <input
                ref={rollInputRef}
                type="text"
                placeholder="যেমন: ১০১"
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2.5 text-sm font-bold text-slate-800 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 min-h-[44px]"
                required
              />
              {searchRoll && (
                <button
                  type="button"
                  onClick={() => { setSearchRoll(''); setSearchResult(null); rollInputRef.current?.focus(); }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="sm:col-span-4 group">
            <label className="block text-[11px] font-black text-slate-600 uppercase mb-1">
              পরীক্ষার নাম
            </label>
            <select
              value={searchExam}
              onChange={(e) => setSearchExam(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 min-h-[44px]"
            >
              <option value="HSC_TEST">এইচএসসি নির্বাচনী পরীক্ষা ২০২৬</option>
              <option value="HALF_YEARLY">অর্ধবার্ষিক মূল্যায়ন পরীক্ষা</option>
              <option value="YEAR_FINAL">একাদশ শ্রেণি সমাপনী পরীক্ষা</option>
            </select>
          </div>

          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              disabled={searchingResult}
              className="w-full rounded-2xl bg-[#0F2C59] hover:bg-[#163A70] py-3 px-4 text-xs font-black text-white shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
            >
              {searchingResult ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  <span>সার্চ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 text-[#FF6B00]" />
                  <span>রেজাল্ট দেখুন</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* রেজাল্ট আউটপুট */}
        {searchResult && !searchingResult && (
          <div className="p-5 mt-5 space-y-4 border shadow-xs rounded-3xl bg-slate-50/90 sm:p-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider block">
                  রোল: {searchResult.roll} • {searchResult.session} • {searchResult.group}
                </span>
                <h3 className="text-lg font-black text-[#0F2C59] mt-0.5">
                  {searchResult.student_name}
                </h3>
              </div>
              <span className="rounded-2xl bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-800 border border-emerald-300 shadow-xs flex items-center space-x-1.5 w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>GPA {searchResult.gpa} ({searchResult.grade}) - উত্তীর্ণ</span>
              </span>
            </div>

            {/* সাব-ট্যাব */}
            <div className="flex self-center w-full p-1 border rounded-2xl bg-slate-200/70 border-slate-300/60 sm:w-auto">
              <button
                type="button"
                onClick={() => setModalResultTab('GRADES')}
                className={`flex-1 sm:flex-initial px-5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  modalResultTab === 'GRADES' ? 'bg-white text-[#0F2C59] shadow-xs' : 'text-slate-500'
                }`}
              >
                বিষয়ভিত্তিক গ্রেডশিট
              </button>
              <button
                type="button"
                onClick={() => setModalResultTab('SUMMARY')}
                className={`flex-1 sm:flex-initial px-5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  modalResultTab === 'SUMMARY' ? 'bg-white text-[#0F2C59] shadow-xs' : 'text-slate-500'
                }`}
              >
                সার্বিক পারফরম্যান্স
              </button>
            </div>

            {modalResultTab === 'GRADES' ? (
              <div className="overflow-x-auto bg-white border rounded-2xl border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0F2C59] text-white text-[11px]">
                    <tr>
                      <th className="p-3">বিষয়</th>
                      <th className="p-3 text-center">নম্বর</th>
                      <th className="p-3 text-right">লেটার গ্রেড</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold divide-y divide-slate-100 text-slate-700">
                    {searchResult.subjects.map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-2.5 sm:p-3 font-medium text-slate-800">{sub.name}</td>
                        <td className="p-2.5 sm:p-3 text-center font-mono font-bold text-[#0F2C59]">{sub.marks}</td>
                        <td className="p-2.5 sm:p-3 text-right font-black text-emerald-600">{sub.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">মোট নম্বর</span>
                  <span className="text-xl font-black text-[#0F2C59] font-mono mt-1 block">{searchResult.total_marks} / ৭০০</span>
                </div>
                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">ক্লাস উপস্থিতি</span>
                  <span className="text-xl font-black text-[#0F2C59] font-mono mt-1 block">{searchResult.attendance_rate}</span>
                </div>
                <div className="rounded-2xl bg-white p-3.5 border border-slate-200 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">মেধা অবস্থান</span>
                  <span className="text-xl font-black text-[#EA580C] font-mono mt-1 block">{searchResult.merit}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 flex items-center space-x-1.5 shadow-2xs active:scale-95 cursor-pointer min-h-[44px]"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>প্রিন্ট করুন</span>
              </button>

              <Link to="/login" onClick={onClose} className="font-extrabold text-[#EA580C] hover:underline flex items-center space-x-1">
                <span>স্টুডেন্ট পোর্টালে সম্পূর্ণ প্রোফাইল</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 hidden sm:inline">* অফিশিয়াল ট্রান্সক্রিপ্টের জন্য পোর্টালে লগইন করুন।</span>
        </div>
      </div>
    </div>
  );
};

export default ResultSearchModal;