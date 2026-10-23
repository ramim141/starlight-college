import React from 'react';
import { Download, Plus, FileText, Trash2, BookOpen } from 'lucide-react';

const SyllabusSection = ({
  syllabi,
  canEdit,
  onOpenUploadModal,
  onDeleteSyllabus,
}) => {
  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">অনুমোদিত সিলেবাস ফাইল</h3>
              <span className="text-xs text-slate-400 font-medium">মোট ফাইল: {syllabi.length} টি</span>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition min-h-[40px] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>নতুন সিলেবাস</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {syllabi.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center font-medium">
              বর্তমানে কোনো অনুমোদিত সিলেবাস ফাইল আপলোড করা হয়নি।
            </p>
          ) : (
            syllabi.map((syl) => (
              <div
                key={syl.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs text-slate-900">{syl.title}</h4>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-brand-navy">{syl.subject_name || 'বিষয়'}</span>
                    {' '}| সেশন: {syl.session || '২০২৫-২০২৬'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {syl.file && (
                    <a
                      href={syl.file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 rounded-xl bg-[#0F2C59] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 transition min-h-[36px]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>ডাউনলোড</span>
                    </a>
                  )}

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onDeleteSyllabus(syl.id, syl.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusSection;
