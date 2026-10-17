import React, { useState } from 'react';
import api from '../../api/client';
import { UserPlus, X, Bus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const EnrollmentModal = ({ isOpen, onClose, section, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'MALE',
    roll_number: '',
    password: 'Student@1234',
    father_name: '',
    mother_name: '',
    guardian_phone: '',
    present_address: '',
    monthly_tuition_fee: '1500.00',
    uses_transport: false,
    monthly_transport_fee: '0.00',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !section) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        section: section.id,
        roll_number: parseInt(formData.roll_number),
        monthly_tuition_fee: formData.monthly_tuition_fee || '0.00',
        monthly_transport_fee: formData.uses_transport ? formData.monthly_transport_fee : '0.00',
      };

      const res = await api.post('academics/students/', payload);
      if (res.status === 201) {
        toast.success(`শিক্ষার্থী '${res.data.data?.student_unique_id}' সফলভাবে ভর্তি হয়েছে!`);
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.roll_number?.[0] || err.response?.data?.message || 'ভর্তি প্রক্রিয়া ব্যর্থ হয়েছে';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-premium border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-brand-navy">নতুন শিক্ষার্থী ভর্তি (Student Enrollment)</h3>
            <p className="text-xs text-slate-400">
              শাখা: <strong className="text-brand-orange">{section.class_level} - {section.group} ({section.section_name}) [{section.session}]</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* নাম ও লিঙ্গ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">নামের প্রথম অংশ</label>
              <input
                type="text"
                placeholder="যেমন: Arifur"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">নামের শেষ অংশ</label>
              <input
                type="text"
                placeholder="যেমন: Rahman"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">লিঙ্গ (Gender)</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
              >
                <option value="MALE">ছাত্র (Male)</option>
                <option value="FEMALE">ছাত্রী (Female)</option>
              </select>
            </div>
          </div>

          {/* রোল ও পাসওয়ার্ড */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ক্লাস রোল নম্বর</label>
              <input
                type="number"
                min="1"
                placeholder="যেমন: 101"
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">ডিফল্ট পাসওয়ার্ড</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-slate-800 bg-slate-50"
                required
              />
            </div>
          </div>

          {/* পিতা-মাতার নাম ও অভিভাবকের ফোন */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">পিতার নাম</label>
              <input
                type="text"
                placeholder="পিতার নাম লিখুন"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">মাতার নাম</label>
              <input
                type="text"
                placeholder="মাতার নাম লিখুন"
                value={formData.mother_name}
                onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">অভিভাবকের মোবাইল (SMS এর জন্য)</label>
              <input
                type="text"
                placeholder="01811223344"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-brand-navy"
                required
              />
            </div>
          </div>

          {/* ফি ও পরিবহন সেটিংস */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-brand-navy">ফি কনফিগারেশন</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">মাসিক টিউশন ফি (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_tuition_fee}
                  onChange={(e) => setFormData({ ...formData, monthly_tuition_fee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="usesTrans"
                  checked={formData.uses_transport}
                  onChange={(e) => setFormData({ ...formData, uses_transport: e.target.checked })}
                  className="h-4 w-4 text-brand-orange rounded"
                />
                <label htmlFor="usesTrans" className="text-xs font-bold text-slate-700 cursor-pointer">
                  কলেজের বাস সুবিধা নিবে
                </label>
              </div>

              {formData.uses_transport && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">মাসিক পরিবহন ফি (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_transport_fee}
                    onChange={(e) => setFormData({ ...formData, monthly_transport_fee: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-bold"
                    placeholder="যেমন: 600.00"
                  />
                </div>
              )}
            </div>
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
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover disabled:opacity-70"
            >
              <UserPlus className="h-4 w-4" />
              <span>{submitting ? 'ভর্তি সম্পন্ন হচ্ছে...' : 'শিক্ষার্থী ভর্তি নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentModal;