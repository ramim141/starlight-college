import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import ParentCallModal from '../../components/incharge/ParentCallModal';
import { 
  PhoneCall, 
  Plus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  Check, 
  X, 
  MessageCircle, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

const InChargeCallLog = () => {
  const { user, isClassIncharge, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('calls'); // calls | student_leaves | fine_waivers
  const [callLogs, setCallLogs] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [fineWaivers, setFineWaivers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // লিভ রিভিউ মডাল স্টেট
  const [reviewLeaveItem, setReviewLeaveItem] = useState(null);
  const [leaveRemarks, setLeaveRemarks] = useState('');
  const [submittingLeaveReview, setSubmittingLeaveReview] = useState(false);

  // জরিমানা মওকুফ রিভিউ মডাল স্টেট
  const [reviewWaiverItem, setReviewWaiverItem] = useState(null);
  const [waiverStatus, setWaiverStatus] = useState('RECOMMENDED');
  const [waiverAmount, setWaiverAmount] = useState('');
  const [waiverRemarks, setWaiverRemarks] = useState('মেডিকেল প্রেসক্রিপশন ও অভিভাবকের আবেদন যাচাইপূর্বক জরিমানা মওকুফের সুপারিশ করা হলো');
  const [submittingWaiverReview, setSubmittingWaiverReview] = useState(false);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [callRes, leaveRes, waiverRes, stuRes] = await Promise.all([
        api.get('operations/parent-calls/'),
        api.get('operations/leaves/'),
        api.get('finance/waivers/'),
        activeSection ? api.get(`academics/students/?section=${activeSection.id}`) : Promise.resolve({ data: [] }),
      ]);
      setCallLogs(callRes.data.results || callRes.data || []);
      setStudentLeaves(leaveRes.data.results || leaveRes.data || []);
      setFineWaivers(waiverRes.data.results || waiverRes.data || []);
      setStudents(stuRes.data.results || stuRes.data || []);
    } catch (e) {
      toast.error('ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSection?.id]);

  // স্টুডেন্ট ছুটির সুপারিশ সাবমিট
  const handleRecommendLeaveSubmit = async (status) => {
    if (!reviewLeaveItem) return;
    setSubmittingLeaveReview(true);
    try {
      const res = await api.patch(`operations/leaves/${reviewLeaveItem.id}/incharge-review/`, {
        status: status,
        remarks: leaveRemarks || (status === 'RECOMMENDED' ? 'ইনচার্জ কর্তৃক যাচাইপূর্বক সুপারিশকৃত' : 'যথাযথ কারণ দর্শাতে না পারায় বাতিল'),
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setReviewLeaveItem(null);
        setLeaveRemarks('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'সুপারিশ সম্পন্ন করা যায়নি');
    } finally {
      setSubmittingLeaveReview(false);
    }
  };

  // জরিমানা মওকুফের ইনচার্জ সুপারিশ সাবমিট
  const handleRecommendWaiverSubmit = async (e) => {
    e.preventDefault();
    if (!reviewWaiverItem) return;

    setSubmittingWaiverReview(true);
    try {
      const res = await api.patch(`finance/waivers/${reviewWaiverItem.id}/incharge-recommend/`, {
        status: waiverStatus,
        recommended_waiver_amount: waiverAmount || reviewWaiverItem.absence_fine || 0,
        remarks: waiverRemarks,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setReviewWaiverItem(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'মওকুফ সুপারিশ সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSubmittingWaiverReview(false);
    }
  };

  const filteredCalls = callLogs.filter(
    (log) =>
      log.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.roll_number?.toString().includes(searchTerm) ||
      log.discussion_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaves = studentLeaves.filter(
    (l) =>
      l.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.roll_number?.toString().includes(searchTerm) ||
      l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWaivers = fineWaivers.filter(
    (w) =>
      w.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.roll_number?.toString().includes(searchTerm) ||
      w.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingLeavesCount = studentLeaves.filter((l) => l.incharge_status === 'PENDING').length;
  const pendingWaiversCount = fineWaivers.filter((w) => w.incharge_status === 'PENDING').length;

  return (
    <div className="space-y-6">
      
      {/* ১. হেডার ও ট্যাব */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-lg bg-brand-orange/10 px-2 py-0.5 text-[11px] font-black text-brand-orange">
                ইনচার্জ স্পেশাল
              </span>
              <h2 className="text-xl font-bold text-brand-navy">অভিভাবক কল ডায়েরি, ছুটি ও জরিমানা মওকুফ</h2>
            </div>
            {activeSection ? (
              <p className="text-xs text-slate-500 mt-1">
                শাখা: <strong className="text-brand-orange">{activeSection.class_level_display || activeSection.class_level} - {activeSection.group_display || activeSection.group} ({activeSection.section_name})</strong> | শিক্ষার্থীদের অভিভাবক যোগাযোগ ও সুপারিশ নিয়ন্ত্রণ কেন্দ্র
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">অভিভাবকদের সাথে কৃত কল রেকর্ড ও শিক্ষার্থীদের বিভিন্ন আবেদনের ১ম ধাপের পর্যালোচনা।</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {mySections.length > 1 && (
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
              >
                {mySections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.class_level_display || sec.class_level} - {sec.group_display || sec.group} ({sec.section_name})
                  </option>
                ))}
              </select>
            )}

            {activeTab === 'calls' && (
              <button
                onClick={() => setShowCallModal(true)}
                disabled={!activeSection}
                className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover disabled:opacity-50 transition"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন কল রেকর্ড যোগ</span>
              </button>
            )}
          </div>
        </div>

        {!activeSection && (
          <div className="rounded-2xl bg-amber-50 p-6 border border-amber-200 text-center my-4">
            <Clock className="mx-auto h-8 w-8 text-amber-500 mb-1" />
            <h3 className="text-sm font-bold text-amber-900">আপনি এখনও কোনো সক্রিয় শাখার শ্রেণি ইনচার্জ নন</h3>
            <p className="text-xs text-amber-700 mt-1">
              প্রিন্সিপাল ড্যাশবোর্ড থেকে আপনাকে কোনো শাখার শ্রেণি ইনচার্জ হিসেবে নিয়োগ দিলে এই পাতায় অভিভাবক কল ডায়েরি, স্টুডেন্ট ছুটি ও জরিমানা মওকুফের আবেদন পরিচালনা করা যাবে।
            </p>
          </div>
        )}

        {/* ট্যাব নেভিগেশন */}
        <div className="flex flex-wrap gap-2 pt-4">
          <button
            onClick={() => setActiveTab('calls')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'calls'
                ? 'bg-[#0F2C59] text-white shadow'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PhoneCall className="h-4 w-4 text-emerald-400" />
            <span>অভিভাবক কল ডায়েরি ({callLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('student_leaves')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition relative ${
              activeTab === 'student_leaves'
                ? 'bg-[#0F2C59] text-white shadow'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4 text-amber-400" />
            <span>স্টুডেন্ট ছুটির সুপারিশ</span>
            {pendingLeavesCount > 0 && (
              <span className="rounded-full bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2">
                {pendingLeavesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fine_waivers')}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold transition relative ${
              activeTab === 'fine_waivers'
                ? 'bg-[#0F2C59] text-white shadow'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="h-4 w-4 text-cyan-400" />
            <span>জরিমানা মওকুফের আবেদন</span>
            {pendingWaiversCount > 0 && (
              <span className="rounded-full bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2">
                {pendingWaiversCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ২. সার্চ বার */}
      <div className="rounded-3xl bg-white p-4 border border-slate-200 shadow-soft flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="রোল, নাম বা বিষয় লিখে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-bold hidden sm:block">
          {activeTab === 'calls' && `মোট কল রেকর্ড: ${filteredCalls.length} টি`}
          {activeTab === 'student_leaves' && `ছুটির আবেদন: ${filteredLeaves.length} টি`}
          {activeTab === 'fine_waivers' && `মওকুফের আবেদন: ${filteredWaivers.length} টি`}
        </div>
      </div>

      {/* ৩. ট্যাব কন্টেন্ট */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'calls' ? (
        /* ট্যাব ১: অভিভাবক কল ডায়েরি */
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
          {filteredCalls.length === 0 ? (
            <div className="py-10 text-center">
              <PhoneCall className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">কোনো কল রেকর্ড সংরক্ষিত নেই।</p>
              <p className="text-[11px] text-slate-400 mt-0.5">অনুপস্থিত বা ঝুঁকিপূর্ণ শিক্ষার্থীর অভিভাবকের সাথে আলাপের নোট যোগ করতে উপরের বাটনে ক্লিক করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCalls.map((log) => {
                const phoneClean = log.guardian_phone_called?.replace(/[^0-9]/g, '') || '';
                return (
                  <div key={log.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white transition shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-black text-brand-orange uppercase">রোল: {log.roll_number}</span>
                          <h4 className="text-sm font-bold text-brand-navy">{log.student_name}</h4>
                        </div>
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800">
                          {log.category_display || log.category}
                        </span>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                        {log.discussion_summary}
                      </p>
                      
                      {log.guardian_response && (
                        <div className="mt-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">অভিভাবকের মন্তব্য/প্রতিশ্রুতি</span>
                          <span className="italic">"{log.guardian_response}"</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-slate-400">তারিখ: </span>
                        <strong className="text-slate-700">{log.call_date}</strong>
                        {log.follow_up_needed && (
                          <span className="ml-2 rounded-full bg-rose-100 text-rose-700 font-bold px-2 py-0.5 text-[10px]">
                            ফলো-আপ প্রয়োজন
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <a
                          href={`tel:${log.guardian_phone_called}`}
                          className="rounded-lg bg-[#0F2C59] p-1.5 text-white hover:bg-slate-800 transition"
                          title="পুনরায় কল করুন"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                        </a>
                        {phoneClean && (
                          <a
                            href={`https://wa.me/88${phoneClean.replace(/^88/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-500 transition"
                            title="হোয়াটসঅ্যাপে লিখুন"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'student_leaves' ? (
        /* ট্যাব ২: স্টুডেন্ট ছুটির সুপারিশ */
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
          {filteredLeaves.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-600">কোনো ছুটির আবেদন জমা নেই।</p>
              <p className="text-[11px] text-slate-400 mt-0.5">শিক্ষার্থীরা ছুটির আবেদন করলে ইনচার্জ হিসেবে ১ম ধাপের অনুমোদন এখানে দেখতে পাবেন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLeaves.map((l) => (
                <div key={l.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-black text-brand-orange uppercase">রোল: {l.roll_number}</span>
                        <h4 className="text-sm font-bold text-brand-navy">{l.student_name}</h4>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block ${
                          l.incharge_status === 'RECOMMENDED' ? 'bg-emerald-100 text-emerald-700' :
                          l.incharge_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          ইনচার্জ: {l.incharge_status_display}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          প্রিন্সিপাল: <strong>{l.principal_status_display || l.principal_status}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="my-2 text-xs space-y-1">
                      <p className="text-slate-600">
                        ছুটির মেয়াদ: <strong className="text-slate-800">{l.start_date} হতে {l.end_date}</strong>
                      </p>
                      <p className="text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-100">
                        "{l.reason}"
                      </p>
                    </div>

                    {l.incharge_remarks && (
                      <p className="text-[11px] text-slate-500">
                        ইনচার্জের নোট: <em>{l.incharge_remarks}</em>
                      </p>
                    )}
                  </div>

                  {l.incharge_status === 'PENDING' ? (
                    <div className="mt-4 pt-2.5 border-t border-slate-200 flex gap-2">
                      <button
                        onClick={() => {
                          setReviewLeaveItem(l);
                          setLeaveRemarks('শিক্ষার্থীর অভিভাবকের সাথে কথা বলে ছুটির সুপারিশ করা হলো');
                        }}
                        className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition flex items-center justify-center space-x-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>সুপারিশ করুন (Recommend)</span>
                      </button>
                      <button
                        onClick={() => {
                          setReviewLeaveItem(l);
                          setLeaveRemarks('যথাযথ কারণ দর্শাতে না পারায় আবেদন বাতিল করা হলো');
                        }}
                        className="rounded-xl bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                      >
                        বাতিল
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 text-right">
                      পর্যালোচনা সম্পন্ন হয়েছে
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ট্যাব ৩: জরিমানা মওকুফের আবেদন */
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
          {filteredWaivers.length === 0 ? (
            <div className="py-10 text-center">
              <DollarSign className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">কোনো জরিমানা মওকুফের আবেদন নেই।</p>
              <p className="text-[11px] text-slate-400 mt-0.5">শিক্ষার্থীরা অনুপস্থিতির দৈনিক ১০০৳ জরিমানা মওকুফের আবেদন করলে তা ইনচার্জ হিসেবে এখানে পর্যালোচনা করতে পারবেন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWaivers.map((w) => (
                <div key={w.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-black text-brand-orange uppercase">রোল: {w.roll_number}</span>
                        <h4 className="text-sm font-bold text-brand-navy">{w.student_name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">ইনভয়েস: {w.invoice_number}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-block ${
                          w.incharge_status === 'RECOMMENDED' ? 'bg-emerald-100 text-emerald-700' :
                          w.incharge_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          ইনচার্জ: {w.incharge_status_display}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          প্রিন্সিপাল: <strong>{w.principal_status_display}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="my-3 rounded-xl bg-white p-3 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">অনুপস্থিতি জরিমানা:</span>
                        <strong className="text-red-600 font-black">৳ {w.absence_fine || 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ইনভয়েস মোট বকেয়া:</span>
                        <strong className="text-slate-800">৳ {w.due_amount || 0}</strong>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">শিক্ষার্থীর আবেদনের কারণ</span>
                        <p className="text-slate-700 italic">"{w.reason}"</p>
                      </div>
                    </div>

                    {w.incharge_status !== 'PENDING' && (
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <p>সুপারিশকৃত মওকুফ: <strong className="text-emerald-700">৳ {w.recommended_waiver_amount}</strong></p>
                        <p>মন্তব্য: <em>{w.incharge_remarks || '—'}</em></p>
                      </div>
                    )}
                  </div>

                  {w.incharge_status === 'PENDING' ? (
                    <div className="mt-4 pt-2.5 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setReviewWaiverItem(w);
                          setWaiverAmount(w.absence_fine || w.due_amount || '0');
                          setWaiverStatus('RECOMMENDED');
                        }}
                        className="w-full rounded-xl bg-brand-orange py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition flex items-center justify-center space-x-1.5"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>ইনচার্জের সুপারিশ প্রদান করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 text-right">
                      {w.principal_status === 'APPROVED' ? (
                        <span className="text-emerald-600 font-bold">✓ প্রিন্সিপাল কর্তৃক অনুমোদিত</span>
                      ) : (
                        <span>প্রিন্সিপালের সিদ্ধান্তের অপেক্ষায়</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ৪. ছুটির আবেদন সুপারিশ মডাল */}
      {reviewLeaveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-brand-navy">শিক্ষার্থীর ছুটির আবেদন পর্যালোচনা</h3>
              <button onClick={() => setReviewLeaveItem(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
              <p>শিক্ষার্থী: <strong>{reviewLeaveItem.student_name}</strong> (রোল: {reviewLeaveItem.roll_number})</p>
              <p>মেয়াদ: <strong>{reviewLeaveItem.start_date} হতে {reviewLeaveItem.end_date}</strong></p>
              <p className="italic text-slate-600">কারণ: "{reviewLeaveItem.reason}"</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ইনচার্জের মন্তব্য বা নোট</label>
                <textarea
                  rows="2"
                  value={leaveRemarks}
                  onChange={(e) => setLeaveRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium focus:border-brand-orange focus:outline-none"
                  placeholder="অভিভাবকের সাথে যাচাই করা হয়েছে কিনা..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewLeaveItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => handleRecommendLeaveSubmit('REJECTED')}
                  disabled={submittingLeaveReview}
                  className="rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200 transition"
                >
                  অনুমোদন নাকচ
                </button>
                <button
                  type="button"
                  onClick={() => handleRecommendLeaveSubmit('RECOMMENDED')}
                  disabled={submittingLeaveReview}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                >
                  {submittingLeaveReview ? 'সংরক্ষণ হচ্ছে...' : 'সুপারিশ নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ৫. জরিমানা মওকুফের সুপারিশ মডাল */}
      {reviewWaiverItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-brand-navy">জরিমানা মওকুফের ইনচার্জ সুপারিশ</h3>
              <button onClick={() => setReviewWaiverItem(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-xs space-y-1">
              <p>শিক্ষার্থী: <strong>{reviewWaiverItem.student_name}</strong> (রোল: {reviewWaiverItem.roll_number})</p>
              <p>ইনভয়েস: <span className="font-mono">{reviewWaiverItem.invoice_number}</span></p>
              <p>অনুপস্থিতি জরিমানা: <strong className="text-red-600">৳ {reviewWaiverItem.absence_fine}</strong></p>
              <p className="italic text-slate-600">কারণ: "{reviewWaiverItem.reason}"</p>
            </div>

            <form onSubmit={handleRecommendWaiverSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ইনচার্জের সিদ্ধান্ত</label>
                <select
                  value={waiverStatus}
                  onChange={(e) => setWaiverStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
                >
                  <option value="RECOMMENDED">সুপারিশ করা হলো (Recommend)</option>
                  <option value="REJECTED">সুপারিশ বাতিল (Reject)</option>
                </select>
              </div>

              {waiverStatus === 'RECOMMENDED' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    সুপারিশকৃত মওকুফের পরিমাণ (BDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={reviewWaiverItem.absence_fine || reviewWaiverItem.total_amount}
                    value={waiverAmount}
                    onChange={(e) => setWaiverAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-black text-emerald-600"
                    required
                  />
                  <span className="text-[10px] text-slate-400">সর্বোচ্চ জরিমানা সমপরিমাণ টাকা মওকুফ সুপারিশযোগ্য</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ইনচার্জের মন্তব্য</label>
                <textarea
                  rows="2"
                  value={waiverRemarks}
                  onChange={(e) => setWaiverRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewWaiverItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingWaiverReview}
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition"
                >
                  {submittingWaiverReview ? 'সংরক্ষণ হচ্ছে...' : 'সুপারিশ দাখিল করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ৬. নতুন অভিভাবক কল লগ মডাল */}
      <ParentCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        students={students}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default InChargeCallLog;