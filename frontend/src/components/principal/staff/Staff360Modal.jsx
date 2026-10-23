import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalDialogVariants } from '../../../utils/motion';
import {
  X,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  Phone,
  MessageCircle,
  Check,
  Ban,
  Banknote,
  Sparkles,
  CalendarDays,
  Loader2,
  AlertCircle,
  ChevronDown,
  Inbox,
} from 'lucide-react';
import api from '../../../api/client';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Local (device) date, NOT UTC — toISOString() shows yesterday in Bangladesh between 12am–6am.
const localDateStr = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const fmtTaka = (n) => `৳${Number(n || 0).toLocaleString('en-IN')}`;
const fmtSalary = (v) => (v === null || v === undefined || v === '' ? '—' : fmtTaka(v));
const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

const DAY_NAMES = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';

const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};
const LEAVE_TONE = { APPROVED: 'success', REJECTED: 'danger', PENDING: 'warning' };
const CLAIM_TONE = { DISBURSED: 'success', APPROVED_BY_PRINCIPAL: 'info', REJECTED: 'danger', PENDING: 'warning' };

const pendingFirst = (list, isPending) =>
  [...list].sort((a, b) => Number(isPending(b)) - Number(isPending(a)));

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

const Badge = ({ tone = 'neutral', children }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${TONES[tone]}`}
  >
    {children}
  </span>
);

const Card = ({ children, className = '' }) => (
  <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>{children}</section>
);

const CardHeader = ({ title, meta }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-navy">
      <span className="h-4 w-1 rounded-full bg-brand-orange" aria-hidden="true" />
      {title}
    </h3>
    {meta && <span className="text-xs text-slate-500">{meta}</span>}
  </div>
);

const EmptyState = ({ icon: Icon = Inbox, children }) => (
  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <p className="text-sm text-slate-500">{children}</p>
  </div>
);

const TH = 'px-4 py-3 text-left text-xs font-bold text-[#0F2C59] whitespace-nowrap';
const TD = 'px-4 py-3 align-middle';

/* Approve / reject bar. Reject always asks for confirmation (+ optional reason). */
const ReviewBar = ({ onApprove, onReject, approveLabel, rejectLabel, disabled }) => {
  const [rejecting, setRejecting] = useState(false);
  const [remark, setRemark] = useState('');
  const [working, setWorking] = useState(null); // 'approve' | 'reject' | null

  const run = async (kind) => {
    setWorking(kind);
    const ok = kind === 'approve' ? await onApprove() : await onReject(remark.trim());
    setWorking(null);
    if (ok && kind === 'reject') {
      setRejecting(false);
      setRemark('');
    }
  };

  if (rejecting) {
    return (
      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-3">
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={2}
          autoFocus
          aria-label="প্রত্যাখ্যানের কারণ"
          placeholder="প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক)"
          className={`w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 ${FOCUS}`}
        />
        <div className="mt-2.5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setRejecting(false)}
            disabled={working !== null}
            className={`min-h-[40px] rounded-lg px-3.5 text-sm font-medium text-slate-600 hover:bg-white ${FOCUS}`}
          >
            ফিরে যান
          </button>
          <button
            type="button"
            onClick={() => run('reject')}
            disabled={disabled || working !== null}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 ${FOCUS}`}
          >
            {working === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            প্রত্যাখ্যান নিশ্চিত করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setRejecting(true)}
        disabled={disabled}
        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60 ${FOCUS}`}
      >
        <Ban className="h-4 w-4" />
        {rejectLabel}
      </button>
      <button
        type="button"
        onClick={() => run('approve')}
        disabled={disabled || working !== null}
        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold shadow-md shadow-emerald-600/25 text-white hover:bg-emerald-700 disabled:opacity-60 ${FOCUS}`}
      >
        {working === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {approveLabel}
      </button>
    </div>
  );
};

/* Cash verification is money-related, so it gets an inline "are you sure". */
const VerifyCash = ({ amount, onVerify, disabled }) => {
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);

  const run = async () => {
    setWorking(true);
    await onVerify();
    setWorking(false);
    setConfirming(false);
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        className={`min-h-[36px] rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 ${FOCUS}`}
      >
        ভেরিফাই করুন
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs text-slate-600">{fmtTaka(amount)} বুঝে পেয়েছেন?</span>
      <button
        type="button"
        onClick={run}
        disabled={working}
        className={`inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 ${FOCUS}`}
      >
        {working && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        হ্যাঁ, নিশ্চিত
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={working}
        className={`min-h-[36px] rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 ${FOCUS}`}
      >
        না
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const Staff360Modal = ({ staff, trackingData, isOpen, onClose, onRefreshData, initialTab = 'attendance' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [busy, setBusy] = useState(false);
  const [showAllAttendance, setShowAllAttendance] = useState(false);

  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const bodyRef = useRef(null);
  const tabRefs = useRef({});

  // Land on the requested tab each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setShowAllAttendance(false);
    }
  }, [isOpen, initialTab, staff?.id]);

  // Scroll lock + focus handling (focus close button, restore focus on exit)
  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  // Escape to close + keep Tab inside the dialog
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !staff) return null;

  /* ---------------- derived data ---------------- */
  const isTeacher = staff.role === 'TEACHER' || staff.role_display === 'Teacher';
  const staffAttendance = trackingData?.attendance || [];
  const staffRoutines = trackingData?.routines || [];
  const staffLeaves = trackingData?.leaves || [];
  const staffClaims = trackingData?.claims || [];
  const staffHandovers = trackingData?.handovers || [];

  const todayStr = localDateStr();
  const todayLog = staffAttendance.find((a) => a.date === todayStr);

  const totalDaysLogged = staffAttendance.length;
  const presentDays = staffAttendance.filter((a) => a.approval_status !== 'REJECTED' && !a.is_absent).length;
  const attendanceRate = totalDaysLogged > 0 ? Math.round((presentDays / totalDaysLogged) * 100) : 100;
  const sortedAttendance = [...staffAttendance].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const visibleAttendance = showAllAttendance ? sortedAttendance : sortedAttendance.slice(0, 10);

  const approvedLeaveDays = staffLeaves
    .filter((l) => l.status === 'APPROVED')
    .reduce((acc, l) => acc + (Number(l.total_days) || 1), 0);
  const pendingLeaves = staffLeaves.filter((l) => l.status === 'PENDING');
  const pendingSalaryClaims = staffClaims.filter((c) => c.status === 'PENDING');
  const pendingHandovers = staffHandovers.filter((h) => h.status === 'PENDING');

  const baseSalary = staff.teacher_profile?.base_salary;
  const verifiedCash = staffHandovers
    .filter((h) => h.status === 'VERIFIED')
    .reduce((acc, h) => acc + (Number(h.amount) || 0), 0);
  const pendingCash = pendingHandovers.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);

  const jsDay = new Date().getDay();
  const currentModelDay = jsDay === 6 ? 0 : jsDay + 1;
  const sortedRoutines = [...staffRoutines].sort(
    (a, b) => a.day_of_week - b.day_of_week || String(a.start_time).localeCompare(String(b.start_time))
  );
  const todaysClasses = sortedRoutines.filter((r) => r.day_of_week === currentModelDay);

  const totalPending = pendingLeaves.length + pendingSalaryClaims.length + pendingHandovers.length;

  /* ---------------- tabs ---------------- */
  const tabs = [
    { id: 'attendance', label: 'হাজিরা', icon: Calendar, count: staffAttendance.length, alert: 0 },
    ...(isTeacher
      ? [{ id: 'routine', label: 'ক্লাস রুটিন', icon: Clock, count: staffRoutines.length, alert: 0 }]
      : []),
    { id: 'collection', label: 'ক্যাশ কালেকশন', icon: Banknote, count: staffHandovers.length, alert: pendingHandovers.length },
    { id: 'leaves', label: 'ছুটি', icon: CalendarDays, count: staffLeaves.length, alert: pendingLeaves.length },
    { id: 'salary', label: 'বেতন ও ক্লেইম', icon: CreditCard, count: staffClaims.length, alert: pendingSalaryClaims.length },
  ];
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : 'attendance';

  const selectTab = (id) => {
    setActiveTab(id);
    bodyRef.current?.scrollTo?.({ top: 0 });
  };

  const onTabKeyDown = (e, index) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    selectTab(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  };

  /* ---------------- actions ---------------- */
  const submitAction = async ({ url, payload, okFallback, errFallback }) => {
    setBusy(true);
    try {
      const res = await api.patch(url, payload);
      if (res.data?.success) {
        toast.success(res.data.message || okFallback);
        if (onRefreshData) onRefreshData();
        return true;
      }
      toast.error(res.data?.message || errFallback);
      return false;
    } catch (err) {
      toast.error(err.response?.data?.message || errFallback);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const reviewLeave = (id, status, remark) =>
    submitAction({
      url: `operations/teacher-leaves/${id}/review-leave/`,
      payload: {
        status,
        remarks: remark || `প্রিন্সিপাল কর্তৃক ${status === 'APPROVED' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}`,
      },
      okFallback: `ছুটি ${status === 'APPROVED' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে`,
      errFallback: 'ছুটি আপডেট করা যায়নি, আবার চেষ্টা করুন',
    });

  const reviewClaim = (id, status, remark) =>
    submitAction({
      url: `finance/salary-claims/${id}/principal-approve/`,
      payload: {
        status,
        remarks: remark || `প্রিন্সিপাল কর্তৃক ${status === 'APPROVED' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}`,
      },
      okFallback: status === 'APPROVED' ? 'বেতন ক্লেইম অনুমোদিত হয়েছে' : 'বেতন ক্লেইম প্রত্যাখ্যাত হয়েছে',
      errFallback: 'ক্লেইম আপডেট করা যায়নি, আবার চেষ্টা করুন',
    });

  const verifyHandover = (id) =>
    submitAction({
      url: `finance/cash-handovers/${id}/verify-cash/`,
      payload: { notes: 'প্রিন্সিপাল কর্তৃক সরাসরি নগদ ভেরিফাইড' },
      okFallback: 'ক্যাশ ভেরিফাই হয়েছে',
      errFallback: 'ভেরিফাই করা যায়নি, আবার চেষ্টা করুন',
    });

  /* ---------------- header data ---------------- */
  const headerStats = [
    {
      icon: CheckCircle2,
      label: 'উপস্থিতির হার',
      value: `${attendanceRate}%`,
      sub: `${presentDays}/${totalDaysLogged} দিন`,
      valueClass: attendanceRate >= 80 ? 'text-emerald-300' : 'text-amber-300',
    },
    {
      icon: Calendar,
      label: 'আজকের অবস্থা',
      value: todayLog ? (todayLog.is_late ? 'লেট' : 'উপস্থিত') : 'লগ নেই',
      sub: todayLog?.check_in_time ? `চেক-ইন ${hhmm(todayLog.check_in_time)}` : 'চেক-ইন হয়নি',
      valueClass: todayLog ? (todayLog.is_late ? 'text-amber-300' : 'text-emerald-300') : 'text-slate-300',
    },
    {
      icon: Clock,
      label: isTeacher ? 'আজকের ক্লাস' : 'দায়িত্ব',
      value: isTeacher ? `${todaysClasses.length}টি` : 'অফিস',
      sub: isTeacher ? 'পিরিয়ড' : 'প্রশাসন',
      valueClass: 'text-white',
    },
    {
      icon: CalendarDays,
      label: 'ছুটি নিয়েছেন',
      value: `${approvedLeaveDays} দিন`,
      sub: pendingLeaves.length ? `${pendingLeaves.length}টি আবেদন বাকি` : 'আবেদন বাকি নেই',
      valueClass: 'text-white',
    },
    {
      icon: Banknote,
      label: 'মূল বেতন',
      value: fmtSalary(baseSalary),
      sub: pendingSalaryClaims.length ? `${pendingSalaryClaims.length}টি ক্লেইম বাকি` : 'ক্লেইম বাকি নেই',
      valueClass: 'text-white',
    },
  ];

  const staffName = staff.full_name || staff.username;
  const initial = (staff.first_name?.[0] || staff.username?.[0] || 'S').toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff360-title"
    >
      {/* Backdrop */}
      <motion.div
        onClick={onClose}
        aria-hidden="true"
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <motion.div
        ref={dialogRef}
        variants={modalDialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* ===== Header ===== */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#143B75] px-5 pb-5 pt-4 text-white sm:px-6 sm:pt-5">
          <svg
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/4"
            viewBox="0 0 600 300"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="s360-swoosh" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#FF6A1A" stopOpacity="0" />
                <stop offset="0.55" stopColor="#FF6A1A" stopOpacity="0.9" />
                <stop offset="1" stopColor="#FFB067" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path d="M0 300 C 180 150, 380 50, 600 25" fill="none" stroke="url(#s360-swoosh)" strokeWidth="2.5" />
          </svg>
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" aria-hidden="true" />

          <div className="relative">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/30 sm:hidden" aria-hidden="true" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-[#e64a19] text-xl font-extrabold shadow-lg shadow-orange-900/30 ring-4 ring-white/10">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 id="staff360-title" className="truncate text-lg font-extrabold sm:text-xl">
                      {staffName}
                    </h2>
                    <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-xs font-semibold">
                      {staff.role_display}
                    </span>
                    {staff.is_class_incharge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> শ্রেণি ইনচার্জ
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-slate-300">
                    {staff.teacher_profile?.designation && <span>{staff.teacher_profile.designation}</span>}
                    {staff.teacher_profile?.department && <span>{staff.teacher_profile.department}</span>}
                    {staff.employee_id && <span className="tabular-nums text-orange-300">আইডি #{staff.employee_id}</span>}
                  </p>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                {staff.phone && (
                  <>
                    <a
                      href={`https://wa.me/${staff.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp-এ মেসেজ করুন"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 text-sm font-semibold hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${staff.phone}`}
                      aria-label="ফোন করুন"
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 text-sm font-semibold hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline">কল</span>
                    </a>
                  </>
                )}
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="বন্ধ করুন"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-4 sm:grid-cols-5">
              {headerStats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-orange ring-1 ring-white/10">
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <dt className="truncate text-xs text-slate-300">{s.label}</dt>
                      <dd className={`text-base font-bold tabular-nums ${s.valueClass}`}>{s.value}</dd>
                      <dd className="truncate text-xs text-slate-400">{s.sub}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
        </header>

        {/* ===== Needs-attention banner ===== */}
        {totalPending > 0 && (
          <div className="flex flex-col gap-2 border-b border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-900">
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {totalPending}টি বিষয়ে আপনার সিদ্ধান্ত প্রয়োজন
            </p>
            <div className="flex flex-wrap gap-2">
              {pendingLeaves.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectTab('leaves')}
                  className={`min-h-[36px] rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 ${FOCUS}`}
                >
                  ছুটির আবেদন ({pendingLeaves.length})
                </button>
              )}
              {pendingSalaryClaims.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectTab('salary')}
                  className={`min-h-[36px] rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 ${FOCUS}`}
                >
                  বেতন ক্লেইম ({pendingSalaryClaims.length})
                </button>
              )}
              {pendingHandovers.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectTab('collection')}
                  className={`min-h-[36px] rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 ${FOCUS}`}
                >
                  ক্যাশ ভেরিফিকেশন ({pendingHandovers.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== Tabs ===== */}
        <div
          role="tablist"
          aria-label="স্টাফ তথ্যের বিভাগ"
          className="flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5"
        >
          {tabs.map((t, i) => {
            const Icon = t.icon;
            const active = currentTab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[t.id] = el)}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active}
                aria-controls={`panel-${t.id}`}
                tabIndex={active ? 0 : -1}
                type="button"
                onClick={() => selectTab(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={`relative flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  active ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="staff360ActiveTabPill"
                    className="absolute inset-0 rounded-full bg-brand-navy shadow-md shadow-blue-900/20"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${active ? 'text-brand-orange' : ''}`} aria-hidden="true" />
                  <span>{t.label}</span>
                  {t.alert > 0 ? (
                    <span
                      className="rounded-full bg-rose-600 px-1.5 text-xs font-semibold leading-5 text-white"
                      aria-label={`${t.alert}টি অপেক্ষমাণ`}
                    >
                      {t.alert}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-1.5 text-xs font-semibold leading-5 ${
                        active ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* ===== Body ===== */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto bg-[#F3F6FB] p-4 sm:p-6">
          {/* ---------- Attendance ---------- */}
          {currentTab === 'attendance' && (
            <div role="tabpanel" id="panel-attendance" aria-labelledby="tab-attendance" className="space-y-4">
              <Card>
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">আজকের হাজিরা</h3>
                    <p className="mt-0.5 text-xs tabular-nums text-slate-500">{todayStr}</p>
                  </div>
                  <dl className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">চেক-ইন</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">
                        {hhmm(todayLog?.check_in_time) || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">চেক-আউট</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">
                        {hhmm(todayLog?.check_out_time) || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">অবস্থা</dt>
                      <dd className="mt-0.5">
                        {todayLog ? (
                          <Badge tone={todayLog.is_late ? 'warning' : 'success'}>
                            {todayLog.is_late ? 'লেট' : 'উপস্থিত'}
                          </Badge>
                        ) : (
                          <Badge>লগ নেই</Badge>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader title="হাজিরার ইতিহাস" meta={`মোট ${staffAttendance.length} দিন`} />
                {staffAttendance.length > 0 && (
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>উপস্থিতির হার</span>
                      <span className="font-semibold tabular-nums text-slate-800">{attendanceRate}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                )}
                {staffAttendance.length === 0 ? (
                  <EmptyState icon={Calendar}>এখনো কোনো হাজিরা রেকর্ড হয়নি</EmptyState>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-[#0F2C59]/[0.06]">
                          <tr>
                            <th className={TH}>তারিখ</th>
                            <th className={TH}>চেক-ইন</th>
                            <th className={TH}>চেক-আউট</th>
                            <th className={TH}>অবস্থা</th>
                            <th className={TH}>অনুমোদন</th>
                            <th className={TH}>মন্তব্য</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {visibleAttendance.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50">
                              <td className={`${TD} font-medium tabular-nums text-slate-900`}>{a.date}</td>
                              <td className={`${TD} tabular-nums`}>{hhmm(a.check_in_time) || '—'}</td>
                              <td className={`${TD} tabular-nums text-slate-500`}>{hhmm(a.check_out_time) || '—'}</td>
                              <td className={TD}>
                                {a.is_absent ? (
                                  <Badge tone="danger">অনুপস্থিত</Badge>
                                ) : a.is_late ? (
                                  <Badge tone="warning">লেট</Badge>
                                ) : (
                                  <Badge tone="success">উপস্থিত</Badge>
                                )}
                              </td>
                              <td className={TD}>
                                <Badge
                                  tone={
                                    a.approval_status === 'APPROVED'
                                      ? 'success'
                                      : a.approval_status === 'REJECTED'
                                        ? 'danger'
                                        : 'neutral'
                                  }
                                >
                                  {a.approval_status_display || a.approval_status || '—'}
                                </Badge>
                              </td>
                              <td className={`${TD} max-w-[200px] truncate text-slate-500`} title={a.remarks || ''}>
                                {a.remarks || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {sortedAttendance.length > 10 && (
                      <button
                        type="button"
                        onClick={() => setShowAllAttendance((v) => !v)}
                        className={`flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-3 text-sm font-medium text-brand-navy hover:bg-slate-50 ${FOCUS}`}
                      >
                        {showAllAttendance ? 'কম দেখান' : `আরও ${sortedAttendance.length - 10}টি রেকর্ড দেখান`}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${showAllAttendance ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </>
                )}
              </Card>
            </div>
          )}

          {/* ---------- Routine ---------- */}
          {currentTab === 'routine' && (
            <div role="tabpanel" id="panel-routine" aria-labelledby="tab-routine" className="space-y-4">
              <Card>
                <CardHeader
                  title={`আজকের ক্লাস, ${DAY_NAMES[currentModelDay]}`}
                  meta={`${todaysClasses.length}টি পিরিয়ড`}
                />
                {todaysClasses.length === 0 ? (
                  <EmptyState icon={Clock}>আজ এই শিক্ষকের কোনো ক্লাস নেই</EmptyState>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {todaysClasses.map((cls) => (
                      <li key={cls.id} className="flex items-center gap-4 px-4 py-3">
                        <span className="w-28 flex-shrink-0 text-sm font-semibold tabular-nums text-brand-navy">
                          {hhmm(cls.start_time)} – {hhmm(cls.end_time)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{cls.subject_name || cls.subject}</p>
                          <p className="truncate text-xs text-slate-500">{cls.section_display || 'সেকশন উল্লেখ নেই'}</p>
                        </div>
                        <Badge>রুম {cls.room_number || '—'}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="overflow-hidden">
                <CardHeader title="সাপ্তাহিক রুটিন" meta={`${staffRoutines.length}টি পিরিয়ড`} />
                {staffRoutines.length === 0 ? (
                  <EmptyState icon={Clock}>কোনো রুটিন স্লট দেওয়া হয়নি</EmptyState>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead className="bg-[#0F2C59]/[0.06]">
                        <tr>
                          <th className={TH}>বার</th>
                          <th className={TH}>সময়</th>
                          <th className={TH}>বিষয়</th>
                          <th className={TH}>শ্রেণি ও শাখা</th>
                          <th className={TH}>রুম</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {sortedRoutines.map((r) => {
                          const isToday = r.day_of_week === currentModelDay;
                          return (
                            <tr key={r.id} className={isToday ? 'bg-orange-50/50' : 'hover:bg-slate-50'}>
                              <td className={`${TD} font-medium text-slate-900`}>
                                {r.day_name || DAY_NAMES[r.day_of_week]}
                                {isToday && <span className="ml-2 text-xs font-semibold text-brand-orange">আজ</span>}
                              </td>
                              <td className={`${TD} tabular-nums`}>
                                {hhmm(r.start_time)} – {hhmm(r.end_time)}
                              </td>
                              <td className={TD}>
                                <span className="font-medium text-slate-900">{r.subject_name}</span>
                                {r.subject_code && <span className="ml-1.5 text-xs text-slate-400">{r.subject_code}</span>}
                              </td>
                              <td className={`${TD} text-slate-600`}>{r.section_display || '—'}</td>
                              <td className={`${TD} tabular-nums`}>{r.room_number || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ---------- Collection ---------- */}
          {currentTab === 'collection' && (
            <div role="tabpanel" id="panel-collection" aria-labelledby="tab-collection" className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card className="flex items-center gap-3.5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ভেরিফাইড কালেকশন</p>
                    <p className="text-lg font-bold tabular-nums text-slate-900">{fmtTaka(verifiedCash)}</p>
                  </div>
                </Card>
                <Card className={`flex items-center gap-3.5 p-4 ${pendingCash > 0 ? 'border-amber-300' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ভেরিফিকেশনের অপেক্ষায়</p>
                    <p className="text-lg font-bold tabular-nums text-slate-900">{fmtTaka(pendingCash)}</p>
                  </div>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <CardHeader title="ক্যাশ হস্তান্তরের ইতিহাস" meta={`${staffHandovers.length}টি রেকর্ড`} />
                {staffHandovers.length === 0 ? (
                  <EmptyState icon={Banknote}>কোনো ক্যাশ হস্তান্তরের রেকর্ড নেই</EmptyState>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className="bg-[#0F2C59]/[0.06]">
                        <tr>
                          <th className={TH}>তারিখ</th>
                          <th className={TH}>পরিমাণ</th>
                          <th className={TH}>গ্রহণকারী</th>
                          <th className={TH}>অবস্থা</th>
                          <th className={TH}>নোট</th>
                          <th className={`${TH} text-right`}>অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {pendingFirst(staffHandovers, (h) => h.status === 'PENDING').map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className={`${TD} font-medium tabular-nums text-slate-900`}>{h.handover_date}</td>
                            <td className={`${TD} font-semibold tabular-nums text-slate-900`}>{fmtTaka(h.amount)}</td>
                            <td className={`${TD} text-slate-600`}>{h.received_by_name || '—'}</td>
                            <td className={TD}>
                              <Badge tone={h.status === 'VERIFIED' ? 'success' : 'warning'}>
                                {h.status_display || h.status}
                              </Badge>
                            </td>
                            <td className={`${TD} max-w-[180px] truncate text-slate-500`} title={h.notes || ''}>
                              {h.notes || '—'}
                            </td>
                            <td className={`${TD} text-right`}>
                              {h.status === 'PENDING' && (
                                <VerifyCash amount={h.amount} disabled={busy} onVerify={() => verifyHandover(h.id)} />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ---------- Leaves ---------- */}
          {currentTab === 'leaves' && (
            <div role="tabpanel" id="panel-leaves" aria-labelledby="tab-leaves" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />অনুমোদিত ছুটি</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{approvedLeaveDays} দিন</p>
                </Card>
                <Card className={`p-4 ${pendingLeaves.length ? 'border-amber-300' : ''}`}>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-brand-orange" />অপেক্ষমাণ আবেদন</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{pendingLeaves.length}টি</p>
                </Card>
                <Card className="p-4">
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-brand-navy" />মোট আবেদন</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{staffLeaves.length}টি</p>
                </Card>
              </div>

              {staffLeaves.length === 0 ? (
                <Card>
                  <EmptyState icon={CalendarDays}>কোনো ছুটির আবেদন নেই</EmptyState>
                </Card>
              ) : (
                <ul className="space-y-3">
                  {pendingFirst(staffLeaves, (l) => l.status === 'PENDING').map((l) => (
                    <li
                      key={l.id}
                      className={`rounded-xl border bg-white p-4 ${
                        l.status === 'PENDING' ? 'border-amber-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{l.leave_type_display || l.leave_type}</p>
                          <p className="mt-0.5 text-sm tabular-nums text-slate-600">
                            {l.start_date} থেকে {l.end_date}
                            <span className="ml-2 text-slate-500">({l.total_days} দিন)</span>
                          </p>
                        </div>
                        <Badge tone={LEAVE_TONE[l.status] || 'neutral'}>{l.status_display || l.status}</Badge>
                      </div>

                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex gap-2">
                          <dt className="w-24 flex-shrink-0 text-slate-500">কারণ</dt>
                          <dd className="text-slate-800">{l.reason || 'উল্লেখ নেই'}</dd>
                        </div>
                        {l.proxy_teacher_name && (
                          <div className="flex gap-2">
                            <dt className="w-24 flex-shrink-0 text-slate-500">প্রক্সি শিক্ষক</dt>
                            <dd className="font-medium text-slate-800">{l.proxy_teacher_name}</dd>
                          </div>
                        )}
                        {l.principal_remarks && (
                          <div className="flex gap-2">
                            <dt className="w-24 flex-shrink-0 text-slate-500">আপনার মন্তব্য</dt>
                            <dd className="text-slate-800">{l.principal_remarks}</dd>
                          </div>
                        )}
                      </dl>

                      {l.status === 'PENDING' && (
                        <ReviewBar
                          approveLabel="অনুমোদন দিন"
                          rejectLabel="প্রত্যাখ্যান"
                          disabled={busy}
                          onApprove={() => reviewLeave(l.id, 'APPROVED')}
                          onReject={(remark) => reviewLeave(l.id, 'REJECTED', remark)}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ---------- Salary ---------- */}
          {currentTab === 'salary' && (
            <div role="tabpanel" id="panel-salary" aria-labelledby="tab-salary" className="space-y-4">
              <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A2147] to-[#143B75] p-5 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
                <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-orange-500/25 blur-3xl" aria-hidden="true" />
                <div className="relative flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-brand-orange ring-1 ring-white/10">
                    <Banknote className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">নির্ধারিত মাসিক মূল বেতন</p>
                    <p className="mt-0.5 text-2xl font-extrabold tabular-nums">{fmtSalary(baseSalary)}</p>
                  </div>
                </div>
                <dl className="relative grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <dt className="text-xs text-slate-300">পদবি</dt>
                    <dd className="mt-0.5 font-semibold">{staff.teacher_profile?.designation || staff.role_display || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-300">বিভাগ</dt>
                    <dd className="mt-0.5 font-semibold">{staff.teacher_profile?.department || '—'}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-brand-navy"><span className="h-4 w-1 rounded-full bg-brand-orange" aria-hidden="true" />বেতন ও সম্মানীর ক্লেইম</h3>
                <span className="text-xs text-slate-500">
                  মোট {staffClaims.length}টি, অপেক্ষমাণ {pendingSalaryClaims.length}টি
                </span>
              </div>

              {staffClaims.length === 0 ? (
                <Card>
                  <EmptyState icon={CreditCard}>কোনো বেতন বা সম্মানীর ক্লেইম নেই</EmptyState>
                </Card>
              ) : (
                <ul className="space-y-3">
                  {pendingFirst(staffClaims, (c) => c.status === 'PENDING').map((c) => (
                    <li
                      key={c.id}
                      className={`rounded-xl border bg-white p-4 ${
                        c.status === 'PENDING' ? 'border-amber-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{c.claim_type_display || c.claim_type}</p>
                          <p className="mt-0.5 text-sm tabular-nums text-slate-500">
                            মাস {c.month}/{c.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold tabular-nums text-slate-900">
                            {fmtTaka(c.requested_amount)}
                          </span>
                          <Badge tone={CLAIM_TONE[c.status] || 'neutral'}>{c.status_display || c.status}</Badge>
                        </div>
                      </div>

                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex gap-2">
                          <dt className="w-24 flex-shrink-0 text-slate-500">বিবরণ</dt>
                          <dd className="text-slate-800">{c.reason || 'মাসিক নিয়মিত বেতন বিল'}</dd>
                        </div>
                        {c.approved_by_name && (
                          <div className="flex gap-2">
                            <dt className="w-24 flex-shrink-0 text-slate-500">অনুমোদনকারী</dt>
                            <dd className="text-slate-800">{c.approved_by_name}</dd>
                          </div>
                        )}
                      </dl>

                      {c.status === 'PENDING' && (
                        <ReviewBar
                          approveLabel="অনুমোদন দিন"
                          rejectLabel="বাতিল করুন"
                          disabled={busy}
                          onApprove={() => reviewClaim(c.id, 'APPROVED')}
                          onReject={(remark) => reviewClaim(c.id, 'REJECTED', remark)}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ===== Footer ===== */}
        <footer className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
          <p className="text-xs text-slate-400">স্টাফ আইডি #{String(staff.id ?? '').slice(0, 8)}</p>
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[40px] rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-brand-navy hover:bg-slate-50 ${FOCUS}`}
          >
            বন্ধ করুন
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default Staff360Modal;