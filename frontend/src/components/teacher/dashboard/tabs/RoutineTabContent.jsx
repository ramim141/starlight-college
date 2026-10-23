import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Users,
  ChevronRight,
} from 'lucide-react';

const RoutineTabContent = ({ schedule, proxyClasses = [] }) => {
  return (
    <div className="space-y-6">
      {/* প্রক্সি দায়িত্ব থাকলে স্পেশাল কার্ড */}
      {proxyClasses.length > 0 && (
        <div className="rounded-3xl bg-purple-50 border-2 border-purple-200 p-6 text-purple-900 shadow-soft">
          <div className="flex items-center space-x-3 mb-4">
            <div className="rounded-xl bg-purple-200 p-2 text-purple-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-purple-950">আপনার উপর অর্পিত প্রক্সি ক্লাস দায়িত্ব</h4>
              <p className="text-xs text-purple-700">সহকর্মী শিক্ষক ছুটিতে থাকায় আপনাকে এই ক্লাসগুলো নেওয়ার দায়িত্ব দেওয়া হয়েছে।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {proxyClasses.map((p) => (
              <div key={p.id} className="rounded-2xl bg-white p-4 border border-purple-100 shadow-sm">
                <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  প্রক্সি ক্লাস
                </span>
                <h5 className="font-bold text-sm text-slate-900 mt-2">
                  মূল শিক্ষক: {p.teacher_name || p.teacher?.full_name || 'সহকর্মী শিক্ষক'}
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  মেয়াদ: {p.start_date} হতে {p.end_date} | কারণ: {p.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* আজকের ক্লাসের তালিকা */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-brand-sky p-2.5 text-brand-navy">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">
                আজকের ক্লাস শিডিউল ({schedule?.day || 'আজ'})
              </h3>
              <p className="text-xs text-slate-400">নির্ধারিত সময় অনুযায়ী ক্লাসে পাঠদান সম্পন্ন করুন</p>
            </div>
          </div>
          <Link
            to="/teacher/schedule"
            className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>সম্পূর্ণ সাপ্তাহিক রুটিন দেখুন</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6">
          {!schedule?.data || schedule.data.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarCheck className="mx-auto h-12 w-12 text-slate-300" />
              <h4 className="mt-3 text-sm font-bold text-slate-700">আজকে আপনার কোনো ক্লাস নির্ধারিত নেই!</h4>
              <p className="text-xs text-slate-400 mt-1">পাঠ প্রস্তুতি নিন বা পরীক্ষার খাতা মূল্যায়ন করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.data.map((slot, idx) => (
                <div
                  key={slot.id || idx}
                  className="group rounded-3xl border border-slate-200/90 bg-slate-50/60 p-5 hover:border-brand-orange hover:bg-white transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-xl bg-[#0F2C59] px-2.5 py-1 text-[11px] font-black text-white">
                      রুম: {slot.room_number || 'N/A'}
                    </span>
                    <span className="text-xs font-black text-brand-orange">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-brand-orange transition">
                    {slot.subject_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {slot.section_display}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <Link
                      to="/teacher/incharge/bulk-attendance"
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>হাজিরা নিন</span>
                    </Link>
                    <Link
                      to="/teacher/materials"
                      className="text-xs font-bold text-slate-500 hover:text-brand-navy flex items-center space-x-1 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>লেকচার শিট</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineTabContent;
