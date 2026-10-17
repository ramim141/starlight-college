import React, { useState, useEffect } from 'react';
import { getMyInvoicesApi } from '../../api/student';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const StudentInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await getMyInvoicesApi();
        const list = res.results || res;
        setInvoices(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-brand-navy">বেতন ও ফি বিবরণী</h2>
        <p className="text-xs text-slate-500">আপনার মাসিক বেতন, পরিবহন ফি, জরিমানা ও আদায়ের রসিদ হিস্ট্রি।</p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-100">
          <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">কোনো ইনভয়েস পাওয়া যায়নি</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400">ইনভয়েস নম্বর:</span>
                  <h4 className="text-sm font-black text-brand-navy">{inv.invoice_number}</h4>
                </div>
                <span className={`rounded-xl px-3 py-1 text-xs font-extrabold ${
                  inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                  inv.status === 'PARTIAL' ? 'bg-orange-50 text-brand-orange' : 'bg-red-50 text-red-600'
                }`}>
                  {inv.status_display}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 my-4 text-xs">
                <div><span className="text-slate-400">মাস ও বছর:</span> <span className="font-bold text-slate-800">{inv.month}/{inv.year}</span></div>
                <div><span className="text-slate-400">টিউশন ফি:</span> <span className="font-bold text-slate-800">৳ {inv.tuition_fee}</span></div>
                <div><span className="text-slate-400">পরিবহন ফি:</span> <span className="font-bold text-slate-800">৳ {inv.transport_fee}</span></div>
                <div><span className="text-slate-400">অনুপস্থিতি জরিমানা:</span> <span className="font-bold text-rose-600">৳ {inv.absence_fine}</span></div>
                <div><span className="text-slate-400">মওকুফ (ছাড়):</span> <span className="font-bold text-emerald-600">৳ {inv.waiver_amount}</span></div>
                <div><span className="text-slate-400">পরিশোধিত:</span> <span className="font-bold text-emerald-600">৳ {inv.paid_amount}</span></div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-4 rounded-b-3xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">মোট প্রদেয়</span>
                  <span className="text-sm font-black text-slate-900">৳ {inv.total_amount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">অবশিষ্ট বকেয়া</span>
                  <span className={`text-base font-black ${parseFloat(inv.due_amount) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ৳ {inv.due_amount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentInvoices;