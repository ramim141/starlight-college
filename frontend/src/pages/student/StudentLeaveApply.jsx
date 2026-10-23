import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  FileEdit, 
  ListFilter, 
  ShieldCheck, 
  CalendarCheck2, 
  ChevronRight,
  Info
} from 'lucide-react';
import { getMyLeavesApi, cancelLeaveApplicationApi } from '../../api/student';
import { getAcademicHolidaysApi } from '../../api/academics';
import LeaveApplicationForm, { toBanglaNumber } from '../../components/student/leaves/LeaveApplicationForm';
import MyLeaveApplicationsList from '../../components/student/leaves/MyLeaveApplicationsList';
import LeaveDetailSheet from '../../components/student/leaves/LeaveDetailSheet';

const StudentLeaveApply = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('APPLY');
  const [selectedLeave, setSelectedLeave] = useState(null);

  // ছুটির তালিকা কুয়েরি
  const leavesQuery = useQuery({
    queryKey: ['student-leaves'],
    queryFn: getMyLeavesApi,
  });

  // একাডেমিক ক্যালেন্ডার ছুটির কুয়েরি (স্মার্ট কার্যদিবস গণনার জন্য)
  const holidaysQuery = useQuery({
    queryKey: ['academic-holidays'],
    queryFn: () => getAcademicHolidaysApi(),
    staleTime: 1000 * 60 * 30, // ৩০ মিনিট ক্যাশ
  });

  const leaves = Array.isArray(leavesQuery.data) 
    ? leavesQuery.data 
    : (leavesQuery.data?.results || []);

  const holidays = Array.isArray(holidaysQuery.data) 
    ? holidaysQuery.data 
    : (holidaysQuery.data?.results || []);

  // অপেক্ষমাণ আবেদনের সংখ্যা
  const pendingCount = leaves.filter(
    (l) => l.principal_status !== 'APPROVED' && l.principal_status !== 'REJECTED' && l.incharge_status !== 'REJECTED'
  ).length;

  // আবেদন বাতিল মিউটেশন
  const cancelMutation = useMutation({
    mutationFn: cancelLeaveApplicationApi,
    onSuccess: () => {
      toast.success('ছুটির আবেদনটি সফলভাবে বাতিল করা হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['student-leaves'] });
      setSelectedLeave(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'আবেদন বাতিল করা সম্ভব হয়নি।';
      toast.error(msg);
    },
  });

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* ১. পেজ হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
            <span>সেবা ও আবেদন</span>
            <span>•</span>
            <span className="text-brand-orange">ডিজিটাল ছুটি</span>
          </div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight leading-snug">
            ছুটির আবেদন ও ট্র্যাকিং
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            জরুরি প্রয়োজনে শ্রেণি ইনচার্জ ও অধ্যক্ষ বরাবর ছুটির আবেদন করুন এবং লাইভ স্ট্যাটাস ট্র্যাক করুন।
          </p>
        </div>

        {/* হাজিরা লিঙ্কেজ কার্ড */}
        <Link
          to="/student/attendance"
          className="inline-flex items-center space-x-2 rounded-2xl bg-white p-3 border border-slate-200/80 shadow-soft hover:shadow-premium hover:border-brand-orange/40 transition group"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-black text-brand-navy group-hover:text-brand-orange transition">
              আমার হাজিরা খাতা
            </span>
            <span className="text-[10px] text-slate-400">
              অনুমোদিত ছুটি স্বয়ংক্রিয় যুক্ত
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-brand-orange transition ml-1" />
        </Link>
      </div>

      {/* ২. স্বয়ংক্রিয় হাজিরা ও ইনচার্জ পলিসি নোটিশ */}
      <div className="rounded-3xl bg-linear-to-r from-brand-navy to-brand-navy-light text-white p-5 sm:p-6 shadow-soft flex items-start space-x-3.5">
        <ShieldCheck className="h-6 w-6 text-brand-orange shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-sm text-amber-200 leading-snug">
            ২-ধাপের ডিজিটাল ছুটি অনুমোদন প্রক্রিয়া
          </h3>
          <p className="text-slate-200 text-[11px] leading-relaxed">
            আপনার দাখিলকৃত আবেদন প্রথমে আপনার <strong>শ্রেণি ইনচার্জের</strong> নিকট সুপারিশের জন্য যাবে। ইনচার্জ সুপারিশ করার পর <strong>অধ্যক্ষ মহোদয়</strong> চূড়ান্ত অনুমোদন প্রদান করবেন। ছুটি মঞ্জুর হলে উপস্থিতির হিসাবে <strong>'ছুটি (LEAVE)'</strong> গণ্য হবে।
          </p>
        </div>
      </div>

      {/* ৩. ট্যাব সুইচিং পিল (আবেদন ফর্ম / আমার আবেদনসমূহ) */}
      <div className="flex rounded-2xl bg-slate-200/60 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('APPLY')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 min-h-[44px] ${
            activeTab === 'APPLY'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileEdit className="h-4 w-4 text-brand-orange" />
          <span>নতুন ছুটির আবেদন</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MY_LEAVES')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 min-h-[44px] ${
            activeTab === 'MY_LEAVES'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListFilter className="h-4 w-4 text-brand-navy" />
          <span>আমার আবেদনসমূহ</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 ml-1">
              {toBanglaNumber(pendingCount)} অপেক্ষমাণ
            </span>
          )}
        </button>
      </div>

      {/* ৪. ট্যাব কন্টেন্ট */}
      {activeTab === 'APPLY' ? (
        <LeaveApplicationForm
          onSuccess={() => setActiveTab('MY_LEAVES')}
          existingLeaves={leaves}
          holidays={holidays}
        />
      ) : (
        <MyLeaveApplicationsList
          leaves={leaves}
          isLoading={leavesQuery.isLoading}
          onNewLeaveClick={() => setActiveTab('APPLY')}
          onSelectLeave={setSelectedLeave}
        />
      )}

      {/* ৫. বিস্তারিত ও ট্র্যাকিং শিট */}
      <LeaveDetailSheet
        leave={selectedLeave}
        onClose={() => setSelectedLeave(null)}
        onCancel={(id) => cancelMutation.mutate(id)}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
};

export default StudentLeaveApply;
