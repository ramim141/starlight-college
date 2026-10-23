import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  X,
  ExternalLink 
} from 'lucide-react';
import { getMediaUrl } from '../../../api/homepage';
import { formatDateBn, toBanglaNumber } from './HomeworkCard';

const SyllabusList = ({ syllabi = [], isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  // সকল অনন্য বিষয়ের তালিকা তৈরি
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set();
    syllabi.forEach((item) => {
      if (item.subject_name) subjects.add(item.subject_name);
    });
    return Array.from(subjects);
  }, [syllabi]);

  // ফিল্টার করা সিলেবাস তালিকা
  const filteredSyllabi = useMemo(() => {
    return syllabi.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subject_name && item.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.session && item.session.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSubject =
        selectedSubject === 'ALL' || item.subject_name === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [syllabi, searchTerm, selectedSubject]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-3xl bg-white p-6 border border-slate-200 shadow-soft animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-slate-200 rounded-lg" />
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
            </div>
            <div className="h-5 w-60 bg-slate-200 rounded-md" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ১. সার্চ ও বিষয় ফিল্টার বার */}
      <div className="space-y-3">
        {/* সার্চ ইনপুট */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="সিলেবাস বা বিষয় অনুসন্ধান করুন..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 py-3 text-xs font-medium text-brand-navy placeholder:text-slate-400 focus:border-brand-navy focus:outline-none transition shadow-2xs min-h-[46px]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* বিষয় ফিল্টার চিপস */}
        {uniqueSubjects.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSubject('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[36px] border ${
                selectedSubject === 'ALL'
                  ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              সকল বিষয় ({toBanglaNumber(syllabi.length)})
            </button>

            {uniqueSubjects.map((subject) => {
              const isSelected = selectedSubject === subject;
              const count = syllabi.filter((s) => s.subject_name === subject).length;

              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[36px] border ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-navy shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <span>{subject}</span>
                  <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    ({toBanglaNumber(count)})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ২. সিলেবাস ফাইল তালিকা বা ফাঁকা অবস্থা */}
      {filteredSyllabi.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center border border-slate-200/80 shadow-soft space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-brand-navy">
              {syllabi.length === 0 ? 'বর্তমানে কোনো সিলেবাস আপলোড করা নেই' : 'অনুসন্ধানের সাথে কোনো সিলেবাস মেলেনি'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              কলেজের শিক্ষকগণ সংশ্লিষ্ট বিষয়ের পরীক্ষার সিলেবাস ও পাঠ পরিকল্পনা আপলোড করলে এখানে পাওয়া যাবে।
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredSyllabi.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-premium transition space-y-4"
            >
              {/* মেটা বার: বিষয় ও শিক্ষাবর্ষ */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="rounded-xl bg-brand-orange/10 px-3 py-1 text-xs font-black text-brand-orange">
                    {item.subject_name || 'বিষয়'}
                  </span>
                  {item.session && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-600">
                      সেশন: {toBanglaNumber(item.session)}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDateBn(item.created_at)}</span>
                </span>
              </div>

              {/* সিলেবাসের নাম ও শিক্ষক */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-brand-navy tracking-tight leading-snug">
                  {item.title}
                </h3>
                {item.uploaded_by_name && (
                  <p className="text-xs text-slate-500 flex items-center space-x-1">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>আপলোডকারী শিক্ষক: <strong>{item.uploaded_by_name}</strong></span>
                  </p>
                )}
              </div>

              {/* ডাউনলোড বাটন */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  PDF / অফিস ডকুমেন্ট
                </span>

                <a
                  href={getMediaUrl(item.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-black shadow-sm transition active:scale-[0.98] min-h-[40px]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>সিলেবাস ফাইল ডাউনলোড</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SyllabusList;
