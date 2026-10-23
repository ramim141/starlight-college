import React, { useState } from 'react';
import { Plus, Trash2, Edit2, GraduationCap } from 'lucide-react';
import ReorderButtons from '../common/ReorderButtons';

const DepartmentsSectionForm = ({ items = [], onSaveItem, onDeleteItem, onReorderItems, saving = false }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [itemForm, setItemForm] = useState({
    key: '',
    title: '',
    description: '',
    mandatory_subjects: '',
    optional_subjects: '',
    display_order: 0,
  });

  const handleStartEdit = (item) => {
    setIsNew(false);
    setEditingItem(item);
    setItemForm({
      key: item.key || '',
      title: item.title || '',
      description: item.description || '',
      mandatory_subjects: item.mandatory_subjects || '',
      optional_subjects: item.optional_subjects || '',
      display_order: item.display_order ?? 0,
    });
  };

  const handleStartNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setItemForm({
      key: `dept-${Date.now().toString(36)}`,
      title: '',
      description: '',
      mandatory_subjects: '',
      optional_subjects: '',
      display_order: items.length,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await onSaveItem('departments', itemForm, editingItem?.id === 'new' ? null : editingItem?.id);
    if (success) {
      setEditingItem(null);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    onReorderItems('departments', newItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    onReorderItems('departments', newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 ">
        <div>
          <h2 className="text-base font-bold text-brand-navy  flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-orange" />
            একাডেমিক বিভাগসমূহ ({items.length}টি)
          </h2>
          <p className="text-xs text-slate-500">
            বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখার পাঠ্যক্রম ও বিষয়তালিকা
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 px-4 text-xs font-bold text-white shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বিভাগ যোগ করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((item, idx) => (
          <div
            key={item.id || item.key || idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200  bg-white  shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F2C59] text-xs font-black text-brand-orange shrink-0">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 ">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                {item.mandatory_subjects && (
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-600 ">আবশ্যিক:</strong> {item.mandatory_subjects}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <ReorderButtons
                index={idx}
                total={items.length}
                disabled={saving}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />

              <button
                type="button"
                onClick={() => handleStartEdit(item)}
                title="সম্পাদনা"
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200  bg-slate-50  text-slate-700  hover:text-brand-orange transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`আপনি কি "${item.title}" বিভাগটি মুছে ফেলতে চান?`)) {
                    onDeleteItem('departments', item.id);
                  }
                }}
                title="মুছুন"
                className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-rose-200  bg-rose-50  text-rose-600 hover:bg-rose-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white  rounded-3xl border border-slate-200  w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 ">
              {isNew ? 'নতুন একাডেমিক বিভাগ যোগ করুন' : `সম্পাদনা: ${editingItem.title}`}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">
                  ইউনিক কী (Slug Key)
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.key}
                  onChange={(e) => setItemForm({ ...itemForm, key: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-slate-50  px-3 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">বিভাগের নাম</label>
                <input
                  type="text"
                  required
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  placeholder="যেমন: বিজ্ঞান বিভাগ (Science)"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  required
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">
                  আবশ্যিক বিষয়সমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={itemForm.mandatory_subjects}
                  onChange={(e) => setItemForm({ ...itemForm, mandatory_subjects: e.target.value })}
                  placeholder="যেমন: বাংলা, ইংরেজি, আইসিটি, পদার্থবিজ্ঞান..."
                  className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">
                  ঐচ্ছিক বিষয়সমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={itemForm.optional_subjects}
                  onChange={(e) => setItemForm({ ...itemForm, optional_subjects: e.target.value })}
                  placeholder="যেমন: উচ্চতর গণিত, জীববিজ্ঞান, পরিসংখ্যান..."
                  className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 ">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-300  text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsSectionForm;
