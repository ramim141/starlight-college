import React from 'react';
import { Calendar, Package } from 'lucide-react';

const LeavesTabContent = ({
  leaves = [],
  markers = [],
  onOpenLeaveModal,
  onOpenMarkerModal,
  onAcknowledgeMarker,
}) => {
  return (
    <div className="space-y-6">
      {/* ছুটির আবেদন ও হিস্ট্রি */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-purple-50 p-2.5 text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">আমার ছুটির আবেদন ও রেকর্ড</h3>
              <p className="text-xs text-slate-400">ছুটির অনুমোদন ও প্রক্সি ক্লাসের স্ট্যাটাস</p>
            </div>
          </div>
          <button
            onClick={onOpenLeaveModal}
            className="rounded-2xl bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-purple-500 transition cursor-pointer"
          >
            + ছুটির আবেদন করুন
          </button>
        </div>

        <div className="mt-4">
          {leaves.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">আপনার কোনো ছুটির আবেদন রেকর্ড নেই।</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaves.map((l) => (
                <div key={l.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-brand-navy uppercase">
                        {l.leave_type_display || l.leave_type}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {l.status_display || l.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      তারিখ: <strong>{l.start_date} হতে {l.end_date}</strong> ({l.total_days || 1} দিন)
                    </p>
                    <p className="text-xs text-slate-500 italic mt-0.5">কারণ: {l.reason}</p>
                  </div>

                  {l.proxy_teacher_name && (
                    <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                      প্রক্সি শিক্ষক: <strong>{l.proxy_teacher_name}</strong>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* মার্কার রিকুইজিশন হিস্ট্রি */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-orange-50 p-2.5 text-brand-orange">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">হোয়াইটবোর্ড মার্কার রিকুইজিশন</h3>
              <p className="text-xs text-slate-400">ক্লাসরুমের জন্য কালো, নীল, লাল মার্কারের রিকুইজিশন হিস্ট্রি</p>
            </div>
          </div>
          <button
            onClick={onOpenMarkerModal}
            className="rounded-2xl bg-brand-orange px-4 py-2 text-xs font-black text-white shadow-md hover:bg-brand-orange-hover transition cursor-pointer"
          >
            + মার্কার রিকুইজিশন
          </button>
        </div>

        <div className="mt-4">
          {markers.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">এখনো কোনো মার্কার রিকুইজিশন করা হয়নি।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {markers.map((m) => (
                <div key={m.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-extrabold text-brand-navy border border-slate-200">
                      {m.marker_color_display || m.marker_color} ({m.quantity}টি)
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      m.status === 'ISSUED' && m.is_acknowledged ? 'bg-emerald-100 text-emerald-700' :
                      m.status === 'ISSUED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {m.status === 'ISSUED' && m.is_acknowledged ? 'প্রাপ্তি নিশ্চিত' :
                       m.status === 'ISSUED' ? 'ইস্যুকৃত (অপেক্ষমাণ)' : 'রিকোয়েস্টেড'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 italic">কারণ: {m.reason}</p>
                  
                  {m.status === 'ISSUED' && !m.is_acknowledged && (
                    <button
                      onClick={() => onAcknowledgeMarker(m.id)}
                      className="mt-3 w-full rounded-xl bg-brand-orange py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-orange-hover cursor-pointer"
                    >
                      মার্কার বুঝে পেয়েছি
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavesTabContent;
