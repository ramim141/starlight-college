import React from 'react';
import { 
  Phone, 
  ChevronRight, 
  KeyRound, 
  Power, 
  Eye, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const StaffCardGridMobile = ({
  staffList = [],
  metricsById = new Map(),
  onSelectStaff360,
  onDeactivateClick,
  onPasswordResetClick,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {staffList.map((staff) => {
        const metrics = metricsById.get(staff.id) || {};
        const todayLog = metrics.todayLog;
        const pendingCount = metrics.pendingCount || 0;
        const isInactive = staff.is_active === false;

        return (
          <div
            key={staff.id}
            className={`relative flex h-full flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft motion-safe:transition motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
              isInactive ? 'opacity-65 bg-slate-50/50' : ''
            }`}
          >
            {/* হেডার: নাম, রোল ও উপস্থিতি */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-[#0F2C59] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {staff.first_name ? staff.first_name[0].toUpperCase() : 'S'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-brand-navy text-sm truncate">
                    {staff.full_name || staff.username}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {staff.teacher_profile?.designation || staff.designation || 'স্টাফ'} · {staff.teacher_profile?.department || staff.department || 'প্রশাসন'}
                  </p>
                </div>
              </div>

              {/* রোল ব্যাজ */}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                  staff.role === 'TEACHER'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {staff.role_display || staff.role}
              </span>
            </div>

            {/* মেটা তথ্য: ফোন, ইনচার্জ ও আজকের স্ট্যাটাস */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">যোগাযোগ</span>
                <a
                  href={`tel:${staff.phone}`}
                  className="font-mono font-bold text-slate-700 flex items-center hover:text-brand-navy min-h-[32px]"
                >
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  {staff.phone || 'নেই'}
                </a>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">আজকের উপস্থিতি</span>
                {todayLog ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold mt-1 ${
                      todayLog.is_late
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {todayLog.is_late ? 'দেরিতে' : 'উপস্থিত'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    লগ নেই
                  </span>
                )}
              </div>
            </div>

            {/* যদি শ্রেণি ইনচার্জ হন বা অপেক্ষমাণ কাজ থাকে */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {staff.is_class_incharge && (
                <span className="px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-brand-orange text-[10px] font-black">
                  শ্রেণি ইনচার্জ
                </span>
              )}
              {staff.is_library_manager && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
                  লাইব্রেরি ম্যানেজার
                </span>
              )}
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black">
                  {pendingCount}টি কাজ অপেক্ষমাণ
                </span>
              )}
            </div>

            {/* মোবাইল অ্যাকশন বার */}
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => onSelectStaff360(staff)}
                className="flex min-h-[44px] items-center gap-1 rounded-lg text-xs font-extrabold text-brand-orange transition hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>৩৬০° প্রোফাইল</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onPasswordResetClick(staff)}
                  className="p-2 text-amber-600 rounded-xl hover:bg-amber-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="পাসওয়ার্ড রিসেট"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeactivateClick(staff)}
                  className={`p-2 rounded-xl cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isInactive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'
                  }`}
                  title={isInactive ? 'সক্রিয় করুন' : 'নিষ্ক্রিয় করুন'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StaffCardGridMobile;
