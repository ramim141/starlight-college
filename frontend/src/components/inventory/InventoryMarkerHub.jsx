import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCollegeAssetsApi, 
  getAssetCategoriesApi, 
  getMarkerStocksApi, 
  getMarkerRequestsApi 
} from '../../api/principal';
import api from '../../api/client';
import CollegeAssetsTab from './tabs/CollegeAssetsTab';
import MarkerStockTab from './tabs/MarkerStockTab';
import MarkerRequestsTab from './tabs/MarkerRequestsTab';
import MarkerUsageReportTab from './tabs/MarkerUsageReportTab';
import { 
  Package, 
  PenTool, 
  Plus, 
  BarChart2, 
  Layers, 
  RefreshCw, 
  X, 
  Loader2, 
  Send 
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * InventoryMarkerHub - ক্যাম্পাস সম্পদ ও মার্কার ইনভেন্টরি ম্যানেজমেন্ট হাব
 * প্রিন্সিপাল, শিক্ষক এবং অ্যাডমিন স্টাফদের জন্য মাল্টি-রোল সাপোর্টেড।
 */
const InventoryMarkerHub = ({ overrideRole = null }) => {
  const { isPrincipal: authIsPrincipal, isTeacher: authIsTeacher } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;

  const [activeTab, setActiveTab] = useState('assets'); // 'assets' | 'stock' | 'requests' | 'usage'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // মূল ডেটা স্টেট
  const [assets, setAssets] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [markerStocks, setMarkerStocks] = useState([]);
  const [markerRequests, setMarkerRequests] = useState([]);

  // শিক্ষকের মার্কার আবেদন মডাল
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherRequest, setTeacherRequest] = useState({
    marker_color: 'BLACK',
    quantity: 1,
    purpose: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchInventoryData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [assetsRes, catsRes, stocksRes, reqsRes] = await Promise.allSettled([
        getCollegeAssetsApi(),
        getAssetCategoriesApi(),
        getMarkerStocksApi(),
        getMarkerRequestsApi(),
      ]);

      if (assetsRes.status === 'fulfilled') {
        const aList = assetsRes.value.results || assetsRes.value;
        setAssets(Array.isArray(aList) ? aList : []);
      }
      if (catsRes.status === 'fulfilled') {
        const cList = catsRes.value.results || catsRes.value;
        setAssetCategories(Array.isArray(cList) ? cList : []);
      }
      if (stocksRes.status === 'fulfilled') {
        const sList = stocksRes.value.results || stocksRes.value;
        setMarkerStocks(Array.isArray(sList) ? sList : []);
      }
      if (reqsRes.status === 'fulfilled') {
        const rList = reqsRes.value.results || reqsRes.value;
        setMarkerRequests(Array.isArray(rList) ? rList : []);
      }
    } catch (e) {
      toast.error('ইনভেন্টরি তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // শিক্ষকের মার্কার আবেদন সাবমিট
  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const res = await api.post('operations/markers/', {
        marker_color: teacherRequest.marker_color,
        quantity: parseInt(teacherRequest.quantity, 10) || 1,
        purpose: teacherRequest.purpose.trim() || 'শ্রেণিকক্ষে পাঠদানের জন্য',
      });
      if (res.data.id || res.data.success) {
        toast.success('মার্কারের আবেদন সফলভাবে পাঠানো হয়েছে');
        setShowTeacherModal(false);
        setTeacherRequest({ marker_color: 'BLACK', quantity: 1, purpose: '' });
        fetchInventoryData();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'আবেদন জমা দিতে ব্যর্থ হয়েছে');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার ব্যানার */}
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">কলেজ সম্পদ ও মার্কার ইনভেন্টরি</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              ক্যাম্পাস ফার্নিচার, ল্যাব সরঞ্জাম এবং সেন্ট্রাল মার্কার স্টক ট্র্যাকিং ও বিতরণ ব্যবস্থা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInventoryData(true)}
            disabled={refreshing}
            title="রিফ্রেশ করুন"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {isTeacher && (
            <button
              onClick={() => setShowTeacherModal(true)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> মার্কার আবেদন
            </button>
          )}
        </div>
      </div>

      {/* ট্যাব নেভিগেশন বার */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('assets')}
          className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'assets'
              ? 'bg-brand-orange text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          ফার্নিচার ও সম্পদ ({assets.length})
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'stock'
              ? 'bg-brand-orange text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PenTool className="w-4 h-4" />
          সেন্ট্রাল মার্কার স্টক
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'requests'
              ? 'bg-brand-orange text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          মার্কার রিকোয়েস্ট ও বিতরণ ({markerRequests.length})
        </button>

        {isPrincipal && (
          <button
            onClick={() => setActiveTab('usage')}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'usage'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            মাসিক ব্যবহার রিপোর্ট
          </button>
        )}
      </div>

      {/* কন্টেন্ট লোডিং শিমার ও ট্যাব রেন্ডার */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      ) : (
        <>
          {activeTab === 'assets' && (
            <div data-tab-panel="true"><CollegeAssetsTab
              assets={assets}
              assetCategories={assetCategories}
              isPrincipal={isPrincipal}
              onRefresh={() => fetchInventoryData(true)}
            /></div>)}

          {activeTab === 'stock' && (
            <div data-tab-panel="true"><MarkerStockTab
              markerStocks={markerStocks}
              isPrincipal={isPrincipal}
              onRefresh={() => fetchInventoryData(true)}
            /></div>)}

          {activeTab === 'requests' && (
            <div data-tab-panel="true"><MarkerRequestsTab
              markerRequests={markerRequests}
              isPrincipal={isPrincipal}
              isTeacher={isTeacher}
              onRefresh={() => fetchInventoryData(true)}
            /></div>)}

          {activeTab === 'usage' && isPrincipal && (
            <div data-tab-panel="true"><MarkerUsageReportTab /></div>)}
        </>
      )}

      {/* শিক্ষকের মার্কার আবেদন মডাল */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-brand-orange" />
                নতুন মার্কারের আবেদন
              </h3>
              <button 
                onClick={() => setShowTeacherModal(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTeacherSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">মার্কারের রং</label>
                <select
                  value={teacherRequest.marker_color}
                  onChange={(e) => setTeacherRequest({ ...teacherRequest, marker_color: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="BLACK">কালো (Black)</option>
                  <option value="BLUE">নীল (Blue)</option>
                  <option value="RED">লাল (Red)</option>
                  <option value="GREEN">সবুজ (Green)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">পরিমাণ (১ থেকে ৫ টি)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={teacherRequest.quantity}
                  onChange={(e) => setTeacherRequest({ ...teacherRequest, quantity: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">আবেদনের কারণ / বিষয়</label>
                <input
                  type="text"
                  placeholder="যেমন: একাদশ রসায়ন ব্যবহারিক ক্লাস..."
                  value={teacherRequest.purpose}
                  onChange={(e) => setTeacherRequest({ ...teacherRequest, purpose: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingRequest && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  আবেদন পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryMarkerHub;





