import React from 'react';
import {
  Clock,
  CalendarCheck,
  Users,
  Package,
  ChevronRight,
} from 'lucide-react';

const TeacherKpiStrip = ({
  schedule,
  attendanceHistory = [],
  proxyClasses = [],
  approvedLeavesCount = 0,
  markers = [],
  onOpenMarkerModal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* কার্ড ১: আজকের ক্লাস */}
      <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">আজকের ক্লাস শিডিউল</span>
          <div className="rounded-2xl bg-blue-50 p-2 text-brand-navy">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-black text-brand-navy">
            {schedule?.total_classes_today || 0}
          </h3>
          <span className="text-xs font-bold text-slate-500">টি পিরিয়ড</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 flex items-center space-x-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>বার: <strong className="text-slate-700">{schedule?.day || 'আজ'}</strong></span>
        </p>
      </div>

      {/* কার্ড ২: উপস্থিতি ও হাজিরা রেট */}
      <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">ডিজিটাল উপস্থিতি রেট</span>
          <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-600">
            {attendanceHistory.length > 0
              ? `${Math.min(100, Math.round((attendanceHistory.length / 26) * 100))}%`
              : '১০০%'}
          </h3>
          <span className="text-xs font-bold text-slate-500">চলতি মাস</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          মোট উপস্থিত: <strong className="text-slate-700">{attendanceHistory.length} দিন</strong>
        </p>
      </div>

      {/* কার্ড ৩: ছুটি ও প্রক্সি দায়িত্ব */}
      <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">ছুটি ও প্রক্সি ক্লাস</span>
          <div className="rounded-2xl bg-purple-50 p-2 text-purple-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-black text-purple-600">
            {proxyClasses.length}
          </h3>
          <span className="text-xs font-bold text-slate-500">টি প্রক্সি ডিউটি</span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          অনুমোদিত ছুটি: <strong className="text-slate-700">{approvedLeavesCount} টি</strong>
        </p>
      </div>

      {/* কার্ড ৪: ইনভেন্টরি ও মার্কার */}
      <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-soft hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">মার্কার রিকুইজিশন</span>
          <div className="rounded-2xl bg-orange-50 p-2 text-brand-orange">
            <Package className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-black text-brand-orange">
            {markers.length}
          </h3>
          <span className="text-xs font-bold text-slate-500">টি আবেদন</span>
        </div>
        <button
          onClick={onOpenMarkerModal}
          className="mt-2 text-xs font-bold text-brand-navy hover:text-brand-orange transition flex items-center space-x-1 cursor-pointer"
        >
          <span>+ নতুন মার্কারের আবেদন</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TeacherKpiStrip;
