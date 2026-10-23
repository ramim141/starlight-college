import React from 'react';
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw
} from 'lucide-react';

const money = (val) => `৳ ${Number(val || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

const SupervisionFeesTab = ({
  financeData,
  loadingFinance,
  refetchFinance,
  actionLoading,
  onSendDueAlert,
  onVerifyCashHandover,
}) => {
  const invoicesList = financeData.invoices || [];
  const handoversList = financeData.handovers || [];

  const totalInvoiced = invoicesList.reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);
  const totalPaid = invoicesList.reduce((acc, inv) => acc + Number(inv.paid_amount || 0), 0);
  const totalDue = invoicesList.reduce((acc, inv) => acc + Number(inv.due_amount || 0), 0);
  const overdueCount = invoicesList.filter((inv) => Number(inv.due_amount || 0) > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* হেডার ও অ্যাকশন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h4 className="text-sm font-extrabold text-brand-navy">
            শাখার ফি আদায় ও নগদ ক্যাশ হস্তান্তর তদারকি
          </h4>
          <p className="text-xs text-slate-500">
            শিক্ষার্থীদের টিউশন ফি সংগ্রহ ও শ্রেণি ইনচার্জ কর্তৃক হিসাবরক্ষককে ক্যাশ হস্তান্তরের রসিদ।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchFinance()}
            disabled={loadingFinance}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`h-4 w-4 ${loadingFinance ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onSendDueAlert}
            disabled={actionLoading || overdueCount === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              overdueCount > 0
                ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>বকেয়া ফি তাগাদা পাঠান ({overdueCount} জন)</span>
          </button>
        </div>
      </div>

      {/* ফি স্ট্যাটস ৪টি কার্ড */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>মোট ইনভয়েস দাবি</span>
            <Receipt className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-lg font-extrabold text-brand-navy">{money(totalInvoiced)}</p>
          <span className="text-[10px] text-slate-400">এই সেশনের মোট ফি</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-soft">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-bold mb-1">
            <span>মোট আদায়কৃত</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold text-emerald-700">{money(totalPaid)}</p>
          <span className="text-[10px] text-emerald-600/70">
            {totalInvoiced > 0 ? `${Math.round((totalPaid / totalInvoiced) * 100)}% সংগৃহীত` : 'আদায় সম্পন্ন'}
          </span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-rose-100 shadow-soft">
          <div className="flex items-center justify-between text-rose-600 text-xs font-bold mb-1">
            <span>মোট বকেয়া ফি</span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-lg font-extrabold text-rose-700">{money(totalDue)}</p>
          <span className="text-[10px] text-rose-600/70">{overdueCount} জন শিক্ষার্থীর বকেয়া</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-blue-100 shadow-soft">
          <div className="flex items-center justify-between text-blue-600 text-xs font-bold mb-1">
            <span>ক্যাশ হস্তান্তর সংখ্যা</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-lg font-extrabold text-blue-800">{handoversList.length} টি রেকর্ড</p>
          <span className="text-[10px] text-blue-600/70">নগদ লেনদেন হিসাব</span>
        </div>
      </div>

      {/* ক্যাশ হস্তান্তর হিস্ট্রি টেবিল */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">
            শ্রেণি ইনচার্জ ক্যাশ হস্তান্তর ভাউচার তালিকা
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            মোট {handoversList.length} টি হ্যান্ডওভার
          </span>
        </div>

        {loadingFinance ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-orange border-t-transparent" />
          </div>
        ) : handoversList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            এই শাখার জন্য কোনো ক্যাশ হ্যান্ডওভার ভাউচার পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">ভাউচার নং</th>
                  <th className="px-4 py-3">তারিখ</th>
                  <th className="px-4 py-3">ইনচার্জ শিক্ষক</th>
                  <th className="px-4 py-3">নগদ জমার পরিমাণ</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {handoversList.map((h) => {
                  const isVerified = h.status === 'VERIFIED';
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-brand-navy">
                        #{h.voucher_number || h.id}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {h.date || h.created_at?.split('T')[0] || '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {h.in_charge_name || 'ইনচার্জ শিক্ষক'}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-emerald-700">
                        {money(h.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              যাচাইকৃত (Verified)
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-amber-600" />
                              অপেক্ষমাণ (Pending)
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isVerified && (
                          <button
                            onClick={() => onVerifyCashHandover(h.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs"
                          >
                            ভেরিফাই ও গ্রহণ
                          </button>
                        )}
                        {isVerified && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            সম্পন্ন হয়েছে
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisionFeesTab;
