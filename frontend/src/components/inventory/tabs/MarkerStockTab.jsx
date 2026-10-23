import React, { useState } from 'react';
import { updateMarkerStockApi } from '../../../api/principal';
import { 
  PenTool, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  PackageCheck, 
  RefreshCw, 
  X, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react';
import { toast } from 'sonner';

const COLOR_CONFIG = {
  BLACK: {
    name: 'কালো (Black)',
    border: 'border-slate-300 dark:border-slate-700',
    headerBg: 'bg-slate-900 text-white',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    accent: 'text-slate-800 dark:text-slate-100',
    dot: 'bg-black',
  },
  BLUE: {
    name: 'নীল (Blue)',
    border: 'border-blue-200 dark:border-blue-900/60',
    headerBg: 'bg-blue-600 text-white',
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    accent: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-600',
  },
  RED: {
    name: 'লাল (Red)',
    border: 'border-rose-200 dark:border-rose-900/60',
    headerBg: 'bg-rose-600 text-white',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    accent: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-600',
  },
  GREEN: {
    name: 'সবুজ (Green)',
    border: 'border-emerald-200 dark:border-emerald-900/60',
    headerBg: 'bg-emerald-600 text-white',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    accent: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-600',
  },
};

const LOW_STOCK_THRESHOLD = 5;

const MarkerStockTab = ({ markerStocks = [], isPrincipal = false, onRefresh }) => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [updateMode, setUpdateMode] = useState('add'); // 'add' | 'set'
  const [quantityInput, setQuantityInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openUpdateModal = (stock) => {
    setSelectedStock(stock);
    setUpdateMode('add');
    setQuantityInput('');
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantityInput, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('সঠিক সংখ্যা প্রদান করুন');
      return;
    }

    setSubmitting(true);
    try {
      let newAvailable = selectedStock.available_stock;
      let newTotal = selectedStock.total_stock;

      if (updateMode === 'add') {
        newAvailable += qty;
        newTotal += qty;
      } else {
        newAvailable = qty;
        if (qty > newTotal) newTotal = qty;
      }

      await updateMarkerStockApi(selectedStock.id, {
        available_stock: newAvailable,
        total_stock: newTotal,
      });

      toast.success(`${COLOR_CONFIG[selectedStock.color]?.name || 'মার্কার'} সেন্ট্রাল স্টক আপডেট হয়েছে`);
      setSelectedStock(null);
      onRefresh?.();
    } catch (err) {
      toast.error('স্টক আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* সেন্ট্রাল ইনভেন্টরি হেডার নির্দেশনা */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-brand-orange" />
            সেন্ট্রাল হোয়াইটবোর্ড মার্কার স্টক রেজিস্টার
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            শিক্ষক মার্কার বুঝে পেলে স্বয়ংক্রিয়ভাবে স্টক হ্রাস পাবে। যেকোনো রঙে স্টকের পরিমাণ {LOW_STOCK_THRESHOLD} বা তার নিচে নামলে সতর্কবার্তা প্রদর্শিত হবে।
          </p>
        </div>
      </div>

      {/* ৪ রঙের স্টক কার্ড গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {markerStocks.map((stock) => {
          const cfg = COLOR_CONFIG[stock.color] || COLOR_CONFIG.BLACK;
          const isLowStock = stock.available_stock <= LOW_STOCK_THRESHOLD;

          return (
            <div
              key={stock.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border ${cfg.border} shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md relative`}
            >
              {isLowStock && (
                <div className="bg-rose-500 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-center gap-1.5 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  স্টক দ্রুত ফুরিয়ে আসছে!
                </div>
              )}

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    {stock.color_display || cfg.name}
                  </span>
                  <PenTool className={`w-4 h-4 ${cfg.accent}`} />
                </div>

                <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-slate-100 flex items-baseline gap-1">
                    {stock.available_stock}
                    <span className="text-xs font-semibold text-slate-400">টি অবশিষ্ট</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>মোট কেনা: <strong>{stock.total_stock} টি</strong></span>
                    <span>বিতরণকৃত: <strong>{Math.max(0, stock.total_stock - stock.available_stock)} টি</strong></span>
                  </div>
                </div>
              </div>

              {isPrincipal && (
                <div className="p-4 pt-0">
                  <button
                    onClick={() => openUpdateModal(stock)}
                    className="min-h-[44px] w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> স্টক সমন্বয় / যোগ করুন
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* স্টক সমন্বয় মডাল */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-brand-orange" />
                {COLOR_CONFIG[selectedStock.color]?.name || selectedStock.color} মার্কার স্টক
              </h3>
              <button 
                onClick={() => setSelectedStock(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              বর্তমানে স্টকে আছে: <strong>{selectedStock.available_stock} টি</strong> (মোট কেনা: {selectedStock.total_stock} টি)।
            </p>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUpdateMode('add')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    updateMode === 'add' ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-sm' : 'text-slate-500'
                  }`}
                >
                  নতুন স্টক যোগ (+Qty)
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateMode('set')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    updateMode === 'set' ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-sm' : 'text-slate-500'
                  }`}
                >
                  সরাসরি স্টক নির্ধারণ (Set)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {updateMode === 'add' ? 'কতটি নতুন মার্কার যোগ করবেন?' : 'স্টকে থাকা চূড়ান্ত পরিমাণ'}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="যেমন: 10 বা 20"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-brand-orange"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  স্টক সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkerStockTab;
