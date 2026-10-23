import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, FileText } from 'lucide-react';

const TeacherUpcomingClassCard = ({ upcomingClass }) => {
  if (!upcomingClass) return null;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center space-x-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20">
          <BookOpen className="h-7 w-7 text-brand-orange" />
        </div>
        <div>
          <span className="rounded-md bg-brand-orange px-2 py-0.5 text-[10px] font-black uppercase text-white">
            পরবর্তী নির্ধারিত ক্লাস
          </span>
          <h3 className="text-lg font-black text-white mt-1">
            {upcomingClass.subject_name} — {upcomingClass.section_display}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            রুম নম্বর: <strong className="text-white font-mono">{upcomingClass.room_number || 'অনির্ধারিত'}</strong> | 
            সময়: <strong className="text-white font-mono">{upcomingClass.start_time} - {upcomingClass.end_time}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          to="/teacher/incharge/bulk-attendance"
          className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-emerald-400 transition cursor-pointer"
        >
          <CalendarCheck className="h-4 w-4" />
          <span>ক্লাসের হাজিরা নিন</span>
        </Link>
        <Link
          to="/teacher/materials"
          className="flex items-center space-x-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25 transition border border-white/15 cursor-pointer"
        >
          <FileText className="h-4 w-4 text-orange-300" />
          <span>নোট / হোমওয়ার্ক দিন</span>
        </Link>
      </div>
    </div>
  );
};

export default TeacherUpcomingClassCard;
