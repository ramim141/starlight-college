import React from 'react';
import { Pin, Trash2, Edit3, Clock } from 'lucide-react';

const StickyNoteCard = ({ note, onEdit, onTogglePin, onDelete }) => {
  const formattedDate = note.updated_at
    ? new Date(note.updated_at).toLocaleDateString('bn-BD', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      style={{ backgroundColor: note.color_code || '#FEF3C7' }}
      className={`group relative flex flex-col justify-between rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border ${
        note.is_pinned ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md' : 'border-black/5'
      }`}
    >
      {/* কার্ড হেডার: পিন ও অ্যাকশন */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-2">
          <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2 select-text">
            {note.title || 'শিরোনামহীন নোট'}
          </h3>

          <div className="flex items-center gap-1 shrink-0">
            {/* পিন টগল বাটন */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer ${
                note.is_pinned
                  ? 'bg-amber-500/20 text-amber-800 hover:bg-amber-500/30'
                  : 'text-slate-400 hover:bg-black/5 hover:text-slate-600'
              }`}
              title={note.is_pinned ? 'আনপিন করুন' : 'পিন করে রাখুন'}
              aria-label={note.is_pinned ? 'আনপিন করুন' : 'পিন করে রাখুন'}
            >
              <Pin
                className={`h-4 w-4 ${note.is_pinned ? 'fill-amber-600 text-amber-600 rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* কনটেন্ট বডি */}
        <p
          onClick={() => onEdit(note)}
          className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed line-clamp-6 cursor-pointer select-text mt-1"
        >
          {note.content || 'কোনো বিবরণ নেই...'}
        </p>
      </div>

      {/* কার্ড ফুটার: তারিখ ও কন্ট্রোলস */}
      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3 opacity-60" />
          {formattedDate}
        </span>

        <div className="flex items-center gap-1">
          {/* এডিট বাটন */}
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-black/5 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            title="এডিট করুন"
            aria-label="এডিট করুন"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>

          {/* ডিলিট বাটন */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="মুছে ফেলুন"
            aria-label="মুছে ফেলুন"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyNoteCard;
