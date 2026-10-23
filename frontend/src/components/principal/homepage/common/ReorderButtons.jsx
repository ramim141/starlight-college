import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ReorderButtons = ({
  index,
  total,
  onMoveUp,
  onMoveDown,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="ক্রম পরিবর্তন করুন">
      <button
        type="button"
        disabled={disabled || index === 0}
        onClick={() => onMoveUp(index)}
        aria-label="উপরে নিন"
        title="উপরে নিন"
        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200  bg-white  text-slate-700  hover:border-brand-orange hover:text-brand-orange disabled:opacity-30 disabled:pointer-events-none transition shadow-sm"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      <button
        type="button"
        disabled={disabled || index === total - 1}
        onClick={() => onMoveDown(index)}
        aria-label="নিচে নিন"
        title="নিচে নিন"
        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-slate-200  bg-white  text-slate-700  hover:border-brand-orange hover:text-brand-orange disabled:opacity-30 disabled:pointer-events-none transition shadow-sm"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ReorderButtons;
