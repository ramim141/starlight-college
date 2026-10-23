import React, { useState, useEffect } from 'react';
import { X, Clock, RotateCcw, Check } from 'lucide-react';

const RoutinePeriodConfigModal = ({
  isOpen,
  onClose,
  periods,
  routineGender,
  onSave,
  onReset,
}) => {
  const [scheduleList, setScheduleList] = useState([]);

  useEffect(() => {
    if (periods) {
      setScheduleList(JSON.parse(JSON.stringify(periods)));
    }
  }, [periods, isOpen]);

  if (!isOpen) return null;

  const handlePeriodChange = (index, field, value) => {
    const updated = [...scheduleList];
    updated[index][field] = value;
    if (field === 'start' || field === 'end') {
      const s = field === 'start' ? value : updated[index].start;
      const e = field === 'end' ? value : updated[index].end;
      updated[index].timeDisplay = `${s} - ${e}`;
    }
    setScheduleList(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(scheduleList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">
                {routineGender === 'FEMALE' ? 'ছাত্রী শিফট' : 'ছাত্র শিফট'} পিরিয়ড সময়সূচি
              </h3>
              <p className="text-xs text-slate-400 font-medium">প্রতিটি পিরিয়ডের শুরুর ও শেষের সময় নির্ধারণ করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
            {scheduleList.map((p, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border grid grid-cols-12 gap-2 items-center text-xs ${
                  p.isBreak || p.isAssembly ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="col-span-4">
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) => handlePeriodChange(idx, 'label', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-800"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="time"
                    value={p.start}
                    onChange={(e) => handlePeriodChange(idx, 'start', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono font-bold text-slate-800"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="time"
                    value={p.end}
                    onChange={(e) => handlePeriodChange(idx, 'end', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 min-h-[44px] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>ডিফল্ট রিস্টোর</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-orange-hover min-h-[44px] cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoutinePeriodConfigModal;
