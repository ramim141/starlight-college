import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import ReorderButtons from '../../common/ReorderButtons';

const AdmissionStepsSubTab = ({
  steps = [],
  onSaveStep,
  onDeleteStep,
  onReorderSteps,
  saving = false,
}) => {
  const [editingStep, setEditingStep] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-600 ">ধাপের ক্রম ও নির্দেশনা</span>
        <button
          type="button"
          onClick={() =>
            setEditingStep({
              id: 'new',
              step: `০${steps.length + 1}`,
              title: '',
              description: '',
              color: 'bg-[#EA580C]',
              display_order: steps.length,
            })
          }
          className="inline-flex min-h-[44px] items-center gap-1.5 px-3.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
        >
          <Plus className="w-4 h-4" /> নতুন ধাপ যোগ
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {steps.map((st, idx) => (
          <div
            key={st.id || idx}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200  bg-white "
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F2C59] text-xs font-bold text-brand-orange shrink-0">
                {st.step || idx + 1}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 ">{st.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{st.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ReorderButtons
                index={idx}
                total={steps.length}
                disabled={saving}
                onMoveUp={() => {
                  if (idx === 0) return;
                  const next = [...steps];
                  const t = next[idx];
                  next[idx] = next[idx - 1];
                  next[idx - 1] = t;
                  onReorderSteps(next);
                }}
                onMoveDown={() => {
                  if (idx === steps.length - 1) return;
                  const next = [...steps];
                  const t = next[idx];
                  next[idx] = next[idx + 1];
                  next[idx + 1] = t;
                  onReorderSteps(next);
                }}
              />
              <button
                type="button"
                onClick={() => setEditingStep(st)}
                aria-label={`সম্পাদনা: ${st.title}`}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200  bg-slate-50  text-slate-700  hover:text-brand-orange"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`"${st.title}" ধাপটি মুছে ফেলতে চান?`)) {
                    onDeleteStep(st.id);
                  }
                }}
                aria-label={`মুছুন: ${st.title}`}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-rose-200  bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white  rounded-3xl border border-slate-200  w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 ">
              {editingStep.id === 'new' ? 'নতুন ভর্তি ধাপ যোগ' : `সম্পাদনা: ${editingStep.title}`}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await onSaveStep(editingStep, editingStep.id === 'new' ? null : editingStep.id);
                if (ok) setEditingStep(null);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600  mb-1">ধাপ নং</label>
                  <input
                    type="text"
                    value={editingStep.step || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, step: e.target.value })}
                    placeholder="যেমন: ০১"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600  mb-1">ধাপের শিরোনাম</label>
                  <input
                    type="text"
                    required
                    value={editingStep.title || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                    placeholder="যেমন: অনলাইন আবেদন"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  required
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 ">
                <button
                  type="button"
                  onClick={() => setEditingStep(null)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionStepsSubTab;
