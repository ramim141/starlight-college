import React, { useState } from 'react';
import { CheckCircle2, XCircle, X, Loader2 } from 'lucide-react';

const TeacherDayAttendanceModal = ({
  isOpen = false,
  onClose,
  attendanceRecord = null,
  onVerify,
  loading = false,
}) => {
  const [status, setStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !attendanceRecord) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await onVerify(attendanceRecord.attendanceId, status, remarks);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 ">
          <div>
            <h3 className="text-base font-bold text-slate-900 ">
              হাজিরা ভেরিফিকেশন ও সংশোধন
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              শিক্ষক: <strong className="text-slate-800 ">{attendanceRecord.teacherName}</strong> ({attendanceRecord.department})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100  min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50  text-xs">
          <div>
            <span className="text-slate-500 block">প্রবেশের সময় (Check-in)</span>
            <span className="font-bold text-slate-900  font-mono text-sm">
              {attendanceRecord.checkInTime ? String(attendanceRecord.checkInTime).slice(0, 5) : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">লেট স্ট্যাটাস</span>
            <span className={`font-bold ${attendanceRecord.isLate ? 'text-amber-600' : 'text-emerald-600'}`}>
              {attendanceRecord.isLate ? 'বিলম্বিত (Late)' : 'যথাযথ সময়ে (On Time)'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700  mb-1.5">
              অনুমোদনের সিদ্ধান্ত
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('APPROVED')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition min-h-[44px] ${
                  status === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700  '
                    : 'border-slate-200  text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>অনুমোদন (Approved)</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('REJECTED')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition min-h-[44px] ${
                  status === 'REJECTED'
                    ? 'border-rose-500 bg-rose-50 text-rose-700  '
                    : 'border-slate-200  text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>বাতিল / সংশোধন</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700  mb-1">
              অধ্যক্ষের মন্তব্য বা সংশোধনের কারণ {status === 'REJECTED' && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={2}
              required={status === 'REJECTED'}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={status === 'REJECTED' ? 'বাতিল বা সংশোধনের সুনির্দিষ্ট কারণ লিখুন...' : 'ঐচ্ছিক মন্তব্য...'}
              className="w-full rounded-xl border border-slate-300  bg-white  p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 ">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              ফিরে যান
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl text-xs font-bold text-white shadow-md transition disabled:opacity-60 ${
                status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{status === 'APPROVED' ? 'অনুমোদন নিশ্চিত করুন' : 'বাতিল নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDayAttendanceModal;
