import React, { useState, useEffect } from 'react';
import { Search, BookOpen, MapPin, X, CheckCircle2, AlertCircle } from 'lucide-react';

const BookCatalogList = ({ books = [], onSelectBook, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // ৩০০ মিলি-সেকেন্ড ডিবাউন্স সার্চ
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // বইয়ের তালিকা থেকে ডিস্টিঙ্কট ক্যাটাগরি এক্সট্রাক্ট করা
  const categories = ['ALL', ...Array.from(new Set(books.map((b) => b.category_name).filter(Boolean)))];

  // ফিল্টারিং লজিক (ডিবাউন্সড সার্চ ও ক্যাটাগরি)
  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === 'ALL' || book.category_name === selectedCategory;
    const s = debouncedSearch.toLowerCase().trim();
    const matchesSearch = 
      !s || 
      book.title?.toLowerCase().includes(s) || 
      book.author?.toLowerCase().includes(s) ||
      book.isbn?.toLowerCase().includes(s);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      
      {/* ১. সার্চ বার ও ক্যাটাগরি চিপস */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="বইয়ের নাম, লেখক বা বিষয় দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 py-3 text-xs font-semibold text-slate-900 shadow-soft focus:border-brand-orange focus:outline-none transition min-h-[44px]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="সার্চ মুছুন"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ক্যাটাগরি চিপস (হরিজন্টাল স্ক্রল) */}
        {categories.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[38px] ${
                  selectedCategory === cat
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
                }`}
              >
                {cat === 'ALL' ? 'সব বই' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ২. বই গ্রিড */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/70" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/90 shadow-soft">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h4 className="mt-3 text-sm font-bold text-slate-700">কোনো বই খুঁজে পাওয়া যায়নি</h4>
          <p className="mt-1 text-xs text-slate-400">
            {searchTerm ? `"${searchTerm}" সম্পর্কিত কোনো বই ক্যাটালগে নেই।` : 'লাইব্রেরি ক্যাটালগ বর্তমানে খালি রয়েছে।'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition min-h-[40px]"
            >
              সব বই দেখুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.available_copies > 0;
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group rounded-3xl bg-white p-5 border border-slate-200/80 shadow-soft hover:shadow-premium hover:border-brand-orange/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* টপ ক্যাটাগরি ও স্টক স্ট্যাটাস */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <span className="rounded-xl bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 truncate max-w-[140px]">
                      {book.category_name || 'সাধারণ'}
                    </span>

                    <span
                      className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border shrink-0 ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>কপি আছে ({book.available_copies})</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          <span>স্টক শেষ</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* বইয়ের নাম ও লেখক */}
                  <div className="pt-3">
                    <h4 className="text-sm font-bold text-brand-navy group-hover:text-brand-orange transition line-clamp-2 leading-snug">
                      {book.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 font-medium truncate">
                      লেখক: {book.author}
                    </p>
                  </div>
                </div>

                {/* তলা: তাকের অবস্থান ও বিস্তারিত ইঙ্গিত */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1 truncate">
                    <MapPin className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                    <span className="font-semibold text-slate-600 truncate">{book.shelf_location || 'লাইব্রেরি শেলফ'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-orange group-hover:underline shrink-0">
                    বিস্তারিত →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default BookCatalogList;
