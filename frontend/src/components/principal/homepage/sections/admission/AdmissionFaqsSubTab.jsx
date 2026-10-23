import React, { useState } from 'react';
import { Plus, Trash2, Edit2, HelpCircle } from 'lucide-react';
import ReorderButtons from '../../common/ReorderButtons';

const AdmissionFaqsSubTab = ({
  faqs = [],
  onSaveFaq,
  onDeleteFaq,
  onReorderFaqs,
  saving = false,
}) => {
  const [editingFaq, setEditingFaq] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-600 ">প্রশ্নোত্তর ও সমাধান তালিকা</span>
        <button
          type="button"
          onClick={() =>
            setEditingFaq({
              id: 'new',
              question: '',
              answer: '',
              display_order: faqs.length,
            })
          }
          className="inline-flex min-h-[44px] items-center gap-1.5 px-3.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
        >
          <Plus className="w-4 h-4" /> নতুন প্রশ্ন যোগ
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {faqs.map((f, idx) => (
          <div
            key={f.id || idx}
            className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200  bg-white "
          >
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900  flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-orange shrink-0" />
                {f.question}
              </h4>
              <p className="text-xs text-slate-500 pl-6">{f.answer}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ReorderButtons
                index={idx}
                total={faqs.length}
                disabled={saving}
                onMoveUp={() => {
                  if (idx === 0) return;
                  const next = [...faqs];
                  const t = next[idx];
                  next[idx] = next[idx - 1];
                  next[idx - 1] = t;
                  onReorderFaqs(next);
                }}
                onMoveDown={() => {
                  if (idx === faqs.length - 1) return;
                  const next = [...faqs];
                  const t = next[idx];
                  next[idx] = next[idx + 1];
                  next[idx + 1] = t;
                  onReorderFaqs(next);
                }}
              />
              <button
                type="button"
                onClick={() => setEditingFaq(f)}
                aria-label={`সম্পাদনা: ${f.question}`}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200  bg-slate-50  text-slate-700  hover:text-brand-orange"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`"${f.question}" প্রশ্নটি মুছে ফেলতে চান?`)) {
                    onDeleteFaq(f.id);
                  }
                }}
                aria-label={`মুছুন: ${f.question}`}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-rose-200  bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white  rounded-3xl border border-slate-200  w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 ">
              {editingFaq.id === 'new' ? 'নতুন FAQ যোগ করুন' : 'FAQ সম্পাদনা'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await onSaveFaq(editingFaq, editingFaq.id === 'new' ? null : editingFaq.id);
                if (ok) setEditingFaq(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">প্রশ্ন</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="যেমন: ন্যূনতম কত জিপিএ প্রয়োজন?"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">উত্তর</label>
                <textarea
                  rows={3}
                  required
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 ">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
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

export default AdmissionFaqsSubTab;
