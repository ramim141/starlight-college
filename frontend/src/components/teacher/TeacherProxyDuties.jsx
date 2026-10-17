import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Clock, UserCheck, AlertCircle } from 'lucide-react';

const TeacherProxyDuties = () => {
  const [proxyDuties, setProxyDuties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('operations/teacher-leaves/my-proxy-classes/')
      .then((res) => {
        if (res.data.success) {
          setProxyDuties(res.data.data || []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (proxyDuties.length === 0) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-5 border border-orange-200/80 shadow-soft">
      <div className="flex items-center space-x-2.5 mb-3">
        <UserCheck className="h-5 w-5 text-brand-orange" />
        <h3 className="font-extrabold text-sm text-brand-navy">
          আপনার প্রক্সি ক্লাস দায়িত্বসমূহ (Proxy Classes Assigned)
        </h3>
        <span className="rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-black text-white">
          {proxyDuties.length} টি
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {proxyDuties.map((duty) => (
          <div key={duty.id} className="rounded-2xl bg-white p-4 border border-orange-100 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                ছুটিপ্রাপ্ত শিক্ষক: <strong className="text-brand-navy">{duty.teacher_name}</strong>
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                অনুমোদিত
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              মেয়াদ: <strong className="text-slate-700">{duty.start_date} হতে {duty.end_date}</strong> ({duty.total_days} দিন)
            </p>
            <p className="mt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl italic border border-slate-100">
              কারণ: "{duty.reason}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherProxyDuties;