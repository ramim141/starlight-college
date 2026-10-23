import React, { useState } from 'react';
import { X, Upload, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const UploadSyllabusModal = ({
  isOpen,
  onClose,
  onUpload,
  subjects,
  submitting,
}) => {
  const [formData, setFormData] = useState({
    subject: subjects[0]?.id ? String(subjects[0].id) : '',
    session: '2025-2026',
    title: '',
    file: null,
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('ফাইলের সাইজ সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারে');
      e.target.value = '';
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('শুধুমাত্র PDF, DOC বা DOCX ফরম্যাটের ফাইল আপলোড করা যাবে');
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('সিলেবাসের ফাইল নির্বাচন করুন');
      return;
    }

    const data = new FormData();
    data.append('subject', formData.subject || subjects[0]?.id || '');
    data.append('session', formData.session);
    data.append('title', formData.title);
    data.append('file', formData.file);

    onUpload(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">নতুন সিলেবাস আপলোড</h3>
              <p className="text-xs text-slate-400 font-medium">পিডিএফ বা ডক ফাইল সংযুক্ত করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              পাঠ্য বিষয় <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
            >
              <option value="">-- বিষয় নির্বাচন করুন --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} [{sub.code}] ({sub.class_level_display || sub.class_level})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শিক্ষাবর্ষ / সেশন <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: 2025-2026"
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                সিলেবাস শিরোনাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: রসায়ন বার্ষিক সিলেবাস"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              সিলেবাস ফাইল (.pdf, .doc, .docx - max 10MB) <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-dashed border-slate-300 p-2 text-xs font-bold file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0F2C59] file:text-white hover:file:bg-slate-800 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-orange-hover min-h-[44px] disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>আপলোড করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSyllabusModal;
