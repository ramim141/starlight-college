import React, { useState, useEffect } from 'react';
import { getExpensesListApi, verifyExpenseApi } from '../../api/adminFinance';
import { CreditCard, CheckCircle2, XCircle, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      const res = await getExpensesListApi();
      const list = res.results || res;
      setExpenses(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('খরচের ভাউচার লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      const res = await verifyExpenseApi(id, status);
      if (res.success) {
        toast.success(res.message);
        fetchExpenses();
      }
    } catch (err) {
      toast.error('ভাউচার অডিট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-brand-navy">খরচের ভাউচার অডিট ও অনুমোদন</h2>
        <p className="text-xs text-slate-500">অ্যাকাউন্ট্যান্টের এন্ট্রি করা ভাউচার রসিদ যাচাই করে অনুমোদন (Approve) করুন।</p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-slate-100">
          <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-700">কোনো ভাউচার পাওয়া যায়নি</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.map((exp) => (
            <div key={exp.id} className="rounded-3xl bg-white p-5 border border-slate-200/80 shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black text-brand-navy">{exp.voucher_no}</span>
                  <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-extrabold ${
                    exp.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    exp.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exp.status_display}
                  </span>
                </div>

                <div className="my-3 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                  <p className="text-xs text-slate-500">খাত: <strong className="text-brand-navy">{exp.category_name}</strong></p>
                  <p className="text-xs text-slate-500">তারিখ: {exp.expense_date}</p>
                  <h3 className="text-xl font-black text-red-600 mt-2">৳ {exp.amount}</h3>
                  {exp.description && <p className="text-xs text-slate-600 mt-1 italic">"{exp.description}"</p>}
                </div>
              </div>

              {exp.status === 'PENDING' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleVerify(exp.id, 'APPROVED')}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                  >
                    অনুমোদন (Approve)
                  </button>
                  <button
                    onClick={() => handleVerify(exp.id, 'REJECTED')}
                    className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                  >
                    বাতিল
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrincipalExpenses;