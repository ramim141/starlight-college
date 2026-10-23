import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Paperclip, 
  FileText, 
  PlusCircle,
  MessageSquare
} from 'lucide-react';
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
    month: 'short',
    year: 'numeric'
  });
};

const getStatusBadge = (item) => {
  if (item.principal_status === 'APPROVED') {
    return {
      label: 'চূড়ান্ত অনুমোদিত',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  }
  if (item.principal_status === 'REJECTED') {
    return {
      label: 'অধ্যক্ষ কর্তৃক বাতিল',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    };
  }
  if (item.incharge_status === 'REJECTED') {
    return {
      label: 'ইনচার্জ কর্তৃক বাতিল',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    };
  }
  if (item.incharge_status === 'RECOMMENDED') {
    return {
      label: 'ইনচার্জ সুপারিশকৃত',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    };
  }
  return {
    label: 'পর্যালোচনায় অপেক্ষমাণ',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  };
};

const MyLeaveApplicationsList = ({ 
  leaves = [], 
  isLoading = false, 
  onNewLeaveClick, 
  onSelectLeave 
}) => {
  const [filter, setFilter] = useState('ALL');

  const filteredLeaves = leaves.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') {
      return (
        item.principal_status !== 'APPROVED' &&
        item.principal_status !== 'REJECTED' &&
        item.incharge_status !== 'REJECTED'
      );
    }
    if (filter === 'APPROVED') {
      return item.principal_status === 'APPROVED';
    }
    if (filter === 'REJECTED') {
      return item.principal_status === 'REJECTED' || item.incharge_status === 'REJECTED';
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded-lg" />
              <div className="h-5 w-28 bg-slate-200 rounded-full" />
            </div>
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ফিল্টার চিপস বার */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'সব আবেদন', count: leaves.length },
          { 
            key: 'PENDING', 
            label: 'অপেক্ষমাণ', 
            count: leaves.filter(l => l.principal_status !== 'APPROVED' && l.principal_status !== 'REJECTED' && l.incharge_status !== 'REJECTED').length 
          },
          { key: 'APPROVED', label: 'অনুমোদিত', count: leaves.filter(l => l.principal_status === 'APPROVED').length },
          { key: 'REJECTED', label: 'বাতিলকৃত', count: leaves.filter(l => l.principal_status === 'REJECTED' || l.incharge_status === 'REJECTED').length },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[40px] ${
              filter === f.key
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{f.label}</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
              filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {toBanglaNumber(f.count)}
            </span>
          </button>
        ))}
      </div>

      {/* আবেদন তালিকা বা ফাঁকা অবস্থা */}
      {filteredLeaves.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center border border-slate-200/80 shadow-soft space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-navy">
              {leaves.length === 0 ? 'আপনি এখনো কোনো ছুটির আবেদন করেননি' : 'এই ক্যাটাগরিতে কোনো আবেদন পাওয়া যায়নি'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              জরুরি পারিবারিক কাজ বা অসুস্থতায় শ্রেণি ইনচার্জ ও অধ্যক্ষের অনুমোদনের জন্য ডিজিটাল আবেদন দাখিল করুন।
            </p>
          </div>
          {leaves.length === 0 && onNewLeaveClick && (
            <button
              type="button"
              onClick={onNewLeaveClick}
              className="mt-2 inline-flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition min-h-[44px]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>নতুন ছুটির আবেদন করুন</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLeaves.map((item) => {
            const statusMeta = getStatusBadge(item);
            const StatusIcon = statusMeta.icon;
            const { type, reason } = parseLeaveReason(item.reason);

            const start = new Date(item.start_date);
            const end = new Date(item.end_date);
            const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

            return (
              <div
                key={item.id}
                onClick={() => onSelectLeave(item)}
                className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition cursor-pointer space-y-3.5 group"
              >
                {/* টপ মেটা বার */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-xl bg-brand-navy/5 px-2.5 py-1 text-[11px] font-black text-brand-navy">
                      #{item.id}
                    </span>
                    <span className="rounded-xl bg-brand-orange/10 px-2.5 py-1 text-[11px] font-bold text-brand-orange">
                      {type}
                    </span>
                  </div>

                  <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-black border ${statusMeta.badgeClass}`}>
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{statusMeta.label}</span>
                  </span>
                </div>

                {/* তারিখ ও ব্যাপ্তি */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <Calendar className="h-4 w-4 text-brand-orange shrink-0" />
                    <span>
                      {formatDateBn(item.start_date)} — {formatDateBn(item.end_date)}
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 rounded-lg px-2 py-0.5">
                    মোট {toBanglaNumber(totalDays)} দিন
                  </span>
                </div>

                {/* ছুটির কারণ সারাংশ */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {reason}
                </p>

                {/* মন্তব্য থাকলে ছোট হাইলাইট */}
                {(item.incharge_remarks || item.principal_remarks) && (
                  <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100 flex items-start space-x-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      {item.principal_remarks ? `অধ্যক্ষের মন্তব্য: ${item.principal_remarks}` : `ইনচার্জের মন্তব্য: ${item.incharge_remarks}`}
                    </span>
                  </div>
                )}

                {/* বটম বার */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center space-x-3">
                    <span>দাখিল: {formatDateBn(item.created_at)}</span>
                    {item.attachment && (
                      <span className="inline-flex items-center space-x-1 text-slate-600 font-bold">
                        <Paperclip className="h-3 w-3 text-brand-orange" />
                        <span>সংযুক্তি আছে</span>
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center space-x-1 font-bold text-brand-navy group-hover:text-brand-orange transition">
                    <span>বিস্তারিত ট্র্যাক</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLeaveApplicationsList;
