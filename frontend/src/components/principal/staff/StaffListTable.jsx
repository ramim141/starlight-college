import React from 'react';
import { 
  Phone, 
  Mail, 
  ChevronRight, 
  ShieldAlert, 
  KeyRound, 
  Power, 
  CreditCard, 
  Eye, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const StaffListTable = ({
  staffList = [],
  metricsById = new Map(),
  onSelectStaff360,
  onDeactivateClick,
  onPasswordResetClick,
  onPrintIdClick,
}) => {
  return (
    <div className="overflow-hidden bg-white border rounded-3xl border-slate-200/90 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <th className="py-3.5 pl-6 pr-4">স্টাফ / শিক্ষক</th>
              <th className="px-4 py-3.5">পদবি ও বিভাগ</th>
              <th className="px-4 py-3.5">যোগাযোগ</th>
              <th className="px-4 py-3.5">আজকের উপস্থিতি</th>
              <th className="px-4 py-3.5">ইনচার্জ শাখা</th>
              <th className="px-4 py-3.5">অপেক্ষমাণ কাজ</th>
              <th className="py-3.5 pl-4 pr-6 text-right">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((staff) => {
              const metrics = metricsById.get(staff.id) || {};
              const todayLog = metrics.todayLog;
              const pendingCount = metrics.pendingCount || 0;
              const isInactive = staff.is_active === false;

              return (
                <tr
                  key={staff.id}
                  className={`transition hover:bg-slate-50/70 ${isInactive ? 'opacity-60 bg-slate-50/40' : ''}`}
                >
                  {/* নাম ও রোল */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#0F2C59] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {staff.first_name ? staff.first_name[0].toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectStaff360(staff)}
                          className="font-extrabold text-brand-navy hover:text-brand-orange hover:underline text-xs text-left truncate block cursor-pointer"
                        >
                          {staff.full_name || staff.username}
                        </button>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              staff.role === 'TEACHER'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {staff.role_display || staff.role}
                          </span>
                          {staff.is_library_manager && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                              লাইব্রেরি
                            </span>
                          )}
                          {isInactive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">
                              নিষ্ক্রিয়
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* পদবি ও বিভাগ */}
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-800">
                      {staff.teacher_profile?.designation || staff.designation || 'স্টাফ'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {staff.teacher_profile?.department || staff.department || 'প্রশাসন'}
                      {staff.employee_id || staff.teacher_profile?.employee_id ? (
                        <span className="ml-1 font-mono text-slate-500 font-bold">
                          [{staff.employee_id || staff.teacher_profile?.employee_id}]
                        </span>
                      ) : null}
                    </p>
                  </td>

                  {/* যোগাযোগ */}
                  <td className="px-4 py-4 space-y-0.5 font-mono">
                    <a
                      href={`tel:${staff.phone}`}
                      className="flex items-center text-xs font-bold text-slate-700 hover:text-brand-navy hover:underline"
                    >
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {staff.phone || 'নেই'}
                    </a>
                    {staff.email && (
                      <span className="flex items-center text-[11px] text-slate-400">
                        <Mail className="w-3 h-3 mr-1" />
                        {staff.email}
                      </span>
                    )}
                  </td>

                  {/* আজকের উপস্থিতি */}
                  <td className="px-4 py-4">
                    {todayLog ? (
                      <div className="space-y-0.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            todayLog.is_late
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {todayLog.is_late ? 'লেট চেক-ইন' : 'উপস্থিত'}
                        </span>
                        {todayLog.check_in_time && (
                          <p className="text-[10px] font-mono text-slate-400">
                            {String(todayLog.check_in_time).slice(0, 5)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        লগ নেই
                      </span>
                    )}
                  </td>

                  {/* ইনচার্জ শাখা */}
                  <td className="px-4 py-4">
                    {staff.is_class_incharge && staff.incharge_sections?.length > 0 ? (
                      <div className="space-y-1">
                        {staff.incharge_sections.map((sec) => (
                          <span
                            key={sec.id}
                            className="inline-block px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-brand-orange text-[10px] font-bold"
                          >
                            {sec.class_level_display || sec.class_level} ({sec.section_name})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* অপেক্ষমাণ কাজ */}
                  <td className="px-4 py-4">
                    {pendingCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                        {pendingCount} টি অপেক্ষমাণ
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">কোনো কাজ নেই</span>
                    )}
                  </td>

                  {/* অ্যাকশনস */}
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* ৩৬০ প্রোফাইল বাটন */}
                      <button
                        type="button"
                        onClick={() => onSelectStaff360(staff)}
                        title="স্টাফ ৩৬০° প্রোফাইল"
                        className="p-2 transition rounded-xl text-brand-navy hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* পাসওয়ার্ড রিসেট বাটন */}
                      <button
                        type="button"
                        onClick={() => onPasswordResetClick(staff)}
                        title="পাসওয়ার্ড রিসেট"
                        className="p-2 transition rounded-xl text-amber-600 hover:bg-amber-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {/* সক্রিয় / নিষ্ক্রিয় বাটন */}
                      <button
                        type="button"
                        onClick={() => onDeactivateClick(staff)}
                        title={isInactive ? 'সক্রিয় করুন' : 'নিষ্ক্রিয় করুন'}
                        className={`p-2 transition rounded-xl cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                          isInactive
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffListTable;
