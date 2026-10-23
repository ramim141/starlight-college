import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const TeacherMonthlyDetailSheet = ({
  isOpen = false,
  onClose,
  teacher = null,
  month = 1,
  year = 2026,
  onOpenVerifyModal,
}) => {
  if (!isOpen || !teacher) return null;

  const records = teacher.dailyRecords || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full sm:max-w-2xl max-h-[85vh] flex flex-col bg-white  rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200  overflow-hidden"
        >
          {/* হেডার */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100  bg-slate-50 ">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-brand-orange font-bold text-sm shadow-sm">
                {teacher.teacherName[0]}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 ">
                  {teacher.teacherName}
                </h3>
                <p className="text-xs text-slate-500">
                  {teacher.department} • আইডি: {teacher.employeeId} • {month}/{year}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-200 "
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* স্ট্যাটস স্ট্রিপ */}
          <div className="grid grid-cols-4 gap-2 p-3 sm:px-6 bg-slate-100/60  border-b border-slate-200  text-center text-xs">
            <div className="p-2 rounded-xl bg-white  shadow-xs">
              <span className="text-slate-500 text-[10px] block">উপস্থিত দিন</span>
              <strong className="text-emerald-600 text-sm">{teacher.presentDays}</strong>
            </div>
            <div className="p-2 rounded-xl bg-white  shadow-xs">
              <span className="text-slate-500 text-[10px] block">লেট কাউন্ট</span>
              <strong className="text-amber-600 text-sm">{teacher.lateDays}</strong>
            </div>
            <div className="p-2 rounded-xl bg-white  shadow-xs">
              <span className="text-slate-500 text-[10px] block">ছুটির দিন</span>
              <strong className="text-blue-600 text-sm">{teacher.leaveDays}</strong>
            </div>
            <div className="p-2 rounded-xl bg-white  shadow-xs">
              <span className="text-slate-500 text-[10px] block">মোট এন্ট্রি</span>
              <strong className="text-slate-800  text-sm">{teacher.totalLogs}</strong>
            </div>
          </div>

          {/* দিনভিত্তিক লগ তালিকা */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
            {records.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Calendar className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs font-semibold">এই মাসে কোনো ডিজিটাল উপস্থিতি রেকর্ড নেই</p>
              </div>
            ) : (
              records.map((rec) => {
                const isLate = !!rec.is_late;
                const isApproved = rec.approval_status === 'APPROVED';
                const isRejected = rec.approval_status === 'REJECTED';

                return (
                  <div
                    key={rec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200  bg-white  shadow-xs hover:border-brand-orange/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100  text-slate-700  font-bold text-xs shrink-0 font-mono">
                        {String(rec.date).slice(-2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900  font-mono">
                            {rec.date}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLate
                                ? 'bg-amber-100 text-amber-800  '
                                : 'bg-emerald-100 text-emerald-800  '
                            }`}
                          >
                            {isLate ? 'বিলম্বিত (Late)' : 'অন-টাইম'}
                          </span>
                          {isApproved && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> অনুমোদিত
                            </span>
                          )}
                          {isRejected && (
                            <span className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                              <AlertCircle className="w-3 h-3" /> বাতিলকৃত
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          <span>ইন: {rec.check_in_time ? String(rec.check_in_time).slice(0, 5) : '—'}</span>
                          <span>আউট: {rec.check_out_time ? String(rec.check_out_time).slice(0, 5) : '—'}</span>
                          {rec.remarks && <span className="italic text-slate-400">({rec.remarks})</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenVerifyModal({
                            attendanceId: rec.id,
                            teacherName: teacher.teacherName,
                            department: teacher.department,
                            checkInTime: rec.check_in_time,
                            isLate: rec.is_late,
                            remarks: rec.remarks,
                          })
                        }
                        className="min-h-[40px] px-3.5 rounded-xl border border-slate-200  bg-slate-50  text-xs font-bold text-slate-700  hover:text-brand-orange"
                      >
                        ভেরিফাই / কারেক্ট
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeacherMonthlyDetailSheet;
