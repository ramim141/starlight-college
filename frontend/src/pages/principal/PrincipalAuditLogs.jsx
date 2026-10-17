import React, { useState, useEffect } from 'react';
import { getSystemAuditLogsApi } from '../../api/adminFinance';
import { Clock, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';

const PrincipalAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getSystemAuditLogsApi();
        setLogs(res.results || res || []);
      } catch (err) {
        toast.error('অডিট লগ লোড করা যায়নি');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <h2 className="text-lg font-bold text-brand-navy">সিস্টেম সিকিউরিটি ও অ্যাক্টিভিটি অডিট লগ</h2>
        <p className="text-xs text-slate-500">পুরো সিস্টেমে কে কখন লগইন করল, কে মার্কস পরিবর্তন করল বা ফি আদায় করল তার অপরিবর্তনযোগ্য হিস্ট্রি।</p>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0F2C59] text-white text-[11px] font-bold">
              <tr>
                <th className="p-3">অ্যাকশন</th>
                <th className="p-3">ব্যবহারকারী</th>
                <th className="p-3">রোল</th>
                <th className="p-3">বিবরণ</th>
                <th className="p-3">আইপি অ্যাড্রেস</th>
                <th className="p-3">টাইমস্ট্যাম্প</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-navy">
                      {log.action_display || log.action}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{log.username}</td>
                  <td className="p-3 text-slate-500">{log.user_role}</td>
                  <td className="p-3 text-slate-700">{log.description}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">{log.ip_address || "127.0.0.1"}</td>
                  <td className="p-3 text-slate-400">{new Date(log.created_at).toLocaleString('bn-BD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PrincipalAuditLogs;