import React from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  RefreshCw,
  Users
} from 'lucide-react';

const SupervisionAttendanceTab = ({
  attendanceDate,
  setAttendanceDate,
  attendanceSheetData,
  loadingAttendance,
  refetchAttendance,
  atRiskData,
  actionLoading,
  onSendAbsentWhatsAppAlert,
  onOpenStudent360,
}) => {
  const attStudents = attendanceSheetData?.students || [];
  const totalAttStudents = attStudents.length;
  const presentCount = attStudents.filter((s) => s.status === 'PRESENT').length;
  const absentCount = attStudents.filter((s) => s.status === 'ABSENT').length;
  const lateCount = attStudents.filter((s) => s.status === 'LATE').length;
  const leaveCount = attStudents.filter((s) => s.status === 'LEAVE').length;
  const attendanceRate = totalAttStudents > 0
    ? Math.round(((presentCount + lateCount) / totalAttStudents) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* তারিখ ও অ্যাকশন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">তারিখ নির্বাচন:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
            />
          </div>
          <button
            onClick={() => refetchAttendance()}
            disabled={loadingAttendance}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`h-4 w-4 ${loadingAttendance ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* হোয়াটসঅ্যাপ অ্যালার্ট বাটন */}
        <button
          onClick={onSendAbsentWhatsAppAlert}
          disabled={actionLoading || absentCount === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            absentCount > 0
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="h-4 w-4" />
          <span>অনুপস্থিতদের অভিভাবককে WhatsApp পাঠান ({absentCount} জন)</span>
        </button>
      </div>

      {/* লাইভ উপস্থিতি মেট্রিক্স কার্ডস */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>মোট শিক্ষার্থী</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-brand-navy">{totalAttStudents} জন</p>
          <span className="text-[10px] text-slate-400">নিবন্ধিত শিক্ষার্থী</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-soft">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-bold mb-1">
            <span>উপস্থিত</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{presentCount} জন</p>
          <span className="text-[10px] text-emerald-600/70">যথাসময়ে উপস্থিত</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-amber-100 shadow-soft">
          <div className="flex items-center justify-between text-amber-600 text-xs font-bold mb-1">
            <span>দেরিতে উপস্থিত</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-700">{lateCount} জন</p>
          <span className="text-[10px] text-amber-600/70">বিলম্বিত প্রবেশ</span>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-rose-100 shadow-soft">
          <div className="flex items-center justify-between text-rose-600 text-xs font-bold mb-1">
            <span>অনুপস্থিত</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-700">{absentCount} জন</p>
          <span className="text-[10px] text-rose-600/70">আজ অনুপস্থিত</span>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-brand-orange/10 to-orange-50 p-4 border border-brand-orange/30 shadow-soft col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-brand-orange text-xs font-bold mb-1">
            <span>উপস্থিতির হার</span>
            <Calendar className="h-4 w-4 text-brand-orange" />
          </div>
          <p className="text-2xl font-black text-brand-navy">{attendanceRate}%</p>
          <span className="text-[10px] text-brand-orange font-semibold">আজকের উপস্থিতি হার</span>
        </div>
      </div>

      {/* At-Risk শিক্ষার্থী সতর্কবার্তা (যদি থাকে) */}
      {atRiskData && atRiskData.length > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">
              ঝুঁকিপূর্ণ শিক্ষার্থী সতর্কতা ({atRiskData.length} জন শিক্ষার্থী বিশেষ নজরদারিতে)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {atRiskData.slice(0, 8).map((stu) => (
              <button
                key={stu.student_id || stu.id}
                onClick={() => onOpenStudent360(stu)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800 hover:bg-rose-100 transition shadow-xs"
              >
                <span>রোল {stu.roll_number || 'N/A'}:</span>
                <span className="text-slate-800">{stu.student_name}</span>
                <span className="text-[10px] text-rose-600 font-extrabold">({stu.attendance_percentage || stu.warning_count || 0}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* হাজিরার বিস্তারিত তালিকা */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">
            দৈনিক হাজিরা তালিকা ({attendanceDate})
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            মোট {attStudents.length} জন শিক্ষার্থীর রেকর্ড
          </span>
        </div>

        {loadingAttendance ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-orange border-t-transparent" />
          </div>
        ) : attStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            এই তারিখে কোনো হাজিরা ডাটা পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">রোল</th>
                  <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                  <th className="px-4 py-3">উপস্থিতি স্ট্যাটাস</th>
                  <th className="px-4 py-3">প্রবেশ সময়</th>
                  <th className="px-4 py-3">মন্তব্য / নোট</th>
                  <th className="px-4 py-3 text-right">৩৬০° প্রোফাইল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {attStudents.map((st) => {
                  const statusColors = {
                    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    LATE: 'bg-amber-50 text-amber-700 border-amber-200',
                    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200',
                    LEAVE: 'bg-blue-50 text-blue-700 border-blue-200',
                  };
                  const statusLabels = {
                    PRESENT: 'উপস্থিত (Present)',
                    LATE: 'দেরিতে (Late)',
                    ABSENT: 'অনুপস্থিত (Absent)',
                    LEAVE: 'ছুটি (Leave)',
                  };

                  return (
                    <tr key={st.student_id || st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-brand-navy">
                        #{st.roll_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {st.student_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[st.status] || 'bg-slate-100 text-slate-600'}`}>
                          {statusLabels[st.status] || st.status || 'রেকর্ড নেই'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {st.in_time || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {st.remarks || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenStudent360({ id: st.student_id, full_name: st.student_name, roll_number: st.roll_number })}
                          className="text-[11px] font-bold text-brand-orange hover:underline"
                        >
                          দেখুন →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisionAttendanceTab;
