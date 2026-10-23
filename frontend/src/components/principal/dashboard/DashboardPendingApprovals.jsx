import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Users, 
  FileText, 
  CreditCard, 
  Banknote, 
  Award, 
  GraduationCap, 
  ShieldAlert, 
  FileQuestion, 
  CalendarCheck 
} from 'lucide-react';

const ICON_MAP = {
  student_leaves: GraduationCap,
  teacher_leaves: Users,
  proxy_duties: CalendarCheck,
  fine_waivers: CreditCard,
  expenses: Banknote,
  payrolls: Banknote,
  salary_claims: FileText,
  certificates: Award,
  alumni: Users,
  question_papers: FileQuestion,
  complaints: ShieldAlert,
};

const COLOR_MAP = {
  student_leaves: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-500',
  teacher_leaves: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-500',
  proxy_duties: 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-500',
  fine_waivers: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-500',
  expenses: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-500',
  payrolls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-500',
  salary_claims: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-500',
  certificates: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:border-yellow-500',
  alumni: 'bg-sky-50 text-sky-700 border-sky-200 hover:border-sky-500',
  question_papers: 'bg-orange-50 text-brand-orange border-orange-200 hover:border-brand-orange',
  complaints: 'bg-red-50 text-red-700 border-red-200 hover:border-red-500',
};

const DashboardPendingApprovals = ({ 
  pendingApprovalsList = [], 
  loading = false 
}) => {
  // ০ সংখ্যা থাকা ক্যাটাগরিগুলো ফিল্টার করে বাদ দেওয়া
  const activeApprovals = pendingApprovalsList.filter((item) => (item.count || 0) > 0);

  if (loading) {
    return (
      <div id="approvals-strip" className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="w-48 h-5 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="approvals-strip" className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 pb-4 mb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 font-bold rounded-2xl bg-orange-50 text-brand-orange shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-brand-navy">
                অনুমোদনের অপেক্ষায় (Action Required Hub)
              </h3>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-black text-brand-orange">
                {activeApprovals.length} টি সক্রিয় ক্যাটাগরি
              </span>
            </div>
            <p className="text-xs text-slate-400">
              কলেজের ১১টি প্রশাসনিক বিভাগের অপেক্ষমাণ আবেদনসমূহ — সরাসরি অনুমোদন পৃষ্ঠায় যেতে ট্যাপ করুন।
            </p>
          </div>
        </div>
      </div>

      {activeApprovals.length === 0 ? (
        <div className="py-8 text-center bg-slate-50/60 rounded-2xl border border-slate-100">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
          <h4 className="text-sm font-bold text-slate-700">কোনো অপেক্ষমাণ সিদ্ধান্ত নেই!</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            সকল ছুটি, বিল, ভাউচার ও প্রশাসনিক আবেদন হালনাগাদ রয়েছে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {activeApprovals.map((item) => {
            const Icon = ICON_MAP[item.key] || FileText;
            const colorClass = COLOR_MAP[item.key] || 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <Link
                key={item.key}
                to={item.path}
                className={`group relative flex min-h-[118px] flex-col justify-between rounded-2xl border p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none ${colorClass}`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-white/70 backdrop-blur-xs shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black">{item.count}</span>
                  <p className="text-[11px] font-bold mt-0.5 line-clamp-1">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPendingApprovals;
