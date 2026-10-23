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
  Globe2,
  FileEdit,
  FileCheck,
  Bell,
  BellRing,
  UserCheck,
  DollarSign,
  KeyRound,
} from 'lucide-react';

/**
 * স্টুডেন্ট পোর্টালের একক ক্যাটাগরাইজড মেনু কনফিগ (Single Source of Truth)
 */
export const STUDENT_SECTIONS = [
  {
    group: 'পড়াশোনা',
    items: [
      { label: 'আমার উপস্থিতি', icon: CalendarCheck, path: '/student/attendance' },
      { label: 'ক্লাস রুটিন', icon: Clock, path: '/student/routine' },
      { label: 'হোমওয়ার্ক ও সিলেবাস', icon: BookOpen, path: '/student/homework' },
      { label: 'ডিজিটাল মার্কশিট ও রেজাল্ট', icon: Award, path: '/student/results' },
      { label: 'স্মার্ট অ্যাডমিট কার্ড', icon: ClipboardList, path: '/student/admit-card' },
      { label: 'ব্যক্তিগত নোটস', icon: FileEdit, path: '/student/notes' },
    ],
  },
  {
    group: 'আর্থিক',
    items: [
      { label: 'বেতন ও ট্রানজেকশন হিস্ট্রি', icon: CreditCard, path: '/student/invoices' },
      { label: 'ফি মওকুফ আবেদন', icon: DollarSign, path: '/student/waiver' },
    ],
  },
  {
    group: 'সেবা',
    items: [
      { label: 'ডিজিটাল আইডি কার্ড', icon: GraduationCap, path: '/student/id-card' },
      { label: 'আমার পরিবহন ও অ্যালার্ট', icon: Bus, path: '/student/transport' },
      { label: 'লাইব্রেরি বই ক্যাটালগ', icon: Library, path: '/student/library' },
      { label: 'ছুটির আবেদন ফর্ম', icon: FileText, path: '/student/leave-apply' },
      { label: 'প্রশংসাপত্র ও প্রত্যয়নপত্র', icon: FileCheck, path: '/student/certificates' },
      { label: 'ক্লাব ও কো-কারিকুলার', icon: Sparkles, path: '/student/clubs' },
      { label: 'গোপন অভিযোগ / পরামর্শ', icon: HelpCircle, path: '/student/complaint' },
    ],
  },
  {
    group: 'আমার তথ্য',
    items: [
      { label: 'কলেজ নোটিশ বোর্ড', icon: Bell, path: '/student/notices' },
      { label: 'নোটিফিকেশন সেন্টার', icon: BellRing, path: '/student/notifications' },
      { label: 'আমার প্রোফাইল', icon: UserCheck, path: '/student/profile' },
      { label: 'পাসওয়ার্ড পরিবর্তন', icon: KeyRound, path: '/change-password' },
    ],
  },
];

/**
 * Returns the full navigation items array for the desktop Sidebar.
 */
export const getSidebarNavItems = ({
  isPrincipal,
  isTeacher,
  isAccountant,
  isStudent,
  isClassIncharge,
}) => {
  if (isPrincipal) {
    return [
      { label: 'কমান্ড সেন্টার', icon: LayoutDashboard, path: '/principal', end: true },
      { label: 'হোমপেজ কনটেন্ট ম্যানেজমেন্ট', icon: Globe2, path: '/principal/homepage-content' },
      { label: 'শিক্ষক ও স্টাফ তালিকা', icon: Users, path: '/principal/staff' },
      { label: 'শিক্ষক হাজিরা ও অনুমোদন', icon: CalendarCheck, path: '/principal/teacher-attendance' },
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
      { label: 'শিক্ষক ড্যাশবোর্ড', icon: LayoutDashboard, path: '/teacher', end: true },
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
      { label: 'অ্যাকাউন্টস ড্যাশবোর্ড', icon: LayoutDashboard, path: '/accountant', end: true },
      { label: 'অর্থায়ন, ভাউচার ও অডিট', icon: CreditCard, path: '/accountant/finance' },
      { label: 'পরিবহন ফ্লিট ও মাসিক বিল', icon: Bus, path: '/accountant/transport' },
      { label: 'সম্পদ ও মার্কার ইনভেন্টরি', icon: Package, path: '/accountant/inventory' },
      { label: 'ছুটির আবেদন ও রেকর্ড', icon: CalendarCheck, path: '/accountant/leaves' },
    ];
  }

  if (isStudent) {
    const list = [
      { label: 'আমার ড্যাশবোর্ড', icon: LayoutDashboard, path: '/student', end: true },
    ];
    STUDENT_SECTIONS.forEach((sec) => {
      list.push({ sectionTitle: sec.group });
      list.push(...sec.items);
    });
    return list;
  }

  return [];
};

/**
 * Returns primary items and secondary sheet items for DashboardBottomNav.
 */
export const getBottomNavConfig = (authContext) => {
  const { isPrincipal, isTeacher, isAccountant, isStudent, isClassIncharge } = authContext;
  const allItems = getSidebarNavItems(authContext);

  let primaryItems = [];
  let groupedSecondaryItems = null;

  if (isStudent) {
    primaryItems = [
      { label: 'হোম', icon: LayoutDashboard, path: '/student', end: true },
      {
        label: 'উপস্থিতি/রুটিন',
        icon: CalendarCheck,
        path: '/student/attendance',
        matchPaths: ['/student/attendance', '/student/routine'],
      },
      { label: 'ফি', icon: CreditCard, path: '/student/invoices' },
      { label: 'রেজাল্ট', icon: Award, path: '/student/results' },
    ];

    groupedSecondaryItems = STUDENT_SECTIONS.map((sec) => ({
      group: sec.group,
      items: sec.items,
    }));
  } else if (isTeacher) {
    primaryItems = [
      { label: 'হোম', icon: LayoutDashboard, path: '/teacher', end: true },
      { label: 'রুটিন', icon: Clock, path: '/teacher/schedule' },
      isClassIncharge
        ? { label: 'বাল্ক হাজিরা', icon: CalendarCheck, path: '/teacher/incharge/bulk-attendance' }
        : { label: 'হাজিরা', icon: CalendarCheck, path: '/teacher/attendance' },
      { label: 'ছুটি', icon: CalendarCheck, path: '/teacher/leaves' },
    ];
  } else if (isAccountant) {
    primaryItems = [
      { label: 'হোম', icon: LayoutDashboard, path: '/accountant', end: true },
      { label: 'ফিন্যান্স', icon: CreditCard, path: '/accountant/finance' },
      { label: 'ট্রান্সপোর্ট', icon: Bus, path: '/accountant/transport' },
    ];
  } else if (isPrincipal) {
    primaryItems = [
      { label: 'হোম', icon: LayoutDashboard, path: '/principal', end: true },
      { label: 'অনুমোদন', icon: CalendarCheck, path: '/principal/leaves' },
      { label: 'ফিন্যান্স', icon: CreditCard, path: '/principal/finance' },
    ];
  }

  const primaryPaths = new Set(primaryItems.map((item) => item.path));

  // বাকি আইটেমগুলো "আরও" বটম শীটে প্রদর্শিত হবে (নন-গ্রুপড ফলব্যাক)
  const secondaryItems = allItems.filter(
    (item) => item.sectionTitle || !primaryPaths.has(item.path)
  );

  return {
    primaryItems,
    secondaryItems,
    groupedSecondaryItems,
  };
};

export default {
  STUDENT_SECTIONS,
  getSidebarNavItems,
  getBottomNavConfig,
};
