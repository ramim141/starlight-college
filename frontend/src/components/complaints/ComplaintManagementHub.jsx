import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { getStudentComplaintsApi, resolveStudentComplaintApi } from '../../api/principal';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  User, 
  Phone, 
  Calendar,
  XCircle,
  Filter,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * ComplaintManagementHub - বহু-ব্যবহারযোগ্য অভিযোগ ও মতামত পোর্টাল কম্পোনেন্ট
 * এটি প্রিন্সিপাল (অ্যাডমিন সমাধান ও পরিচয় দেখা) এবং শিক্ষার্থী (নতুন অভিযোগ জমা দেওয়া) উভয় রোল পরিচালনা করতে পারে।
 */
const ComplaintManagementHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isStudent: authIsStudent } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isStudent = overrideRole ? overrideRole === 'STUDENT' : authIsStudent;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [revealedIds, setRevealedIds] = useState(new Set());
  
  // সিদ্ধান্ত গ্রহণ মডাল (প্রিন্সিপাল)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionStatus, setActionStatus] = useState('RESOLVED');
  const [actionRemarks, setActionRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // নতুন অভিযোগ দাখিল মডাল (শিক্ষার্থী)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'ACADEMIC',
    description: '',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getStudentComplaintsApi(filterStatus);
      const list = res.results || res;
      setComplaints(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('অভিযোগ ও পরামর্শ লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const toggleRevealIdentity = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!actionRemarks.trim()) {
      toast.error('পর্যালোচনা বা সিদ্ধান্তের মন্তব্য লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resolveStudentComplaintApi(selectedComplaint.id, actionStatus, actionRemarks);
      if (res.success) {
        toast.success(res.message);
        setSelectedComplaint(null);
        setActionRemarks('');
        fetchComplaints();
      }
    } catch (err) {
      toast.error('সিদ্ধান্ত সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('operations/complaints/', newComplaint);
      if (res.data.id || res.data.success) {
        toast.success('আপনার অভিযোগ/পরামর্শ সফলভাবে জমা হয়েছে। আপনার পরিচয় সুরক্ষিত থাকবে।');
        setShowSubmitModal(false);
        setNewComplaint({ title: '', category: 'ACADEMIC', description: '' });
        fetchComplaints();
      }
    } catch (err) {
      toast.error('অভিযোগ জমা ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3 h-3" /> অপেক্ষমাণ</span>;
      case 'INVESTIGATING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20"><AlertTriangle className="w-3 h-3" /> তদন্তাধীন</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> সমাধানকৃত</span>;
      case 'DISMISSED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20"><XCircle className="w-3 h-3" /> খারিজ</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">গোপন অভিযোগ ও পরামর্শ পোর্টাল</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              {isPrincipal
                ? 'সাধারণ শিক্ষার্থীদের পরিচয় সুরক্ষিত রেখে সরাসরি অধ্যক্ষের কাছে পাঠানো অভিযোগ ও পরামর্শ পর্যবেক্ষণ'
                : 'আপনার পরিচয় সুরক্ষিত রেখে কলেজের যে কোনো অনিয়ম বা উন্নয়নের পরামর্শ দাখিল করুন'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ফিল্টার বাটনসমূহ */}
          <div className="flex items-center bg-slate-900/60 p-1.5 rounded-xl border border-white/10">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            {['', 'PENDING', 'INVESTIGATING', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === st
                    ? 'bg-brand-orange text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === '' ? 'সকল' : st === 'PENDING' ? 'অপেক্ষমাণ' : st === 'INVESTIGATING' ? 'তদন্তাধীন' : 'সমাধান'}
              </button>
            ))}
          </div>

          {/* শিক্ষার্থী বা যে কারও জন্য অভিযোগ দাখিল বাটন */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" /> অভিযোগ দাখিল
          </button>
        </div>
      </div>

      {/* লোডিং / তালিকা */}
      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div data-tab-panel="true" key={filterStatus} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো অভিযোগ জমা নেই</h3>
          <p className="text-xs text-slate-400 mt-1">নির্বাচিত ফিল্টারে কোনো রেকর্ড পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div data-tab-panel="true" key={filterStatus} className="grid grid-cols-1 gap-4">
          {complaints.map((item) => {
            const isRevealed = revealedIds.has(item.id);
            const studentInfo = item.student_details || {};

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.category_display || item.category || 'সাধারণ'}
                      </span>
                      {getStatusBadge(item.status)}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </h3>

                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {item.description}
                    </p>

                    {item.principal_remarks && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                        <strong className="block font-semibold mb-0.5">অধ্যক্ষের সিদ্ধান্ত ও গৃহীত ব্যবস্থা:</strong>
                        {item.principal_remarks}
                      </div>
                    )}
                  </div>

                  {/* প্রিন্সিপাল অ্যাকশন প্যানেল */}
                  {isPrincipal && (
                    <div className="lg:w-72 flex flex-col gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          পরিচয় সুরক্ষা
                        </span>
                        <button
                          onClick={() => toggleRevealIdentity(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3 h-3" /> পরিচয় আড়াল
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" /> আসল ছাত্র দেখুন
                            </>
                          )}
                        </button>
                      </div>

                      {isRevealed ? (
                        <div className="space-y-1 p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {studentInfo.name || item.student_name || 'নাম সংরক্ষিত'}
                          </div>
                          <div className="text-slate-500">আইডি: {studentInfo.student_id || item.student_id || 'N/A'}</div>
                          <div className="text-slate-500">শাখা: {studentInfo.section || 'N/A'}</div>
                          {studentInfo.phone && <div className="text-slate-500">মোবাইল: {studentInfo.phone}</div>}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic p-2 bg-white dark:bg-slate-900 rounded-lg text-center">
                          🔒 শিক্ষার্থীর পরিচয় গোপন রাখা হয়েছে।
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setActionStatus(item.status === 'PENDING' ? 'RESOLVED' : item.status);
                          setActionRemarks(item.principal_remarks || '');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#0F2C59] hover:bg-[#153e7c] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-brand-orange" />
                        ব্যবস্থা গ্রহণ করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* সমাধান ও সিদ্ধান্ত মডাল (প্রিন্সিপাল) */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-orange" />
              অভিযোগের পর্যালোচনা ও সিদ্ধান্ত
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
              {selectedComplaint.title}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">স্ট্যাটাস নির্ধারণ</label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold"
              >
                <option value="INVESTIGATING">তদন্তাধীন (Under Investigation)</option>
                <option value="RESOLVED">সমাধানকৃত (Resolved)</option>
                <option value="DISMISSED">খারিজ (Dismissed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">অধ্যক্ষের মন্তব্য ও নির্দেশনামূলক নোট</label>
              <textarea
                rows={4}
                required
                placeholder="যেমন: সংশ্লিষ্ট শিক্ষকের সাথে কথা বলে সমাধান করা হয়েছে..."
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleResolveSubmit}
                className="px-5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-semibold shadow-md"
              >
                {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত সেভ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* নতুন অভিযোগ দাখিল মডাল (শিক্ষার্থী/অন্যান্য) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-orange" />
              গোপন অভিযোগ / পরামর্শ দাখিল
            </h3>
            <p className="text-xs text-slate-500">
              আপনার মতামত সরাসরি অধ্যক্ষের টেবিলে পৌঁছাবে। সহপাঠী বা শিক্ষকদের কাছে আপনার নাম গোপন থাকবে।
            </p>

            <form onSubmit={handleCreateComplaint} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ক্যাটাগরি</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="ACADEMIC">একাডেমিক ও ক্লাস সংক্রান্ত</option>
                  <option value="CANTEEN">ক্যান্টিন ও খাবার মান</option>
                  <option value="BULLYING">র‌্যাগিং বা বুলিং সংক্রান্ত</option>
                  <option value="INFRASTRUCTURE">ক্লাসরুম, ওয়াশরুম বা ফার্নিচার</option>
                  <option value="LIBRARY">লাইব্রেরি ও বই</option>
                  <option value="OTHER">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বিষয় বা শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৩য় পিরিয়ডে ফ্যানের সমস্যা..."
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  rows={4}
                  required
                  placeholder="সমস্যার স্থান, তারিখ এবং বিস্তারিত বিষয় লিখুন..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  {submitting ? 'দাখিল হচ্ছে...' : 'জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagementHub;




