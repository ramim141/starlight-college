import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAtRiskStudentsApi } from '../../api/teacher';
import api from '../../api/client';
import ParentCallModal from '../../components/incharge/ParentCallModal';
import { 
  ShieldAlert, 
  AlertTriangle, 
  PhoneCall, 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  NotebookPen, 
  UserCheck, 
  Eye, 
  Search, 
  Filter,
  X,
  GraduationCap,
  CalendarCheck,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const InChargeAtRiskTracker = () => {
  const { user, isClassIncharge, refreshUser } = useAuth();
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // ALL | ATTENDANCE | EXAM

  // কল লগ মডাল স্টেট
  const [callModalStudent, setCallModalStudent] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // স্টুডেন্ট ৩৬০° প্রোফাইল মডাল স্টেট
  const [profileModalStudent, setProfileModalStudent] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const mySections = user?.incharge_sections || [];
  const activeSection = mySections.find((s) => s.id === selectedSectionId) || mySections[0];

  useEffect(() => {
    if (!user?.incharge_sections?.length && refreshUser) {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    if (mySections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(mySections[0].id);
    }
  }, [mySections]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await getAtRiskStudentsApi(selectedSectionId);
      if (res.success) {
        setAtRiskList(res.watchlist || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('ঝুঁকিপূর্ণ শিক্ষার্থীদের তথ্য লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [selectedSectionId]);

  // স্টুডেন্ট ৩৬০° ডেটা লোড
  const handleOpenProfile = async (stu) => {
    setProfileModalStudent(stu);
    setLoadingProfile(true);
    try {
      const res = await api.get(`academics/students/${stu.student_id}/full-profile/`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (e) {
      toast.error('শিক্ষার্থীর বিস্তারিত তথ্য লোড করা যায়নি');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenCallModal = (stu) => {
    setCallModalStudent({
      id: stu.student_id,
      full_name: stu.student_name,
      roll_number: stu.roll_number,
      guardian_phone: stu.guardian_phone,
    });
    setShowCallModal(true);
  };

  // ফিল্টারিং
  const filteredList = atRiskList.filter((stu) => {
    const matchesSearch =
      stu.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.roll_number?.toString().includes(searchTerm) ||
      stu.student_unique_id?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (riskFilter === 'ATTENDANCE') {
      return stu.risk_details?.some((r) => r.type === 'LOW_ATTENDANCE');
    }
    if (riskFilter === 'EXAM') {
      return stu.risk_details?.some((r) => r.type === 'ACADEMIC_FAILURE');
    }
    return true;
  });

  // মেট্রিক্স হিসাব
  const totalAtRisk = atRiskList.length;
  const attendanceRiskCount = atRiskList.filter((s) =>
    s.risk_details?.some((r) => r.type === 'LOW_ATTENDANCE')
  ).length;
  const examRiskCount = atRiskList.filter((s) =>
    s.risk_details?.some((r) => r.type === 'ACADEMIC_FAILURE')
  ).length;

  return (
    <div className="space-y-6">
      
      {/* ১. হেডার ব্যানার */}
      <div className="rounded-3xl bg-gradient-to-r from-red-600 via-rose-700 to-red-800 p-6 text-white shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md shrink-0">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                ইনচার্জ স্পেশাল
              </span>
              <h2 className="text-xl font-bold">দুর্বল ও অনিয়মিত শিক্ষার্থী ওয়াচলিস্ট (At-Risk Tracker)</h2>
            </div>
            <p className="text-xs text-red-100 mt-1">
              যাদের মোট ক্লাসে উপস্থিতি ৭০%-এর নিচে নেমে গেছে অথবা যারা পরীক্ষায় অকৃতকার্য হয়েছে তাদের তালিকা।
            </p>
          </div>
        </div>

        {mySections.length > 1 && (
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-white/20"
          >
            <option value="" className="text-slate-800">সকল ইনচার্জ শাখা</option>
            {mySections.map((sec) => (
              <option key={sec.id} value={sec.id} className="text-slate-800">
                {sec.class_level_display || sec.class_level} - {sec.group_display || sec.group} ({sec.section_name})
              </option>
            ))}
          </select>
        )}
      </div>

      {!loading && !isClassIncharge && (
        <div className="rounded-3xl bg-amber-50 p-8 border border-amber-200 text-center">
          <Clock className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <h3 className="text-base font-bold text-amber-900">আপনি এখনও কোনো সক্রিয় শাখার শ্রেণি ইনচার্জ নন</h3>
          <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
            প্রিন্সিপাল ড্যাশবোর্ড থেকে আপনাকে কোনো শাখার শ্রেণি ইনচার্জ হিসেবে নিয়োগ দিলে এই পাতায় সেই শাখার ঝুঁকিপূর্ণ শিক্ষার্থীদের লাল তালিকা প্রদর্শিত হবে।
          </p>
        </div>
      )}

      {/* ২. রিয়েল-টাইম মেট্রিক্স স্ট্রিপ */}
      {isClassIncharge && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400">মোট ঝুঁকিপূর্ণ শিক্ষার্থী</span>
              <h3 className="text-2xl font-black text-rose-700 mt-0.5">{totalAtRisk} জন</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">তাত্ক্ষণিক কাউন্সিলিং প্রয়োজন</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400">উপস্থিতি ঘাটতি (&lt; ৭০%)</span>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{attendanceRiskCount} জন</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">দৈনিক হাজিরায় অনিয়মিত</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-soft flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400">পরীক্ষায় অকৃতকার্য</span>
              <h3 className="text-2xl font-black text-purple-700 mt-0.5">{examRiskCount} জন</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">বিশেষ কোচিং প্রয়োজন</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* ৩. সার্চ ও ফিল্টার বার */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                riskFilter === 'ALL'
                  ? 'bg-brand-navy text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সকল ঝুঁকি ({atRiskList.length})
            </button>
            <button
              onClick={() => setRiskFilter('ATTENDANCE')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                riskFilter === 'ATTENDANCE'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              উপস্থিতি ঝুঁকি ({attendanceRiskCount})
            </button>
            <button
              onClick={() => setRiskFilter('EXAM')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                riskFilter === 'EXAM'
                  ? 'bg-purple-700 text-white shadow'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              ফলাফল দুর্বল ({examRiskCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="রোল বা নাম লিখে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            />
          </div>
        </div>

        {/* ৪. শিক্ষার্থী কার্ড গ্রিড */}
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
          </div>
        ) : isClassIncharge && filteredList.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-12 text-center border border-slate-100">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-3 text-base font-bold text-slate-800">কোনো ঝুঁকিপূর্ণ শিক্ষার্থী পাওয়া যায়নি!</h3>
            <p className="text-xs text-slate-400 mt-1">আপনার নির্বাচিত শাখায় সকল শিক্ষার্থীর উপস্থিতি ও ফলাফল সন্তোষজনক পর্যায়ে রয়েছে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((stu) => {
              const phoneClean = stu.guardian_phone?.replace(/[^0-9]/g, '') || '';
              const whatsappMessage = encodeURIComponent(
                `সম্মানিত অভিভাবক, আসসালামু আলাইকুম। স্টারলাইট কলেজ থেকে শ্রেণি ইনচার্জ বলছি। আপনার সন্তান ${stu.student_name} (রোল: ${stu.roll_number})-এর উপস্থিতি বা পরীক্ষার ফলাফল আশঙ্কাজনক পর্যায়ে রয়েছে। জরুরি প্রয়োজনে অনুগ্রহ করে কলেজে যোগাযোগ করুন বা এই নম্বরে কল ব্যাক করুন।`
              );

              return (
                <div 
                  key={stu.student_id} 
                  className="rounded-3xl bg-white p-5 border border-red-200/90 shadow-soft hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* কার্ড হেডার */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="rounded-md bg-brand-orange/10 px-2 py-0.5 text-[10px] font-black text-brand-orange">
                            রোল: {stu.roll_number}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{stu.student_unique_id}</span>
                        </div>
                        <h4 className="text-sm font-black text-brand-navy mt-1">{stu.student_name}</h4>
                        <p className="text-[11px] text-slate-500">{stu.section}</p>
                      </div>

                      <div className="text-right">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black inline-block ${
                          parseFloat(stu.attendance_percentage) < 50 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {stu.attendance_percentage} উপস্থিতি
                        </span>
                      </div>
                    </div>

                    {/* রিস্ক ফ্যাক্টরস */}
                    <div className="my-3 space-y-2">
                      {stu.risk_details?.map((risk, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-start space-x-2 text-xs p-2.5 rounded-xl border ${
                            risk.severity === 'CRITICAL' || risk.severity === 'HIGH'
                              ? 'bg-red-50/80 border-red-200 text-red-800'
                              : 'bg-amber-50/80 border-amber-200 text-amber-800'
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                          <span className="font-medium">{risk.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* কার্ড ফুটার ও ইন্টারেক্টিভ অ্যাকশনসমূহ */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">অভিভাবক ফোন:</span>
                      <strong className="font-mono text-slate-800">{stu.guardian_phone || 'সংরক্ষিত নেই'}</strong>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                      {/* ১. সরাসরি কল */}
                      <a
                        href={stu.guardian_phone ? `tel:${stu.guardian_phone}` : '#'}
                        className="flex items-center justify-center space-x-1 rounded-xl bg-[#0F2C59] py-2 text-[11px] font-bold text-white shadow-sm hover:bg-slate-800 transition text-center"
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>কল করুন</span>
                      </a>

                      {/* ২. হোয়াটসঅ্যাপ */}
                      {phoneClean ? (
                        <a
                          href={`https://wa.me/88${phoneClean.replace(/^88/, '')}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-1 rounded-xl bg-emerald-600 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-500 transition text-center"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <button disabled className="rounded-xl bg-slate-100 py-2 text-[11px] font-bold text-slate-400 text-center">
                          হোয়াটসঅ্যাপ
                        </button>
                      )}

                      {/* ৩. কল ডায়েরি নোট */}
                      <button
                        onClick={() => handleOpenCallModal(stu)}
                        className="flex items-center justify-center space-x-1 rounded-xl bg-brand-orange py-2 text-[11px] font-bold text-white shadow-sm hover:bg-brand-orange-hover transition text-center"
                      >
                        <NotebookPen className="h-3 w-3" />
                        <span>ডায়েরি নোট</span>
                      </button>

                      {/* ৪. ৩৬০° প্রোফাইল */}
                      <button
                        onClick={() => handleOpenProfile(stu)}
                        className="flex items-center justify-center space-x-1 rounded-xl bg-slate-100 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition text-center"
                      >
                        <Eye className="h-3 w-3" />
                        <span>৩৬০° প্রোফাইল</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* অভিভাবক কল লগ মডাল */}
      <ParentCallModal
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setCallModalStudent(null);
        }}
        initialStudent={callModalStudent}
        initialStudentId={callModalStudent?.id}
        onSuccess={() => toast.success('কল ডায়েরিতে নোট সফলভাবে সংরক্ষিত হয়েছে')}
      />

      {/* স্টুডেন্ট ৩৬০° প্রোফাইল মডাল */}
      {profileModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-xl bg-brand-navy p-2 text-white">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">{profileModalStudent.student_name}</h3>
                  <p className="text-xs text-slate-400">
                    রোল: {profileModalStudent.roll_number} | আইডি: {profileModalStudent.student_unique_id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setProfileModalStudent(null)} 
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingProfile ? (
              <div className="py-12 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent mx-auto"></div>
                <p className="text-xs text-slate-500 mt-2 font-bold">শিক্ষার্থীর একাডেমিক ও আর্থিক প্রোফাইল লোড হচ্ছে...</p>
              </div>
            ) : profileData ? (
              <div className="space-y-4 my-4">
                {/* ১. উপস্থিতি সংক্ষেপ */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-brand-navy flex items-center space-x-1.5">
                      <CalendarCheck className="h-4 w-4 text-emerald-600" />
                      <span>উপস্থিতির সারাংশ</span>
                    </h4>
                    <span className="text-xs font-extrabold text-brand-orange">
                      মোট কার্যদিবস: {profileData.attendance?.total || 0} দিন
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 block">উপস্থিত</span>
                      <strong className="text-emerald-800 text-sm">{profileData.attendance?.summary?.PRESENT || 0} দিন</strong>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                      <span className="text-[10px] text-amber-700 block">দেরিতে</span>
                      <strong className="text-amber-800 text-sm">{profileData.attendance?.summary?.LATE || 0} দিন</strong>
                    </div>
                    <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                      <span className="text-[10px] text-red-700 block">অনুপস্থিত</span>
                      <strong className="text-red-800 text-sm">{profileData.attendance?.summary?.ABSENT || 0} দিন</strong>
                    </div>
                  </div>
                </div>

                {/* ২. পরীক্ষার ফলাফল ও ফেইল্ড বিষয়সমূহ */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-brand-navy mb-2 flex items-center space-x-1.5">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                    <span>পরীক্ষার ফলাফল ও দুর্বল বিষয়</span>
                  </h4>
                  {profileData.exams?.results?.length === 0 ? (
                    <p className="text-xs text-slate-400">কোনো পরীক্ষার ফলাফল প্রকাশিত হয়নি।</p>
                  ) : (
                    <div className="space-y-2">
                      {profileData.exams?.results?.map((res, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div>
                            <strong className="text-slate-800">{res.exam}</strong>
                            <div className="text-[10px] text-slate-400">প্রাপ্ত নম্বর: {res.total_obtained_marks}/{res.total_full_marks}</div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${res.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {res.is_passed ? `GPA: ${res.gpa}` : `ফেল (${res.failed_subjects_count} বিষয়)`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ৩. ফি ও বকেয়া স্ট্যাটাস */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-brand-navy mb-2 flex items-center space-x-1.5">
                    <CreditCard className="h-4 w-4 text-brand-orange" />
                    <span>ফি ও বকেয়ার বিবরণ</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">মোট ধার্যকৃত</span>
                      <strong className="text-slate-800">৳ {profileData.fees?.summary?.total || 0}</strong>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 block">পরিশোধিত</span>
                      <strong className="text-emerald-800">৳ {profileData.fees?.summary?.paid || 0}</strong>
                    </div>
                    <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                      <span className="text-[10px] text-red-700 block">মোট বকেয়া</span>
                      <strong className="text-red-700">৳ {profileData.fees?.summary?.due || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setProfileModalStudent(null)}
                className="rounded-xl bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InChargeAtRiskTracker;