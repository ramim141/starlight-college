import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import { getMyHomeworksApi, getMySyllabiApi } from '../../api/student';
import HomeworkGroupList from '../../components/student/homework/HomeworkGroupList';
import HomeworkDetailSheet from '../../components/student/homework/HomeworkDetailSheet';
import SyllabusList from '../../components/student/homework/SyllabusList';
import { toBanglaNumber } from '../../components/student/homework/HomeworkCard';

const StudentHomework = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('HOMEWORK'); // 'HOMEWORK' | 'SYLLABUS'
  const [selectedHomework, setSelectedHomework] = useState(null);

  // লোকালস্টোরেজ থেকে ব্যক্তিগত সম্পন্নকৃত কাজের সেট লোড
  const storageKey = `starlight_completed_hw_${user?.id || 'default'}`;
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    return new Set();
  });

  // সম্পন্ন টগল হ্যান্ডলার
  const handleToggleComplete = (id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // storage quota
      }
      return next;
    });
  };

  // হোমওয়ার্ক কুয়েরি
  const homeworkQuery = useQuery({
    queryKey: ['student-homeworks'],
    queryFn: () => getMyHomeworksApi(),
    staleTime: 1000 * 60 * 5, // ৫ মিনিট ক্যাশ
  });

  // সিলেবাস কুয়েরি
  const syllabusQuery = useQuery({
    queryKey: ['student-syllabi'],
    queryFn: () => getMySyllabiApi(),
    staleTime: 1000 * 60 * 30, // ৩০ মিনিট ক্যাশ
  });

  const homeworks = Array.isArray(homeworkQuery.data)
    ? homeworkQuery.data
    : (homeworkQuery.data?.results || []);

  const syllabi = Array.isArray(syllabusQuery.data)
    ? syllabusQuery.data
    : (syllabusQuery.data?.results || []);

  // বাকি থাকা হোমওয়ার্ক সংখ্যা
  const pendingCount = useMemo(() => {
    return homeworks.filter((h) => !completedIds.has(h.id)).length;
  }, [homeworks, completedIds]);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* ১. পেজ হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
            <span>পড়াশোনা</span>
            <span>•</span>
            <span className="text-brand-orange">অ্যাকাডেমিক ফাইল</span>
          </div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight leading-snug">
            হোমওয়ার্ক ও সিলেবাস হাব
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            শিক্ষকদের দেওয়া বাড়ির কাজ, অ্যাসাইনমেন্ট ও সেমিস্টার সিলেবাস সহজেই ট্র্যাক ও ডাউনলোড করুন।
          </p>
        </div>

        {/* রিফ্রেশ বাটন */}
        <button
          type="button"
          onClick={() => {
            homeworkQuery.refetch();
            syllabusQuery.refetch();
          }}
          disabled={homeworkQuery.isFetching || syllabusQuery.isFetching}
          className="self-start sm:self-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition shadow-2xs min-h-[44px]"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`h-4 w-4 ${homeworkQuery.isFetching || syllabusQuery.isFetching ? 'animate-spin text-brand-orange' : ''}`} />
        </button>
      </div>

      {/* ২. স্লাইডিং পিল ট্যাব বার */}
      <div className="flex rounded-2xl bg-slate-200/60 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('HOMEWORK')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 min-h-[44px] ${
            activeTab === 'HOMEWORK'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="h-4 w-4 text-brand-orange" />
          <span>হোমওয়ার্ক ও অ্যাসাইনমেন্ট</span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 ml-1">
              {toBanglaNumber(pendingCount)} বাকি
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SYLLABUS')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 min-h-[44px] ${
            activeTab === 'SYLLABUS'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 text-brand-navy" />
          <span>সিলেবাস ও পাঠ পরিকল্পনা</span>
          <span className="rounded-full bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 ml-1">
            {toBanglaNumber(syllabi.length)}
          </span>
        </button>
      </div>

      {/* ৩. ট্যাব কন্টেন্ট */}
      {activeTab === 'HOMEWORK' ? (
        homeworkQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-200 rounded-lg" />
                  <div className="h-5 w-28 bg-slate-200 rounded-full" />
                </div>
                <div className="h-5 w-52 bg-slate-200 rounded" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <HomeworkGroupList
            homeworks={homeworks}
            completedIds={completedIds}
            onToggleComplete={handleToggleComplete}
            onSelectHomework={setSelectedHomework}
          />
        )
      ) : (
        <SyllabusList
          syllabi={syllabi}
          isLoading={syllabusQuery.isLoading}
        />
      )}

      {/* ৪. হোমওয়ার্ক ডিটেইল বটম-শীট */}
      <HomeworkDetailSheet
        homework={selectedHomework}
        isCompleted={selectedHomework ? completedIds.has(selectedHomework.id) : false}
        onToggleComplete={handleToggleComplete}
        onClose={() => setSelectedHomework(null)}
      />
    </div>
  );
};

export default StudentHomework;
