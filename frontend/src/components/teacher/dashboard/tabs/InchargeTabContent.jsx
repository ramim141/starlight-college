import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CalendarCheck,
  Users,
  CreditCard,
  ShieldAlert,
  PhoneCall,
  Calendar,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

const InchargeTabContent = ({
  isClassIncharge,
  atRiskList = [],
  pendingStudentLeaves = [],
  onRecommendStudentLeave,
}) => {
  if (!isClassIncharge) return null;

  return (
    <div className="space-y-6">
      {/* ইনচার্জ অ্যাকশন গ্রিড */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="rounded-2xl bg-brand-orange/10 p-2.5 text-brand-orange">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-brand-navy">দায়িত্বপ্রাপ্ত শাখার কমান্ড সেন্টার</h3>
            <p className="text-xs text-slate-400">এক নজরে আপনার শাখার শিক্ষার্থী, হাজিরা ও নিয়ন্ত্রণ ব্যবস্থা</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link
            to="/teacher/incharge/bulk-attendance"
            className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 border border-emerald-100 hover:border-emerald-300 transition shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">এক ক্লিকে ক্লাসের হাজিরা</h4>
              <p className="text-xs text-slate-500 mt-1">পুরো সেকশনের দৈনিক উপস্থিতি বা অনুপস্থিতি ইনপুট দিন</p>
            </div>
            <span className="mt-4 text-xs font-black text-emerald-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
              <span>হাজিরা শিট খুলুন</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/teacher/incharge/enrollment"
            className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50/50 p-5 border border-purple-100 hover:border-purple-300 transition shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/20 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">শিক্ষার্থী ভর্তি ও তথ্য</h4>
              <p className="text-xs text-slate-500 mt-1">নতুন আইডি দিয়ে ভর্তি ও রোলসহ শিক্ষার্থীদের প্রোফাইল দেখুন</p>
            </div>
            <span className="mt-4 text-xs font-black text-purple-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
              <span>ভর্তি হাব খুলুন</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/teacher/incharge/at-risk"
            className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-rose-50 to-red-50/50 p-5 border border-rose-100 hover:border-rose-300 transition shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/20 mb-3">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">দুর্বল শিক্ষার্থী (At-Risk)</h4>
              <p className="text-xs text-slate-500 mt-1">উপস্থিতি &lt;৭০% ও ফেল করা শিক্ষার্থীদের তালিকা ({atRiskList.length} জন)</p>
            </div>
            <span className="mt-4 text-xs font-black text-rose-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
              <span>ওয়াচলিস্ট দেখুন</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/teacher/incharge/fees"
            className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 border border-blue-100 hover:border-blue-300 transition shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">ফি আদায় ও রশিদ</h4>
              <p className="text-xs text-slate-500 mt-1">শিক্ষার্থীদের বেতন ও ইনভয়েস কালেকশন ও হিসাব</p>
            </div>
            <span className="mt-4 text-xs font-black text-blue-700 flex items-center space-x-1 group-hover:translate-x-1 transition">
              <span>ফি পোর্টাল খুলুন</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/teacher/incharge/call-log"
            className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 border border-amber-100 hover:border-amber-300 transition shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-md shadow-brand-orange/20 mb-3">
                <PhoneCall className="h-6 w-6" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">অভিভাবক কল ডায়েরি</h4>
              <p className="text-xs text-slate-500 mt-1">অনুপস্থিতি বা অভিযোগ নিয়ে অভিভাবকদের সাথে আলোচনার রেকর্ড</p>
            </div>
            <span className="mt-4 text-xs font-black text-brand-orange flex items-center space-x-1 group-hover:translate-x-1 transition">
              <span>কল ডায়েরি খুলুন</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* শিক্ষার্থী ছুটির আবেদন সুপারিশ */}
      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-purple-50 p-2.5 text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">
                শিক্ষার্থী ছুটির আবেদন ({pendingStudentLeaves.length}টি অপেক্ষমাণ)
              </h3>
              <p className="text-xs text-slate-400">ইনচার্জ হিসেবে আবেদনটি যাচাই করে প্রিন্সিপালের কাছে সুপারিশ পাঠান</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {pendingStudentLeaves.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">এই মুহূর্তে কোনো শিক্ষার্থীর ছুটির আবেদন অপেক্ষমাণ নেই।</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingStudentLeaves.map((leave) => (
                <div key={leave.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-extrabold text-brand-navy">
                        {leave.student_name || 'শিক্ষার্থী'}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        রোল: {leave.roll_number || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      তারিখ: <strong>{leave.start_date} হতে {leave.end_date}</strong> ({leave.total_days || 1} দিন)
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 italic">
                      কারণ: "{leave.reason}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRecommendStudentLeave(leave.id, 'RECOMMENDED')}
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition cursor-pointer"
                    >
                      সুপারিশ করুন (Recommend)
                    </button>
                    <button
                      onClick={() => onRecommendStudentLeave(leave.id, 'REJECTED')}
                      className="rounded-xl bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* At-Risk শিক্ষার্থী প্রিভিউ */}
      {atRiskList.length > 0 && (
        <div className="rounded-3xl bg-rose-50/60 border border-rose-200 p-6 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-rose-200/60">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <h4 className="font-extrabold text-sm text-rose-950">
                ঝুঁকিপূর্ণ শিক্ষার্থী ওয়াচলিস্ট ({atRiskList.length} জন)
              </h4>
            </div>
            <Link
              to="/teacher/incharge/at-risk"
              className="text-xs font-black text-rose-700 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>সম্পূর্ণ তালিকা</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskList.slice(0, 4).map((stu) => (
              <div key={stu.student_id} className="rounded-2xl bg-white p-4 border border-rose-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-orange">রোল: {stu.roll_number}</span>
                  <h5 className="font-bold text-sm text-brand-navy">{stu.student_name}</h5>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">
                    উপস্থিতি: {stu.attendance_percentage}%
                  </p>
                </div>
                {stu.guardian_phone && (
                  <a
                    href={`tel:${stu.guardian_phone}`}
                    className="flex items-center space-x-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>কল করুন</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InchargeTabContent;
