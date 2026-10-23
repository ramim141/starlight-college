import React, { useState, useEffect } from 'react';
import { Building2, X, Grid, Users } from 'lucide-react';

const ExamRoomModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    room_number: '',
    building: 'Main Building',
    rows: 5,
    columns: 4,
    students_per_bench: 2,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      const benches = initialData.benches_count || Math.floor((initialData.capacity || 40) / 2) || 20;
      // আনুমানিক সারি ও কলাম অনুপাত বের করা
      const estimatedCols = 4;
      const estimatedRows = Math.ceil(benches / estimatedCols) || 5;
      const perBench = initialData.capacity && benches ? Math.round(initialData.capacity / benches) : 2;

      setFormData({
        room_number: initialData.room_number || '',
        building: initialData.building || 'Main Building',
        rows: estimatedRows,
        columns: estimatedCols,
        students_per_bench: perBench || 2,
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        room_number: '',
        building: 'Main Building',
        rows: 5,
        columns: 4,
        students_per_bench: 2,
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const totalBenches = (Number(formData.rows) || 1) * (Number(formData.columns) || 1);
  const totalCapacity = totalBenches * (Number(formData.students_per_bench) || 2);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      room_number: formData.room_number,
      building: formData.building,
      capacity: totalCapacity,
      benches_count: totalBenches,
      is_active: formData.is_active,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg p-6 space-y-4 bg-white border shadow-2xl dark:bg-slate-900 rounded-3xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-brand-orange">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'পরীক্ষা কক্ষ ও সিট গ্রিড সম্পাদনা' : 'নতুন পরীক্ষা কক্ষ ও সিট গ্রিড সংযোজন'}
              </h3>
              <p className="text-xs text-slate-500">
                রুম নম্বর, ধারণক্ষমতা এবং বেঞ্চ বিন্যাস গ্রিড (Rows × Cols)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                কক্ষ নম্বর / কোড *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Room-201, Lab-1"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                ভবন / ব্লক
              </label>
              <input
                type="text"
                placeholder="Main Building, Science Building"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
          </div>

          {/* গ্রিড ডাইমেনশন কনফিগ */}
          <div className="p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Grid className="w-4 h-4 text-brand-orange" />
                আসন বিন্যাস গ্রিড মাত্রা (Seating Dimensions)
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-brand-orange border border-amber-500/20">
                মোট বেঞ্চ: {totalBenches} টি
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  সারি (Rows)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.rows}
                  onChange={(e) => setFormData({ ...formData, rows: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  কলাম (Columns)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.columns}
                  onChange={(e) => setFormData({ ...formData, columns: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  প্রতি বেঞ্চে আসন
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.students_per_bench}
                  onChange={(e) => setFormData({ ...formData, students_per_bench: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold font-mono"
                />
              </div>
            </div>

            {/* লাইভ গ্রিড প্রিভিউ */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">গ্রিড লেআউট প্রিভিউ ({formData.rows} × {formData.columns}):</span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Users className="w-3.5 h-3.5" /> মোট ধারণক্ষমতা: {totalCapacity} জন
                </span>
              </div>

              <div className="max-h-36 overflow-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div
                  className="grid gap-1.5 justify-center"
                  style={{ gridTemplateColumns: `repeat(${Math.min(formData.columns, 10)}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: Math.min(totalBenches, 40) }).map((_, idx) => {
                    const row = Math.floor(idx / formData.columns) + 1;
                    const col = (idx % formData.columns) + 1;
                    return (
                      <div
                        key={idx}
                        className="py-1 px-1.5 text-center text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        title={`সারি ${row}, কলাম ${col} (${formData.students_per_bench} জন)`}
                      >
                        R{row}C{col}
                      </div>
                    );
                  })}
                </div>
                {totalBenches > 40 && (
                  <p className="text-[10px] text-center text-slate-400 mt-1">
                    (+ আরও {totalBenches - 40} টি বেঞ্চ)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.room_number.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialData ? 'রুম আপডেট করুন' : 'রুম সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamRoomModal;
