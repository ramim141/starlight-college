import React from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

const money = (val) => `৳ ${Number(val || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

const SupervisionLeavesTab = ({
  approvalsData,
  loadingApprovals,
  refetchApprovals,
  actionLoading,
  onLeaveReview,
  onWaiverReview,
}) => {
  const leavesList = approvalsData.leaves || [];
  const waiversList = approvalsData.waivers || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* হেডার ও রিফ্রেশ বার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h4 className="text-sm font-extrabold text-brand-navy">
            ছুটি ও জরিমানা মওকুফ সুপারিশ তদারকি
          </h4>
          <p className="text-xs text-slate-500">
            শ্রেণি ইনচার্জ কর্তৃক সুপারিশকৃত শিক্ষার্থীর ছুটির আবেদন ও অনুপস্থিতির ১০০/- টাকা জরিমানা মওকুফ।
          </p>
        </div>

        <button
          onClick={() => refetchApprovals()}
          disabled={loadingApprovals}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className={`h-4 w-4 ${loadingApprovals ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* ১. ছুটির আবেদন তালিকা */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-orange" />
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">
              ছুটির আবেদনপত্র ({leavesList.length} টি)
            </h4>
          </div>
        </div>

        {loadingApprovals ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-orange border-t-transparent" />
          </div>
        ) : leavesList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            এই শাখার কোনো শিক্ষার্থীর ছুটির আবেদন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {leavesList.map((leave) => {
              const isPending = leave.status === 'PENDING';
              return (
                <div key={leave.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-navy">
                        {leave.student_name || leave.student?.full_name || 'শিক্ষার্থী'}
                      </span>
                      <span className="text-slate-400">
                        ({leave.start_date} হতে {leave.end_date})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        leave.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">কারণ: {leave.reason}</p>
                    {leave.incharge_remarks && (
                      <p className="text-[11px] text-slate-500 italic">
                        ইনচার্জের মন্তব্য: {leave.incharge_remarks}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => onLeaveReview(leave.id, 'APPROVED')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>অনুমোদন</span>
                        </button>
                        <button
                          onClick={() => onLeaveReview(leave.id, 'REJECTED')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>প্রত্যাখ্যান</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ২. জরিমানা মওকুফ আবেদন তালিকা */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">
              অনুপস্থিতি জরিমানা মওকুফ আবেদন ({waiversList.length} টি)
            </h4>
          </div>
        </div>

        {loadingApprovals ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-orange border-t-transparent" />
          </div>
        ) : waiversList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            এই শাখার কোনো জরিমানা মওকুফ আবেদন নেই।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {waiversList.map((waiver) => {
              const isPending = waiver.status === 'PENDING';
              return (
                <div key={waiver.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-navy">
                        {waiver.student_name || waiver.student_unique_id || 'শিক্ষার্থী'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        দাবিকৃত মওকুফ: {money(waiver.applied_waiver_amount || waiver.amount)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        waiver.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        waiver.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {waiver.status}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">আবেদনের কারণ: {waiver.reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => onWaiverReview(waiver.id, 'APPROVED')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>মঞ্জুর করুন</span>
                        </button>
                        <button
                          onClick={() => onWaiverReview(waiver.id, 'REJECTED')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>বাতিল</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisionLeavesTab;
