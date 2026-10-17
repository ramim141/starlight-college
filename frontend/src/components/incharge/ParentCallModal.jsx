import React, { useState } from 'react';
import api from '../../api/client';
import { PhoneCall, Send, X } from 'lucide-react';
import { toast } from 'sonner';

const ParentCallModal = ({ isOpen, onClose, students = [], onSuccess, initialStudentId = '', initialStudent = null }) => {
  const [formData, setFormData] = useState({
    student: initialStudentId || initialStudent?.id || '',
    category: 'ATTENDANCE',
    guardian_phone_called: initialStudent?.guardian_phone || '',
    discussion_summary: '',
    guardian_response: '',
    follow_up_needed: false,
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const activeStudentId = initialStudentId || initialStudent?.id || '';
      const matched = students.find((item) => item.id === activeStudentId) || initialStudent;
      setFormData((prev) => ({
        ...prev,
        student: activeStudentId,
        guardian_phone_called: matched?.guardian_phone || prev.guardian_phone_called || '',
      }));
    }
  }, [isOpen, initialStudentId, initialStudent, students]);

  if (!isOpen) return null;

  const handleStudentSelect = (studentId) => {
    const s = students.find((item) => item.id === studentId);
    setFormData((prev) => ({
      ...prev,
      student: studentId,
      guardian_phone_called: s?.guardian_phone || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student || !formData.discussion_summary.trim()) {
      toast.error('শিক্ষার্থী নির্বাচন ও আলাপের বিবরণ লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('operations/parent-calls/', formData);
      if (res.status === 201) {
        toast.success('অভিভাবকের সাথে আলাপের নোট ডিজিটাল ডায়েরিতে সংরক্ষিত হয়েছে');
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('কল লগ সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-brand-navy">অভিভাবক কল-ডায়েরি এন্ট্রি</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শিক্ষার্থী নির্বাচন করুন</label>
            <select
              value={formData.student}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
              required
            >
              <option value="">-- শিক্ষার্থী সিলেক্ট করুন --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  রোল: {s.roll_number} - {s.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">আলাপের কারণ</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold"
              >
                <option value="ATTENDANCE">অনুপস্থিতি সংক্রান্ত</option>
                <option value="ACADEMIC">পড়ালেখা ও রেজাল্ট</option>
                <option value="DISCIPLINE">আচরণবিধি / শৃঙ্খলা</option>
                <option value="FEE_DUE">বেতন বকেয়া তাগাদা</option>
                <option value="GENERAL">সাধারণ খোঁজখবর</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">কলকৃত ফোন নম্বর</label>
              <input
                type="text"
                value={formData.guardian_phone_called}
                onChange={(e) => setFormData({ ...formData, guardian_phone_called: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">কী কথা হলো তার সারসংক্ষেপ</label>
            <textarea
              rows="2"
              placeholder="যেমন: ১৫ অক্টোবর বাবার সাথে কথা হয়েছে, অসুস্থতার কারণে আসেনি..."
              value={formData.discussion_summary}
              onChange={(e) => setFormData({ ...formData, discussion_summary: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">অভিভাবকের মন্তব্য / প্রতিশ্রুতি</label>
            <input
              type="text"
              placeholder="যেমন: আগামী রবিবার ক্লাসে পাঠাবেন"
              value={formData.guardian_response}
              onChange={(e) => setFormData({ ...formData, guardian_response: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="followUp"
              checked={formData.follow_up_needed}
              onChange={(e) => setFormData({ ...formData, follow_up_needed: e.target.checked })}
              className="h-4 w-4 text-brand-orange rounded"
            />
            <label htmlFor="followUp" className="text-xs font-bold text-slate-700 cursor-pointer">
              পুনরায় ফলো-আপ নেওয়া প্রয়োজন
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">বাতিল</button>
            <button type="submit" disabled={submitting} className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover">
              <Send className="h-4 w-4" />
              <span>{submitting ? 'সংরক্ষণ হচ্ছে...' : 'ডায়েরিতে সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParentCallModal;