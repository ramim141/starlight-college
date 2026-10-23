import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  DollarSign, 
  CalendarCheck, 
  Award, 
  ShieldAlert, 
  Send 
} from 'lucide-react';

const QUICK_LINKS = [
  {
    to: '/principal/students',
    title: 'শিক্ষার্থী ৩৬০° প্রোফাইল',
    subtitle: 'ভর্তি, তল্লাশি ও আইডি',
    icon: GraduationCap,
    iconColor: 'text-brand-orange',
    bgHover: 'hover:bg-orange-500/10 hover:border-orange-500/30',
  },
  {
    to: '/principal/staff',
    title: 'শিক্ষক ও স্টাফ হাব',
    subtitle: 'রুটিন, হাজিরা ও পে-রোল',
    icon: Users,
    iconColor: 'text-purple-400',
    bgHover: 'hover:bg-purple-500/10 hover:border-purple-500/30',
  },
  {
    to: '/principal/sections',
    title: 'শাখা ও ইনচার্জ শিক্ষক',
    subtitle: 'দায়িত্ব বণ্টন ও তদারকি',
    icon: Building2,
    iconColor: 'text-sky-400',
    bgHover: 'hover:bg-sky-500/10 hover:border-sky-500/30',
  },
  {
    to: '/principal/finance',
    title: 'ক্যাশ ও ব্যালেন্স শিট',
    subtitle: 'ফি আদায় ও দৈনিক ক্লোজিং',
    icon: DollarSign,
    iconColor: 'text-yellow-400',
    bgHover: 'hover:bg-yellow-500/10 hover:border-yellow-500/30',
  },
  {
    to: '/principal/leaves',
    title: 'ছুটি ও চূড়ান্ত অনুমোদন',
    subtitle: 'শিক্ষক ও শিক্ষার্থী ছুটি',
    icon: CalendarCheck,
    iconColor: 'text-emerald-400',
    bgHover: 'hover:bg-emerald-500/10 hover:border-emerald-500/30',
  },
  {
    to: '/principal/exams',
    title: 'পরীক্ষা ও প্রশ্নপত্র হাব',
    subtitle: 'সিটপ্ল্যান ও ফলাফল অনুমোদন',
    icon: Award,
    iconColor: 'text-amber-400',
    bgHover: 'hover:bg-amber-500/10 hover:border-amber-500/30',
  },
  {
    to: '/principal/complaints',
    title: 'গোপন অভিযোগ বক্স',
    subtitle: 'শিক্ষার্থী পরিচয় ও নিষ্পত্তি',
    icon: ShieldAlert,
    iconColor: 'text-rose-400',
    bgHover: 'hover:bg-rose-500/10 hover:border-rose-500/30',
  },
  {
    to: '/principal/broadcast',
    title: 'স্মার্ট নোটিশ ও ব্রডকাস্ট',
    subtitle: 'WhatsApp ও SMS বার্তা',
    icon: Send,
    iconColor: 'text-teal-400',
    bgHover: 'hover:bg-teal-500/10 hover:border-teal-500/30',
  },
];

const DashboardQuickLinks = () => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[linear-gradient(145deg,#111b30_0%,#0b1425_100%)] p-5 text-white shadow-xl shadow-slate-900/10 sm:p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <h4 className="text-xs font-extrabold tracking-widest text-orange-400 uppercase">
          প্রশাসনিক কুইক এক্সেস হাব (8 Core Command Portals)
        </h4>
        <span className="text-[11px] font-mono text-slate-400">সর্বাধিক ব্যবহৃত ৮টি মডিউল</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex min-h-[72px] items-center rounded-2xl border border-white/[0.07] bg-white/[0.045] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none ${link.bgHover}`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="shrink-0 rounded-xl bg-white/10 p-2 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none">
                  <Icon className={`w-4 h-4 ${link.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate text-xs">{link.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{link.subtitle}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardQuickLinks;
