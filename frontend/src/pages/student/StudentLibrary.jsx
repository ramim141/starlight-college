import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, BookOpen, BookmarkCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getBooksCatalogApi, 
  getMyBorrowedBooksApi, 
  requestBookBorrowApi 
} from '../../api/student';
import BookCatalogList from '../../components/student/library/BookCatalogList';
import BookDetailSheet from '../../components/student/library/BookDetailSheet';
import BorrowConfirmModal from '../../components/student/library/BorrowConfirmModal';
import MyBorrowedBooksList from '../../components/student/library/MyBorrowedBooksList';

const StudentLibrary = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'MY_BOOKS'
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowModalBook, setBorrowModalBook] = useState(null);

  // ১. লাইব্রেরি ক্যাটালগ কোয়েরি
  const {
    data: booksData,
    isLoading: booksLoading,
    isError: booksError,
    refetch: refetchBooks,
    isFetching: booksFetching,
  } = useQuery({
    queryKey: ['library-books'],
    queryFn: () => getBooksCatalogApi(),
    staleTime: 60 * 1000,
  });

  // ২. শিক্ষার্থীর ধার করা বই কোয়েরি
  const {
    data: myBooksData,
    isLoading: myBooksLoading,
    isError: myBooksError,
    refetch: refetchMyBooks,
    isFetching: myBooksFetching,
  } = useQuery({
    queryKey: ['my-borrowed-books'],
    queryFn: getMyBorrowedBooksApi,
    staleTime: 60 * 1000,
  });

  const booksList = Array.isArray(booksData?.results) 
    ? booksData.results 
    : Array.isArray(booksData) 
      ? booksData 
      : [];

  const myBooksList = Array.isArray(myBooksData?.results) 
    ? myBooksData.results 
    : Array.isArray(myBooksData) 
      ? myBooksData 
      : [];

  // শিক্ষার্থীর কোনো বিলম্বিত বই আছে কি না চেক করা (ওভারডিউ গার্ড)
  const hasOverdueBook = myBooksList.some((item) => {
    if (item.status !== 'ISSUED' || !item.due_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(item.due_date);
    due.setHours(0, 0, 0, 0);
    return today > due;
  });

  // ৩. বই ধার নেওয়ার আবেদন সাবমিট মিউটেশন
  const borrowMutation = useMutation({
    mutationFn: requestBookBorrowApi,
    onSuccess: () => {
      toast.success('বই ধার নেওয়ার আবেদন সফলভাবে জমা হয়েছে। বিষয় শিক্ষকের অনুমোদনের পর লাইব্রেরি থেকে বই সংগ্রহ করতে পারবেন।');
      queryClient.invalidateQueries({ queryKey: ['my-borrowed-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      setBorrowModalBook(null);
      setSelectedBook(null);
      setActiveTab('MY_BOOKS');
    },
    onError: (err) => {
      toast.error(err.response?.data?.book || err.response?.data?.message || 'বইয়ের আবেদন জমা নেওয়া সম্ভব হয়নি।');
    },
  });

  const handleConfirmBorrow = (payload, successCallback) => {
    borrowMutation.mutate(payload, {
      onSuccess: () => {
        if (successCallback) successCallback();
      },
    });
  };

  const handleOpenBorrowModal = (book) => {
    setSelectedBook(null);
    setBorrowModalBook(book);
  };

  const handleRefresh = () => {
    refetchBooks();
    refetchMyBooks();
  };

  const isRefreshing = booksFetching || myBooksFetching;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* পেজ হেডার ও রিফ্রেশ বাটন */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-5 sm:p-6 border border-slate-100 shadow-soft">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange border border-orange-200 shrink-0">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-navy">সেন্ট্রাল লাইব্রেরি ক্যাটালগ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              বই অনুসন্ধান, প্রাপ্যতা যাচাই এবং অধ্যয়নের জন্য বই ধার নেওয়ার আবেদন করুন।
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition disabled:opacity-60 min-h-[44px]"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-brand-orange' : 'text-slate-500'}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* ট্যাব নেভিগেশন (স্লাইডিং পিল) */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('CATALOG')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'CATALOG'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>বই ক্যাটালগ</span>
          {booksList.length > 0 && (
            <span className="rounded-full bg-slate-200/80 px-2 py-0.2 text-[10px] font-bold text-slate-700">
              {booksList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MY_BOOKS')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition min-h-[44px] ${
            activeTab === 'MY_BOOKS'
              ? 'bg-white text-brand-navy shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookmarkCheck className="h-4 w-4" />
          <span>আমার বই ও আবেদন</span>
          {myBooksList.length > 0 && (
            <span className="rounded-full bg-brand-orange px-2 py-0.2 text-[10px] font-extrabold text-white">
              {myBooksList.length}
            </span>
          )}
        </button>
      </div>

      {/* কনটেন্ট এলাকা */}
      {activeTab === 'CATALOG' ? (
        <div>
          {booksError ? (
            <div className="rounded-3xl bg-white p-8 text-center border border-slate-200">
              <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">বই ক্যাটালগ লোড করা যায়নি</h4>
              <button
                onClick={() => refetchBooks()}
                className="mt-3 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition min-h-[40px]"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          ) : (
            <BookCatalogList
              books={booksList}
              isLoading={booksLoading}
              onSelectBook={(book) => setSelectedBook(book)}
            />
          )}
        </div>
      ) : (
        <div>
          {myBooksLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/70" />
              ))}
            </div>
          ) : myBooksError ? (
            <div className="rounded-3xl bg-white p-8 text-center border border-slate-200">
              <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">ধার করা বইয়ের রেকর্ড লোড করা যায়নি</h4>
              <button
                onClick={() => refetchMyBooks()}
                className="mt-3 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition min-h-[40px]"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          ) : (
            <MyBorrowedBooksList
              records={myBooksList}
              onBrowseCatalogClick={() => setActiveTab('CATALOG')}
            />
          )}
        </div>
      )}

      {/* বই বিস্তারিত বটম-শিট */}
      <BookDetailSheet
        isOpen={!!selectedBook}
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onBorrowClick={handleOpenBorrowModal}
        hasOverdueBook={hasOverdueBook}
      />

      {/* বই নেওয়ার নিশ্চিতকরণ মডাল */}
      <BorrowConfirmModal
        isOpen={!!borrowModalBook}
        book={borrowModalBook}
        onClose={() => setBorrowModalBook(null)}
        onConfirm={handleConfirmBorrow}
        submitting={borrowMutation.isPending}
      />

    </div>
  );
};

export default StudentLibrary;
