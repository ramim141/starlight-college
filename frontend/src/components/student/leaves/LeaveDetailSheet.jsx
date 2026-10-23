import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Paperclip, 
  ExternalLink, 
  Trash2,
  UserCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { getMediaUrl } from '../../../api/homepage';
import { toBanglaNumber } from './LeaveApplicationForm';

const parseLeaveReason = (rawReason = '') => {
  const match = rawReason.match(/^\[ধরণ:\s*([^\]]+)\]\s*([\s\S]*)$/);
  if (match) {
    return {
      type: match[1].trim(),
      reason: match[2].trim(),
    };
  }
  return {
    type: 'ছুটির আবেদন',
    reason: rawReason,
  };
};

const formatDateBn = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatTimeBn = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('bn-BD', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const LeaveDetailSheet = ({ leave, onClose, onCancel, isCancelling }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!leave) return null;

  const { type, reason } = parseLeaveReason(leave.reason);

  const start = new Date(leave.start_date);
  const end = new Date(leave.end_date);
  const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // ক্যানসেল করার যোগ্য কিনা (ইনচার্জ ও প্রিন্সিপাল উভয়েই পেন্ডিং)
  const isCancellable = leave.incharge_status === 'PENDING' && leave.principal_status === 'PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div 
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* শিট হেডার */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <span className="rounded-xl bg-brand-orange/10 px-2.5 py-1 text-xs font-black text-brand-orange">
              আবেদন #{leave.id}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {formatDateBn(leave.created_at)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* স্ক্রলেবল কন্টেন্ট */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ছুটির ধরন ও তারিখ কার্ড */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-block rounded-xl bg-brand-navy px-3 py-1 text-xs font-extrabold text-white">
                {type}
              </span>
              <span className="text-xs font-black text-brand-navy">
                মোট {toBanglaNumber(totalDays)} দিন
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
              <Calendar className="h-4 w-4 text-brand-orange shrink-0" />
              <span>
                {formatDateBn(leave.start_date)} — {formatDateBn(leave.end_date)}
              </span>
            </div>
          </div>

          {/* ২-ধাপের অনুমোদন অগ্রগতি টাইমলাইন */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              অনুমোদনের বর্তমান পর্যায় (Approval Journey)
            </h4>

            <div className="space-y-3">
              {/* ধাপ ১: শ্রেণি ইনচার্জ পর্যালোচনা */}
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-brand-navy">১. শ্রেণি ইনচার্জ</span>
                  </div>
                  {leave.incharge_status === 'RECOMMENDED' ? (
                    <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>সুপারিশকৃত</span>
                    </span>
                  ) : leave.incharge_status === 'REJECTED' ? (
                    <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="h-3 w-3" />
                      <span>বাতিল</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="h-3 w-3" />
                      <span>পর্যালোচনায় অপেক্ষমাণ</span>
                    </span>
                  )}
                </div>

                {leave.reviewed_by_incharge_name && (
                  <p className="text-[11px] text-slate-500">
                    শিক্ষক: <strong>{leave.reviewed_by_incharge_name}</strong>
                    {leave.incharge_reviewed_at && ` (${formatDateBn(leave.incharge_reviewed_at)}, ${formatTimeBn(leave.incharge_reviewed_at)})`}
                  </p>
                )}

                {leave.incharge_remarks && (
                  <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-700 border border-slate-100">
                    <span className="font-bold text-slate-900">ইনচার্জের মন্তব্য: </span>
                    {leave.incharge_remarks}
                  </div>
                )}
              </div>

              {/* ধাপ ২: অধ্যক্ষের চূড়ান্ত সিদ্ধান্ত */}
              <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-brand-navy">২. অধ্যক্ষ মহোদয় (Final Decision)</span>
                  </div>
                  {leave.principal_status === 'APPROVED' ? (
                    <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>চূড়ান্ত অনুমোদিত</span>
                    </span>
                  ) : leave.principal_status === 'REJECTED' ? (
                    <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="h-3 w-3" />
                      <span>বাতিল</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="h-3 w-3" />
                      <span>সিদ্ধান্ত অপেক্ষমাণ</span>
                    </span>
                  )}
                </div>

                {leave.approved_by_principal_name && (
                  <p className="text-[11px] text-slate-500">
                    অনুমোদনকারী: <strong>{leave.approved_by_principal_name}</strong>
                    {leave.principal_reviewed_at && ` (${formatDateBn(leave.principal_reviewed_at)}, ${formatTimeBn(leave.principal_reviewed_at)})`}
                  </p>
                )}

                {leave.principal_remarks && (
                  <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-700 border border-slate-100">
                    <span className="font-bold text-slate-900">অধ্যক্ষের মন্তব্য: </span>
                    {leave.principal_remarks}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ছুটির কারণ ও পূর্ণ বিবরণ */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              ছুটির কারণ ও বিবরণ
            </h4>
            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {reason}
            </div>
          </div>

          {/* অ্যাটাচমেন্ট থাকলে */}
          {leave.attachment && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                সংযুক্ত প্রমাণক
              </h4>
              <a
                href={getMediaUrl(leave.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-slate-200 hover:border-brand-orange hover:bg-brand-orange/5 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-brand-navy group-hover:text-brand-orange transition">
                    সংযুক্ত ফাইল ডাউনলোড বা প্রিভিউ করুন
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-brand-orange transition" />
              </a>
            </div>
          )}

          {/* ক্যানসেল কনফার্মেশন প্রম্পট */}
          {showCancelConfirm && (
            <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 space-y-3 animate-in fade-in">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-900 space-y-1">
                  <p className="font-black">আপনি কি নিশ্চিতভাবে এই আবেদনটি বাতিল করতে চান?</p>
                  <p className="text-[11px] text-rose-700">
                    বাতিল করার পর এই আবেদনটি পুনরায় সক্রিয় করা যাবে না।
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => onCancel(leave.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 transition flex items-center space-x-1.5"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>বাতিল হচ্ছে...</span>
                    </>
                  ) : (
                    <span>হ্যাঁ, বাতিল করুন</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                >
                  না, ফিরে যান
                </button>
              </div>
            </div>
          )}
        </div>

        {/* শিট ফুটার */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {isCancellable && !showCancelConfirm ? (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition min-h-[44px]"
            >
              <Trash2 className="h-4 w-4" />
              <span>আবেদন বাতিল</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition min-h-[44px]"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailSheet;
