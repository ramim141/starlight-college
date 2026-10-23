import React, { useState, useMemo } from 'react';
import { issueMarkerToTeacherApi } from '../../../api/principal';
import { acknowledgeMarkerApi } from '../../../api/teacher';
import { 
  PenTool, 
  CheckCircle2, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  Send, 
  UserCheck 
} from 'lucide-react';
import { toast } from 'sonner';

const COLOR_BADGES = {
  BLACK: { name: 'কালো', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200', dot: 'bg-black' },
  BLUE: { name: 'নীল', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', dot: 'bg-blue-600' },
  RED: { name: 'লাল', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300', dot: 'bg-rose-600' },
  GREEN: { name: 'সবুজ', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', dot: 'bg-emerald-600' },
};

const MarkerRequestsTab = ({ markerRequests = [], isPrincipal = false, isTeacher = false, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'REQUESTED' | 'ISSUED' | 'ACKNOWLEDGED'
  const [issuingRequest, setIssuingRequest] = useState(null);
  const [issueRemarks, setIssueRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ফিল্টার করা আবেদন তালিকা
  const filteredRequests = useMemo(() => {
    return markerRequests.filter((req) => {
      if (statusFilter === 'REQUESTED') return req.status === 'REQUESTED';
      if (statusFilter === 'ISSUED') return req.status === 'ISSUED' && !req.is_acknowledged;
      if (statusFilter === 'ACKNOWLEDGED') return req.is_acknowledged;
      return true;
    });
  }, [markerRequests, statusFilter]);

  // প্রিন্সিপাল কর্তৃক ইস্যু মডাল ওপেন
  const openIssueModal = (req) => {
    setIssuingRequest(req);
    setIssueRemarks('অধ্যক্ষ কর্তৃক মার্কার ইস্যু অনুমোদিত');
  };

  // মার্কার ইস্যু নিশ্চিতকরণ
  const handleConfirmIssue = async (e) => {
    e.preventDefault();
    if (!issuingRequest) return;

    setSubmitting(true);
    try {
      const res = await issueMarkerToTeacherApi(issuingRequest.id, issueRemarks);
      if (res.success || res.id) {
        toast.success(res.message || 'মার্কার সফলভাবে ইস্যু করা হয়েছে');
        setIssuingRequest(null);
        onRefresh?.();
      }
    } catch (err) {
      toast.error('মার্কার ইস্যু করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  // শিক্ষক কর্তৃক মার্কার বুঝে নেওয়া
  const handleAcknowledge = async (id) => {
    setSubmitting(true);
    try {
      const res = await acknowledgeMarkerApi(id);
      if (res.success || res.data) {
        toast.success(res.message || 'মার্কার প্রাপ্তি নিশ্চিত হয়েছে এবং স্টক কর্তন করা হয়েছে');
        onRefresh?.();
      }
    } catch (err) {
      toast.error('মার্কার প্রাপ্তি নিশ্চিতকরণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ফিল্টার বার */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'ALL'
                ? 'bg-brand-orange text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            সকল রিকোয়েস্ট ({markerRequests.length})
          </button>
          <button
            onClick={() => setStatusFilter('REQUESTED')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'REQUESTED'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            অপেক্ষমাণ ({markerRequests.filter(r => r.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setStatusFilter('ISSUED')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'ISSUED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ইস্যুকৃত ({markerRequests.filter(r => r.status === 'ISSUED' && !r.is_acknowledged).length})
          </button>
          <button
            onClick={() => setStatusFilter('ACKNOWLEDGED')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'ACKNOWLEDGED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            গৃহীত / স্টক কর্তিত ({markerRequests.filter(r => r.is_acknowledged).length})
          </button>
        </div>
      </div>

      {/* তালিকা: ডেস্কটপে টেবিল, মোবাইলে কার্ড */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <PenTool className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো মার্কার আবেদন পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-400 mt-1">নির্বাচিত ফিল্টারে এই মুহূর্তে কোনো মার্কারের রেকর্ড নেই।</p>
        </div>
      ) : (
        <>
          {/* মোবাইল কার্ড ভিউ */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredRequests.map((req) => {
              const colorCfg = COLOR_BADGES[req.marker_color] || COLOR_BADGES.BLACK;

              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{req.teacher_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{req.purpose || 'ক্লাসরুম ব্যবহার'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${colorCfg.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${colorCfg.dot}`} />
                      {req.color_display || colorCfg.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">পরিমাণ: <strong>{req.quantity} টি</strong></span>
                    <div>
                      {req.is_acknowledged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> বুঝে পেয়েছেন
                        </span>
                      ) : req.status === 'ISSUED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          <Clock className="w-3 h-3" /> ইস্যুকৃত (প্রাপ্তি বাকি)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          <AlertCircle className="w-3 h-3" /> অপেক্ষমাণ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* অ্যাকশন বাটন */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    {isPrincipal && req.status === 'REQUESTED' ? (
                      <button
                        onClick={() => openIssueModal(req)}
                        className="min-h-[44px] w-full flex items-center justify-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" /> মার্কার ইস্যু করুন
                      </button>
                    ) : isTeacher && req.status === 'ISSUED' && !req.is_acknowledged ? (
                      <button
                        onClick={() => handleAcknowledge(req.id)}
                        disabled={submitting}
                        className="min-h-[44px] w-full flex items-center justify-center gap-1 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" /> বুঝে পেয়েছি (নিশ্চিত করুন)
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">প্রক্রিয়া সম্পন্ন</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ডেস্কটপ টেবিল ভিউ */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs uppercase font-bold sticky top-0">
                  <tr>
                    <th className="py-3 px-4">শিক্ষকের নাম</th>
                    <th className="py-3 px-4">মার্কারের রং</th>
                    <th className="py-3 px-4">পরিমাণ</th>
                    <th className="py-3 px-4">আবেদনের কারণ</th>
                    <th className="py-3 px-4">বর্তমান স্ট্যাটাস</th>
                    <th className="py-3 px-4">ইস্যু / প্রাপ্তির তারিখ</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map((req) => {
                    const colorCfg = COLOR_BADGES[req.marker_color] || COLOR_BADGES.BLACK;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                          {req.teacher_name}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${colorCfg.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${colorCfg.dot}`} />
                            {req.color_display || colorCfg.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {req.quantity} টি
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          {req.purpose || 'ক্লাসের জন্য'}
                        </td>
                        <td className="py-3 px-4">
                          {req.is_acknowledged ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> বুঝে পেয়েছেন (স্টক কর্তিত)
                            </span>
                          ) : req.status === 'ISSUED' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
                              <Clock className="w-3.5 h-3.5" /> অফিস থেকে ইস্যুকৃত
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5" /> অনুমোদন অপেক্ষমাণ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                          {req.acknowledged_at ? (
                            new Date(req.acknowledged_at).toLocaleDateString('bn-BD')
                          ) : req.issued_at ? (
                            new Date(req.issued_at).toLocaleDateString('bn-BD')
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isPrincipal && req.status === 'REQUESTED' ? (
                            <button
                              onClick={() => openIssueModal(req)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              ইস্যু করুন
                            </button>
                          ) : isTeacher && req.status === 'ISSUED' && !req.is_acknowledged ? (
                            <button
                              onClick={() => handleAcknowledge(req.id)}
                              disabled={submitting}
                              className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 ml-auto"
                            >
                              <Check className="w-3.5 h-3.5" /> বুঝে পেয়েছি
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">সম্পন্ন</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ২-ধাপের মার্কার ইস্যু কনফার্মেশন মডাল (প্রিন্সিপাল) */}
      {issuingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                শিক্ষককে মার্কার ইস্যু অনুমোদন
              </h3>
              <button 
                onClick={() => setIssuingRequest(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div>শিক্ষক: <strong>{issuingRequest.teacher_name}</strong></div>
              <div>মার্কারের রং: <strong>{issuingRequest.color_display || issuingRequest.marker_color}</strong></div>
              <div>পরিমাণ: <strong>{issuingRequest.quantity} টি</strong></div>
              <div>উদ্দেশ্য: <em>{issuingRequest.purpose || 'শ্রেণিকক্ষে ব্যবহারের জন্য'}</em></div>
            </div>

            <p className="text-[11px] text-slate-500">
              ইস্যু অনুমোদনের পর শিক্ষক তার পোর্টাল থেকে মার্কার গ্রহণের কনফার্মেশন দিলেই সেন্ট্রাল স্টক স্বয়ংক্রিয়ভাবে কর্তিত হবে।
            </p>

            <form onSubmit={handleConfirmIssue} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">ইস্যু মন্তব্য / নির্দেশনা</label>
                <input
                  type="text"
                  value={issueRemarks}
                  onChange={(e) => setIssueRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIssuingRequest(null)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  ইস্যু নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkerRequestsTab;
