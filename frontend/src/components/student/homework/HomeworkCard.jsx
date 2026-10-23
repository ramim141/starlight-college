import React from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Paperclip, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getMediaUrl } from '../../../api/homepage';

// সংখ্যাকে বাংলায় রূপান্তর
export const toBanglaNumber = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

// তারিখ ফরম্যাট
export const formatDateBn = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getDueStatus = (dueDateStr, isCompleted) => {
  if (!dueDateStr) return { label: 'তারিখ নেই', badgeClass: 'bg-slate-100 text-slate-600' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (isCompleted) {
    return {
      label: 'সম্পন্ন হয়েছে',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      isOverdue: false,
    };
  }

  if (diffDays < 0) {
    return {
      label: 'মেয়াদোত্তীর্ণ (Overdue)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
      icon: AlertTriangle,
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'আজ শেষ দিন',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-black',
      icon: Clock,
      isOverdue: false,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'আগামীকাল জমা',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      isOverdue: false,
    };
  }

  return {
    label: `আর ${toBanglaNumber(diffDays)} দিন বাকি`,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Calendar,
    isOverdue: false,
  };
};

const HomeworkCard = ({ 
  homework, 
  isCompleted = false, 
  onToggleComplete, 
  onSelect 
}) => {
  const statusMeta = getDueStatus(homework.due_date, isCompleted);
  const StatusIcon = statusMeta.icon || Clock;

  return (
    <div
      onClick={() => onSelect(homework)}
      className={`rounded-3xl p-5 sm:p-6 border transition cursor-pointer space-y-3.5 group ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 opacity-85'
          : statusMeta.isOverdue
          ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400 shadow-soft'
          : 'bg-white border-slate-200/90 shadow-soft hover:shadow-premium'
      }`}
    >
      {/* টপ মেটা বার: বিষয় ও ডেডলাইন স্ট্যাটাস */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="rounded-xl bg-brand-navy/10 px-3 py-1 text-xs font-black text-brand-navy">
            {homework.subject_name}
          </span>
          {homework.section_display && (
            <span className="text-[11px] font-bold text-slate-400">
              {homework.section_display}
            </span>
          )}
        </div>

        <span className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-black border ${statusMeta.badgeClass}`}>
          <StatusIcon className="h-3 w-3 shrink-0" />
          <span>{statusMeta.label}</span>
        </span>
      </div>

      {/* হোমওয়ার্কের শিরোনাম ও বর্ণনা সংক্ষেপ */}
      <div className="space-y-1">
        <h3
          className={`text-sm sm:text-base font-black tracking-tight leading-snug group-hover:text-brand-orange transition ${
            isCompleted ? 'line-through text-slate-500' : 'text-brand-navy'
          }`}
        >
          {homework.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {homework.description}
        </p>
      </div>

      {/* মেটা ইনফো ও চেকলিস্ট বাটন */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{homework.teacher_name}</span>
          </span>

          {homework.attachment && (
            <span className="inline-flex items-center space-x-1 text-brand-orange font-bold text-[11px]">
              <Paperclip className="h-3 w-3" />
              <span>সংযুক্তি</span>
            </span>
          )}
        </div>

        {/* চেকলিস্ট টগল বাটন */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(homework.id);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[36px] ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="নিজের ব্যক্তিগত চেকলিস্টে টিক দিন"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>সম্পন্ন</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 text-slate-400" />
                <span>সম্পন্ন মার্ক করুন</span>
              </>
            )}
          </button>

          <span className="p-1 text-slate-400 group-hover:text-brand-orange transition">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default HomeworkCard;
