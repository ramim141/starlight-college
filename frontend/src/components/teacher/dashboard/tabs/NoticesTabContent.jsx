import React from 'react';
import { FileText } from 'lucide-react';

const NoticesTabContent = ({ notices = [] }) => {
  return (
    <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-4">
        <div className="rounded-2xl bg-brand-sky p-2.5 text-brand-navy">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-brand-navy">কলেজ নোটিশ ও প্রিন্সিপালের সার্কুলার</h3>
          <p className="text-xs text-slate-400">সকল প্রাতিষ্ঠানিক নির্দেশিকা, ছুটির প্রজ্ঞাপন ও মিটিং নোটিশ</p>
        </div>
      </div>

      {notices.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-400">এই মুহূর্তে কোনো নতুন নোটিশ প্রকাশিত হয়নি।</p>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 hover:border-brand-navy transition">
              <div className="flex items-center justify-between mb-1">
                <span className="rounded-md bg-[#0F2C59] px-2 py-0.5 text-[10px] font-bold text-white">
                  {n.notice_type || 'সার্কুলার'}
                </span>
                <span className="text-xs font-mono text-slate-400">{n.created_at?.slice(0, 10)}</span>
              </div>
              <h4 className="text-sm font-bold text-brand-navy mt-2">{n.title}</h4>
              <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticesTabContent;
