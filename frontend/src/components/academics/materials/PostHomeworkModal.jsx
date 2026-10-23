import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PostHomeworkModal = ({
  isOpen,
  onClose,
  onPost,
  sections,
  subjects,
  teachers,
  submitting,
}) => {
  const [formData, setFormData] = useState({
    section: sections[0]?.id ? String(sections[0].id) : '',
    subject: subjects[0]?.id ? String(subjects[0].id) : '',
    teacher: teachers[0]?.id ? String(teachers[0].id) : '',
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    attachment: null,
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
    setFormData((prev) => ({ ...prev, attachment: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('section', formData.section || sections[0]?.id || '');
    data.append('subject', formData.subject || subjects[0]?.id || '');
    data.append('teacher', formData.teacher || teachers[0]?.id || '');
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('due_date', formData.due_date);
    if (formData.attachment) {
      data.append('attachment', formData.attachment);
    }

    onPost(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">নতুন হোমওয়ার্ক প্রদান</h3>
              <p className="text-xs text-slate-400 font-medium">শিক্ষার্থীদের জন্য অ্যাসাইনমেন্ট বা বাড়ির কাজ তৈরি করুন</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শ্রেণি ও শাখা <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              >
                <option value="">-- শাখা নির্বাচন করুন --</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.section_name} ({sec.class_level_display || sec.class_level})
                  </option>
                ))}
              </select>
            </div>

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
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} [{s.code}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                প্রভাষক / শিক্ষক <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              >
                <option value="">-- শিক্ষক নির্বাচন করুন --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                জমার শেষ তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              হোমওয়ার্কের শিরোনাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: ৩য় অধ্যায়ের অনুশীলনী ৫-১০ সমাধান"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              বিস্তারিত নির্দেশনা
            </label>
            <textarea
              rows={3}
              placeholder="শিক্ষার্থীদের জন্য বিস্তারিত নির্দেশনা লিখুন..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              সংযুক্ত ফাইল (ঐচ্ছিক, সর্বোচ্চ 10MB)
            </label>
            <input
              type="file"
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
              <span>পোস্ট করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostHomeworkModal;
