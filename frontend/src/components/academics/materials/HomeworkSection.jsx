import React from 'react';
import { Plus, Download, Trash2, Calendar, FileText } from 'lucide-react';

const HomeworkSection = ({
  homeworks,
  canEdit,
  onOpenPostModal,
  onDeleteHomework,
}) => {
  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-navy border border-blue-200">
              <FileText className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">শিক্ষকদের দেওয়া হোমওয়ার্ক</h3>
              <span className="text-xs text-slate-400 font-medium">মোট অ্যাসাইনমেন্ট: {homeworks.length} টি</span>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={onOpenPostModal}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition min-h-[40px] cursor-pointer"
            >
              <Plus className="h-4 w-4 text-brand-orange" />
              <span>নতুন হোমওয়ার্ক</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {homeworks.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center font-medium">
              বর্তমানে কোনো হোমওয়ার্ক পোস্ট করা হয়নি।
            </p>
          ) : (
            homeworks.map((hw) => (
              <div
                key={hw.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-xs text-brand-navy">{hw.title}</h4>
                  <span className="text-[10px] font-extrabold text-brand-orange bg-orange-50 border border-orange-200 px-2 py-0.5 rounded shrink-0">
                    জমার তারিখ: {hw.due_date}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {hw.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex flex-wrap gap-2">
                    <span className="font-semibold text-slate-700">
                      বিষয়: {hw.subject_name} ({hw.section_display || 'সেকশন'})
                    </span>
                    <span>· শিক্ষক: {hw.teacher_name || 'মনোনীত নেই'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hw.attachment && (
                      <a
                        href={hw.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-orange hover:underline"
                      >
                        <Download className="h-3 w-3" />
                        <span>ফাইল</span>
                      </a>
                    )}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onDeleteHomework(hw.id, hw.title)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkSection;
