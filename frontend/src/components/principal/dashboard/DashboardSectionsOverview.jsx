import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const DashboardSectionsOverview = ({ sections = [], loading = false }) => {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm animate-pulse sm:p-6">
        <div className="w-48 h-5 mb-4 rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-brand-navy">একাডেমিক শাখা ও ইনচার্জ শিক্ষক বণ্টন</h3>
          <p className="text-xs text-slate-400">প্রতিটি শাখার মোট শিক্ষার্থী, দায়িত্বপ্রাপ্ত ইনচার্জ ও বর্তমান পরিসংখ্যান</p>
        </div>
        <Link
          to="/principal/sections"
          className="flex items-center space-x-1 text-xs font-bold text-brand-orange hover:underline min-h-[44px] min-w-[44px]"
        >
          <span>শাখা পরিচালনা করুন</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec) => {
          const studentCount = sec.total_students || sec.student_count || 0;
          const capacity = sec.capacity || 60;
          const occupancyRate = Math.min(100, Math.round((studentCount / capacity) * 100));

          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-xs font-extrabold text-brand-navy">
                  {sec.class_level_display || sec.class_level} ({sec.group_display || sec.group})
                </span>
                <span className="rounded-lg bg-orange-100 text-brand-orange px-2 py-0.5 text-[10px] font-black">
                  শাখা {sec.section_name}
                </span>
              </div>
              
              <div className="mt-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ভর্তি শিক্ষার্থী:</span>
                  <strong className="text-slate-800">
                    {studentCount} / {capacity} জন
                    <span className="text-[10px] text-slate-400 ml-1 font-normal">({occupancyRate}%)</span>
                  </strong>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">সেশন:</span>
                  <span className="font-mono text-slate-700">{sec.session}</span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-[11px]">ইনচার্জ:</span>
                  <span
                    className={`text-[11px] font-bold ${
                      sec.in_charge_teacher_name ? 'text-emerald-700' : 'text-rose-500'
                    }`}
                  >
                    {sec.in_charge_teacher_name || 'নিযুক্ত হয়নি'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSectionsOverview;
