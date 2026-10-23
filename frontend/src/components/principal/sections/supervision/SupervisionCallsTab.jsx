import React from 'react';
import { PhoneCall, Plus, RefreshCw, AlertCircle } from 'lucide-react';

const SupervisionCallsTab = ({
  parentCallsData,
  loadingCalls,
  refetchCalls,
  showNewCallForm,
  setShowNewCallForm,
  newCallForm,
  setNewCallForm,
  submittingCall,
  onCreateCall,
  sectionStudents,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* হেডার ও অ্যাকশন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h4 className="text-sm font-extrabold text-brand-navy">
            অভিভাবক যোগাযোগ ও কল ডায়েরি
          </h4>
          <p className="text-xs text-slate-500">
            ৭২% এর কম উপস্থিতি বা দুর্বল আচরণে অভিভাবকের সাথে শ্রেণি ইনচার্জের যোগাযোগের নথিপত্র।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchCalls()}
            disabled={loadingCalls}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`h-4 w-4 ${loadingCalls ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNewCallForm(!showNewCallForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:brightness-110 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>নতুন অভিভাবক কল লগ</span>
          </button>
        </div>
      </div>

      {/* নতুন কল ফর্ম মডাল / ইনলাইন ফর্ম */}
      {showNewCallForm && (
        <form onSubmit={onCreateCall} className="bg-white p-5 rounded-2xl border border-orange-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h5 className="text-xs font-black text-brand-navy uppercase tracking-wider">
              অভিভাবকের সাথে ফোনালাপ নথিবদ্ধকরণ
            </h5>
            <button
              type="button"
              onClick={() => setShowNewCallForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              বন্ধ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">শিক্ষার্থী নির্বাচন</label>
              <select
                value={newCallForm.student}
                onChange={(e) => {
                  const stu = sectionStudents.find(s => String(s.id) === e.target.value);
                  setNewCallForm({
                    ...newCallForm,
                    student: e.target.value,
                    guardian_phone_called: stu?.guardian_phone || stu?.phone || newCallForm.guardian_phone_called
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              >
                <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                {sectionStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    রোল {s.roll_number || 'N/A'} - {s.student_name || s.user?.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">আলোচনার বিষয় (Category)</label>
              <select
                value={newCallForm.category}
                onChange={(e) => setNewCallForm({ ...newCallForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              >
                <option value="ATTENDANCE">অনুপস্থিতি সংক্রান্ত (Attendance)</option>
                <option value="ACADEMIC">অ্যাকাডেমিক ফলাফল / পড়ালেখা</option>
                <option value="DISCIPLINE">শৃঙ্খলা / আচরণবিধি</option>
                <option value="FEE">মাসিক বেতন / ফি বকেয়া</option>
                <option value="GENERAL">সাধারণ যোগাযোগ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">অভিভাবকের ফোন নম্বর</label>
              <input
                type="text"
                placeholder="017XXXXXXXX"
                value={newCallForm.guardian_phone_called}
                onChange={(e) => setNewCallForm({ ...newCallForm, guardian_phone_called: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">আলোচনার মূল বিষয় / কারণ</label>
              <textarea
                rows={2}
                placeholder="অভিভাবকের সাথে আলোচনার মূল কথা..."
                value={newCallForm.discussion_summary}
                onChange={(e) => setNewCallForm({ ...newCallForm, discussion_summary: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-brand-orange focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">অভিভাবকের প্রতিক্রিয়া / সিদ্ধান্ত</label>
              <textarea
                rows={2}
                placeholder="অভিভাবকের বক্তব্য বা প্রতিশ্রুতি..."
                value={newCallForm.guardian_response}
                onChange={(e) => setNewCallForm({ ...newCallForm, guardian_response: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={newCallForm.follow_up_needed}
                onChange={(e) => setNewCallForm({ ...newCallForm, follow_up_needed: e.target.checked })}
                className="rounded text-brand-orange"
              />
              <span>পরবর্তীতে ফলো-আপ কল বা বৈঠক প্রয়োজন (Follow-up Needed)</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewCallForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submittingCall}
                className="px-5 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl shadow hover:brightness-110"
              >
                {submittingCall ? 'সংরক্ষণ হচ্ছে...' : 'লগ সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* কল তালিকা */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">
            অভিভাবক কল হিস্ট্রি ({parentCallsData.length} টি কল)
          </h4>
        </div>

        {loadingCalls ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-orange border-t-transparent" />
          </div>
        ) : parentCallsData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            এখনও কোনো অভিভাবক কল রেকর্ড করা হয়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {parentCallsData.map((call) => (
              <div key={call.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-brand-navy">
                      {call.student_name || `রোল ${call.roll_number || 'N/A'}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {call.category_display || call.category}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {call.call_date || call.created_at?.split('T')[0]}
                    </span>
                    {call.follow_up_needed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="h-3 w-3 text-rose-500" />
                        ফলো-আপ প্রয়োজন
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 font-medium">
                    {call.discussion_summary}
                  </p>
                  {call.guardian_response && (
                    <p className="text-slate-500 text-[11px] italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      অভিভাবকের প্রতিক্রিয়া: {call.guardian_response}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      <PhoneCall className="h-3.5 w-3.5 text-brand-orange" />
                      <span>{call.guardian_phone_called || '—'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">কলকারী: {call.caller_name || 'ইনচার্জ'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisionCallsTab;
