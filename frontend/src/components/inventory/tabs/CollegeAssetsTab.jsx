import React, { useState, useMemo } from 'react';
import { 
  createCollegeAssetApi, 
  updateCollegeAssetApi, 
  deleteCollegeAssetApi 
} from '../../../api/principal';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Archive, 
  Calendar, 
  MapPin, 
  Tag, 
  DollarSign, 
  X, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const CONDITION_MAP = {
  GOOD: { label: 'ভালো/সচল', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
  DAMAGED: { label: 'নষ্ট/ভাঙা', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400', icon: AlertTriangle },
  UNDER_REPAIR: { label: 'মেরামতাধীন', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400', icon: Wrench },
  DISPOSED: { label: 'পরিত্যক্ত', color: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400', icon: Archive },
};

const CollegeAssetsTab = ({ assets = [], assetCategories = [], isPrincipal = false, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    asset_code: '',
    category: '',
    quantity: 1,
    room_or_location: '',
    condition: 'GOOD',
    purchase_date: '',
    unit_cost: '',
    remarks: '',
  });

  // ফিল্টার তালিকা
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        (asset.name && asset.name.toLowerCase().includes(q)) ||
        (asset.asset_code && asset.asset_code.toLowerCase().includes(q)) ||
        (asset.room_or_location && asset.room_or_location.toLowerCase().includes(q));

      const matchCategory = !categoryFilter || String(asset.category) === String(categoryFilter);
      const matchCondition = !conditionFilter || asset.condition === conditionFilter;
      const matchRoom = !roomFilter || 
        (asset.room_or_location && asset.room_or_location.toLowerCase().includes(roomFilter.toLowerCase()));

      return matchSearch && matchCategory && matchCondition && matchRoom;
    });
  }, [assets, searchQuery, categoryFilter, conditionFilter, roomFilter]);

  // পরিসংখ্যান
  const stats = useMemo(() => {
    let totalQty = 0;
    let totalVal = 0;
    let damagedCount = 0;

    filteredAssets.forEach((a) => {
      const qty = parseInt(a.quantity, 10) || 0;
      const cost = parseFloat(a.unit_cost) || 0;
      totalQty += qty;
      totalVal += qty * cost;
      if (a.condition === 'DAMAGED' || a.condition === 'UNDER_REPAIR') {
        damagedCount += qty;
      }
    });

    return { totalQty, totalVal, damagedCount };
  }, [filteredAssets]);

  const openCreateModal = () => {
    setFormData({
      name: '',
      asset_code: `AST-${Date.now().toString().slice(-6)}`,
      category: assetCategories[0]?.id || '',
      quantity: 1,
      room_or_location: '',
      condition: 'GOOD',
      purchase_date: new Date().toISOString().split('T')[0],
      unit_cost: '',
      remarks: '',
    });
    setModalMode('create');
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name || '',
      asset_code: asset.asset_code || '',
      category: asset.category || assetCategories[0]?.id || '',
      quantity: asset.quantity || 1,
      room_or_location: asset.room_or_location || '',
      condition: asset.condition || 'GOOD',
      purchase_date: asset.purchase_date || '',
      unit_cost: asset.unit_cost || '',
      remarks: asset.remarks || '',
    });
    setModalMode('edit');
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.asset_code.trim()) {
      toast.error('সম্পদের নাম ও কোড প্রদান করা আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        asset_code: formData.asset_code.trim(),
        category: formData.category ? parseInt(formData.category, 10) : null,
        quantity: parseInt(formData.quantity, 10) || 1,
        room_or_location: formData.room_or_location.trim(),
        condition: formData.condition,
        purchase_date: formData.purchase_date || null,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
        remarks: formData.remarks.trim(),
      };

      if (modalMode === 'create') {
        await createCollegeAssetApi(payload);
        toast.success('নতুন সম্পদ সফলভাবে যুক্ত হয়েছে');
      } else {
        await updateCollegeAssetApi(editingAsset.id, payload);
        toast.success('সম্পদের তথ্য সফলভাবে আপডেট হয়েছে');
      }

      setModalMode(null);
      setEditingAsset(null);
      onRefresh?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'সম্পদের তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    setSubmitting(true);
    try {
      await deleteCollegeAssetApi(deletingAsset.id);
      toast.success('সম্পদ তালিকা থেকে অপসারিত হয়েছে');
      setDeletingAsset(null);
      onRefresh?.();
    } catch (err) {
      toast.error('সম্পদ মুছতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* পরিসংখ্যান কার্ড */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">মোট তালিকাভুক্ত আইটেম</span>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {filteredAssets.length} <span className="text-xs font-normal text-slate-400">প্রকার</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">মোট সামগ্রী (পরিমাণ)</span>
          <div className="text-xl md:text-2xl font-black text-brand-orange mt-1">
            {stats.totalQty} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">মোট বর্তমান মূল্যমান</span>
          <div className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ৳ {stats.totalVal.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">ত্রুটিপূর্ণ / মেরামত প্রয়োজন</span>
          <div className={`text-xl md:text-2xl font-black mt-1 ${stats.damagedCount > 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
            {stats.damagedCount} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
        </div>
      </div>

      {/* সার্চ ও ফিল্টার টুলবার */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="সম্পদের নাম, কোড বা রুম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-brand-orange"
            />
          </div>

          {isPrincipal && (
            <button
              onClick={openCreateModal}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> নতুন সম্পদ এন্ট্রি
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="">সকল ক্যাটাগরি</option>
            {assetCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="">সকল অবস্থা (Condition)</option>
            <option value="GOOD">ভালো/সচল (Good)</option>
            <option value="DAMAGED">নষ্ট/ভাঙা (Damaged)</option>
            <option value="UNDER_REPAIR">মেরামতাধীন (Under Repair)</option>
            <option value="DISPOSED">পরিত্যক্ত (Disposed)</option>
          </select>

          <input
            type="text"
            placeholder="রুম ফিল্টার (যেমন: 302, Lab)"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          />
        </div>
      </div>

      {/* তালিকা: ডেস্কটপে টেবিল, মোবাইলে কার্ড */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো সম্পদ পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-400 mt-1">অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
        </div>
      ) : (
        <>
          {/* মোবাইল কার্ড ভিউ */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredAssets.map((asset) => {
              const cond = CONDITION_MAP[asset.condition] || CONDITION_MAP.GOOD;
              const CondIcon = cond.icon;
              return (
                <div 
                  key={asset.id} 
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{asset.name}</h4>
                      <span className="font-mono text-xs text-slate-400 block mt-0.5">{asset.asset_code}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cond.color}`}>
                      <CondIcon className="w-3 h-3" />
                      {cond.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div><span className="text-slate-400">রুম:</span> <strong>{asset.room_or_location || 'অনির্দিষ্ট'}</strong></div>
                    <div><span className="text-slate-400">পরিমাণ:</span> <strong>{asset.quantity} টি</strong></div>
                    <div><span className="text-slate-400">একক মূল্য:</span> <strong>৳ {parseFloat(asset.unit_cost || 0).toLocaleString('en-IN')}</strong></div>
                    <div><span className="text-slate-400">মোট মূল্য:</span> <strong>৳ {(asset.quantity * (asset.unit_cost || 0)).toLocaleString('en-IN')}</strong></div>
                  </div>

                  {isPrincipal && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => openEditModal(asset)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-semibold text-slate-600 hover:text-brand-orange px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" /> এডিট
                      </button>
                      <button
                        onClick={() => setDeletingAsset(asset)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> মুছুন
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ডেস্কটপ টেবিল ভিউ */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-bold sticky top-0">
                  <tr>
                    <th className="py-3 px-4">কোড ও নাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">রুম / অবস্থান</th>
                    <th className="py-3 px-4">পরিমাণ</th>
                    <th className="py-3 px-4">একক ও মোট মূল্য</th>
                    <th className="py-3 px-4">অবস্থা</th>
                    <th className="py-3 px-4">ক্রয়ের তারিখ</th>
                    {isPrincipal && <th className="py-3 px-4 text-right">অ্যাকশন</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssets.map((asset) => {
                    const cond = CONDITION_MAP[asset.condition] || CONDITION_MAP.GOOD;
                    const CondIcon = cond.icon;
                    const totalVal = (asset.quantity || 0) * (asset.unit_cost || 0);

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">{asset.name}</span>
                          <span className="font-mono text-xs text-slate-400">{asset.asset_code}</span>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {asset.category_name || 'সাধারণ'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {asset.room_or_location || 'অনির্দিষ্ট'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {asset.quantity} টি
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">
                          <div>৳ {parseFloat(asset.unit_cost || 0).toLocaleString('en-IN')}</div>
                          <span className="text-[11px] text-slate-400">মোট ৳ {totalVal.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cond.color}`}>
                            <CondIcon className="w-3 h-3" />
                            {cond.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                          {asset.purchase_date || '-'}
                        </td>
                        {isPrincipal && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(asset)}
                                title="এডিট করুন"
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingAsset(asset)}
                                title="মুছুন"
                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* তৈরি বা এডিট মডাল */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-orange" />
                {modalMode === 'create' ? 'নতুন ক্যাম্পাস সম্পদ সংযোজন' : 'সম্পদের বিবরণ হালনাগাদ'}
              </h3>
              <button 
                onClick={() => setModalMode(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    সম্পদের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: স্টুডেন্ট বেঞ্চ"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    অ্যাসেট কোড <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: AST-BNCH-001"
                    value={formData.asset_code}
                    onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">ক্যাটাগরি</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <option value="">সাধারণ ক্যাটাগরি</option>
                    {assetCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">রুম নং / স্থান</label>
                  <input
                    type="text"
                    placeholder="যেমন: Room-302, ল্যাব-১"
                    value={formData.room_or_location}
                    onChange={(e) => setFormData({ ...formData, room_or_location: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">পরিমাণ (সংখ্যা)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">একক মূল্য (৳)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">কন্ডিশন / অবস্থা</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <option value="GOOD">ভালো/সচল (Good)</option>
                    <option value="DAMAGED">নষ্ট/ভাঙা (Damaged)</option>
                    <option value="UNDER_REPAIR">মেরামতাধীন (Under Repair)</option>
                    <option value="DISPOSED">পরিত্যক্ত (Disposed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">ক্রয়ের তারিখ</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="ভেন্ডর বা ওয়ারেন্টি বিবরণ..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {modalMode === 'create' ? 'সংরক্ষণ করুন' : 'আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ডিলিট কনফার্মেশন মডাল */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">সম্পদ মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-500 mt-1">
                আপনি কি নিশ্চিতভাবে <strong>{deletingAsset.name}</strong> ({deletingAsset.asset_code}) ইনভেন্টরি থেকে অপসারিত করতে চান?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAsset(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteAsset}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeAssetsTab;
