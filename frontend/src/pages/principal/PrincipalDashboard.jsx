import React, { useState, useEffect } from 'react';
import { getBalanceSheetApi, getComplaintsApi, resolveComplaintApi, processExamResultsApi } from '../../api/adminFinance';
import { getExamsListApi } from '../../api/student';
import { 
  DollarSign, 
  CreditCard, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Sparkles, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

const PrincipalDashboard = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExamForProcess, setSelectedExamForProcess] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [processingResult, setProcessingResult] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [balRes, compRes, exRes] = await Promise.allSettled([
        getBalanceSheetApi(),
        getComplaintsApi(),
        getExamsListApi()
      ]);

      if (balRes.status === 'fulfilled' && balRes.value.success) {
        setBalanceSheet(balRes.value);
      }
      if (compRes.status === 'fulfilled') {
        const compList = compRes.value.results || compRes.value;
        setComplaints(Array.isArray(compList) ? compList : []);
      }
      if (exRes.status === 'fulfilled') {
        const exList = exRes.value.results || exRes.value;
        if (Array.isArray(exList) && exList.length > 0) {
          setExams(exList);
          setSelectedExamForProcess(exList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleProcessResult = async () => {
    if (!selectedExamForProcess) {
      toast.error('পরীক্ষা নির্বাচন করুন');
      return;
    }

    setProcessingResult(true);
    try {
      const res = await processExamResultsApi(selectedExamForProcess);
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'রেজাল্ট প্রসেসিং ব্যর্থ হয়েছে');
    } finally {
      setProcessingResult(false);
    }
  };

  const handleResolveComplaint = async (id, status) => {
    try {
      const res = await resolveComplaintApi(id, status, 'অধ্যক্ষ কর্তৃক পর্যালোচনা ও ব্যবস্থা গ্রহণ সম্পন্ন');
      if (res.success) {
        toast.success(res.message);
        setSelectedComplaint(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('অভিযোগ সমাধান ব্যর্থ হয়েছে');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  const summary = balanceSheet?.summary;

  return (
    <div className="space-y-6">
      
      {/* ১. অধ্যক্ষ হেডার ওভারভিউ */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#1A365D] to-[#142B4E] p-6 sm:p-8 text-white shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange text-white text-2xl font-black shadow-lg shadow-brand-orange/30">
              👑
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">অধ্যক্ষ এক্সিকিউটিভ কমান্ড সেন্টার</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  সুপার অ্যাডমিন
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                স্টারলাইট কলেজ, সিলেট | EIIN: 135342 | লাইভ প্রশাসনিক নিয়ন্ত্রণ
              </p>
            </div>
          </div>

          {/* এক ক্লিকে রেজাল্ট প্রসেসিং উইজেট */}
          <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            <select
              value={selectedExamForProcess}
              onChange={(e) => setSelectedExamForProcess(e.target.value)}
              className="rounded-xl bg-[#0F2C59] text-white px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
            <button
              onClick={handleProcessResult}
              disabled={processingResult}
              className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow hover:bg-brand-orange-hover transition disabled:opacity-70"
            >
              <Award className="h-4 w-4" />
              <span>{processingResult ? 'প্রসেস হচ্ছে...' : 'রেজাল্ট ও মেধা প্রসেস'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ২. লাইভ আর্থিক ব্যালেন্স শিট কার্ডস (SUM & Group By) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* মোট ফি কালেকশন */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">মোট ফি আদায়</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-600">
              ৳ {summary?.total_fee_collected?.toFixed(2) || "0.00"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">বর্তমান শিক্ষাবর্ষে সংগৃহীত</p>
          </div>
        </div>

        {/* মোট অনুমোদিত খরচ */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">অনুমোদিত খরচ</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-red-600">
              ৳ {summary?.total_approved_expense?.toFixed(2) || "0.00"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">ভাউচার অডিটকৃত মোট ব্যয়</p>
          </div>
        </div>

        {/* নিট ক্যাশ ইন হ্যান্ড / স্থিতি */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">নিট তহবিল স্থিতি</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-brand-navy">
              ৳ {summary?.net_cash_in_hand?.toFixed(2) || "0.00"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">আদায় হতে খরচ বাদ দিয়ে অবশিষ্ট</p>
          </div>
        </div>

        {/* মোট অনাদায়ী বকেয়া */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">শিক্ষার্থীদের বকেয়া</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-brand-orange">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-brand-orange">
              ৳ {summary?.total_student_due_receivable?.toFixed(2) || "0.00"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">পরিশোধের অপেক্ষায় রয়েছে</p>
          </div>
        </div>

      </div>

      {/* ৩. সুরক্ষিত গোপন অভিযোগ ও পরামর্শ বক্স (আপনার নির্দেশিত লজিক) */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl bg-red-100 p-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-navy">গোপন অভিযোগ ও পরামর্শ বক্স (অধ্যক্ষ প্রিভিউ)</h3>
              <p className="text-xs text-slate-400">শিক্ষার্থী পরিচয় গোপন রাখলেও অধ্যক্ষ এখানে তার আসল নাম, রোল ও ফোন দেখতে পাচ্ছেন।</p>
            </div>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            মোট অভিযোগ: {complaints.length}টি
          </span>
        </div>

        {complaints.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">বর্তমানে কোনো অভিযোগ বা পরামর্শ জমা নেই।</p>
        ) : (
          <div className="space-y-3">
            {complaints.map((comp) => (
              <div 
                key={comp.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-brand-navy transition cursor-pointer"
                onClick={() => setSelectedComplaint(selectedComplaint?.id === comp.id ? null : comp)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                        {comp.category_display}
                      </span>
                      <h4 className="font-bold text-xs text-brand-navy">{comp.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{comp.description}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    comp.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {comp.status_display}
                  </span>
                </div>

                {/* ক্লিকে আসল শিক্ষার্থীর বিস্তারিত পরিচয় রিভিল হওয়া */}
                {selectedComplaint?.id === comp.id && comp.student_details && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 bg-white p-3.5 rounded-xl border">
                    <p className="text-[11px] font-bold text-brand-orange mb-2">🔍 শিক্ষার্থীর গোপন তথ্য (শুধুমাত্র অধ্যক্ষ দৃশ্যমান):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div><span className="text-slate-400">নাম:</span> <span className="font-bold text-slate-800">{comp.student_details.student_name}</span></div>
                      <div><span className="text-slate-400">রোল ও শাখা:</span> <span className="font-bold text-slate-800">{comp.student_details.roll_number} ({comp.student_details.section})</span></div>
                      <div><span className="text-slate-400">স্টুডেন্ট ফোন:</span> <span className="font-bold text-slate-800">{comp.student_details.student_phone || "-"}</span></div>
                      <div><span className="text-slate-400">অভিভাবকের ফোন:</span> <span className="font-bold text-brand-navy">{comp.student_details.guardian_phone}</span></div>
                    </div>

                    {comp.status !== 'RESOLVED' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveComplaint(comp.id, 'RESOLVED');
                          }}
                          className="flex items-center space-x-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>নিষ্পত্তি সম্পন্ন করুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PrincipalDashboard;