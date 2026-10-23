import React, { useState } from 'react';
import { UserCheck, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

const AssignInchargeModal = ({
  section,
  teachers,
  teacherAssignedSectionMap,
  onClose,
  onAssign,
  submitting,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    section?.in_charge_teacher ? String(section.in_charge_teacher) : ''
  );
  const [collisionAcknowledged, setCollisionAcknowledged] = useState(false);

  if (!section) return null;

  // Collision detection: Check if the selected teacher already has one or more assigned sections
  const existingAssignments = selectedTeacherId
    ? teacherAssignedSectionMap.get(Number(selectedTeacherId)) || teacherAssignedSectionMap.get(selectedTeacherId) || []
    : [];

  // Exclude current section from collision
  const conflictingSections = existingAssignments.filter((s) => s.id !== section.id);
  const hasCollision = conflictingSections.length > 0;

  const selectedTeacher = teachers.find((t) => String(t.id) === String(selectedTeacherId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return;
    if (hasCollision && !collisionAcknowledged) return;
    onAssign(section.id, Number(selectedTeacherId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-brand-navy">
                শ্রেণি ইনচার্জ নিয়োগ ও পরিবর্তন
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {section.class_level_display || section.class_level} - {section.group_display || section.group} (শাখা: {section.section_name}, সেশন {section.session})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              শিক্ষক নির্বাচন করুন
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setCollisionAcknowledged(false);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-800 focus:border-brand-orange focus:outline-none"
              required
            >
              <option value="">-- শিক্ষক সিলেক্ট করুন --</option>
              {teachers.map((t) => {
                const assigned = teacherAssignedSectionMap.get(t.id) || [];
                const otherAssignments = assigned.filter((s) => s.id !== section.id);
                const isAssignedElsewhere = otherAssignments.length > 0;

                return (
                  <option key={t.id} value={t.id}>
                    {t.full_name || t.username} ({t.teacher_profile?.department || 'শিক্ষক'})
                    {isAssignedElsewhere ? ` ⚠️ [ইতিমধ্যে ${otherAssignments[0].section_name} এর ইনচার্জ]` : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              নির্বাচিত শিক্ষক এই শাখার দৈনিক হাজিরা, অভিভাবক কল এবং ফি সংগ্রহের দায়িত্বপ্রাপ্ত হবেন।
            </p>
          </div>

          {/* ইনচার্জ সংঘাত (Collision Warning Dialog) */}
          {hasCollision && (
            <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-black text-amber-900">ইনচার্জ সংঘাত সতর্কতা (Assignment Conflict)</h4>
                  <p className="text-amber-800 mt-1 leading-relaxed">
                    <span className="font-bold underline">{selectedTeacher?.full_name || selectedTeacher?.username}</span> বর্তমানে অন্য শাখার দায়িত্বপ্রাপ্ত:
                  </p>
                  <ul className="mt-1 list-disc list-inside font-bold text-amber-950">
                    {conflictingSections.map((cs) => (
                      <li key={cs.id}>
                        {cs.class_level_display} ({cs.group_display}) - শাখা {cs.section_name} [সেশন: {cs.session}]
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-amber-800">
                    আপনি কি নিশ্চিত যে তাকে এই শাখায় স্থানান্তর বা অতিরিক্ত দায়িত্ব হিসেবে নিয়োগ দিতে চান?
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-amber-200/80 text-xs font-bold text-amber-950">
                <input
                  type="checkbox"
                  checked={collisionAcknowledged}
                  onChange={(e) => setCollisionAcknowledged(e.target.checked)}
                  className="rounded text-brand-orange h-4 w-4"
                />
                <span>আমি সচেতনভাবে এই শিক্ষককে নতুন শাখায় স্থানান্তর বা দায়িত্ব দিতে সম্মতি দিচ্ছি</span>
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTeacherId || (hasCollision && !collisionAcknowledged)}
              className="rounded-xl bg-brand-orange px-5 py-2 text-xs font-bold text-white shadow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitting ? 'নিয়োগ হচ্ছে...' : 'নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignInchargeModal;
