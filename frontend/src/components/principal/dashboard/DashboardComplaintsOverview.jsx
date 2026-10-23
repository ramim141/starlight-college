import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Clock
} from 'lucide-react';

const formatAgeBangla = (dateStr) => {
  if (!dateStr) return '';
  const created = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'আজকে এসেছে';
  if (diffDays === 1) return 'গতকাল এসেছে';
  return `${diffDays} দিন অপেক্ষমাণ`;
};

const DashboardComplaintsOverview = ({
  complaints = [],
  revealedComplaintIds = new Set(),
  onToggleRevealIdentity,
  onResolveComplaint,
  resolvingId = null,
  loading = false,
}) => {
  // অমীমাংসিত অভিযোগ ও সবচেয়ে পুরোনো অভিযোগের বয়স হিসাব
  const pendingComplaints = useMemo(() => {
    return complaints.filter((c) => c.status !== 'RESOLVED');
  }, [complaints]);

  const oldestUnresolved = useMemo(() => {
    if (!pendingComplaints.length) return null;
    const sorted = [...pendingComplaints].sort(
      (a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date)
    );
    return sorted[0];
  }, [pendingComplaints]);

  const oldestAgeText = oldestUnresolved ? formatAgeBangla(oldestUnresolved.created_at || oldestUnresolved.date) : null;

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm animate-pulse sm:p-6">
        <div className="w-48 h-5 mb-4 rounded bg-slate-200" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 pb-4 mb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-brand-navy">
                গোপন অভিযোগ ও পরামর্শ বক্স (অধ্যক্ষ প্রিভিউ)
              </h3>
              <span className="rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-[10px] font-black">
                অমীমাংসিত: {pendingComplaints.length}টি
              </span>
              {oldestAgeText && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                  <Clock className="w-3 h-3 text-amber-600" />
                  সবচেয়ে পুরনো: {oldestAgeText}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              শিক্ষার্থী পরিচয় সাধারণের কাছে অপ্রকাশিত থাকলেও অধ্যক্ষ ড্যাশবোর্ডে তার আসল নাম, রোল ও ফোন দেখতে পাচ্ছেন।
            </p>
          </div>
        </div>
        <Link
          to="/principal/complaints"
          className="flex items-center space-x-1 text-xs font-bold text-brand-orange hover:underline shrink-0 min-h-[44px]"
        >
          <span>সকল অভিযোগ</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="py-10 text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50 text-emerald-500" />
          <p className="text-xs font-bold text-slate-500">বর্তমানে কোনো অভিযোগ বা পরামর্শ জমা নেই।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.slice(0, 5).map((comp) => {
            const isRevealed = revealedComplaintIds.has(comp.id);
            const student = comp.student_details || {};

            return (
              <div
                key={comp.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors duration-200 hover:border-blue-200 hover:bg-white motion-reduce:transition-none"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800">
                        {comp.category_display || comp.category}
                      </span>
                      <h4 className="text-sm font-bold text-brand-navy">{comp.title}</h4>
                      {comp.created_at && (
                        <span className="text-[10px] text-slate-400">
                          ({formatAgeBangla(comp.created_at)})
                        </span>
                      )}
                    </div>
                    <p className="p-3 text-xs bg-white border text-slate-600 rounded-xl border-slate-200/70">
                      {comp.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end shrink-0">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        comp.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {comp.status_display || comp.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleRevealIdentity(comp.id)}
                      className="inline-flex items-center space-x-1 text-xs font-bold cursor-pointer text-brand-orange hover:underline min-h-[44px]"
                    >
                      {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{isRevealed ? 'পরিচয় আড়াল' : 'আসল ছাত্র দেখুন'}</span>
                    </button>
                  </div>
                </div>

                {/* ক্লিকে আসল শিক্ষার্থীর বিস্তারিত প্রোফাইল প্রকাশ */}
                {isRevealed && (
                  <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3.5 rounded-xl border border-rose-100">
                    <p className="text-[11px] font-black text-rose-700 mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>শিক্ষার্থীর গোপন ডাটাবেস তথ্য (শুধুমাত্র অধ্যক্ষ দৃশ্যমান):</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-slate-400">নাম:</span>{' '}
                        <strong className="block text-slate-800">
                          {student.student_name || 'সংরক্ষিত'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">রোল ও শাখা:</span>{' '}
                        <strong className="block text-brand-orange">
                          {student.roll_number} ({student.section})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">শিক্ষার্থী ফোন:</span>{' '}
                        <span className="block font-mono text-slate-700">
                          {student.student_phone || 'নেই'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">অভিভাবক ফোন:</span>{' '}
                        <a
                          href={`tel:${student.guardian_phone}`}
                          className="block font-mono font-bold text-brand-navy hover:underline"
                        >
                          {student.guardian_phone}
                        </a>
                      </div>
                    </div>

                    {comp.status !== 'RESOLVED' && (
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => onResolveComplaint(comp.id)}
                          disabled={resolvingId === comp.id}
                          className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition disabled:opacity-50 min-h-[44px]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>
                            {resolvingId === comp.id ? 'নিষ্পত্তি হচ্ছে...' : 'অভিযোগ নিষ্পত্তি করুন'}
                          </span>
                        </button>
                      </div>
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

export default DashboardComplaintsOverview;
