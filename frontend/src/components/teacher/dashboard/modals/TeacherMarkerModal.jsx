import React from 'react';
import { X } from 'lucide-react';

const TeacherMarkerModal = ({
  isOpen,
  onClose,
  markerForm,
  setMarkerForm,
  onRequestMarker,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-brand-navy">হোয়াইটবোর্ড মার্কার রিকুইজিশন</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onRequestMarker} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">মার্কারের রঙ *</label>
            <select
              value={markerForm.marker_color}
              onChange={(e) => setMarkerForm({ ...markerForm, marker_color: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            >
              <option value="BLACK">কালো মার্কার (Black Marker)</option>
              <option value="BLUE">নীল মার্কার (Blue Marker)</option>
              <option value="RED">লাল মার্কার (Red Marker)</option>
              <option value="GREEN">সবুজ মার্কার (Green Marker)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পরিমাণ (টি) *</label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={markerForm.quantity}
              onChange={(e) => setMarkerForm({ ...markerForm, quantity: parseInt(e.target.value) || 1 })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">প্রয়োজনের কারণ *</label>
            <input
              type="text"
              required
              value={markerForm.reason}
              onChange={(e) => setMarkerForm({ ...markerForm, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-black text-white hover:bg-brand-orange-hover shadow-md cursor-pointer"
            >
              {submitting ? 'পাঠানো হচ্ছে...' : 'রিকুইজিশন পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherMarkerModal;
