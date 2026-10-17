import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getLibraryBooksApi, 
  createLibraryBookApi, 
  getLibraryCategoriesApi, 
  getLibraryBorrowRequestsApi 
} from '../../api/principal';
import api from '../../api/client';
import { 
  Library, 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Layers,
  Check,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * LibraryHub - বহু-ব্যবহারযোগ্য সেন্ট্রাল লাইব্রেরি ও বুক ব্যাংক হাব
 * প্রিন্সিপাল, লাইব্রেরিয়ান, শিক্ষক ও শিক্ষার্থী যে কারও জন্য প্রযোজ্য।
 */
const LibraryHub = ({ overrideRole = null }) => {
  const { user, isPrincipal: authIsPrincipal, isStudent: authIsStudent, isTeacher: authIsTeacher } = useAuth();
  const isPrincipal = overrideRole ? overrideRole === 'PRINCIPAL' : authIsPrincipal;
  const isStudent = overrideRole ? overrideRole === 'STUDENT' : authIsStudent;
  const isTeacher = overrideRole ? overrideRole === 'TEACHER' : authIsTeacher;
  const canManageLibrary = isPrincipal || user?.is_library_manager;

  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'borrow'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // নতুন বই এন্ট্রি মডাল (প্রিন্সিপাল/লাইব্রেরিয়ান)
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    total_copies: 5,
    available_copies: 5,
    rack_number: 'A-1',
  });

  // বই নেওয়ার আবেদন মডাল (শিক্ষার্থী/শিক্ষক)
  const [borrowModalBook, setBorrowModalBook] = useState(null);
  const [borrowDays, setBorrowDays] = useState(7);
  const [submittingBorrow, setSubmittingBorrow] = useState(false);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'books') {
        const [bookRes, catRes] = await Promise.allSettled([
          getLibraryBooksApi(),
          getLibraryCategoriesApi()
        ]);
        if (bookRes.status === 'fulfilled') {
          const list = bookRes.value.results || bookRes.value;
          setBooks(Array.isArray(list) ? list : []);
        }
        if (catRes.status === 'fulfilled') {
          const cList = catRes.value.results || catRes.value;
          setCategories(Array.isArray(cList) ? cList : []);
        }
      } else {
        const res = await getLibraryBorrowRequestsApi();
        const list = res.results || res;
        setBorrowRequests(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      toast.error('লাইব্রেরি তথ্য লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, [activeTab]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const res = await createLibraryBookApi({
        ...newBook,
        available_copies: newBook.total_copies,
      });
      if (res.id || res.success) {
        toast.success('নতুন বই ক্যাটালগে সফলভাবে যুক্ত হয়েছে');
        setShowAddBookModal(false);
        setNewBook({ title: '', author: '', isbn: '', category: '', total_copies: 5, available_copies: 5, rack_number: 'A-1' });
        fetchLibraryData();
      }
    } catch (err) {
      toast.error('বই যোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleBorrowRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBorrow(true);
    try {
      const res = await api.post('library/borrow/', {
        book: borrowModalBook.id,
        duration_days: borrowDays
      });
      if (res.data.id || res.data.success) {
        toast.success('বই ধার নেওয়ার আবেদন সফলভাবে পাঠানো হয়েছে');
        setBorrowModalBook(null);
        fetchLibraryData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'বইয়ের আবেদন ব্যর্থ হয়েছে');
    } finally {
      setSubmittingBorrow(false);
    }
  };

  // লাইব্রেরিয়ান/প্রিন্সিপাল কর্তৃক বই ইস্যু ও রিটার্ন
  const handleIssueBook = async (id) => {
    try {
      const res = await api.patch(`library/borrow/${id}/issue-book/`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchLibraryData();
      }
    } catch (err) {
      toast.error('বই ইস্যু করতে ব্যর্থ হয়েছে');
    }
  };

  const handleReturnBook = async (id) => {
    try {
      const res = await api.patch(`library/borrow/${id}/return-book/`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchLibraryData();
      }
    } catch (err) {
      toast.error('বই ফেরত এন্ট্রি ব্যর্থ হয়েছে');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0F2C59] p-6 rounded-2xl border border-white/10 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400 border border-teal-500/30">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">সেন্ট্রাল লাইব্রেরি ও বুক ব্যাংক</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-0.5">
              বইয়ের ক্যাটালগ, ক্যাটাগরি, শিক্ষার্থী ইস্যু রিকোয়েস্ট ও লেট ফাইন ট্র্যাকিং
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'books' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              বই ক্যাটালগ
            </button>
            <button
              onClick={() => setActiveTab('borrow')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'borrow' ? 'bg-brand-orange text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ইস্যু ও রিটার্ন
            </button>
          </div>

          {canManageLibrary && activeTab === 'books' && (
            <button
              onClick={() => setShowAddBookModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> নতুন বই যোগ
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[35vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-orange border-t-transparent"></div>
        </div>
      ) : activeTab === 'books' ? (
        /* ================= ১. বই ক্যাটালগ ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="বইয়ের নাম, লেখক বা ISBN দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              ক্যাটালগ: {filteredBooks.length} টি বই
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                      {book.category_name || 'সাধারণ পাঠ্য'}
                    </span>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500">লেখক: {book.author}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">উপলব্ধ কপি:</span>
                    <span className="font-black text-slate-800 dark:text-slate-200">
                      {book.available_copies} / {book.total_copies}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">র‍্যাক নং:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {book.rack_number || 'A-1'}
                    </span>
                  </div>
                </div>

                {/* শিক্ষার্থী/শিক্ষক হলে বই নেওয়ার আবেদন বাটন */}
                {(isStudent || isTeacher) && book.available_copies > 0 && (
                  <button
                    onClick={() => setBorrowModalBook(book)}
                    className="w-full mt-3 py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> বই ধার নেওয়ার আবেদন
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= ২. বই ধার ও ইস্যু রেজিস্টার ================= */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              বই ইস্যু ও রিটার্ন হিস্ট্রি ({borrowRequests.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">শিক্ষার্থী</th>
                  <th className="py-3 px-4">বইয়ের নাম</th>
                  <th className="py-3 px-4">আবেদনের তারিখ</th>
                  <th className="py-3 px-4">ফেরতের মেয়াদ</th>
                  <th className="py-3 px-4">লেট ফাইন</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  {canManageLibrary && <th className="py-3 px-4 text-right">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {borrowRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{req.student_name}</span>
                      <span className="block text-xs font-mono text-slate-400">{req.student_unique_id}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{req.book_title}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{req.request_date}</td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300">{req.due_date || '-'}</td>
                    <td className="py-3 px-4 font-black text-rose-500">
                      {req.fine_amount > 0 ? `৳ ${req.fine_amount}` : '৳ ০'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'ISSUED'
                          ? 'bg-blue-500/10 text-blue-500'
                          : req.status === 'RETURNED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    {canManageLibrary && (
                      <td className="py-3 px-4 text-right">
                        {req.status === 'REQUESTED' ? (
                          <button
                            onClick={() => handleIssueBook(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            বই ইস্যু করুন
                          </button>
                        ) : req.status === 'ISSUED' ? (
                          <button
                            onClick={() => handleReturnBook(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> ফেরত গ্রহণ
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">সম্পন্ন</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* নতুন বই এন্ট্রি মডাল */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-orange" />
              লাইব্রেরিতে নতুন বই যোগ
            </h3>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">বইয়ের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: উচ্চমাধ্যমিক তথ্য ও যোগাযোগ প্রযুক্তি"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">লেখক / প্রকাশনী</label>
                <input
                  type="text"
                  required
                  placeholder="প্রকাশক বা লেখকের নাম"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">র‍্যাক নং</label>
                  <input
                    type="text"
                    value={newBook.rack_number}
                    onChange={(e) => setNewBook({ ...newBook, rack_number: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">মোট কপি</label>
                  <input
                    type="number"
                    value={newBook.total_copies}
                    onChange={(e) => setNewBook({ ...newBook, total_copies: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ISBN (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    placeholder="978-XXXXXXXXXX"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* বই ধার নেওয়ার আবেদন মডাল (শিক্ষার্থী/শিক্ষক) */}
      {borrowModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              বই নেওয়ার আবেদন
            </h3>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div><strong>বই:</strong> {borrowModalBook.title}</div>
              <div><strong>লেখক:</strong> {borrowModalBook.author}</div>
              <div><strong>উপলব্ধ কপি:</strong> {borrowModalBook.available_copies} টি</div>
            </div>

            <form onSubmit={handleBorrowRequestSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">কত দিনের জন্য প্রয়োজন?</label>
                <select
                  value={borrowDays}
                  onChange={(e) => setBorrowDays(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                >
                  <option value={7}>৭ দিন (১ সপ্তাহ)</option>
                  <option value={14}>১৪ দিন (২ সপ্তাহ)</option>
                  <option value={30}>৩০ দিন (১ মাস)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBorrowModalBook(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingBorrow}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md"
                >
                  {submittingBorrow ? 'আবেদন পাঠানো হচ্ছে...' : 'আবেদন জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryHub;
