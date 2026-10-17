import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyAttendanceApi, getMyTransportRouteApi, getNoticesApi, getMyInvoicesApi } from '../../api/student';
import { 
  GraduationCap, 
  CalendarCheck, 
  AlertTriangle, 
  CreditCard, 
  Bus, 
  Bell, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [transport, setTransport] = useState(null);
  const [notices, setNotices] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [attRes, transRes, notRes, invRes] = await Promise.allSettled([
          getMyAttendanceApi(),
          getMyTransportRouteApi(),
          getNoticesApi(),
          getMyInvoicesApi(),
        ]);

        if (attRes.status === 'fulfilled' && attRes.value.success) {
          setAttendance(attRes.value);
        }
        if (transRes.status === 'fulfilled' && transRes.value.success) {
          setTransport(transRes.value);
        }
        if (notRes.status === 'fulfilled') {
          // পেজিনেটেড অথবা সাধারণ অ্যারে উভয় হ্যান্ডেল করা
          const noticeList = notRes.value.results || notRes.value;
          setNotices(Array.isArray(noticeList) ? noticeList.slice(0, 4) : []);
        }
        if (invRes.status === 'fulfilled') {
          const invList = invRes.value.results || invRes.value;
          if (Array.isArray(invList)) {
            const dueSum = invList.reduce((acc, curr) => acc + parseFloat(curr.due_amount || 0), 0);
            setTotalDue(dueSum);
          }
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  const student = user?.student_profile;

  return (
    <div className="space-y-6">
      
      {/* ১. মাঝপথে গাড়ি বিকল হলে ইমার্জেন্সি লাল পালসিং ব্যানার */}
      {transport?.has_emergency_breakdown && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white shadow-lg shadow-red-500/20 animate-pulse">
          <div className="flex items-start space-x-3.5">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
              <AlertTriangle className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-yellow-200">
                  জরুরি পরিবহন বিজ্ঞপ্তি
                </span>
                <span className="text-xs text-red-100">রুট: {transport.route_name}</span>
              </div>
              <h3 className="mt-1 font-bold text-sm sm:text-base text-white">
                {transport.active_alert?.alert_message || "আপনার নির্ধারিত গাড়িটিতে যান্ত্রিক ত্রুটি দেখা দিয়েছে।"}
              </h3>
              <p className="mt-0.5 text-xs text-red-100">
                স্থান: {transport.active_alert?.location} | ড্রাইভার: {transport.driver_name} ({transport.driver_phone})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ২. স্বাগতম কার্ড ও প্রোফাইল সারসংক্ষেপ (ছবিটির মতো গ্লাস-কার্ড) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#1A365D] to-[#142B4E] p-6 sm:p-8 text-white shadow-soft">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange text-white text-2xl font-black shadow-lg shadow-brand-orange/30">
              {user?.first_name?.[0] || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {user?.full_name || user?.username}
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  সক্রিয় শিক্ষার্থী
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                আইডি: <span className="font-bold text-brand-orange">{student?.student_unique_id}</span> | রোল: <span className="font-bold text-white">{student?.roll_number}</span> | শ্রেণি: {student?.section_details?.class_level_display} ({student?.section_details?.group_display})
              </p>
            </div>
          </div>

          {/* দ্রুত অ্যাকশন বাটনসমূহ */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/student/results"
              className="flex items-center space-x-2 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/30 transition hover:bg-brand-orange-hover"
            >
              <GraduationCap className="h-4 w-4" />
              <span>মার্কশিট দেখুন</span>
            </Link>
            <Link
              to="/student/admit-card"
              className="flex items-center space-x-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/15"
            >
              <span>অ্যাডমিট কার্ড</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ৩. প্রধান অ্যানালিটিক্স উইজেট গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* উপস্থিতি পার্সেন্টেজ */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট উপস্থিতি</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-brand-navy">
              {attendance?.attendance_percentage || "0.0%"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              কার্যদিবস: {attendance?.total_working_days || 0} দিন | উপস্থিত: {attendance?.present_count || 0} দিন
            </p>
          </div>
        </div>

        {/* বকেয়া ফি স্ট্যাটাস */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট বকেয়া ফি</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ৳ {totalDue.toFixed(2)}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {totalDue > 0 ? "অনতিবিলম্বে পরিশোধযোগ্য" : "সকল ফি সম্পূর্ণ পরিশোধিত"}
            </p>
          </div>
        </div>

        {/* নির্ধারিত পরিবহন বাস */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">পরিবহন বাস</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base font-bold text-brand-navy truncate">
              {transport?.vehicle_number || "যুক্ত নয়"}
            </h3>
            <p className="mt-1 text-xs text-slate-400 truncate">
              {transport?.route_name || "পরিবহন সুবিধা গ্রহণ করা হয়নি"}
            </p>
          </div>
        </div>

        {/* শ্রেণি ইনচার্জ তথ্য */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">শাখা ইনচার্জ</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-base font-bold text-brand-navy truncate">
              {student?.section_details?.section_name} শাখা
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              সেশন: {student?.session}
            </p>
          </div>
        </div>

      </div>

      {/* ৪. নোটিশ বোর্ড এবং কুইক লিঙ্কস */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* সাম্প্রতিক নোটিশসমূহ */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="rounded-xl bg-brand-sky p-2 text-brand-navy">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-brand-navy">কলেজের সাম্প্রতিক নোটিশ</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">সর্বশেষ আপডেট</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {notices.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">বর্তমানে কোনো নোটিশ নেই।</p>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-brand-navy hover:text-brand-orange cursor-pointer">
                      {n.title}
                    </h4>
                    {n.is_pinned && (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-brand-orange">
                        পিন করা
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{n.content}</p>
                  <div className="mt-2 flex items-center space-x-3 text-[10px] text-slate-400">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(n.created_at).toLocaleDateString('bn-BD')}
                    </span>
                    <span>প্রকাশক: {n.created_by_name} ({n.created_by_role})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* কুইক সার্ভিস উইজেট কার্ড */}
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-brand-navy mb-4">প্রয়োজনীয় সেবা</h3>
            <div className="space-y-2.5">
              <Link
                to="/student/id-card"
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 hover:bg-brand-sky hover:text-brand-navy transition"
              >
                <span>ডিজিটাল আইডি কার্ড ডাউনলোড</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                to="/student/invoices"
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 hover:bg-brand-sky hover:text-brand-navy transition"
              >
                <span>ফি জমার মানি রিসিট</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                to="/student/leave-apply"
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 hover:bg-brand-sky hover:text-brand-navy transition"
              >
                <span>ছুটির আবেদন করুন</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                to="/student/complaint"
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-700 hover:bg-brand-sky hover:text-brand-navy transition"
              >
                <span>গোপন অভিযোগ / পরামর্শ বক্স</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-brand-sky/60 p-4 border border-blue-100 text-center">
            <p className="text-[11px] font-bold text-brand-navy">যেকোনো সহায়তায় হেল্পডেস্ক</p>
            <p className="text-[10px] text-slate-500 mt-0.5">অফিস চলাকালীন সরাসরি যোগাযোগ করুন</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;