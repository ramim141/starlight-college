import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getCollegeAssetsApi, 
  createCollegeAssetApi, 
  getAssetCategoriesApi,
  getMarkerStocksApi,
  updateMarkerStockApi,
  getMarkerRequestsApi,
  issueMarkerToTeacherApi,
  getMarkerMonthlyUsageApi
} from '../../api/principal';
import { acknowledgeMarkerApi } from '../../api/teacher';
import api from '../../api/client';
import { 
  Package, 
  PenTool, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Layers, 
  User, 
  Check
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * InventoryMarkerHub - বহু-ব্যবহারযোগ্য ক্যাম্পাস সম্পদ ও মার্কার ইনভেন্টরি হাব
 * এটি প্রিন্সিপাল, শিক্ষক এবং অ্যাডমিন স্টাফ যে কারও পোর্টালে সরাসরি ব্যবহৃত হতে পারে।
 */
const InventoryMarkerHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isTeacher: authIsTeacher } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;

  const [activeTab, setActiveTab] = useState('assets'); // 'assets' | 'markers'
  const [loading, setLoading] = useState(true);

  // ১. অ্যাসেট স্টেট
  const [assets, setAssets] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: '',
    room_number: '',
    quantity: 1,
    condition: 'GOOD',
    purchase_cost: '',
  });

  // ২. মার্কার স্টক স্টেট
  const [markerStocks, setMarkerStocks] = useState([]);
  const [markerRequests, setMarkerRequests] = useState([]);
  const [markerUsage, setMarkerUsage] = useState([]);
  const [selectedStockForEdit, setSelectedStockForEdit] = useState(null);
  const [editStockAmount, setEditStockAmount] = useState('');

  // শিক্ষকের মার্কার আবেদন মডাল
  const [showTeacherMarkerModal, setShowTeacherMarkerModal] = useState(false);
  const [newMarkerRequest, setNewMarkerRequest] = useState({
    marker_color: 'BLACK',
    quantity: 1,
    remarks: '',
  });

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'assets') {
        const [assetRes, catRes] = await Promise.allSettled([
          getCollegeAssetsApi(),
          getAssetCategoriesApi()
        ]);
        if (assetRes.status === 'fulfilled') {
          const aList = assetRes.value.results || assetRes.value;
          setAssets(Array.isArray(aList) ? aList : []);
        }
        if (catRes.status === 'fulfilled') {
          const cList = catRes.value.results || catRes.value;
          setAssetCategories(Array.isArray(cList) ? cList : []);
        }
      } else {
        const [stockRes, reqRes] = await Promise.allSettled([
          getMarkerStocksApi(),
          getMarkerRequestsApi()
        ]);
        if (stockRes.status === 'fulfilled') {
          const sList = stockRes.value.results || stockRes.value;
          setMarkerStocks(Array.isArray(sList) ? sList : []);
        }
        if (reqRes.status === 'fulfilled') {
          const rList = reqRes.value.results || reqRes.value;
          setMarkerRequests(Array.isArray(rList) ? rList : []);
        }
        if (isPrincipal) {
          const usageRes = await getMarkerMonthlyUsageApi(new Date().getMonth() + 1, new Date().getFullYear());
          if (usageRes.success) setMarkerUsage(usageRes.data || []);
        }
      }
    } catch (e) {
      toast.error('ইনভেন্টরি তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [activeTab]);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      const res = await createCollegeAssetApi(newAsset);
      if (res.id || res.success) {
        toast.success('নতুন সম্পদ সফলভাবে যুক্ত হয়েছে');
        setShowAddAssetModal(false);
        setNewAsset({ name: '', category: '', room_number: '', quantity: 1, condition: 'GOOD', purchase_cost: '' });
        fetchInventoryData();
      }
    } catch (err) {
      toast.error('সম্পদ যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  // অধ্যক্ষ কর্তৃক মার্কার ইস্যু
  const handleIssueMarker = async (id) => {
    try {
      const res = await issueMarkerToTeacherApi(id, 'অধ্যক্ষ কর্তৃক মার্কার ইস্যু অনুমোদিত');
      if (res.success) {
        toast.success(res.message);
        fetchInventoryData();
      }
    } catch (err) {
      toast.error('মার্কার ইস্যু ব্যর্থ হয়েছে');
    }
  };

  // শিক্ষক কর্তৃক মার্কার বুঝে নেওয়া (Acknowledge)
  const handleAcknowledgeMarker = async (id) => {
    try {
      const res = await acknowledgeMarkerApi(id);
      if (res.success) {
        toast.success(res.message);
        fetchInventoryData();
      }
    } catch (err) {
      toast.error('মার্কার রিসিট কনফার্মেশন ব্যর্থ হয়েছে');
    }
  };

  // শিক্ষক কর্তৃক নতুন মার্কার আবেদন
  const handleTeacherMarkerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('operations/markers/', newMarkerRequest);
      if (res.data.id || res.data.success) {
        toast.success('মার্কারের আবেদন সফলভাবে পাঠানো হয়েছে');
        setShowTeacherMarkerModal(false);
        setNewMarkerRequest({ marker_color: 'BLACK', quantity: 1, remarks: '' });
        fetchInventoryData();
      }
    } catch (err) {
      toast.error('আবেদন জমা ব্যর্থ হয়েছে');
    }
  };

  // অধ্যক্ষ কর্তৃক সেন্ট্রাল স্টক এডিট
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      const res = await updateMarkerStockApi(selectedStockForEdit.id, {
        available_stock: parseInt(editStockAmount, 10)
      });
      if (res.id || res.success) {
        toast.success('মার্কার সেন্ট্রাল স্টক আপডেট হয়েছে');
        setSelectedStockForEdit(null);
        fetchInventoryData();
      }
    } catch (err) {
      toast.error('স্টক আপডেট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0F2C59] p-6 rounded-2xl border border-white/10 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">কলেজ সম্পদ ও মার্কার ইনভেন্টরি</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              ক্লাসরুমের ফার্নিচার, ল্যাব সরঞ্জাম এবং সেন্ট্রাল মার্কার স্টক বিতরণ ও ব্যবহার পর্যবেক্ষণ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assets' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ফার্নিচার ও অ্যাসেট
            </button>
            <button
              onClick={() => setActiveTab('markers')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'markers' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              মার্কার রেজিস্টার
            </button>
          </div>

          {isPrincipal && activeTab === 'assets' && (
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> সম্পদ এন্ট্রি
            </button>
          )}

          {isTeacher && activeTab === 'markers' && (
            <button
              onClick={() => setShowTeacherMarkerModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> মার্কার আবেদন
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'assets' ? (
        /* ================= ১. সম্পদ ও ফার্নিচার তালিকা ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              কলেজের সকল সম্পদ ও ল্যাব সামগ্রী ({assets.length} টি আইটেম)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">সম্পদের নাম ও ট্যাগ</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">রুম নং / স্থান</th>
                  <th className="py-3 px-4">পরিমাণ</th>
                  <th className="py-3 px-4">কন্ডিশন / অবস্থা</th>
                  <th className="py-3 px-4">মূল্য (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{asset.name}</span>
                      <span className="block text-xs font-mono text-slate-400">{asset.asset_tag || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {asset.category_name || 'জেনারেল'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      রুম {asset.room_number || 'সেন্ট্রাল'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {asset.quantity} টি
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        asset.condition === 'GOOD' || asset.condition === 'NEW'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                      {asset.purchase_cost ? `৳ ${parseFloat(asset.purchase_cost).toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= ২. সেন্ট্রাল মার্কার স্টক রেজিস্টার ================= */
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {markerStocks.map((stock) => (
              <div
                key={stock.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">{stock.color_display || stock.color} মার্কার</span>
                    <PenTool className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-slate-800 dark:text-slate-100">
                    {stock.available_stock} <span className="text-xs text-slate-400 font-normal">টি স্টকে আছে</span>
                  </div>
                </div>
                {isPrincipal && (
                  <button
                    onClick={() => {
                      setSelectedStockForEdit(stock);
                      setEditStockAmount(stock.available_stock);
                    }}
                    className="mt-3 text-xs text-brand-orange hover:underline font-semibold text-left"
                  >
                    স্টক আপডেট করুন →
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isPrincipal ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm`}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {isPrincipal ? 'শিক্ষকদের মার্কার রিকোয়েস্ট ও বিতরণ ট্র্যাকার' : 'আমার মার্কার রিকোয়েস্টসমূহ'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="py-3 px-4">শিক্ষক</th>
                      <th className="py-3 px-4">রং</th>
                      <th className="py-3 px-4">পরিমাণ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {markerRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{req.teacher_name}</td>
                        <td className="py-3 px-4 text-xs font-semibold">{req.marker_color_display || req.marker_color}</td>
                        <td className="py-3 px-4 font-mono">{req.quantity} টি</td>
                        <td className="py-3 px-4">
                          {req.is_acknowledged ? (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500">বুঝে পেয়েছেন</span>
                          ) : req.status === 'ISSUED' ? (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-500">ইস্যুকৃত</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500">আবেদনকৃত</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPrincipal && req.status === 'REQUESTED' ? (
                            <button
                              onClick={() => handleIssueMarker(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              ইস্যু করুন
                            </button>
                          ) : isTeacher && req.status === 'ISSUED' && !req.is_acknowledged ? (
                            <button
                              onClick={() => handleAcknowledgeMarker(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> বুঝে পেয়েছি
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">সম্পন্ন</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* অধ্যক্ষের জন্য মাসিক ব্যবহার রিপোর্ট */}
            {isPrincipal && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-orange" />
                  এই মাসের শিক্ষক মার্কার ব্যবহার
                </h3>
                <div className="space-y-3">
                  {markerUsage.length === 0 ? (
                    <p className="text-xs text-slate-400">কোনো মার্কার ব্যবহার রেকর্ড নেই।</p>
                  ) : (
                    markerUsage.map((u, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{u.teacher_name}</span>
                          <span className="text-slate-400 block font-mono">{u.employee_id || 'শিক্ষক'}</span>
                        </div>
                        <span className="font-bold text-brand-orange">{u.total_markers_used} টি মার্কার</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* নতুন অ্যাসেট যোগ মডাল */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-orange" />
              নতুন সম্পদ বা ফার্নিচার এন্ট্রি
            </h3>
            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">সম্পদের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: স্টুডেন্ট বেঞ্চ, হোয়াইটবোর্ড, কম্পিউটার"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {assetCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">রুম নং</label>
                  <input
                    type="text"
                    required
                    placeholder="১০১, ল্যাব-১"
                    value={newAsset.room_number}
                    onChange={(e) => setNewAsset({ ...newAsset, room_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">কন্ডিশন</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <option value="NEW">নতুন (NEW)</option>
                    <option value="GOOD">ভালো (GOOD)</option>
                    <option value="DAMAGED">ত্রুটিপূর্ণ (DAMAGED)</option>
                    <option value="UNDER_REPAIR">মেরামত চলছে</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* শিক্ষকের মার্কার আবেদন মডাল */}
      {showTeacherMarkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-brand-orange" />
              মার্কারের জন্য আবেদন
            </h3>
            <form onSubmit={handleTeacherMarkerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">মার্কারের রং</label>
                <select
                  value={newMarkerRequest.marker_color}
                  onChange={(e) => setNewMarkerRequest({ ...newMarkerRequest, marker_color: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="BLACK">কালো (Black)</option>
                  <option value="BLUE">নীল (Blue)</option>
                  <option value="RED">লাল (Red)</option>
                  <option value="GREEN">সবুজ (Green)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">পরিমাণ (টি)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={newMarkerRequest.quantity}
                  onChange={(e) => setNewMarkerRequest({ ...newMarkerRequest, quantity: parseInt(e.target.value, 10) })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: ক্লাসের জন্য প্রয়োজন..."
                  value={newMarkerRequest.remarks}
                  onChange={(e) => setNewMarkerRequest({ ...newMarkerRequest, remarks: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherMarkerModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  আবেদন পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* মার্কার স্টক এডিট মডাল (প্রিন্সিপাল) */}
      {selectedStockForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-brand-orange" />
              {selectedStockForEdit.color_display || selectedStockForEdit.color} মার্কার সেন্ট্রাল স্টক
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">স্টকে থাকা মোট পরিমাণ</label>
                <input
                  type="number"
                  required
                  value={editStockAmount}
                  onChange={(e) => setEditStockAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-brand-orange"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStockForEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
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

export default InventoryMarkerHub;
