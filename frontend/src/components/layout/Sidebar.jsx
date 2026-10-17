import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  ClipboardList,
  UserRound,
  CreditCard,
  Award,
  Bus,
  Library,
  HelpCircle,
  FileText,
  ShieldAlert,
  PhoneCall,
  Clock,
  Sparkles,
  Package,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isPrincipal, isTeacher, isAccountant, isStudent, isClassIncharge } = useAuth();

  // রোল অনুযায়ী ডায়নামিক মেনু আইটেম
  const getNavItems = () => {
    if (isPrincipal) {
      return [
        { label: 'কমান্ড সেন্টার', icon: LayoutDashboard, path: '/principal' },
        { label: 'শিক্ষক ও স্টাফ তালিকা', icon: Users, path: '/principal/staff' },
        { label: 'শিক্ষার্থী ব্যবস্থাপনা (360°)', icon: UserRound, path: '/principal/students' },
        { label: 'একাডেমিক কন্ট্রোল সেন্টার', icon: BookOpen, path: '/principal/academics' },
        { label: 'শাখা ও ইনচার্জ নিয়োগ', icon: Users, path: '/principal/sections' },
        { label: 'পরীক্ষা ও প্রশ্নপত্র হাব', icon: Award, path: '/principal/exams' },
        { label: 'রেজাল্ট ও মেধা তালিকা', icon: GraduationCap, path: '/principal/results' },
        { label: 'সিট প্ল্যান ও গার্ড রোস্টার', icon: ClipboardList, path: '/principal/seat-plan' },
        { label: 'অর্থায়ন ও ক্যাশ কমান্ড', icon: CreditCard, path: '/principal/finance' },
        { label: 'ছুটি ও প্রক্সি ক্লাস অনুমোদন', icon: CalendarCheck, path: '/principal/leaves' },
        { label: 'কলেজ পরিবহন ও ফ্লিট', icon: Bus, path: '/principal/transport' },
        { label: 'সম্পদ ও মার্কার ইনভেন্টরি', icon: Package, path: '/principal/inventory' },
        { label: 'ক্লাব ও অ্যালুমনি হাব', icon: Sparkles, path: '/principal/clubs' },
        { label: 'সেন্ট্রাল লাইব্রেরি', icon: Library, path: '/principal/library' },
        { label: 'প্রশংসাপত্র ও প্রত্যয়নপত্র', icon: FileText, path: '/principal/certificates' },
        { label: 'গোপন অভিযোগ বক্স', icon: ShieldAlert, path: '/principal/complaints' },
        { label: 'বাল্ক মেসেজ ও হোয়াটসঅ্যাপ', icon: PhoneCall, path: '/principal/broadcast' },
        { label: 'সিস্টেম অডিট লগ', icon: Clock, path: '/principal/audit-logs' },
      ];
    }

    if (isTeacher) {
      const teacherItems = [
        { label: 'শিক্ষক ড্যাশবোর্ড', icon: LayoutDashboard, path: '/teacher' },
        { label: 'ক্লাস রুটিন ও ক্যালেন্ডার', icon: Clock, path: '/teacher/schedule' },
        { label: 'ডিজিটাল হাজিরা (Check-in)', icon: CalendarCheck, path: '/teacher/attendance' },
        { label: 'পরীক্ষার মার্কস এন্ট্রি', icon: Award, path: '/teacher/marks' },
        { label: 'প্রশ্নপত্র জমা ও পরীক্ষার ডিউটি', icon: ClipboardList, path: '/teacher/exams' },
        { label: 'রেজাল্ট ও মেধা তালিকা', icon: GraduationCap, path: '/teacher/results' },
        { label: 'হোমওয়ার্ক ও সিলেবাস', icon: FileText, path: '/teacher/materials' },
        { label: 'ছুটির আবেদন ও প্রক্সি ক্লাস', icon: CalendarCheck, path: '/teacher/leaves' },
        { label: 'মার্কার রিকুইজিশন ও সম্পদ', icon: Package, path: '/teacher/inventory' },
        { label: 'ক্লাব ও কো-কারিকুলার', icon: Sparkles, path: '/teacher/clubs' },
        { label: 'সেন্ট্রাল লাইব্রেরি', icon: Library, path: '/teacher/library' },
        { label: 'কলেজ পরিবহন ও অ্যালার্ট', icon: Bus, path: '/teacher/transport' },
        { label: 'আমার বেতন ও ভাতা ক্লেইম', icon: CreditCard, path: '/teacher/finance' },
      ];

      // ইনচার্জ হলে অতিরিক্ত এক্সক্লুসিভ ফিচারসমূহ
      if (isClassIncharge) {
        teacherItems.push(
          { sectionTitle: 'শ্রেণি ইনচার্জ কন্ট্রোল' },
          { label: 'এক ক্লিকে ক্লাসের হাজিরা', icon: CalendarCheck, path: '/teacher/incharge/bulk-attendance' },
          { label: 'শিক্ষার্থী ভর্তি (নতুন আইডি)', icon: Users, path: '/teacher/incharge/enrollment' },
          { label: 'ফি আদায় ও কালেকশন', icon: CreditCard, path: '/teacher/incharge/fees' },
          { label: 'দুর্বল শিক্ষার্থী (At-Risk)', icon: ShieldAlert, path: '/teacher/incharge/at-risk' },
          { label: 'অভিভাবক কল ডায়েরি', icon: PhoneCall, path: '/teacher/incharge/call-log' }
        );
      }
      return teacherItems;
    }

    if (isAccountant) {
      return [
        { label: 'অ্যাকাউন্টস ড্যাশবোর্ড', icon: LayoutDashboard, path: '/accountant' },
        { label: 'অর্থায়ন, ভাউচার ও অডিট', icon: CreditCard, path: '/accountant/finance' },
        { label: 'পরিবহন ফ্লিট ও মাসিক বিল', icon: Bus, path: '/accountant/transport' },
        { label: 'সম্পদ ও মার্কার ইনভেন্টরি', icon: Package, path: '/accountant/inventory' },
        { label: 'ছুটির আবেদন ও রেকর্ড', icon: CalendarCheck, path: '/accountant/leaves' },
      ];
    }

    if (isStudent) {
      return [
        { label: 'আমার ড্যাশবোর্ড', icon: LayoutDashboard, path: '/student' },
        { label: 'ডিজিটাল মার্কশিট ও রেজাল্ট', icon: Award, path: '/student/results' },
        { label: 'স্মার্ট অ্যাডমিট কার্ড', icon: ClipboardList, path: '/student/admit-card' },
        { label: 'বেতন ও ট্রানজেকশন হিস্ট্রি', icon: CreditCard, path: '/student/invoices' },
        { label: 'ডিজিটাল আইডি কার্ড', icon: GraduationCap, path: '/student/id-card' },
        { label: 'আমার পরিবহন ও অ্যালার্ট', icon: Bus, path: '/student/transport' },
        { label: 'লাইব্রেরি বই ক্যাটালগ', icon: Library, path: '/student/library' },
        { label: 'ছুটির আবেদন ফর্ম', icon: FileText, path: '/student/leave-apply' },
        { label: 'গোপন অভিযোগ / পরামর্শ', icon: HelpCircle, path: '/student/complaint' },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* মোবাইল ড্রপডাউন ব্যাকড্রপ */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* সাইডবার কন্টেইনার (Navy Blue Theme) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#0F2C59] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ব্র্যান্ড হেডার */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md shadow-brand-orange/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white leading-none">STARLIGHT</h2>
              <span className="text-[10px] font-bold tracking-widest text-brand-orange">COLLEGE PORTAL</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ইউজার কুইক স্ট্যাটাস ট্যাগ */}
        <div className="mx-4 my-4 rounded-xl bg-white/5 p-3.5 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-brand-orange font-bold text-sm">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold text-white">{user?.full_name || user?.username}</p>
              <div className="mt-0.5 flex items-center space-x-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">{user?.role_display || user?.role}</span>
              </div>
            </div>
          </div>
          {isClassIncharge && (
            <div className="mt-2.5 flex items-center justify-center space-x-1.5 rounded-lg bg-orange-500/20 py-1 text-[10px] font-bold text-orange-300 border border-orange-500/30">
              <Sparkles className="h-3 w-3" />
              <span>শ্রেণি ইনচার্জ এক্সেস সক্রিয়</span>
            </div>
          )}
        </div>

        {/* মেনু নেভিগেশন লিস্ট */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2 scrollbar-none">
          {navItems.map((item, index) => {
            if (item.sectionTitle) {
              return (
                <div key={index} className="pt-4 pb-1 px-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange">
                    {item.sectionTitle}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/principal' || item.path === '/teacher' || item.path === '/accountant' || item.path === '/student'}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/30 font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ফুটার কপিরাইট */}
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-slate-400">
          <span>Starlight College ERP v1.0</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;