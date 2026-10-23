import React from 'react';
import { Edit2, Trash2, UserCheck, AlertCircle } from 'lucide-react';

const SubjectCardGridMobile = ({
  subjects,
  canEdit,
  onEditSubject,
  onDeleteSubject,
}) => {
  return (
    <div className="md:hidden space-y-3">
      {subjects.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-400 border border-slate-200 shadow-soft">
          <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">কোনো পাঠ্য বিষয় খুঁজে পাওয়া যায়নি।</p>
        </div>
      ) : (
        subjects.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl bg-white p-4 border border-slate-200 shadow-soft space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-black text-brand-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  [{sub.code}]
                </span>
                <h4 className="mt-1.5 text-sm font-black text-brand-navy leading-snug">
                  {sub.name}
                </h4>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                  sub.is_active !== false
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {sub.is_active !== false ? 'সচল' : 'নিষ্ক্রিয়'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="bg-slate-100 px-2 py-1 rounded-lg font-bold text-slate-700">
                {sub.class_level_display || (sub.class_level === 'XI' ? 'একাদশ শ্রেণি' : 'দ্বাদশ শ্রেণি')}
              </span>
              <span className="bg-slate-100 px-2 py-1 rounded-lg font-medium text-slate-700">
                {sub.group_display || sub.group}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">শিক্ষক:</span>
                <span className="font-bold text-slate-800">
                  {sub.default_teacher_name || 'মনোনীত শিক্ষক নেই'}
                </span>
              </div>

              {canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditSubject(sub)}
                    className="p-2 rounded-xl text-slate-600 hover:text-brand-navy hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSubject(sub)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubjectCardGridMobile;
