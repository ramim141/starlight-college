import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Paperclip, 
  ExternalLink,
  MessageSquare,
  FileQuestion
} from 'lucide-react';
import { getMediaUrl } from '../../../api/homepage';

const STATUS_CONFIG = {
  PENDING: {
    label: 'পর্যালোচনায় আছে',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  INVESTIGATING: {
    label: 'তদন্তাধীন',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: AlertCircle,
  },
  RESOLVED: {
    label: 'সমাধানকৃত',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  DISMISSED: {
    label: 'বাতিলকৃত',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
    icon: XCircle,
  },
};

const ComplaintList = ({ complaints = [], onNewComplaintClick }) => {
  const [filter, setFilter] = useState('ALL');

  const filtered = complaints.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-5">
      {/* ফিল্টার চিপস বার */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'সব অভিযোগ', count: complaints.length },
          { key: 'PENDING', label: 'পর্যালোচনায়', count: complaints.filter(c => c.status === 'PENDING').length },
          { key: 'INVESTIGATING', label: 'তদন্তাধীন', count: complaints.filter(c => c.status === 'INVESTIGATING').length },
          { key: 'RESOLVED', label: 'সমাধান হয়েছে', count: complaints.filter(c => c.status === 'RESOLVED').length },
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
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/90 shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
            <FileQuestion className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-700">
            {filter === 'ALL' ? 'আপনার প্রেরিত কোনো অভিযোগ বা পরামর্শ নেই' : 'এই ক্যাটাগরিতে কোনো অভিযোগ নেই'}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            কলেজের পরিবেশ, শিক্ষক বা যে কোনো বিষয় নিয়ে নির্দ্বিধায় সরাসরি অধ্যক্ষকে জানাতে পারেন।
          </p>
          {onNewComplaintClick && (
            <button
              onClick={onNewComplaintClick}
              className="mt-5 inline-flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition min-h-[44px]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>নতুন অভিযোগ বা পরামর্শ লিখুন</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusMeta.icon;
            const formattedDate = item.created_at
              ? new Date(item.created_at).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : '';

            return (
              <div 
                key={item.id}
                className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition space-y-3.5"
              >
                {/* টপ মেটা বার */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
                      {item.category_display || item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      দাখিলের তারিখ: {formattedDate}
                    </span>
                  </div>

                  <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-0.5 text-xs font-extrabold border ${statusMeta.badgeClass}`}>
                    <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.status_display || statusMeta.label}</span>
                  </span>
                </div>

                {/* টাইটেল ও বর্ণনা */}
                <div>
                  <h4 className="text-sm font-bold text-brand-navy leading-snug">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {/* অ্যাটাচমেন্ট থাকলে */}
                {item.attachment && (
                  <div className="pt-1">
                    <a
                      href={getMediaUrl(item.attachment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-brand-orange transition"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                      <span>সংযুক্ত প্রমাণক দেখুন</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  </div>
                )}

                {/* অধ্যক্ষের গৃহীত ব্যবস্থা বা নোট */}
                {item.principal_remarks && (
                  <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>অধ্যক্ষ মহোদয়ের নোট ও গৃহীত ব্যবস্থা</span>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed pl-5.5">
                      {item.principal_remarks}
                    </p>
                    {item.action_taken_at && (
                      <p className="text-[10px] text-emerald-700 font-semibold pl-5.5 pt-0.5">
                        নিষ্পত্তির সময়: {new Date(item.action_taken_at).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
