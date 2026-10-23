import React from 'react';
import { X } from 'lucide-react';

const NoticeDetailModal = ({ isMounted, isVisible, notice, onClose }) => {
  if (!isMounted || !notice) return null;

  return (
    <div 
      style={{
        transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isVisible ? 1 : 0,
      }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 select-none sm:items-center bg-slate-900/60 backdrop-blur-xs sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        style={{
          transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
          transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(36px) scale(0.95)',
          opacity: isVisible ? 1 : 0,
        }}
        className="w-full max-w-lg p-6 bg-white border shadow-2xl rounded-t-lg sm:rounded-lg border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="rounded-md bg-orange-50 px-2.5 py-0.5 text-[10px] font-black text-[#EA580C]">
              {notice.category_display || notice.category}
            </span>
            <h3 className="text-base font-black text-[#0F2C59] mt-1.5">{notice.title}</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              প্রকাশের তারিখ: {new Date(notice.created_at).toLocaleDateString('bn-BD')}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-2 text-xs leading-relaxed whitespace-pre-wrap select-text text-slate-700">
          {notice.content}
        </div>

      </div>
    </div>
  );
};

export default NoticeDetailModal;