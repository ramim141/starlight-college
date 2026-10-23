import React from 'react';
import { Edit2, Trash2, UserCheck, AlertCircle } from 'lucide-react';

const SubjectTableDesktop = ({
  subjects,
  canEdit,
  onEditSubject,
  onDeleteSubject,
}) => {
  return (
    <div className="hidden md:block rounded-3xl bg-white p-6 border border-slate-200 shadow-soft overflow-x-auto">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
          <tr>
            <th className="p-3.5 w-16 text-center">কোড</th>
            <th className="p-3.5">বিষয়ের নাম</th>
            <th className="p-3.5">শ্রেণি</th>
            <th className="p-3.5">বিভাগ / গ্রুপ</th>
            <th className="p-3.5">বিষয় শিক্ষক / প্রভাষক</th>
            <th className="p-3.5 text-center">স্ট্যাটাস</th>
            {canEdit && <th className="p-3.5 text-right">অ্যাকশন</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
          {subjects.length === 0 ? (
            <tr>
              <td colSpan={canEdit ? 7 : 6} className="py-12 text-center text-slate-400">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">কোনো পাঠ্য বিষয় খুঁজে পাওয়া যায়নি।</p>
              </td>
            </tr>
          ) : (
            subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 text-center font-mono text-brand-orange font-bold text-xs">
                  {sub.code}
                </td>
                <td className="p-3.5 font-bold text-brand-navy text-sm">
                  {sub.name}
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold text-[11px]">
                    {sub.class_level_display || (sub.class_level === 'XI' ? 'একাদশ শ্রেণি' : 'দ্বাদশ শ্রেণি')}
                  </span>
                </td>
                <td className="p-3.5 text-slate-600 font-medium">
                  {sub.group_display || sub.group}
                </td>
                <td className="p-3.5">
                  {sub.default_teacher_name ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      <UserCheck className="h-3 w-3" />
                      {sub.default_teacher_name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">মনোনীত শিক্ষক নেই</span>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      sub.is_active !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sub.is_active !== false ? 'সচল' : 'নিষ্ক্রিয়'}
                  </span>
                </td>
                {canEdit && (
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditSubject(sub)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSubject(sub)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectTableDesktop;
