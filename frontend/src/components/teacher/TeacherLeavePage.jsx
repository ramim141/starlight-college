import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import TeacherLeaveModal from '../../components/teacher/TeacherLeaveModal';
import TeacherProxyDuties from '../../components/teacher/TeacherProxyDuties';
import { Plus, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const TeacherLeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('operations/teacher-leaves/');
      setLeaves(res.data.results || res.data || []);
    } catch (e) {
      toast.error('ছুটির হিস্ট্রি লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 border border-slate-100 shadow-soft">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">শিক্ষক ছুটির আবেদন ও প্রক্সি ব্যবস্থাপনা</h2>
          <p className="text-xs text-slate-500">ছুটির আবেদন করুন এবং সহকর্মীদের প্রক্সি ক্লাসের দায়িত্ব পর্যবেক্ষণ করুন।</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-orange-hover"
        >
          <Plus className="h-4 w-4" />
          <span>ছুটির আবেদন করুন</span>
        </button>
      </div>

      {/* প্রক্সি ক্লাসের দায়িত্ব কম্পোনেন্ট */}
      <TeacherProxyDuties />

      {/* আমার ছুটির হিস্ট্রি */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft">
        <h3 className="font-extrabold text-base text-brand-navy mb-4">আমার ছুটির আবেদনসমূহ</h3>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
          </div>
        ) : leaves.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">আপনার কোনো পূর্ববর্তী ছুটির আবেদন নেই।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves.map((l) => (
              <div key={l.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-brand-navy">{l.leave_type_display}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {l.status_display}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600">মেয়াদ: {l.start_date} হতে {l.end_date} ({l.total_days} দিন)</p>
                {l.proxy_teacher_name && (
                  <p className="text-xs text-slate-500 mt-0.5">মনোনীত প্রক্সি শিক্ষক: <strong>{l.proxy_teacher_name}</strong></p>
                )}
                <p className="text-xs text-slate-500 mt-1 italic">"{l.reason}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <TeacherLeaveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchLeaves}
      />
    </div>
  );
};

export default TeacherLeavePage;