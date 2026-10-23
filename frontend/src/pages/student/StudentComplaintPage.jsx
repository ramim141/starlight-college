import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquarePlus, History, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getMyComplaintsApi, submitComplaintApi } from '../../api/certificate';
import ComplaintForm from '../../components/student/complaints/ComplaintForm';
import ComplaintList from '../../components/student/complaints/ComplaintList';
import ComplaintSuccessModal from '../../components/student/complaints/ComplaintSuccessModal';

const StudentComplaintPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('FORM'); // 'FORM' | 'HISTORY'
  const [successData, setSuccessData] = useState(null);

  // ১. শিক্ষার্থীর পূর্ববর্তী অভিযোগ তালিকা কোয়েরি
  const { 
    data: complaintsData, 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['student-complaints'],
    queryFn: getMyComplaintsApi,
    staleTime: 60 * 1000,
  });

  const complaintsList = Array.isArray(complaintsData?.results) 
    ? complaintsData.results 
    : Array.isArray(complaintsData) 
      ? complaintsData 
      : [];

  // ২. অভিযোগ সাবমিশন মিউটেশন
  const submitMutation = useMutation({
    mutationFn: submitComplaintApi,
    onSuccess: (data) => {
      // গোপনীয়তা নীতি: টোস্টে কোনো সংবেদনশীল বিবরণ বা শিরোনাম প্রতিধ্বনিত হবে না
      toast.success('আপনার অভিযোগ/পরামর্শ সফলভাবে অধ্যক্ষের কাছে পৌঁছানো হয়েছে।');
      setSuccessData(data);
      queryClient.invalidateQueries({ queryKey: ['student-complaints'] });
    },
    onError: (err) => {
      if (err.response?.status === 429) {
        toast.error('অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।');
      } else {
        toast.error(err.response?.data?.message || 'অভিযোগ প্রেরণ করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
      }
    },
  });

  const handleSubmit = (formData, resetCallback) => {
    submitMutation.mutate(formData, {
      onSuccess: () => {
        if (resetCallback) resetCallback();
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* পেজ হেডার ও রিফ্রেশ বাটন */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-5 sm:p-6 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">গোপন অভিযোগ ও পরামর্শ বক্স</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            কলেজ সংক্রান্ত যেকোনো সমস্যা বা উন্নয়নমূলক পরামর্শ সরাসরি অধ্যক্ষকে জানান।
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-60 min-h-[44px]"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-brand-orange' : 'text-slate-500'}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* ট্যাব নেভিগেশন (স্লাইডিং পিল) */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('FORM')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'FORM'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>নতুন অভিযোগ লিখুন</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'HISTORY'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="h-4 w-4" />
          <span>আমার প্রেরিত তালিকা</span>
          {complaintsList.length > 0 && (
            <span className="rounded-full bg-brand-orange px-2 py-0.2 text-[10px] font-extrabold text-white">
              {complaintsList.length}
            </span>
          )}
        </button>
      </div>

      {/* কনটেন্ট এলাকা */}
      {activeTab === 'FORM' ? (
        <ComplaintForm 
          onSubmit={handleSubmit} 
          submitting={submitMutation.isPending} 
        />
      ) : (
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/70" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-3xl bg-white p-8 text-center border border-slate-200">
              <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">অভিযোগ তালিকা লোড করা সম্ভব হয়নি</h4>
              <button
                onClick={() => refetch()}
                className="mt-3 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          ) : (
            <ComplaintList 
              complaints={complaintsList} 
              onNewComplaintClick={() => setActiveTab('FORM')} 
            />
          )}
        </div>
      )}

      {/* সাবমিশন সাকসেস ট্র্যাকিং পপআপ */}
      <ComplaintSuccessModal
        isOpen={!!successData}
        complaintData={successData}
        onClose={() => setSuccessData(null)}
        onViewHistory={() => setActiveTab('HISTORY')}
      />

    </div>
  );
};

export default StudentComplaintPage;