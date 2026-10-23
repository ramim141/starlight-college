import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { 
  getStudentLeavesApi, 
  reviewStudentLeaveApi, 
  getTeacherLeavesApi, 
  reviewTeacherLeaveApi 
} from '../../api/principal';
import TeacherLeaveModal from '../teacher/TeacherLeaveModal';
import { 
  ClipboardCheck, 
  User, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Check, 
  Plus,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * LeaveManagementHub - বহু-ব্যবহারযোগ্য (Reusable) ছুটি ও প্রক্সি ক্লাস কন্ট্রোল হাব
 * এটি প্রিন্সিপাল, শ্রেণি ইনচার্জ ও শিক্ষক যে কারো পোর্টালে সরাসরি ব্যবহার করা যায়।
 */
const LeaveManagementHub = ({ 
  overrideRole = null, 
  defaultTab = null,
  showTeacherApplyButton = true 
}) => {
  const { user, isPrincipal: authIsPrincipal, isTeacher: authIsTeacher, isClassIncharge: authIsIncharge } = useAuth();
  
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;
  const isClassIncharge = overrideRole === 'INCHARGE' ? true : authIsIncharge;

  // ডিফল্ট ট্যাব নির্ধারণ
  const initialTab = defaultTab || (isPrincipal ? 'student' : isClassIncharge ? 'student' : 'teacher');
  const [activeTab, setActiveTab] = useState(initialTab); // 'student' | 'teacher' | 'my-proxies'

  const [studentLeaves, setStudentLeaves] = useState([]);
  const [teacherLeaves, setTeacherLeaves] = useState([]);
  const [proxyDuties, setProxyDuties] = useState([]);
  const [loading, setLoading] = useState(true);

  // শিক্ষক ছুটির আবেদন মডাল
  const [showApplyModal, setShowApplyModal] = useState(false);

  // ইনচার্জ বা অধ্যক্ষের রিভিউ মডাল স্টেট
  const [reviewModalData, setReviewModalData] = useState(null); // { type: 'student' | 'teacher', item: obj }
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [forceApprove, setForceApprove] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeavesData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'student') {
        const res = await getStudentLeavesApi();
        const list = res.results || res;
        setStudentLeaves(Array.isArray(list) ? list : []);
      } else if (activeTab === 'teacher') {
        const res = await getTeacherLeavesApi();
        const list = res.results || res;
        setTeacherLeaves(Array.isArray(list) ? list : []);
      } else if (activeTab === 'my-proxies') {
        const res = await api.get('operations/teacher-leaves/my-proxy-classes/');
        setProxyDuties(res.data.data || []);
      }
    } catch (err) {
      toast.error('ছুটির তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeavesData();
  }, [activeTab]);

  // ইনচার্জ কর্তৃক শিক্ষার্থী ছুটি সুপারিশ/রিজেক্ট
  const handleInchargeReview = async (id, status) => {
    setSubmitting(true);
    try {
      const res = await api.patch(`operations/leaves/${id}/incharge-review/`, {
        status,
        remarks: decisionRemarks || (status === 'RECOMMENDED' ? 'ইনচার্জ কর্তৃক অনুমোদনের সুপারিশকৃত' : 'প্রত্যাখ্যাত'),
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setReviewModalData(null);
        setDecisionRemarks('');
        fetchLeavesData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ইনচার্জ রিভিউ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // অধ্যক্ষ কর্তৃক চূড়ান্ত অনুমোদন
  const handlePrincipalReview = async (status) => {
    setSubmitting(true);
    try {
      if (reviewModalData.type === 'student') {
        const res = await reviewStudentLeaveApi(
          reviewModalData.item.id,
          status,
          decisionRemarks,
          forceApprove
        );
        if (res.success) {
          toast.success(res.message);
          setReviewModalData(null);
          setDecisionRemarks('');
          setForceApprove(false);
          fetchLeavesData();
        }
      } else {
        const res = await reviewTeacherLeaveApi(
          reviewModalData.item.id,
          status,
          decisionRemarks
        );
        if (res.success) {
          toast.success(res.message);
          setReviewModalData(null);
          setDecisionRemarks('');
          fetchLeavesData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'সিদ্ধান্ত সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-orange/20 rounded-xl text-brand-orange border border-brand-orange/30">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              {isPrincipal ? 'ছুটি ও প্রক্সি ক্লাস অনুমোদন কেন্দ্র' : 'ছুটি ও প্রক্সি ক্লাস ব্যবস্থাপনা'}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              {isPrincipal 
                ? 'শিক্ষার্থী ও শিক্ষকদের ছুটির আবেদন পর্যালোচনা এবং স্বয়ংক্রিয় প্রক্সি ক্লাস অ্যাসাইনমেন্ট'
                : isClassIncharge
                ? 'শ্রেণি ইনচার্জ হিসেবে শিক্ষার্থীদের ছুটির সুপারিশ এবং নিজের ছুটির হিস্ট্রি'
                : 'ছুটির আবেদন করুন এবং সহকর্মীদের প্রক্সি ক্লাসের দায়িত্ব পর্যবেক্ষণ করুন'}
            </p>
          </div>
        </div>

        {/* ট্যাব নেভিগেশন ও অ্যাকশন বাটন */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            {(isPrincipal || isClassIncharge) && (
              <button
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'student' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> শিক্ষার্থীদের ছুটি
              </button>
            )}

            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'teacher' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> 
              {isPrincipal ? 'শিক্ষকদের ছুটি ও প্রক্সি' : 'আমার ছুটির হিস্ট্রি'}
            </button>

            {isTeacher && !isPrincipal && (
              <button
                onClick={() => setActiveTab('my-proxies')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'my-proxies' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> প্রক্সি দায়িত্ব
              </button>
            )}
          </div>

          {/* শিক্ষক হলে নতুন ছুটির আবেদন বাটন */}
          {isTeacher && showTeacherApplyButton && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> ছুটির আবেদন
            </button>
          )}
        </div>
      </div>

      {/* কন্টেন্ট লোডিং */}
      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'student' ? (
        /* ================= শিক্ষার্থী ছুটির তালিকা ================= */
        <div data-tab-panel="true" className="space-y-4">
          {studentLeaves.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো আবেদন অপেক্ষমাণ নেই</h3>
              <p className="text-xs text-slate-400 mt-1">শিক্ষার্থীদের কোনো নতুন ছুটির আবেদন জমা নেই।</p>
            </div>
          ) : (
            studentLeaves.map((leave) => {
              const isRecommended = leave.incharge_status === 'RECOMMENDED';
              const isInchargeRejected = leave.incharge_status === 'REJECTED';
              const isApproved = leave.status === 'APPROVED';
              const isRejected = leave.status === 'REJECTED';

              return (
                <div
                  key={leave.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                          {leave.student_name || leave.student?.user?.first_name || 'শিক্ষার্থী'}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          রোল: {leave.student_roll || leave.student?.roll_number || 'N/A'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium">
                          {leave.section_name || 'শ্রেণি ও শাখা'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                        <span>তারিখ: <strong>{leave.start_date}</strong> হতে <strong>{leave.end_date}</strong></span>
                        <span>({leave.total_days || 1} দিন)</span>
                      </div>

                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <strong>ছুটির কারণ:</strong> {leave.reason}
                      </p>

                      {/* ইনচার্জ সুপারিশ স্ট্যাটাস */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">শ্রেণি ইনচার্জ রিভিউ:</span>
                        {isRecommended ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <Check className="w-3.5 h-3.5" /> অনুমোদনের সুপারিশকৃত ({leave.incharge_remarks || 'মন্তব্য নেই'})
                          </span>
                        ) : isInchargeRejected ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> ইনচার্জ কর্তৃক প্রত্যাখ্যাত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                            <Clock className="w-3.5 h-3.5" /> ইনচার্জ পর্যালোচনার অপেক্ষায়
                          </span>
                        )}
                      </div>
                    </div>

                    {/* অ্যাকশন প্যানেল (অধ্যক্ষ বনাম ইনচার্জ) */}
                    <div className="flex flex-col items-end gap-2 min-w-[200px]">
                      {isApproved ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> অধ্যক্ষ কর্তৃক অনুমোদিত
                        </span>
                      ) : isRejected ? (
                        <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> প্রত্যাখ্যাত
                        </span>
                      ) : isPrincipal ? (
                        /* প্রিন্সিপালের চূড়ান্ত রিভিউ বাটন */
                        <button
                          onClick={() => {
                            setReviewModalData({ type: 'student', item: leave });
                            setForceApprove(!isRecommended);
                            setDecisionRemarks(leave.principal_remarks || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                        >
                          <ClipboardCheck className="w-4 h-4" /> পর্যালোচনা ও অনুমোদন
                        </button>
                      ) : isClassIncharge && leave.incharge_status === 'PENDING' ? (
                        /* ইনচার্জের সুপারিশ বাটন */
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleInchargeReview(leave.id, 'RECOMMENDED')}
                            disabled={submitting}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                          >
                            সুপারিশ করুন
                          </button>
                          <button
                            onClick={() => handleInchargeReview(leave.id, 'REJECTED')}
                            disabled={submitting}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                          >
                            রিজেক্ট
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">পর্যালোচনা সম্পন্ন</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'teacher' ? (
        /* ================= শিক্ষক ছুটির তালিকা ================= */
        <div className="space-y-4">
          {teacherLeaves.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো ছুটির রেকর্ড নেই</h3>
              <p className="text-xs text-slate-400 mt-1">বর্তমানে কোনো শিক্ষকের ছুটি জমা নেই।</p>
            </div>
          ) : (
            teacherLeaves.map((leave) => {
              const isApproved = leave.status === 'APPROVED';
              const isRejected = leave.status === 'REJECTED';

              return (
                <div
                  key={leave.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                          {leave.teacher_name || leave.teacher?.first_name || 'শিক্ষক'}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/30 text-purple-600 font-semibold">
                          {leave.leave_type_display || leave.leave_type || 'সাধারণ ছুটি'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                        <span>তারিখ: <strong>{leave.start_date}</strong> হতে <strong>{leave.end_date}</strong></span>
                        <span>({leave.total_days || 1} দিন)</span>
                      </div>

                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <strong>ছুটির কারণ:</strong> {leave.reason}
                      </p>

                      <div className="flex items-center gap-2 text-xs p-2.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 text-blue-800 dark:text-blue-300">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>মনোনীত প্রক্সি শিক্ষক: <strong>{leave.proxy_teacher_name || 'নির্ধারিত হয়নি'}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                      {isApproved ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> অনুমোদিত
                        </span>
                      ) : isRejected ? (
                        <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> প্রত্যাখ্যাত
                        </span>
                      ) : isPrincipal ? (
                        <button
                          onClick={() => {
                            setReviewModalData({ type: 'teacher', item: leave });
                            setDecisionRemarks(leave.principal_remarks || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-[#153e7c] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                        >
                          <ClipboardCheck className="w-4 h-4 text-brand-orange" />
                          ছুটি ও প্রক্সি অনুমোদন
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
                          অপেক্ষমাণ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ================= প্রক্সি ক্লাস দায়িত্ব তালিকা ================= */
        <div className="space-y-4">
          {proxyDuties.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো প্রক্সি ক্লাস নির্ধারিত নেই</h3>
              <p className="text-xs text-slate-400 mt-1">ছুটিতে থাকা সহকর্মীদের কোনো প্রক্সি দায়িত্ব আপনার নামে জমা নেই।</p>
            </div>
          ) : (
            proxyDuties.map((duty) => (
              <div key={duty.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-sm text-brand-navy dark:text-slate-200">
                    ছুটিতে থাকা শিক্ষক: {duty.teacher_name}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    প্রক্সি দায়িত্ব সক্রিয়
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  মেয়াদ: <strong>{duty.start_date}</strong> হতে <strong>{duty.end_date}</strong> ({duty.total_days} দিন)
                </p>
                <p className="text-xs text-slate-500 mt-1 italic">"{duty.reason}"</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* অধ্যক্ষের অনুমোদন মডাল */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-brand-orange" />
              {reviewModalData.type === 'student' ? 'শিক্ষার্থীর ছুটির চূড়ান্ত অনুমোদন' : 'শিক্ষকের ছুটি ও প্রক্সি ক্লাস অনুমোদন'}
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div><strong>আবেদনকারী:</strong> {reviewModalData.type === 'student' ? reviewModalData.item.student_name : reviewModalData.item.teacher_name}</div>
              <div><strong>তারিখ:</strong> {reviewModalData.item.start_date} হতে {reviewModalData.item.end_date}</div>
              <div><strong>কারণ:</strong> {reviewModalData.item.reason}</div>
            </div>

            {reviewModalData.type === 'student' && reviewModalData.item.incharge_status !== 'RECOMMENDED' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                শ্রেণি ইনচার্জ এখনও এই আবেদন সুপারিশ করেননি। আপনি অধ্যক্ষ হিসেবে সরাসরি অনুমোদন করতে পারেন।
                <label className="flex items-center gap-2 mt-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceApprove}
                    onChange={(e) => setForceApprove(e.target.checked)}
                    className="rounded text-brand-orange"
                  />
                  সরাসরি বিশেষ বিবেচনায় অনুমোদন (Force Approve)
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">মন্তব্য (ঐচ্ছিক)</label>
              <textarea
                rows={3}
                placeholder="যেমন: ছুটি মঞ্জুর করা হলো..."
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handlePrincipalReview('REJECTED')}
                className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 text-xs font-semibold hover:bg-rose-50"
              >
                প্রত্যাখ্যান
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handlePrincipalReview('APPROVED')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                {submitting ? 'সংরক্ষণ হচ্ছে...' : 'অনুমোদন দিন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* শিক্ষকের নতুন ছুটির আবেদন মডাল */}
      {showApplyModal && (
        <TeacherLeaveModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={fetchLeavesData}
        />
      )}
    </div>
  );
};

export default LeaveManagementHub;




