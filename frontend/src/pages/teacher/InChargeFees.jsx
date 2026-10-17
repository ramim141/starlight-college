import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import CashHandoverModal from '../../components/incharge/CashHandoverModal';
import { 
  CreditCard, 
  DollarSign, 
  Send, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Search, 
  FileText, 
  Receipt, 
  ShieldCheck, 
  TrendingUp, 
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const InChargeFees = () => {
  const { user, isClassIncharge, refreshUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ফি কালেকশন সাবমিট স্টেট
  const [collectModalInvoice, setCollectModalInvoice] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  // মানি রসিদ মডাল স্টেট
  const [receiptModalData, setReceiptModalData] = useState(null);
  const receiptPrintRef = useRef(null);

  const mySections = user?.incharge_sections || [];
  const activeSection = mySections.find((s) => s.id === selectedSectionId) || mySections[0];

  useEffect(() => {
    if (!user?.incharge_sections?.length && refreshUser) {
      refreshUser();
    }
  }, []);

  useEffect(() => {
    if (mySections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(mySections[0].id);
    }
  }, [mySections]);

  const fetchFeeData = async () => {
    try {
      const sectionQuery = selectedSectionId ? `&section=${selectedSectionId}` : '';
      const [invRes, handRes] = await Promise.all([
        api.get(`finance/invoices/?status=UNPAID${sectionQuery}`),
        api.get('finance/cash-handovers/'),
      ]);
      setInvoices(invRes.data.results || invRes.data || []);
      setHandovers(handRes.data.results || handRes.data || []);
    } catch (e) {
      toast.error('ফি ডেটা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, [selectedSectionId]);

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast.error('জমার সঠিক পরিমাণ দিন');
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await api.post(`finance/invoices/${collectModalInvoice.id}/collect-payment/`, {
        amount_paid: amountPaid,
        payment_method: 'CASH',
        transaction_reference: 'INCHARGE-COLLECTED',
      });
      if (res.data.success) {
        toast.success(res.data.message);
        
        // ডিজিটাল মানি রসিদ তৈরি করে দেখানো
        const receiptInfo = res.data.receipt || {
          receipt_no: `REC-${Date.now().toString().slice(-6)}`,
          amount_paid: amountPaid,
          created_at: new Date().toISOString(),
        };

        setReceiptModalData({
          receipt_no: receiptInfo.receipt_no,
          date: receiptInfo.created_at || new Date().toISOString(),
          student_name: collectModalInvoice.student_name,
          roll_number: collectModalInvoice.roll_number,
          section_name: activeSection ? `${activeSection.class_level_display || activeSection.class_level} - ${activeSection.section_name}` : 'আমার শাখা',
          invoice_number: collectModalInvoice.invoice_number,
          month: collectModalInvoice.month,
          year: collectModalInvoice.year,
          amount_paid: amountPaid,
          previous_due: collectModalInvoice.due_amount,
          remaining_due: Math.max(0, parseFloat(collectModalInvoice.due_amount) - parseFloat(amountPaid)).toFixed(2),
          collector_name: user?.full_name || user?.username,
        });

        setCollectModalInvoice(null);
        setAmountPaid('');
        fetchFeeData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'টাকা জমা ব্যর্থ হয়েছে');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.roll_number?.toString().includes(searchTerm) ||
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // মেট্রিক্স হিসাব
  const totalUnpaidInvoices = filteredInvoices.length;
  const totalDueAmount = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.due_amount || 0), 0);
  
  // আজকের সংগৃহীত হ্যান্ডওভার হিসাব
  const verifiedHandoverTotal = handovers
    .filter((h) => h.status === 'VERIFIED')
    .reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);
  const pendingHandoverTotal = handovers
    .filter((h) => h.status === 'PENDING')
    .reduce((sum, h) => sum + parseFloat(h.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ১. হেডার ও ক্যাশ হ্যান্ডওভার বাটন */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2C59] to-[#1A365D] p-6 text-white shadow-soft flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase text-white">
              ইনচার্জ স্পেশাল
            </span>
            <h2 className="text-xl font-bold">শ্রেণি ইনচার্জ ফি আদায় ও ক্যাশ খতিয়ান</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            নিজ ক্লাসের শিক্ষার্থীদের ফি গ্রহণ করুন, ডিজিটাল মানি রসিদ প্রিন্ট করুন এবং সংগৃহীত ক্যাশ অ্যাকাউন্ট্যান্টের কাছে হস্তান্তর করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {mySections.length > 1 && (
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:bg-white/20"
            >
              <option value="" className="text-slate-800">সকল ইনচার্জ শাখা</option>
              {mySections.map((sec) => (
                <option key={sec.id} value={sec.id} className="text-slate-800">
                  {sec.class_level_display || sec.class_level} - {sec.group_display || sec.group} ({sec.section_name})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowHandoverModal(true)}
            disabled={!isClassIncharge}
            className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange-hover shrink-0 disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
            <span>ক্যাশ হস্তান্তর (Handover Cash)</span>
          </button>
        </div>
      </div>

      {!loading && !isClassIncharge && (
        <div className="rounded-3xl bg-amber-50 p-8 border border-amber-200 text-center">
          <Clock className="mx-auto h-12 w-12 text-amber-500 mb-2" />
          <h3 className="text-base font-bold text-amber-900">আপনি এখনও কোনো সক্রিয় শাখার শ্রেণি ইনচার্জ নন</h3>
          <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
            প্রিন্সিপাল ড্যাশবোর্ড থেকে আপনাকে কোনো শাখার শ্রেণি ইনচার্জ হিসেবে নিয়োগ দিলে এই পাতায় সেই শাখার শিক্ষার্থীদের বকেয়া ফি আদায় ও কালেকশন পরিচালনা করা যাবে।
          </p>
        </div>
      )}

      {/* ২. রিয়েল-টাইম সামারি কার্ডস */}
      {isClassIncharge && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold">বকেয়া ইনভয়েস</span>
              <FileText className="h-4 w-4 text-brand-orange" />
            </div>
            <h3 className="text-xl font-black text-brand-navy mt-1">{totalUnpaidInvoices} টি</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">ফি আদায়ের অপেক্ষায়</p>
          </div>

          <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-200 shadow-soft">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-bold">মোট বকেয়া ফি</span>
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-rose-800 mt-1">৳ {totalDueAmount.toLocaleString()}</h3>
            <p className="text-[10px] text-rose-600 mt-0.5">বর্তমান শাখাসমূহে মোট অপরিশোধিত</p>
          </div>

          <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200 shadow-soft">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold">হস্তান্তর প্রক্রিয়াধীন</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-amber-800 mt-1">৳ {pendingHandoverTotal.toLocaleString()}</h3>
            <p className="text-[10px] text-amber-600 mt-0.5">অ্যাকাউন্ট্যান্টের অনুমোদনের অপেক্ষায়</p>
          </div>

          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200 shadow-soft">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold">যাচাইকৃত হস্তান্তর</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-emerald-800 mt-1">৳ {verifiedHandoverTotal.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">অ্যাকাউন্টস ডিপার্টমেন্টে গৃহিত</p>
          </div>
        </div>
      )}

      {/* ৩. ফি কালেকশন সার্চ ও টেবিল */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-brand-navy">আমার ক্লাসের বকেয়া ইনভয়েসসমূহ</h3>
            <p className="text-xs text-slate-500">শিক্ষার্থী বা অভিভাবক ক্লাসরুমে নগদ টাকা দিলে সাথে সাথে জমা দিন</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="রোল, নাম বা ইনভয়েস লিখে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-600">কোনো বকেয়া ইনভয়েস পাওয়া যায়নি।</p>
            <p className="text-[11px] text-slate-400 mt-0.5">সব শিক্ষার্থী ফি পরিশোধ করেছে অথবা ফিল্টারে কোনো ম্যাচ নেই।</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3 text-left">রোল</th>
                  <th className="p-3 text-left">শিক্ষার্থীর নাম</th>
                  <th className="p-3">ইনভয়েস নং</th>
                  <th className="p-3">মাস/বছর</th>
                  <th className="p-3">মোট বিল</th>
                  <th className="p-3">পরিশোধিত</th>
                  <th className="p-3 text-rose-300">বর্তমান বকেয়া</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-left font-black text-brand-orange">{inv.roll_number}</td>
                    <td className="p-3 text-left font-bold text-brand-navy">
                      <div>{inv.student_name}</div>
                      <div className="text-[10px] text-slate-400">{inv.student_unique_id}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{inv.invoice_number}</td>
                    <td className="p-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold">
                        {inv.month}/{inv.year}
                      </span>
                    </td>
                    <td className="p-3">৳ {inv.total_amount}</td>
                    <td className="p-3 text-emerald-600">৳ {inv.paid_amount}</td>
                    <td className="p-3 font-black text-red-600">৳ {inv.due_amount}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setCollectModalInvoice(inv);
                          setAmountPaid(inv.due_amount);
                        }}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-sm transition inline-flex items-center space-x-1"
                      >
                        <DollarSign className="h-3 w-3" />
                        <span>ফি আদায় করুন</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ৪. পূর্ববর্তী ক্যাশ হ্যান্ডওভার হিস্ট্রি */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-brand-navy">হ্যান্ডওভার রেকর্ড (অ্যাকাউন্ট্যান্টকে বুঝিয়ে দেওয়া ক্যাশ)</h3>
            <p className="text-xs text-slate-500">আপনার প্রেরিত ক্যাশ হস্তান্তর আবেদন এবং হিসাবরক্ষণ কর্মকর্তার অনুমোদন রেকর্ড</p>
          </div>
          <button
            onClick={() => setShowHandoverModal(true)}
            className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1"
          >
            <span>নতুন হস্তান্তর</span>
            <Send className="h-3 w-3" />
          </button>
        </div>

        {handovers.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">কোনো পূর্ববর্তী হ্যান্ডওভার রেকর্ড নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {handovers.map((h) => (
              <div key={h.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-white transition shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-black text-emerald-600 text-base">৳ {h.amount}</span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    h.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {h.status_display}
                  </span>
                </div>
                <div className="mt-2 text-xs space-y-1">
                  <p className="text-slate-500">তারিখ: <strong className="text-slate-700">{h.handover_date}</strong></p>
                  {h.received_by_name && (
                    <p className="text-slate-500">গ্রহণকারী: <strong className="text-brand-navy">{h.received_by_name}</strong></p>
                  )}
                  <p className="text-slate-600 italic text-[11px] mt-1 bg-white p-2 rounded-lg border border-slate-100">
                    "{h.notes || 'কোনো মন্তব্য নেই'}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ৫. ফি কালেকশন পপ-আপ মডাল */}
      {collectModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">ফি গ্রহণ (ইনচার্জ কাউন্টার)</h3>
                  <p className="text-[10px] text-slate-400">ইনভয়েস: {collectModalInvoice.invoice_number}</p>
                </div>
              </div>
              <button 
                onClick={() => setCollectModalInvoice(null)} 
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-3 rounded-2xl bg-slate-50 p-3 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">শিক্ষার্থী:</span>
                <strong className="text-brand-navy">{collectModalInvoice.student_name}</strong>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-500">রোল নম্বর:</span>
                <strong className="text-brand-orange">{collectModalInvoice.roll_number}</strong>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-500">মোট বকেয়া:</span>
                <strong className="text-red-600 font-black">৳ {collectModalInvoice.due_amount}</strong>
              </div>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  জমার পরিমাণ (BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={collectModalInvoice.due_amount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-base font-black text-slate-900 focus:border-brand-orange focus:outline-none"
                  required
                />
              </div>

              {/* কুইক অ্যামাউন্ট বাটনস */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAmountPaid(collectModalInvoice.due_amount)}
                  className="flex-1 rounded-xl bg-slate-100 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  পুরো বকেয়া (৳{collectModalInvoice.due_amount})
                </button>
                {parseFloat(collectModalInvoice.due_amount) > 500 && (
                  <button
                    type="button"
                    onClick={() => setAmountPaid('500')}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    ৳৫০০
                  </button>
                )}
                {parseFloat(collectModalInvoice.due_amount) > 1000 && (
                  <button
                    type="button"
                    onClick={() => setAmountPaid('1000')}
                    className="rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    ৳১০০০
                  </button>
                )}
              </div>

              <div className="rounded-xl bg-blue-50/70 p-2.5 text-[11px] text-blue-700 flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>টাকা জমা সফল হলে সাথে সাথে মানি রসিদ তৈরি হবে।</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
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
                  className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition disabled:opacity-50"
                >
                  {submittingPayment ? 'জমা হচ্ছে...' : 'জমা নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ৬. ডিজিটাল মানি রসিদ (Digital Money Receipt Modal & Print) */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-premium border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-brand-navy">ডিজিটাল মানি রসিদ (Cash Receipt)</h3>
              </div>
              <button
                onClick={() => setReceiptModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* প্রিন্টযোগ্য রসিদ কন্টেন্ট */}
            <div ref={receiptPrintRef} className="my-4 rounded-2xl border-2 border-dashed border-slate-200 p-5 bg-slate-50/50 space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-lg font-black text-[#0F2C59] tracking-wider uppercase">STARLIGHT COLLEGE</h2>
                <p className="text-[10px] text-slate-500 font-medium">SYLHET CAMPUS | OFFICIAL CASH RECEIPT</p>
                <div className="mt-1 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-black text-emerald-800">
                  রসিদ নং: {receiptModalData.receipt_no}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">শিক্ষার্থীর নাম</span>
                  <strong className="text-slate-800">{receiptModalData.student_name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">রোল ও শাখা</span>
                  <strong className="text-brand-orange">{receiptModalData.roll_number} | {receiptModalData.section_name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ইনভয়েস ও মাস</span>
                  <span className="text-slate-700 font-mono text-[11px]">{receiptModalData.invoice_number} ({receiptModalData.month}/{receiptModalData.year})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">তারিখ ও সময়</span>
                  <span className="text-slate-700">{new Date(receiptModalData.date).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">আদায়কৃত নগদ ফি</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">পেমেন্ট মেথড: ক্যাশ (ইনচার্জ কাউন্টার)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-600">৳ {receiptModalData.amount_paid}</span>
                  {parseFloat(receiptModalData.remaining_due) > 0 && (
                    <div className="text-[10px] text-red-500 font-bold">অবশিষ্ট বকেয়া: ৳{receiptModalData.remaining_due}</div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-between items-end border-t border-slate-200 text-[10px] text-slate-500">
                <div>
                  <p>আদায়কারী: <strong>{receiptModalData.collector_name}</strong></p>
                  <p>পদবি: শ্রেণি ইনচার্জ</p>
                </div>
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 pb-1 mb-1"></div>
                  <span>শ্রেণি ইনচার্জের স্বাক্ষর</span>
                </div>
              </div>
            </div>

            {/* অ্যাকশন বাটনসমূহ */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptModalData(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center space-x-1.5 rounded-xl bg-[#0F2C59] px-5 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition"
              >
                <Printer className="h-4 w-4" />
                <span>রসিদ প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ক্যাশ হ্যান্ডওভার মডাল */}
      <CashHandoverModal
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        totalCollectedToday={0}
        onSuccess={fetchFeeData}
      />
    </div>
  );
};

export default InChargeFees;