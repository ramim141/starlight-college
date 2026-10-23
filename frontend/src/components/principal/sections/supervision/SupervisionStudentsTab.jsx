import React from 'react';
import { Users, Eye, Phone } from 'lucide-react';

const SupervisionStudentsTab = ({
  sectionStudents,
  loadingStudents,
  onOpenStudent360,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-orange" />
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">
              শাখায় নিবন্ধিত শিক্ষার্থী তালিকা ({sectionStudents.length} জন)
            </h4>
          </div>
        </div>

        {loadingStudents ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-orange border-t-transparent" />
          </div>
        ) : sectionStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            এই শাখায় কোনো শিক্ষার্থী নিবন্ধিত নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">রোল</th>
                  <th className="px-4 py-3">শিক্ষার্থী</th>
                  <th className="px-4 py-3">শিক্ষার্থী আইডি</th>
                  <th className="px-4 py-3">অভিভাবক ও ফোন</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">৩৬০° প্রোফাইল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {sectionStudents.map((stu) => {
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-brand-navy">
                        #{stu.roll_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {stu.student_name?.[0] || stu.user?.full_name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{stu.student_name || stu.user?.full_name}</p>
                            <p className="text-[10px] text-slate-400">{stu.gender === 'F' ? 'ছাত্রী' : 'ছাত্র'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {stu.student_id || stu.unique_id || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800 font-bold">{stu.guardian_name || 'অভিভাবক'}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone className="h-3 w-3 text-brand-orange" />
                          <span>{stu.guardian_phone || stu.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stu.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {stu.is_active !== false ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenStudent360(stu)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-brand-orange text-xs font-bold transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>৩৬০°</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisionStudentsTab;
