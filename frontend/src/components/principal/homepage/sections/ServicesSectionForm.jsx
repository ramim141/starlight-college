import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Layers } from 'lucide-react';
import ReorderButtons from '../common/ReorderButtons';

const ServicesSectionForm = ({ items = [], onSaveItem, onDeleteItem, onReorderItems, saving = false }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [itemForm, setItemForm] = useState({
    key: '',
    title: '',
    description: '',
    badge: '',
    action_label: '',
    modal_description: '',
    display_order: 0,
  });

  const handleStartEdit = (item) => {
    setIsNew(false);
    setEditingItem(item);
    setItemForm({
      key: item.key || '',
      title: item.title || '',
      description: item.description || '',
      badge: item.badge || '',
      action_label: item.action_label || '',
      modal_description: item.modal_description || '',
      display_order: item.display_order ?? 0,
    });
  };

  const handleStartNew = () => {
    setIsNew(true);
    setEditingItem({ id: 'new' });
    setItemForm({
      key: `service-${Date.now().toString(36)}`,
      title: '',
      description: '',
      badge: '',
      action_label: 'বিস্তারিত দেখুন',
      modal_description: '',
      display_order: items.length,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await onSaveItem('services', itemForm, editingItem?.id === 'new' ? null : editingItem?.id);
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
    onReorderItems('services', newItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    onReorderItems('services', newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 ">
        <div>
          <h2 className="text-base font-bold text-brand-navy  flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-orange" />
            সার্ভিস ও সেবা কার্ডসমূহ ({items.length}টি)
          </h2>
          <p className="text-xs text-slate-500">
            ওয়েবসাইটের 'ডিজিটাল ক্যাম্পাস সেবাসমূহ' সেকশনে প্রদর্শিত কার্ডসমূহ
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 px-4 text-xs font-bold text-white shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সার্ভিস কার্ড যোগ করুন</span>
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
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 ">{item.title}</h3>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-brand-orange ">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                <span className="text-[10px] font-mono text-slate-400">কী: {item.key}</span>
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
                  if (window.confirm(`আপনি কি "${item.title}" কার্ডটি মুছে ফেলতে চান?`)) {
                    onDeleteItem('services', item.id);
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
              {isNew ? 'নতুন সার্ভিস কার্ড যোগ করুন' : `সম্পাদনা: ${editingItem.title}`}
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
                <label className="block text-xs font-bold text-slate-600  mb-1">শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  required
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600  mb-1">ব্যাজ</label>
                  <input
                    type="text"
                    value={itemForm.badge}
                    onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600  mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={itemForm.action_label}
                    onChange={(e) => setItemForm({ ...itemForm, action_label: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300  bg-white  px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600  mb-1">
                  বিস্তারিত বিবরণ (পপআপ মোডাল)
                </label>
                <textarea
                  rows={3}
                  value={itemForm.modal_description}
                  onChange={(e) => setItemForm({ ...itemForm, modal_description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300  bg-white  p-2.5 text-xs"
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

export default ServicesSectionForm;
