import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getVehiclesApi, 
  createVehicleApi, 
  triggerVehicleBreakdownApi, 
  getVehicleDailyLogsApi, 
  getVehicleMonthlyBillsApi 
} from '../../api/principal';
import { 
  Bus, 
  AlertTriangle, 
  Plus, 
  Phone, 
  MapPin, 
  Users, 
  Calendar, 
  FileText, 
  Radio,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * TransportFleetHub - বহু-ব্যবহারযোগ্য কলেজ পরিবহন ও ফ্লিট কন্ট্রোল হাব
 * এটি প্রিন্সিপাল, হিসাবরক্ষক (অ্যাকাউন্ট্যান্ট), শিক্ষক ও শিক্ষার্থী যেকোনো পোর্টালে সরাসরি ব্যবহারযোগ্য।
 */
const TransportFleetHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isAccountant: authIsAccountant, isStudent: authIsStudent } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isAccountant = overrideRole ? overrideRole === 'ACCOUNTANT' : authIsAccountant;
  const isStudent = overrideRole ? overrideRole === 'STUDENT' : authIsStudent;
  const canManageFleet = isPrincipal || isAccountant;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'bills'

  // নতুন গাড়ি যোগ মডাল
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '',
    driver_name: '',
    driver_phone: '',
    route_name: '',
    stoppages: '',
    capacity: 40,
    daily_rate: 1500,
  });

  // জরুরি ব্রেকডাউন অ্যালার্ট মডাল
  const [breakdownModalVehicle, setBreakdownModalVehicle] = useState(null);
  const [breakdownData, setBreakdownData] = useState({
    location: '',
    reason: 'যান্ত্রিক ত্রুটি দেখা দিয়েছে',
    alert_message: '',
  });
  const [triggeringAlert, setTriggeringAlert] = useState(false);

  // মাসিক বিল
  const [monthlyBills, setMonthlyBills] = useState([]);

  const fetchTransportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fleet') {
        const res = await getVehiclesApi();
        const list = res.results || res;
        setVehicles(Array.isArray(list) ? list : []);
      } else {
        const res = await getVehicleMonthlyBillsApi();
        const list = res.results || res;
        setMonthlyBills(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      toast.error('পরিবহন তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, [activeTab]);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await createVehicleApi(newVehicle);
      if (res.id || res.success) {
        toast.success('নতুন পরিবহন সফলভাবে যুক্ত হয়েছে');
        setShowAddVehicleModal(false);
        setNewVehicle({
          vehicle_number: '',
          driver_name: '',
          driver_phone: '',
          route_name: '',
          stoppages: '',
          capacity: 40,
          daily_rate: 1500,
        });
        fetchTransportData();
      }
    } catch (err) {
      toast.error('গাড়ি যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleTriggerBreakdown = async (e) => {
    e.preventDefault();
    if (!breakdownData.location.trim()) {
      toast.error('বিকল হওয়ার স্থান উল্লেখ করুন');
      return;
    }

    setTriggeringAlert(true);
    try {
      const res = await triggerVehicleBreakdownApi(breakdownModalVehicle.id, breakdownData);
      if (res.success) {
        toast.success(res.message);
        setBreakdownModalVehicle(null);
        setBreakdownData({ location: '', reason: 'যান্ত্রিক ত্রুটি দেখা দিয়েছে', alert_message: '' });
        fetchTransportData();
      }
    } catch (err) {
      toast.error('জরুরি নোটিশ পাঠানো ব্যর্থ হয়েছে');
    } finally {
      setTriggeringAlert(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">কলেজ পরিবহন ও ফ্লিট কমান্ড</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              বাসের রুট, স্টপেজ, জরুরি ব্রেকডাউন অ্যালার্ট ও মাসিক নিট বিলিং ব্যবস্থাপনা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canManageFleet && (
            <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'fleet' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                ফ্লিট ও রুট
              </button>
              <button
                onClick={() => setActiveTab('bills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'bills' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                মাসিক নিট বিলিং
              </button>
            </div>
          )}

          {canManageFleet && activeTab === 'fleet' && (
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> নতুন গাড়ি
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'fleet' ? (
        <div data-tab-panel="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {v.vehicle_number}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                  সক্রিয়
                </span>
              </div>

              <div className="my-4 space-y-2">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  {v.route_name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  <strong>স্টপেজ:</strong> {v.stoppages}
                </p>

                <div className="pt-2 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>ধারণক্ষমতা: {v.capacity} জন (নিবন্ধিত: {v.passenger_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>ড্রাইভার: <strong>{v.driver_name}</strong> ({v.driver_phone})</span>
                  </div>
                  {canManageFleet && (
                    <div className="text-slate-500">
                      দৈনিক ভাড়া: <strong>৳ {v.daily_rate}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* জরুরি বিকল বাটন (প্রিন্সিপাল বা অ্যাকাউন্ট্যান্ট) */}
              {canManageFleet && (
                <button
                  onClick={() => {
                    setBreakdownModalVehicle(v);
                    setBreakdownData({
                      location: '',
                      reason: 'যান্ত্রিক ত্রুটি দেখা দিয়েছে',
                      alert_message: `জরুরি বিজ্ঞপ্তি: ${v.route_name}-এর গাড়িতে যান্ত্রিক সমস্যা দেখা দিয়েছে। বিকল্প ব্যবস্থা নেওয়া হচ্ছে।`,
                    });
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/40 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Breakdown Alert
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* মাসিক নিট বিলিং টেবিল */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              গাড়ির দৈনিক নিট বিলিং শিট (Formula: মোট দিন × রেট − ড্রাইভার অগ্রিম)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">গাড়ি নং ও রুট</th>
                  <th className="py-3 px-4">মাস/বছর</th>
                  <th className="py-3 px-4">মোট দিন চলা</th>
                  <th className="py-3 px-4">গ্রস বিল</th>
                  <th className="py-3 px-4">ড্রাইভার অগ্রিম</th>
                  <th className="py-3 px-4">নিট প্রদেয় বিল</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthlyBills.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {b.vehicle_number} <span className="block text-xs text-slate-400">{b.route_name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">{b.month}/{b.year}</td>
                    <td className="py-3 px-4">{b.total_days_run} দিন</td>
                    <td className="py-3 px-4">৳ {parseFloat(b.gross_bill).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-rose-500">- ৳ {parseFloat(b.advance_deductions).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                      ৳ {parseFloat(b.net_payable).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* নতুন গাড়ি যোগ মডাল */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bus className="w-5 h-5 text-brand-orange" />
              নতুন পরিবহন গাড়ি সংযোজন
            </h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">গাড়ির নম্বর</label>
                  <input
                    type="text"
                    required
                    placeholder="ঢাকা মেট্রো-গ ১১-২২৩৩"
                    value={newVehicle.vehicle_number}
                    onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">রুটের নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="উত্তরা - মিরপুর রুট"
                    value={newVehicle.route_name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, route_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">স্টপেজসমূহ</label>
                <input
                  type="text"
                  required
                  placeholder="হাউসবিল্ডিং, আজমপুর, রাজলক্ষ্মী, বিমানবন্দর"
                  value={newVehicle.stoppages}
                  onChange={(e) => setNewVehicle({ ...newVehicle, stoppages: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ড্রাইভারের নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="মো: রফিকুল ইসলাম"
                    value={newVehicle.driver_name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driver_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ড্রাইভারের মোবাইল</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={newVehicle.driver_phone}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driver_phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ধারণক্ষমতা (সিট)</label>
                  <input
                    type="number"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">দৈনিক রেট (টাকা)</label>
                  <input
                    type="number"
                    value={newVehicle.daily_rate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, daily_rate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
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

      {/* জরুরি ব্রেকডাউন অ্যালার্ট মডাল */}
      {breakdownModalVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 text-rose-600">
              <Radio className="w-5 h-5 animate-pulse" />
              জরুরি ব্রেকডাউন নোটিফিকেশন ব্রডকাস্ট
            </h3>
            <p className="text-xs text-slate-500">
              গাড়ি: <strong>{breakdownModalVehicle.vehicle_number}</strong> ({breakdownModalVehicle.route_name})।
            </p>

            <form onSubmit={handleTriggerBreakdown} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">কোথায় বিকল হয়েছে?</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বিমানবন্দর গোলচত্বর..."
                  value={breakdownData.location}
                  onChange={(e) => setBreakdownData({ ...breakdownData, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">সমস্যার কারণ</label>
                <input
                  type="text"
                  value={breakdownData.reason}
                  onChange={(e) => setBreakdownData({ ...breakdownData, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">নোটিশ বার্তা</label>
                <textarea
                  rows={3}
                  value={breakdownData.alert_message}
                  onChange={(e) => setBreakdownData({ ...breakdownData, alert_message: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBreakdownModalVehicle(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={triggeringAlert}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {triggeringAlert ? 'অ্যালার্ট পাঠানো হচ্ছে...' : 'ব্রডকাস্ট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportFleetHub;



