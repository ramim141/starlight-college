import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CalendarDays, 
  CheckCircle2, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import HomeworkCard, { toBanglaNumber } from './HomeworkCard';

const HomeworkGroupList = ({ 
  homeworks = [], 
  completedIds = new Set(), 
  onToggleComplete, 
  onSelectHomework 
}) => {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'

  // তারিখের বাউন্ডারি ক্যালকুলেশন
  const groups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const overdue = [];
    const dueToday = [];
    const dueTomorrow = [];
    const dueThisWeek = [];
    const upcoming = [];
    const completed = [];

    // প্রথমে ফিল্টার প্রযোজ্য করা
    const filtered = homeworks.filter((item) => {
      const isDone = completedIds.has(item.id);
      if (filter === 'PENDING') return !isDone;
      if (filter === 'COMPLETED') return isDone;
      return true;
    });

    filtered.forEach((item) => {
      const isDone = completedIds.has(item.id);
      if (isDone && filter === 'ALL') {
        completed.push(item);
        return;
      }

      if (!item.due_date) {
        upcoming.push(item);
        return;
      }

      const due = new Date(item.due_date);
      due.setHours(0, 0, 0, 0);

      if (due < today) {
        overdue.push(item);
      } else if (due.getTime() === today.getTime()) {
        dueToday.push(item);
      } else if (due.getTime() === tomorrow.getTime()) {
        dueTomorrow.push(item);
      } else if (due <= endOfWeek) {
        dueThisWeek.push(item);
      } else {
        upcoming.push(item);
      }
    });

    return [
      { key: 'overdue', title: 'মেয়াদোত্তীর্ণ কাজ (Overdue)', items: overdue, icon: AlertTriangle, color: 'text-rose-600', badgeClass: 'bg-rose-100 text-rose-800' },
      { key: 'today', title: 'আজকের কাজ (Due Today)', items: dueToday, icon: Clock, color: 'text-amber-600', badgeClass: 'bg-amber-100 text-amber-900' },
      { key: 'tomorrow', title: 'আগামীকালের কাজ (Due Tomorrow)', items: dueTomorrow, icon: Calendar, color: 'text-blue-600', badgeClass: 'bg-blue-100 text-blue-900' },
      { key: 'thisWeek', title: 'এই সপ্তাহের কাজ (This Week)', items: dueThisWeek, icon: CalendarDays, color: 'text-indigo-600', badgeClass: 'bg-indigo-100 text-indigo-900' },
      { key: 'upcoming', title: 'আসন্ন কাজ (Upcoming)', items: upcoming, icon: Sparkles, color: 'text-slate-600', badgeClass: 'bg-slate-100 text-slate-800' },
      { key: 'completed', title: 'সম্পন্নকৃত কাজ (Completed)', items: completed, icon: CheckCircle2, color: 'text-emerald-600', badgeClass: 'bg-emerald-100 text-emerald-800' },
    ];
  }, [homeworks, completedIds, filter]);

  const totalCompleted = homeworks.filter((h) => completedIds.has(h.id)).length;
  const totalPending = homeworks.length - totalCompleted;

  return (
    <div className="space-y-6">
      {/* ফিল্টার চিপস বার */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'সব হোমওয়ার্ক', count: homeworks.length },
          { key: 'PENDING', label: 'বাকি আছে', count: totalPending },
          { key: 'COMPLETED', label: 'সম্পন্ন হয়েছে', count: totalCompleted },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[40px] border ${
              filter === f.key
                ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span>{f.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {toBanglaNumber(f.count)}
            </span>
          </button>
        ))}
      </div>

      {/* হোমওয়ার্ক তালিকা বা ফাঁকা অবস্থা */}
      {homeworks.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center border border-slate-200/80 shadow-soft space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto">
            <BookOpen className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-navy">
              বর্তমানে কোনো হোমওয়ার্ক দেওয়া নেই
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              শিক্ষকগণ নতুন বাড়ির কাজ বা অ্যাসাইনমেন্ট পোস্ট করলে তা স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।
            </p>
          </div>
        </div>
      ) : groups.every((g) => g.items.length === 0) ? (
        <div className="rounded-3xl bg-white p-8 text-center border border-slate-200/80 shadow-soft space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-navy">
              {filter === 'PENDING' ? 'সব হোমওয়ার্ক সম্পন্ন হয়েছে!' : 'এই ফিল্টারে কোনো কাজ নেই'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {filter === 'PENDING' ? 'চমৎকার! আপনার কোনো কাজ আর বাকি নেই।' : 'অন্যান্য ফিল্টার নির্বাচন করে কাজগুলো দেখুন।'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            if (group.items.length === 0) return null;
            const GroupIcon = group.icon;

            return (
              <div key={group.key} className="space-y-3">
                {/* গ্রুপ হেডার */}
                <div className="flex items-center space-x-2">
                  <GroupIcon className={`h-4 w-4 ${group.color}`} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {group.title}
                  </h4>
                  <span className={`text-[10px] font-black px-2 py-0.2 rounded-md ${group.badgeClass}`}>
                    {toBanglaNumber(group.items.length)}
                  </span>
                </div>

                {/* কার্ডস গ্রিড */}
                <div className="space-y-3">
                  {group.items.map((hw) => (
                    <HomeworkCard
                      key={hw.id}
                      homework={hw}
                      isCompleted={completedIds.has(hw.id)}
                      onToggleComplete={onToggleComplete}
                      onSelect={onSelectHomework}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeworkGroupList;
