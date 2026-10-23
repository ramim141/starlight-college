import React, { useState, useEffect } from 'react';
import { getMarkerMonthlyUsageApi } from '../../../api/principal';
import { 
  BarChart2, 
  Calendar, 
  User, 
  Award, 
  Users, 
  PenTool, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const BANGLA_MONTHS = [
  { value: 1, name: 'জানুয়ারি' },
  { value: 2, name: 'ফেব্রুয়ারি' },
  { value: 3, name: 'মার্চ' },
  { value: 4, name: 'এপ্রিল' },
  { value: 5, name: 'মে' },
  { value: 6, name: 'জুন' },
  { value: 7, name: 'জুলাই' },
  { value: 8, name: 'আগস্ট' },
  { value: 9, name: 'সেপ্টেম্বর' },
  { value: 10, name: 'অক্টোবর' },
  { value: 11, name: 'নভেম্বর' },
  { value: 12, name: 'ডিসেম্বর' },
];

const MarkerUsageReportTab = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [usageList, setUsageList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyUsage = async (m, y) => {
    setLoading(true);
    try {
      const res = await getMarkerMonthlyUsageApi(m, y);
      if (res.success || Array.isArray(res.data)) {
        setUsageList(res.data || []);
      }
    } catch (err) {
      toast.error('মাসিক মার্কার ব্যবহারের তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyUsage(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // পরিসংখ্যান হিসাব
  const totalMarkers = usageList.reduce((acc, cur) => acc + (cur.total_markers_used || 0), 0);
  const maxMarkers = usageList.length > 0 ? Math.max(...usageList.map(u => u.total_markers_used || 0), 1) : 1;
  const topTeacher = usageList.length > 0 ? usageList[0] : null;

  return (
    <div className="space-y-6">
      {/* ফিল্টার ও পিকার হেডার */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-orange" />
            শিক্ষকভিত্তিক মাসিক মার্কার ব্যবহার অ্যানালিটিক্স
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            প্রতি মাসে শিক্ষকদের মার্কার গ্রহণের পরিমাণ এবং ব্যবহারের অনুপাত পর্যালোচনা করুন।
          </p>
        </div>

        {/* মাস ও বছর পিকার */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="text-xs font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              {BANGLA_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value={2026}>২০২৬</option>
            <option value={2025}>২০২৫</option>
            <option value={2024}>২০২৪</option>
          </select>
        </div>
      </div>

      {/* সামারি কার্ডসমূহ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>মাসে মোট মার্কার ব্যবহার</span>
            <PenTool className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {totalMarkers} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>সক্রিয় মার্কার ব্যবহারকারী শিক্ষক</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {usageList.length} <span className="text-xs font-normal text-slate-400">জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>সর্বোচ্চ ব্যবহারকারী শিক্ষক</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 truncate">
            {topTeacher ? `${topTeacher.teacher_name} (${topTeacher.total_markers_used} টি)` : '-'}
          </div>
        </div>
      </div>

      {/* ব্যবহার তালিকা ও ভিজ্যুয়াল সিএসএস বার */}
      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
        </div>
      ) : usageList.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {BANGLA_MONTHS.find(m => m.value === selectedMonth)?.name} {selectedYear}-এ কোনো মার্কার ব্যবহারের রেকর্ড নেই
          </h4>
          <p className="text-xs text-slate-400 mt-1">অন্য মাস বা বছর নির্বাচন করে তথ্য পর্যবেক্ষণ করুন।</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {BANGLA_MONTHS.find(m => m.value === selectedMonth)?.name} {selectedYear} মার্কার ব্যবহার বণ্টন
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">ক্রম</th>
                  <th className="py-3 px-4">শিক্ষকের নাম</th>
                  <th className="py-3 px-4">আইডি নম্বর</th>
                  <th className="py-3 px-4">মোট মার্কার</th>
                  <th className="py-3 px-4 w-2/5">ব্যবহারের আপেক্ষিক অনুপাত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usageList.map((item, idx) => {
                  const percentage = Math.round(((item.total_markers_used || 0) / maxMarkers) * 100);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                        {item.teacher_name}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {item.employee_id || 'শিক্ষক'}
                      </td>
                      <td className="py-3 px-4 font-black text-brand-orange">
                        {item.total_markers_used} টি
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>তুলনামূলক হার</span>
                            <span className="font-mono font-semibold">{percentage}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-brand-orange transition-all duration-500"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkerUsageReportTab;
