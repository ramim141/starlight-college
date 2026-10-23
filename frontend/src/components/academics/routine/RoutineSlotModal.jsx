import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 0, name: 'শনিবার' },
  { id: 1, name: 'রবিবার' },
  { id: 2, name: 'সোমবার' },
  { id: 3, name: 'মঙ্গলবার' },
  { id: 4, name: 'বুধবার' },
  { id: 5, name: 'বৃহস্পতিবার' },
];

const RoutineSlotModal = ({
  isOpen,
  onClose,
  onSave,
  slot,
  initialDay,
  initialPeriod,
  teachers,
  subjects,
  sectionName,
  submitting,
  backendConflictError,
  setBackendConflictError,
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    teacher: '',
    day_of_week: 1,
    start_time: '09:10',
    end_time: '10:05',
    room_number: 'Room-201',
  });

  useEffect(() => {
    if (backendConflictError) {
      setBackendConflictError?.(null);
    }

    if (slot) {
      setFormData({
        subject: typeof slot.subject === 'object' ? slot.subject?.id : slot.subject || '',
        teacher: typeof slot.teacher === 'object' ? slot.teacher?.id : slot.teacher || '',
        day_of_week: Number(slot.day_of_week),
        start_time: (slot.start_time || '09:10').slice(0, 5),
        end_time: (slot.end_time || '10:05').slice(0, 5),
        room_number: slot.room_number || '',
      });
    } else {
      setFormData({
        subject: subjects[0]?.id ? String(subjects[0].id) : '',
        teacher: subjects[0]?.default_teacher ? String(subjects[0].default_teacher) : (teachers[0]?.id ? String(teachers[0].id) : ''),
        day_of_week: initialDay !== undefined ? initialDay : 1,
        start_time: initialPeriod?.start || '09:10',
        end_time: initialPeriod?.end || '10:05',
        room_number: 'Room-201',
      });
    }
  }, [slot, initialDay, initialPeriod, isOpen]);

  if (!isOpen) return null;

  const handleSubjectChange = (subjectId) => {
    const selectedSub = subjects.find((s) => String(s.id) === String(subjectId));
    setFormData((prev) => ({
      ...prev,
      subject: subjectId,
      teacher: selectedSub?.default_teacher ? String(selectedSub.default_teacher) : prev.teacher,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* হেডার */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange border border-orange-200">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">
                {slot ? 'ক্লাস রুটিন স্লট সম্পাদন' : 'নতুন ক্লাস স্লট নির্ধারণ'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {sectionName ? `শাখা: ${sectionName}` : 'শাখা রুটিন কনফিগারেশন'}
              </p>
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

        {/* ফর্ম */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                বার / দিন <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                রুম নম্বর / ল্যাব
              </label>
              <input
                type="text"
                placeholder="যেমন: Room-201 / রসায়ন ল্যাব"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              পাঠ্য বিষয় <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
            >
              <option value="">-- বিষয় নির্বাচন করুন --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} [{s.code}] ({s.class_level_display || s.class_level})
                </option>
              ))}
            </select>
          </div>

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
                  {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শুরুর সময় <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                শেষের সময় <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 focus:border-brand-orange focus:outline-none min-h-[42px]"
              />
            </div>
          </div>

          {/* ইনলাইন ব্যাকএন্ড কনফ্লিক্ট সতর্কবার্তা */}
          {backendConflictError && (
            <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-900 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-amber-950">রুটিন সংঘাত ধরা পড়েছে!</h4>
                  <p className="font-semibold text-amber-900 leading-relaxed">{backendConflictError}</p>
                </div>
              </div>
            </div>
          )}

          {/* অ্যাকশন বাটন */}
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
              <span>{slot ? 'হালনাগাদ করুন' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoutineSlotModal;
