import React from 'react';
import { CreditCard } from 'lucide-react';

const FinanceTabContent = ({ payrolls = [], salaryClaims = [], onOpenClaimModal }) => {
  return (
    <div className="space-y-6">
      {/* মাসিক পে-রোল স্লিপ */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">আমার মাসিক বেতন স্লিপ (Payslips)</h3>
              <p className="text-xs text-slate-400">প্রতি মাসের মূল বেতন, ইনচার্জ ভাতা ও নিট পরিশোধিত অর্থ</p>
            </div>
          </div>
          <button
            onClick={onOpenClaimModal}
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
          >
            + ভাউচার / ভাতা ক্লেইম
          </button>
        </div>

        <div className="mt-4">
          {payrolls.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">কোনো বেতন স্লিপ রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payrolls.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-brand-navy">
                      মাস: {p.month}/{p.year}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      p.status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status_display || p.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>মূল বেতন:</span>
                      <strong className="text-slate-800">{p.base_salary} BDT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>বোনাস ও ভাতা:</span>
                      <strong className="text-emerald-600">+{p.bonus_allowance} BDT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>কর্তন:</span>
                      <strong className="text-rose-600">-{p.deductions} BDT</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-brand-navy">
                      <span>নিট প্রদেয়:</span>
                      <span className="text-emerald-700 font-extrabold">{p.net_salary} BDT</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ভাতা ক্লেইম হিস্ট্রি */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <h4 className="font-bold text-sm text-brand-navy mb-4">আমার ক্লেইম ভাউচারের তালিকা</h4>
        {salaryClaims.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">কোনো ভাউচার ক্লেইম জমা দেওয়া হয়নি।</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {salaryClaims.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-brand-navy uppercase">{c.claim_type_display || c.claim_type}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-emerald-600">{c.amount} BDT</span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    {c.status_display || c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceTabContent;
