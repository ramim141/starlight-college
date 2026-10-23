import React from 'react';
import { 
  Phone, 
  Eye, 
  KeyRound, 
  ArrowRightLeft, 
  Power, 
  Bus, 
  ChevronRight 
} from 'lucide-react';

const StudentCardGridMobile = ({
  students = [],
  onSelectStudent360,
  onPinViewClick,
  onTransferClick,
  onDeactivateClick,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {students.map((student) => {
        const isInactive = student.is_active === false;

        return (
          <div
            key={student.id}
            className={`p-4 bg-white border rounded-2xl border-slate-200/90 shadow-soft transition space-y-3 ${
              isInactive ? 'opacity-65 bg-slate-50/50' : ''
            }`}
          >
            {/* হেডার */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {student.first_name ? student.first_name[0].toUpperCase() : 'S'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-brand-navy text-xs truncate">
                    {student.full_name || student.student_unique_id}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500 font-bold truncate">
                    {student.student_unique_id}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-brand-orange font-black text-xs shrink-0">
                রোল {student.roll_number}
              </span>
            </div>

            {/* শাখা ও যোগাযোগ */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">শাখা ও শ্রেণি:</span>
                <p className="font-bold text-slate-800">
                  {student.class_level_display || student.class_level} ({student.section_name_display || 'A'})
                </p>
                <p className="text-[10px] text-slate-400">{student.group_display || student.group}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">অভিভাবকের ফোন:</span>
                <a
                  href={`tel:${student.guardian_phone}`}
                  className="font-mono font-bold text-slate-700 flex items-center hover:text-brand-navy min-h-[32px]"
                >
                  <Phone className="w-3 h-3 mr-1 text-slate-400" />
                  {student.guardian_phone || 'নেই'}
                </a>
              </div>
            </div>

            {/* ফি ও বাস তথ্য */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="font-bold text-slate-600">
                টিউশন: ৳{Number(student.monthly_tuition_fee || 0).toLocaleString('en-IN')}
              </span>
              {student.uses_transport && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-bold">
                  <Bus className="w-3 h-3" />
                  বাস সেবা
                </span>
              )}
            </div>

            {/* মোবাইল অ্যাকশন বার */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectStudent360(student)}
                className="flex items-center gap-1 text-xs font-extrabold text-brand-orange hover:underline min-h-[44px] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>৩৬০° প্রোফাইল</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onPinViewClick(student)}
                  className="p-2 text-amber-600 rounded-xl hover:bg-amber-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="PIN দেখুন"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onTransferClick(student)}
                  className="p-2 text-indigo-600 rounded-xl hover:bg-indigo-50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="শাখা স্থানান্তর"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeactivateClick(student)}
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

export default StudentCardGridMobile;
