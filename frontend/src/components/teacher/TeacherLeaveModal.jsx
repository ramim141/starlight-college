import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Send, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const TeacherLeaveModal = ({ isOpen, onClose, onSuccess }) => {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: 'CASUAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    proxy_teacher: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('auth/staff/?role=TEACHER')
        .then(res => setTeachers(res.data.results || res.data || []))
        .catch(() => toast.error('শিক্ষকদের তালিকা লোড করা যায়নি'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      toast.error('ছুটির কারণ উল্লেখ করুন');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        proxy_teacher: formData.proxy_teacher || null,
      };
      const res = await api.post('operations/teacher-leaves/', payload);
      if (res.status === 201) {
        toast.success('ছুটির আবেদন সফলভাবে অধ্যক্ষের কাছে পাঠানো হয়েছে');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'ছুটির আবেদন ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-brand-navy">শিক্ষক ছুটির আবেদন ও প্রক্সি ক্লাস</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ছুটির ধরন</label>
            <select
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              <option value="CASUAL">নৈমিত্তিক ছুটি (Casual Leave - CL)</option>
              <option value="MEDICAL">চিকিৎসা ছুটি (Medical Leave - ML)</option>
              <option value="DUTY">দাপ্তরিক / পরীক্ষার দায়িত্ব (Duty Leave)</option>
              <option value="EMERGENCY">জরুরি পারিবারিক ছুটি (Emergency Leave)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শুরুর তারিখ</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শেষের তারিখ</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              প্রক্সি শিক্ষক (ছুটিকালীন সময়ে যিনি ক্লাস নিবেন)
            </label>
            <select
              value={formData.proxy_teacher}
              onChange={(e) => setFormData({ ...formData, proxy_teacher: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            >
              <option value="">-- কোনো প্রক্সি শিক্ষক মনোনীত নয় --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ছুটির কারণ</label>
            <textarea
              rows="3"
              placeholder="ছুটির সুনির্দিষ্ট কারণ লিখুন..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover disabled:opacity-70"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'পাঠানো হচ্ছে...' : 'আবেদন পাঠান'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLeaveModal;