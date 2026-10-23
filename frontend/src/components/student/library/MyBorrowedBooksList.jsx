import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  UserCheck, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

const STATUS_CONFIG = {
  REQUESTED: {
    label: 'শিক্ষকের পর্যালোচনায় আছে',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  TEACHER_APPROVED: {
    label: 'অনুমোদিত — বই সংগ্রহ করুন',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: UserCheck,
  },
  TEACHER_REJECTED: {
    label: 'আবেদন বাতিলকৃত',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  ISSUED: {
    label: 'ইস্যুকৃত (পড়ার সময় চলমান)',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: BookOpen,
  },
  RETURNED: {
    label: 'ফেরত সম্পন্ন',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
    icon: CheckCircle2,
  },
};

const MyBorrowedBooksList = ({ records = [], onBrowseCatalogClick }) => {
  const [filter, setFilter] = useState('ALL');

  const filtered = records.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return r.status === 'ISSUED';
    if (filter === 'PENDING') return r.status === 'REQUESTED' || r.status === 'TEACHER_APPROVED';
    if (filter === 'RETURNED') return r.status === 'RETURNED';
    return true;
  });

  const activeIssuedCount = records.filter((r) => r.status === 'ISSUED').length;

  return (
    <div className="space-y-5">
      
      {/* ফিল্টার বার */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'সব বই', count: records.length },
          { key: 'ACTIVE', label: 'বর্তমান বই (ইস্যুকৃত)', count: activeIssuedCount },
          { key: 'PENDING', label: 'অনুরোধ অপেক্ষমাণ', count: records.filter((r) => r.status === 'REQUESTED' || r.status === 'TEACHER_APPROVED').length },
          { key: 'RETURNED', label: 'ফেরত সম্পন্ন', count: records.filter((r) => r.status === 'RETURNED').length },
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

      {/* তালিকা এলাকা */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/90 shadow-soft">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h4 className="mt-3 text-sm font-bold text-slate-700">কোনো বইয়ের রেকর্ড নেই</h4>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            কলেজ লাইব্রেরির সমৃদ্ধ ক্যাটালগ থেকে যে কোনো পাঠ্য বা রেফারেন্স বই ধার নেওয়ার আবেদন করতে পারেন।
          </p>
          {onBrowseCatalogClick && (
            <button
              onClick={onBrowseCatalogClick}
              className="mt-5 inline-flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition min-h-[44px]"
            >
              <Layers className="h-4 w-4" />
              <span>বই ক্যাটালগ দেখুন</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.REQUESTED;
            const StatusIcon = statusMeta.icon;

            // ডিউ ডেট ও বিলম্ব ফি হিসাব
            let isOverdue = false;
            let daysRemaining = null;
            let overdueDays = 0;
            let calculatedFine = parseFloat(item.late_fine || 0);

            if (item.status === 'ISSUED' && item.due_date) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const due = new Date(item.due_date);
              due.setHours(0, 0, 0, 0);
              const diffTime = due.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays >= 0) {
                daysRemaining = diffDays;
              } else {
                isOverdue = true;
                overdueDays = Math.abs(diffDays);
                calculatedFine = overdueDays * 10;
              }
            }

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition space-y-3.5"
              >
                {/* টপ বার */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-0.5 text-xs font-extrabold border ${statusMeta.badgeClass}`}>
                      <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.status_display || statusMeta.label}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      আবেদনের তারিখ: {new Date(item.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>

                  {/* কাউন্টডাউন / ওভারডিউ ইন্ডিকেটর */}
                  {item.status === 'ISSUED' && (
                    <div>
                      {isOverdue ? (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700 animate-pulse border border-rose-300">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          <span>{overdueDays} দিন বিলম্বিত!</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <Clock className="h-3.5 w-3.5 text-emerald-600" />
                          <span>ফেরতের বাকি: {daysRemaining} দিন</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* বইয়ের নাম ও কারণ */}
                <div>
                  <h4 className="text-base font-bold text-brand-navy">
                    {item.book_title}
                  </h4>
                  {item.reason && (
                    <p className="mt-1 text-xs text-slate-600">
                      উদ্দেশ্য: <span className="font-semibold text-slate-800">{item.reason}</span>
                    </p>
                  )}
                </div>

                {/* তারিখ ও ইস্যু তথ্য গ্রিড */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {item.issued_at && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">ইস্যুর তারিখ</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(item.issued_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  )}

                  {item.due_date && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">ফেরতের শেষ তারিখ</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {new Date(item.due_date).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  )}

                  {item.returned_at && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">ফেরত গ্রহণের তারিখ</span>
                      <span className="font-semibold text-emerald-700">
                        {new Date(item.returned_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  )}

                  {(calculatedFine > 0 || parseFloat(item.late_fine || 0) > 0) && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">বিলম্ব জরিমানা</span>
                      <span className="font-black text-rose-600">
                        ৳ {calculatedFine.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* শিক্ষকের মন্তব্য থাকলে */}
                {item.teacher_remarks && (
                  <div className="rounded-xl bg-blue-50/60 p-2.5 text-xs text-slate-700 border border-blue-200">
                    <span className="font-bold text-brand-navy">শিক্ষকের মন্তব্য ({item.teacher_name || 'বিষয় শিক্ষক'}): </span>
                    <span>{item.teacher_remarks}</span>
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

export default MyBorrowedBooksList;
