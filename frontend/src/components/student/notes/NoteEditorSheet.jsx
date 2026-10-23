import React, { useState, useEffect, useRef } from 'react';
import { X, Pin, CheckCircle2, Loader2, Save } from 'lucide-react';

const COLOR_PALETTE = [
  { name: 'হলুদ', hex: '#FEF3C7', border: '#FDE68A' },
  { name: 'নীল', hex: '#E0F2FE', border: '#BAE6FD' },
  { name: 'সবুজ', hex: '#DCFCE7', border: '#BBF7D0' },
  { name: 'গোলাপি', hex: '#FCE7F3', border: '#FBCFE8' },
  { name: 'বেগুনি', hex: '#F3E8FF', border: '#E9D5FF' },
  { name: 'কমলা', hex: '#FFEDD5', border: '#FED7AA' },
];

const NoteEditorSheet = ({ isOpen, note, onClose, onSave, onAutosave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [colorCode, setColorCode] = useState('#FEF3C7');
  const [isPinned, setIsPinned] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('idle'); // 'idle' | 'dirty' | 'saving' | 'saved'
  const isInitialMount = useRef(true);
  const autosaveTimerRef = useRef(null);

  // নোট লোড হলে ফর্ম স্টেট সেট করা
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColorCode(note.color_code || '#FEF3C7');
      setIsPinned(Boolean(note.is_pinned));
      setAutosaveStatus('idle');
    } else {
      setTitle('');
      setContent('');
      setColorCode('#FEF3C7');
      setIsPinned(false);
      setAutosaveStatus('idle');
    }
    isInitialMount.current = true;
  }, [note, isOpen]);

  // এডিটের ক্ষেত্রে ৮০০ms ডিব্বাঊন্সড অটোসেভ
  useEffect(() => {
    if (!isOpen || !note?.id) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setAutosaveStatus('dirty');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      try {
        if (onAutosave) {
          await onAutosave(note.id, {
            title: title.trim() || 'শিরোনামহীন নোট',
            content: content.trim(),
            color_code: colorCode,
            is_pinned: isPinned,
          });
        }
        setAutosaveStatus('saved');
        setTimeout(() => setAutosaveStatus('idle'), 2500);
      } catch {
        setAutosaveStatus('idle');
      }
    }, 800);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, content, colorCode, isPinned, isOpen, note?.id, onAutosave]);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    onSave({
      id: note?.id,
      title: title.trim() || 'শিরোনামহীন নোট',
      content: content.trim(),
      color_code: colorCode,
      is_pinned: isPinned,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{ backgroundColor: colorCode }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-black/10 transition-colors duration-300 max-h-[90vh] flex flex-col"
      >
        {/* ড্রয়ার হ্যান্ডেল (মোবাইলের জন্য) */}
        <div className="sm:hidden w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-3" />

        {/* হেডার */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              {note?.id ? 'নোট সম্পাদনা' : 'নতুন নোট'}
            </span>

            {/* অটোসেভ ইন্ডিকেটর */}
            {note?.id && (
              <span className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                {autosaveStatus === 'dirty' && (
                  <span className="text-amber-700">টাইপ হচ্ছে...</span>
                )}
                {autosaveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-sky-700">
                    <Loader2 className="h-3 w-3 animate-spin" /> সংরক্ষণ হচ্ছে...
                  </span>
                )}
                {autosaveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> সংরক্ষিত ✅
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* পিন টগল */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex h-9 px-3 items-center gap-1 rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px] ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-900 border border-amber-400'
                  : 'bg-black/5 text-slate-600 hover:bg-black/10'
              }`}
              title="পিন করুন"
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-amber-600 rotate-45' : ''}`} />
              <span>{isPinned ? 'পিন্ড' : 'পিন'}</span>
            </button>

            {/* ক্লোজ বাটন */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 text-slate-500 hover:bg-black/10 transition cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label="বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ফর্ম বডি */}
        <form onSubmit={handleManualSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="নোটের শিরোনাম (যেমন: পদার্থবিজ্ঞান অধ্যায় ৩ সূত্র)..."
              maxLength={200}
              className="w-full rounded-xl bg-black/5 px-4 py-2.5 text-base font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[44px]"
            />
          </div>

          <div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="আপনার দরকারি নোট, পড়াশোনার পয়েন্ট বা রিমাইন্ডার লিখুন..."
              className="w-full rounded-xl bg-black/5 p-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none leading-relaxed"
            />
          </div>

          {/* কালার প্যালেট সোয়াচ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              নোটের রঙ নির্বাচন করুন:
            </label>
            <div className="flex items-center gap-3">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColorCode(c.hex)}
                  style={{ backgroundColor: c.hex, borderColor: c.border }}
                  className={`h-8 w-8 rounded-full border-2 transition-transform cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    colorCode === c.hex ? 'scale-110 ring-2 ring-slate-800 shadow-sm' : 'hover:scale-105'
                  }`}
                  title={c.name}
                  aria-label={c.name}
                >
                  {colorCode === c.hex && (
                    <div className="h-2 w-2 rounded-full bg-slate-800" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ফুটার বাটন */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-black/5 transition cursor-pointer min-h-[44px]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm cursor-pointer min-h-[44px]"
            >
              <Save className="h-4 w-4" />
              <span>{note?.id ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditorSheet;
