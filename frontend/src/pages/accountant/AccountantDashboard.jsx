import React, { useState, useEffect } from 'react';
import { 
  getDailyCashClosingApi, 
  getCashHandoversApi, 
  verifyCashHandoverApi, 
  getStudentInvoicesForPaymentApi, 
  collectInvoicePaymentApi 
} from '../../api/adminFinance';
import { CreditCard, FileText, CheckCircle2, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const AccountantDashboard = () => {
  const [closingData, setClosingData] = useState(null);
  const [handovers, setHandovers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [collectModalInvoice, setCollectModalInvoice] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchAccountantData = async () => {
    try {
      const [closeRes, handRes, invRes] = await Promise.allSettled([
        getDailyCashClosingApi(),
        getCashHandoversApi(),
        getStudentInvoicesForPaymentApi()
      ]);

      if (closeRes.status === 'fulfilled' && closeRes.value.success) {
        setClosingData(closeRes.value.cash_summary);
      }
      if (handRes.status === 'fulfilled') {
        const hList = handRes.value.results || handRes.value;
        setHandovers(Array.isArray(hList) ? hList : []);
      }
      if (invRes.status === 'fulfilled') {
        const iList = invRes.value.results || invRes.value;
        setInvoices(Array.isArray(iList) ? iList : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountantData();
  }, []);

  const handleVerifyHandover = async (id) => {
    try {
      const res = await verifyCashHandoverApi(id, 'নগদ টাকা গুনে গ্রহণ করা হয়েছে');
      if (res.success) {
        toast.success(res.message);
        fetchAccountantData();
      }
    } catch (err) {
      toast.error('হ্যান্ডওভার গ্রহণ ব্যর্থ হয়েছে');
    }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast.error('জমার সঠিক পরিমাণ দিন');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await collectInvoicePaymentApi(collectModalInvoice.id, {
        amount_paid: amountPaid,
        payment_method: paymentMethod,
        transaction_reference: 'POS-COUNTER-OFFICE'
      });
      if (res.success) {
        toast.success(res.message);
        setCollectModalInvoice(null);
        setAmountPaid('');
        fetchAccountantData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'টাকা জমা ব্যর্থ হয়েছে');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.student_unique_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.roll_number?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      
      {/* ১. দৈনিক ক্যাশ ক্লোজিং লাইভ শিট (Daily Cash Closing Summary) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#1A365D] to-[#142B4E] p-6 sm:p-8 text-white shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-brand-orange p-2.5 text-white shadow">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">দৈনিক ক্যাশ ক্লোজিং শিট (Live Cash in Hand)</h2>
              <p className="text-xs text-slate-300">আজকের ওপেনিং + নগদ আদায় - খরচ - ব্যাংকে জমা = দিনশেষে ড্রয়ারে থাকা ক্যাশ</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-orange-200 border border-white/15">
            আজকের তারিখ: {new Date().toLocaleDateString('bn-BD')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">কাউন্টার নগদ আদায়</span>
            <span className="text-lg font-black text-emerald-400">৳ {closingData?.direct_counter_cash_collection || 0}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">ইনচার্জ ক্যাশ গ্রহণ</span>
            <span className="text-lg font-black text-emerald-400">৳ {closingData?.incharge_handed_over_cash || 0}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">নগদ খরচ ও ব্যাংকে জমা</span>
            <span className="text-lg font-black text-rose-400">৳ {closingData?.total_cash_outflow || 0}</span>
          </div>
          <div className="bg-brand-orange p-3 rounded-2xl text-white shadow-lg">
            <span className="text-[10px] uppercase font-bold text-orange-100 block">ড্রয়ারে থাকা নিট ক্যাশ</span>
            <span className="text-xl font-black">৳ {closingData?.net_closing_cash_in_hand || 0}</span>
          </div>
        </div>
      </div>

      {/* ২. ইনচার্জদের ক্যাশ হ্যান্ডওভার ভেরিফিকেশন (Receive & Verify) */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4">
          <Users className="h-5 w-5 text-brand-orange" />
          <h3 className="font-extrabold text-base text-brand-navy">ইনচার্জ ক্যাশ হস্তান্তর যাচাই (Cash Handover)</h3>
        </div>

        {handovers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">কোনো ক্যাশ হস্তান্তর অপেক্ষমাণ নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {handovers.map(h => (
              <div key={h.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy">{h.in_charge_name}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      h.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {h.status_display}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-emerald-600 mt-2">৳ {h.amount}</h4>
                  <p className="text-xs text-slate-500 mt-1">{h.notes || "শিক্ষার্থীদের নিকট হতে আদায়কৃত নগদ"}</p>
                </div>

                {h.status === 'PENDING' && (
                  <button
                    onClick={() => handleVerifyHandover(h.id)}
                    className="mt-4 flex items-center justify-center space-x-1.5 rounded-xl bg-brand-orange py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>ক্যাশ গুনে বুঝে নিয়েছি (Verify)</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ৩. পিওএস স্টাইলে দ্রুত ফি কালেকশন কাউন্টার */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-brand-navy">ফি কালেকশন কাউন্টার (POS Search)</h3>
            <p className="text-xs text-slate-400">রোল, স্টুডেন্ট আইডি বা নাম লিখে সার্চ করে বকেয়া ফি জমা নিন</p>
          </div>

          <input
            type="text"
            placeholder="রোল বা আইডি দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
              <tr>
                <th className="p-2.5 text-left">রোল</th>
                <th className="p-2.5 text-left">শিক্ষার্থীর নাম</th>
                <th className="p-2.5">ইনভয়েস</th>
                <th className="p-2.5">মাস</th>
                <th className="p-2.5">মোট প্রদেয়</th>
                <th className="p-2.5 text-red-300">বকেয়া</th>
                <th className="p-2.5">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
              {filteredInvoices.slice(0, 10).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="p-2.5 text-left font-bold text-brand-orange">{inv.roll_number}</td>
                  <td className="p-2.5 text-left font-bold text-brand-navy">{inv.student_name}</td>
                  <td className="p-2.5 text-slate-500">{inv.invoice_number}</td>
                  <td className="p-2.5">{inv.month}/{inv.year}</td>
                  <td className="p-2.5">৳ {inv.total_amount}</td>
                  <td className="p-2.5 font-bold text-red-600">৳ {inv.due_amount}</td>
                  <td className="p-2.5">
                    <button
                      onClick={() => {
                        setCollectModalInvoice(inv);
                        setAmountPaid(inv.due_amount);
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-sm"
                    >
                      টাকা জমা নিন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ফি কালেকশন পপ-আপ মডাল */}
      {collectModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <h3 className="text-base font-bold text-brand-navy">ফি জমা ও রসিদ তৈরি</h3>
            <p className="text-xs text-slate-500 mt-1">শিক্ষার্থী: {collectModalInvoice.student_name} (রোল: {collectModalInvoice.roll_number})</p>

            <form onSubmit={handleCollectPayment} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">জমার পরিমাণ (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-slate-900 focus:border-brand-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">পেমেন্ট মেথড</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-brand-orange focus:outline-none"
                >
                  <option value="CASH">ক্যাশ কাউন্টার (Cash)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                  <option value="BANK">ব্যাংক ট্রান্সফার (Bank)</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCollectModalInvoice(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
                >
                  {submittingPayment ? 'জমা হচ্ছে...' : 'জমা নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountantDashboard;