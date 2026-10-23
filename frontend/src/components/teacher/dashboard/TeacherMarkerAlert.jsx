import React from 'react';
import { Check } from 'lucide-react';

const TeacherMarkerAlert = ({ unacknowledgedMarkers = [], onAcknowledgeMarker }) => {
  if (!unacknowledgedMarkers.length) return null;

  return (
    <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 text-slate-800 shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🖍️</span>
          <div>
            <h4 className="text-sm font-black text-[#0F2C59]">অফিস থেকে মার্কার ইস্যু করা হয়েছে!</h4>
            <p className="text-xs text-slate-600">
              আপনি মার্কার বুঝে পেলে নিচের বাটনে ক্লিক করুন। সাথে সাথে সেন্ট্রাল ইনভেন্টরি স্টক আপডেট হবে।
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {unacknowledgedMarkers.map((m) => (
            <button
              key={m.id}
              onClick={() => onAcknowledgeMarker(m.id)}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-black text-white shadow-md hover:bg-brand-orange-hover active:scale-95 transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>মার্কার বুঝে পেয়েছি ({m.quantity}টি {m.marker_color_display || m.marker_color})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherMarkerAlert;
