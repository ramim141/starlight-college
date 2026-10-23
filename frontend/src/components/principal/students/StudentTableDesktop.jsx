import React from 'react';
import { 
  Phone, 
  Eye, 
  KeyRound, 
  ArrowRightLeft, 
  Power, 
  Bus, 
  GraduationCap 
} from 'lucide-react';

const StudentTableDesktop = ({
  students = [],
  onSelectStudent360,
  onPinViewClick,
  onTransferClick,
  onDeactivateClick,
}) => {
  return (
    <div className="overflow-hidden bg-white border rounded-3xl border-slate-200/90 shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <th className="py-3.5 pl-6 pr-4">শিক্ষার্থী</th>
              <th className="px-4 py-3.5">রোল ও আইডি</th>
              <th className="px-4 py-3.5">শ্রেণি, বিভাগ ও শাখা</th>
              <th className="px-4 py-3.5">অভিভাবক ও যোগাযোগ</th>
              <th className="px-4 py-3.5">মাসিক ফি ও পরিবহন</th>
              <th className="px-4 py-3.5">স্ট্যাটাস</th>
              <th className="py-3.5 pl-4 pr-6 text-right">পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const isInactive = student.is_active === false;

              return (
                <tr
                  key={student.id}
                  className={`transition hover:bg-slate-50/70 ${isInactive ? 'opacity-60 bg-slate-50/40' : ''}`}
                >
                  {/* নাম ও অবতার */}
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {student.first_name ? student.first_name[0].toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectStudent360(student)}
                          className="font-extrabold text-brand-navy hover:text-brand-orange hover:underline text-xs text-left truncate block cursor-pointer"
                        >
                          {student.full_name || student.student_unique_id}
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">
                          SSC: {student.ssc_roll || '—'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* রোল ও ইউনিক আইডি */}
                  <td className="px-4 py-4">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-orange-100 text-brand-orange font-black text-xs">
                      রোল {student.roll_number}
                    </span>
                    <p className="font-mono text-[11px] text-slate-600 font-bold mt-1">
                      {student.student_unique_id}
                    </p>
                  </td>

                  {/* শ্রেণি, বিভাগ ও শাখা */}
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-800">
                      {student.class_level_display || student.class_level || 'একাদশ'} ({student.group_display || student.group})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      শাখা {student.section_name_display || 'A'} · সেশন: {student.session}
                    </p>
                  </td>

                  {/* অভিভাবক ও ফোন */}
                  <td className="px-4 py-4 font-mono space-y-0.5">
                    <a
                      href={`tel:${student.guardian_phone}`}
                      className="flex items-center text-xs font-bold text-slate-700 hover:text-brand-navy hover:underline"
                    >
                      <Phone className="w-3 h-3 mr-1 text-slate-400" />
                      {student.guardian_phone}
                    </a>
                    {student.father_name && (
                      <p className="text-[10px] font-sans text-slate-400 truncate">
                        পিতা: {student.father_name}
                      </p>
                    )}
                  </td>

                  {/* ফি ও পরিবহন */}
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-800">
                      টিউশন: ৳{Number(student.monthly_tuition_fee || 0).toLocaleString('en-IN')}
                    </p>
                    {student.uses_transport ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold mt-0.5">
                        <Bus className="w-3 h-3" />
                        বাস: ৳{Number(student.monthly_transport_fee || 0).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">বাস নেই</span>
                    )}
                  </td>

                  {/* স্ট্যাটাস */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${
                        isInactive
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isInactive ? 'নিষ্ক্রিয়' : 'নিয়মিত'}
                    </span>
                  </td>

                  {/* অ্যাকশনস */}
                  <td className="py-4 pl-4 pr-6 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {/* ৩৬০ ভিউ বাটন */}
                      <button
                        type="button"
                        onClick={() => onSelectStudent360(student)}
                        title="শিক্ষার্থী ৩৬০° প্রোফাইল"
                        className="p-2 transition rounded-xl text-brand-navy hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* পিন দেখুন বাটন */}
                      <button
                        type="button"
                        onClick={() => onPinViewClick(student)}
                        title="PIN ও পাসওয়ার্ড দেখুন"
                        className="p-2 transition rounded-xl text-amber-600 hover:bg-amber-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {/* শাখা স্থানান্তর বাটন */}
                      <button
                        type="button"
                        onClick={() => onTransferClick(student)}
                        title="শাখা পরিবর্তন (Transfer)"
                        className="p-2 transition rounded-xl text-indigo-600 hover:bg-indigo-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>

                      {/* নিষ্ক্রিয় / সক্রিয় বাটন */}
                      <button
                        type="button"
                        onClick={() => onDeactivateClick(student)}
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

export default StudentTableDesktop;
