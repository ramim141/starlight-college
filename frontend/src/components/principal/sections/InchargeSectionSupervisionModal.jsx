import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/client';
import {
  X,
  UserCheck,
  Calendar,
  PhoneCall,
  DollarSign,
  FileText,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import Student360Modal from '../Student360Modal';

import SupervisionAttendanceTab from './supervision/SupervisionAttendanceTab';
import SupervisionCallsTab from './supervision/SupervisionCallsTab';
import SupervisionFeesTab from './supervision/SupervisionFeesTab';
import SupervisionLeavesTab from './supervision/SupervisionLeavesTab';
import SupervisionStudentsTab from './supervision/SupervisionStudentsTab';

const InchargeSectionSupervisionModal = ({ section, teachers, onClose, onAssignClick }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedStudentFor360, setSelectedStudentFor360] = useState(null);

  // নিরাপদ তারিখ ইনিশিয়ালাইজেশন
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);

  // নতুন কল লগ ফর্ম স্টেট
  const [showNewCallForm, setShowNewCallForm] = useState(false);
  const [newCallForm, setNewCallForm] = useState({
    student: '',
    category: 'ATTENDANCE',
    guardian_phone_called: '',
    discussion_summary: '',
    guardian_response: '',
    follow_up_needed: false,
  });
  const [submittingCall, setSubmittingCall] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const inChargeTeacher = teachers?.find((t) => t.id === section.in_charge_teacher) || null;

  // ১. সেকশনের হাজিরা শিট কুয়েরি
  const {
    data: attendanceSheetData = null,
    isLoading: loadingAttendance,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ['section-attendance-sheet', section.id, attendanceDate],
    queryFn: async () => {
      try {
        const res = await api.get(`academics/attendance/section-sheet/?section=${section.id}&date=${attendanceDate}`);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: activeTab === 'attendance',
    staleTime: 1000 * 60 * 2,
  });

  // ২. At-Risk শিক্ষার্থী তালিকা কুয়েরি
  const { data: atRiskData = null } = useQuery({
    queryKey: ['section-at-risk', section.id],
    queryFn: async () => {
      try {
        const res = await api.get(`academics/students/at-risk-tracker/?section=${section.id}`);
        return res.data?.watchlist || [];
      } catch {
        return [];
      }
    },
    enabled: activeTab === 'attendance',
    staleTime: 1000 * 60 * 5,
  });

  // ৩. অভিভাবক কল লগ কুয়েরি
  const {
    data: parentCallsData = [],
    isLoading: loadingCalls,
    refetch: refetchCalls,
  } = useQuery({
    queryKey: ['section-parent-calls', section.id],
    queryFn: async () => {
      try {
        const res = await api.get('operations/parent-calls/');
        const allCalls = res.data?.results || res.data || [];
        return allCalls.filter((c) => c.section === section.id || c.student_unique_id || c.roll_number);
      } catch {
        return [];
      }
    },
    enabled: activeTab === 'calls',
    staleTime: 1000 * 60 * 3,
  });

  // ৪. ইনভয়েস ও ক্যাশ হ্যান্ডওভার কুয়েরি
  const {
    data: financeData = { invoices: [], handovers: [] },
    isLoading: loadingFinance,
    refetch: refetchFinance,
  } = useQuery({
    queryKey: ['section-finance-summary', section.id, inChargeTeacher?.id],
    queryFn: async () => {
      try {
        const [invRes, handRes] = await Promise.allSettled([
          api.get(`finance/invoices/?section=${section.id}`),
          api.get('finance/handovers/'),
        ]);

        const invoices = invRes.status === 'fulfilled' ? (invRes.value.data?.results || invRes.value.data || []) : [];
        const allHandovers = handRes.status === 'fulfilled' ? (handRes.value.data?.results || handRes.value.data || []) : [];
        const teacherHandovers = inChargeTeacher?.id
          ? allHandovers.filter((h) => h.in_charge === inChargeTeacher.id)
          : allHandovers;

        return { invoices, handovers: teacherHandovers };
      } catch {
        return { invoices: [], handovers: [] };
      }
    },
    enabled: activeTab === 'fees',
    staleTime: 1000 * 60 * 3,
  });

  // ৫. ছুটি ও জরিমানা মওকুফ আবেদন কুয়েরি
  const {
    data: approvalsData = { leaves: [], waivers: [] },
    isLoading: loadingApprovals,
    refetch: refetchApprovals,
  } = useQuery({
    queryKey: ['section-approvals', section.id],
    queryFn: async () => {
      try {
        const [leavesRes, waiversRes] = await Promise.allSettled([
          api.get(`operations/leaves/?section=${section.id}`),
          api.get('finance/waivers/'),
        ]);

        const leaves = leavesRes.status === 'fulfilled' ? (leavesRes.value.data?.results || leavesRes.value.data || []) : [];
        const allWaivers = waiversRes.status === 'fulfilled' ? (waiversRes.value.data?.results || waiversRes.value.data || []) : [];
        const sectionWaivers = allWaivers.filter((w) => w.invoice_details?.section_id === section.id || w.section === section.id || true);

        return { leaves, waivers: sectionWaivers };
      } catch {
        return { leaves: [], waivers: [] };
      }
    },
    enabled: activeTab === 'leaves',
    staleTime: 1000 * 60 * 3,
  });

  // ৬. সেকশনের শিক্ষার্থী তালিকা কুয়েরি
  const { data: sectionStudents = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['section-students-list', section.id],
    queryFn: async () => {
      try {
        const res = await api.get(`academics/students/?section=${section.id}`);
        return res.data?.results || res.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // অনুপস্থিতি হোয়াটসঅ্যাপ অ্যালার্ট ট্রিগার
  const handleSendAbsentWhatsAppAlert = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('operations/notifications/send-absent-alert/', {
        section_id: section.id,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের হোয়াটসঅ্যাপ বার্তা পাঠানো হয়েছে।');
      } else {
        toast.info(res.data?.message || 'অ্যালার্ট প্রেরণ সম্পন্ন হয়েছে');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'বার্তা পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // বকেয়া তাগাদা প্রেরণ
  const handleSendDueAlert = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('operations/notifications/send-due-reminder/', {
        section_id: section.id,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'বকেয়া ফি তাগাদা নোটিফিকেশন পাঠানো হয়েছে।');
      } else {
        toast.info(res.data?.message || 'তাগাদা পাঠানো সম্পন্ন হয়েছে');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'বকেয়া তাগাদা পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // ক্যাশ হস্তান্তর ভেরিফাই
  const handleVerifyCashHandover = async (handoverId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`finance/handovers/${handoverId}/verify-cash/`, {
        notes: 'প্রিন্সিপাল কর্তৃক নগদ অর্থ গ্রহণ ও যাচাই সম্পন্ন।',
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'ক্যাশ হস্তান্তর সফলভাবে ভেরিফাই করা হয়েছে।');
        refetchFinance();
        queryClient.invalidateQueries({ queryKey: ['principal', 'sections-and-incharge-hub'] });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ক্যাশ ভেরিফিকেশন ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // ছুটির আবেদন রিভিউ
  const handlePrincipalLeaveReview = async (leaveId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`operations/leaves/${leaveId}/principal-review/`, {
        status: newStatus,
        force_approve: true,
        remarks: newStatus === 'APPROVED' ? 'প্রিন্সিপাল কর্তৃক অনুমোদিত' : 'প্রিন্সিপাল কর্তৃক প্রত্যাখ্যাত',
      });
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || `ছুটির আবেদন '${newStatus}' করা হয়েছে।`);
        refetchApprovals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'আবেদন অনুমোদন ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // জরিমানা মওকুফ রিভিউ
  const handlePrincipalWaiverReview = async (waiverId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`finance/waivers/${waiverId}/principal-review/`, {
        status: newStatus,
        remarks: newStatus === 'APPROVED' ? 'প্রিন্সিপাল কর্তৃক মওকুফ অনুমোদিত' : 'প্রিন্সিপাল কর্তৃক বাতিল',
      });
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || 'জরিমানা মওকুফের আবেদন হালনাগাদ করা হয়েছে।');
        refetchApprovals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'মওকুফ আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  // নতুন কল লগ সাবমিট
  const handleCreateParentCall = async (e) => {
    e.preventDefault();
    if (!newCallForm.student || !newCallForm.discussion_summary) {
      toast.error('শিক্ষার্থী নির্বাচন ও আলোচনার সারসংক্ষেপ আবশ্যক।');
      return;
    }
    setSubmittingCall(true);
    try {
      const res = await api.post('operations/parent-calls/', {
        ...newCallForm,
        call_date: attendanceDate,
      });
      if (res.status === 201) {
        toast.success('অভিভাবকের সাথে আলোচনার কল লগ সফলভাবে নথিবদ্ধ হয়েছে।');
        setShowNewCallForm(false);
        setNewCallForm({
          student: '',
          category: 'ATTENDANCE',
          guardian_phone_called: '',
          discussion_summary: '',
          guardian_response: '',
          follow_up_needed: false,
        });
        refetchCalls();
        queryClient.invalidateQueries({ queryKey: ['principal', 'sections-and-incharge-hub'] });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'কল লগ সংরক্ষণে সমস্যা হয়েছে।');
    } finally {
      setSubmittingCall(false);
    }
  };

  // উপস্থিতির হার হিসাব
  const attStudents = attendanceSheetData?.students || [];
  const totalAttStudents = attStudents.length;
  const presentCount = attStudents.filter((s) => s.status === 'PRESENT').length;
  const lateCount = attStudents.filter((s) => s.status === 'LATE').length;
  const attendanceRate = totalAttStudents > 0
    ? Math.round(((presentCount + lateCount) / totalAttStudents) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* মোডাল হেডার: সেকশন ও ইনচার্জ বিবরণী */}
        <div className="bg-gradient-to-r from-[#0A2147] via-[#0F2C59] to-[#143B75] text-white p-5 sm:p-6 relative overflow-hidden flex-shrink-0">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#F27405]/20 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-brand-orange px-3 py-1 text-xs font-black text-white shadow-sm">
                  শাখা: {section.section_name}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90">
                  {section.class_level_display || section.class_level}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/90">
                  {section.group_display || section.group}
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-500/30">
                  সেশন: {section.session}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                শ্রেণি ইনচার্জ ৩৬০° সেন্ট্রাল সুপারভিশন হাব
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                শ্রেণি ইনচার্জের ৫টি কেন্দ্রীয় দায়িত্ব: দৈনিক হাজিরা, অভিভাবক যোগাযোগ, ফি ও ক্যাশ, ছুটি সুপারিশ এবং রেজাল্ট তদারকি।
              </p>
            </div>

            {/* ইনচার্জ শিক্ষক কার্ড ও অ্যাকশন */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-3 border border-white/15">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center font-black text-white text-base shadow-md">
                  {inChargeTeacher?.first_name?.[0] || inChargeTeacher?.username?.[0] || 'I'}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-brand-orange uppercase tracking-wider">বর্তমান শ্রেণি ইনচার্জ</p>
                  <p className="text-sm font-black text-white truncate max-w-[160px]">
                    {section.in_charge_teacher_name || 'মনোনীত করা হয়নি'}
                  </p>
                  <p className="text-[11px] text-white/60">
                    {inChargeTeacher?.teacher_profile?.department ? `${inChargeTeacher.teacher_profile.department} বিভাগ` : (inChargeTeacher?.phone || 'শিক্ষক')}
                  </p>
                </div>
              </div>

              <button
                onClick={onAssignClick}
                className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-bold text-white transition border border-white/20 flex items-center gap-1.5"
                title="ইনচার্জ পরিবর্তন বা নিয়োগ"
              >
                <UserCheck className="h-4 w-4 text-brand-orange" />
                <span className="hidden sm:inline">পরিবর্তন</span>
              </button>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ৫টি ফাংশনাল সাব-ট্যাব ন্যাভিগেশন */}
          <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-white/10 no-scrollbar">
            {[
              { id: 'attendance', label: '১. দৈনিক হাজিরা ও শিট', icon: Calendar, badge: `${attendanceRate}%` },
              { id: 'calls', label: '২. অভিভাবক কল লগ', icon: PhoneCall, badge: parentCallsData.length },
              { id: 'fees', label: '৩. মাসিক ফি ও ক্যাশ হস্তান্তর', icon: DollarSign, badge: `${financeData.handovers?.length || 0} হস্তান্তর` },
              { id: 'leaves', label: '৪. ছুটি ও জরিমানা সুপারিশ', icon: FileText, badge: `${(approvalsData.leaves?.length || 0) + (approvalsData.waivers?.length || 0)} আবেদন` },
              { id: 'students', label: '৫. শিক্ষার্থী তালিকা', icon: Users, badge: `${section.total_students || 0} জন` },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-md'
                      : 'bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-white/10 text-white/80'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* মোডাল কনটেন্ট বডি */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          {activeTab === 'attendance' && (
            <div data-tab-panel="true"><SupervisionAttendanceTab
              attendanceDate={attendanceDate}
              setAttendanceDate={setAttendanceDate}
              attendanceSheetData={attendanceSheetData}
              loadingAttendance={loadingAttendance}
              refetchAttendance={refetchAttendance}
              atRiskData={atRiskData}
              actionLoading={actionLoading}
              onSendAbsentWhatsAppAlert={handleSendAbsentWhatsAppAlert}
              onOpenStudent360={(stu) => setSelectedStudentFor360(stu)}
            /></div>)}

          {activeTab === 'calls' && (
            <div data-tab-panel="true"><SupervisionCallsTab
              parentCallsData={parentCallsData}
              loadingCalls={loadingCalls}
              refetchCalls={refetchCalls}
              showNewCallForm={showNewCallForm}
              setShowNewCallForm={setShowNewCallForm}
              newCallForm={newCallForm}
              setNewCallForm={setNewCallForm}
              submittingCall={submittingCall}
              onCreateCall={handleCreateParentCall}
              sectionStudents={sectionStudents}
            /></div>)}

          {activeTab === 'fees' && (
            <div data-tab-panel="true"><SupervisionFeesTab
              financeData={financeData}
              loadingFinance={loadingFinance}
              refetchFinance={refetchFinance}
              actionLoading={actionLoading}
              onSendDueAlert={handleSendDueAlert}
              onVerifyCashHandover={handleVerifyCashHandover}
            /></div>)}

          {activeTab === 'leaves' && (
            <div data-tab-panel="true"><SupervisionLeavesTab
              approvalsData={approvalsData}
              loadingApprovals={loadingApprovals}
              refetchApprovals={refetchApprovals}
              actionLoading={actionLoading}
              onLeaveReview={handlePrincipalLeaveReview}
              onWaiverReview={handlePrincipalWaiverReview}
            /></div>)}

          {activeTab === 'students' && (
            <div data-tab-panel="true"><SupervisionStudentsTab
              sectionStudents={sectionStudents}
              loadingStudents={loadingStudents}
              onOpenStudent360={(stu) => setSelectedStudentFor360(stu)}
            /></div>)}
        </div>
      </div>

      {/* স্টুডেন্ট ৩৬০° মডাল */}
      {selectedStudentFor360 && (
        <Student360Modal
          student={selectedStudentFor360}
          onClose={() => setSelectedStudentFor360(null)}
        />
      )}
    </div>
  );
};

export default InchargeSectionSupervisionModal;



