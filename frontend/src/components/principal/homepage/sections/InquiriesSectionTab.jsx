import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MessageSquare, 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Search, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Send,
  UserCheck,
  GraduationCap,
  Sparkles,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { homepageContentApi } from '../../../../api/homepage';

const STATUS_CONFIG = {
  PENDING: {
    label: 'নতুন / অপেক্ষমাণ',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-100',
    icon: Clock,
  },
  CONTACTED: {
    label: 'যোগাযোগ করা হয়েছে',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-100',
    icon: PhoneCall,
  },
  RESOLVED: {
    label: 'ভর্তি সম্পন্ন / নিষ্পন্ন',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-100',
    icon: CheckCircle2,
  },
  DISMISSED: {
    label: 'বাতিল',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: X,
  },
};

const GROUP_LABELS = {
  SCIENCE: { label: 'বিজ্ঞান (Science)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  BUSINESS: { label: 'ব্যবসায় শিক্ষা (Business)', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  HUMANITIES: { label: 'মানবিক (Humanities)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const formatBanglaDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

const cleanPhoneNumber = (phone) => {
  const bengaliDigits = '০১২৩৪৫৬৭৮৯';
  const western = Array.from(String(phone || ''), (ch) => {
    const idx = bengaliDigits.indexOf(ch);
    return idx === -1 ? ch : String(idx);
  }).join('');
  return western.replace(/[^+\d]/g, '');
};

const toWhatsAppUrl = (phone, name) => {
  let cleaned = cleanPhoneNumber(phone);
  if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  } else if (cleaned.startsWith('+8801')) {
    cleaned = cleaned.replace('+', '');
  }
  const text = encodeURIComponent(
    `আসসালামু আলাইকুম ${name || ''}, স্টারলাইট কলেজে ভর্তির তথ্য অনুসন্ধানের জন্য ধন্যবাদ। আমরা আপনার সাথে যোগাযোগ করেছি। আপনার কোনো প্রশ্ন থাকলে জানাতে পারেন।`
  );
  return `https://wa.me/${cleaned}?text=${text}`;
};

const InquiriesSectionTab = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // নোট এডিটিং মোডাল স্টেট
  const [activeNoteInquiry, setActiveNoteInquiry] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageContentApi.inquiries.list();
      const list = Array.isArray(data) ? data : data?.results || [];
      setInquiries(list);
    } catch {
      toast.error('ভর্তি জিজ্ঞাসার তালিকা লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // ফিল্টার করা তালিকা
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.includes(searchTerm) ||
        item.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchesGroup = selectedGroup === 'ALL' || item.group === selectedGroup;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [inquiries, searchTerm, selectedStatus, selectedGroup]);

  // পরিসংখ্যান কাউন্ট
  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      pending: inquiries.filter((i) => i.status === 'PENDING').length,
      contacted: inquiries.filter((i) => i.status === 'CONTACTED').length,
      resolved: inquiries.filter((i) => i.status === 'RESOLVED').length,
    };
  }, [inquiries]);

  // স্ট্যাটাস পরিবর্তন
  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      if (newStatus === 'CONTACTED') {
        await homepageContentApi.inquiries.markContacted(id);
      } else {
        await homepageContentApi.inquiries.update(id, { status: newStatus });
      }
      toast.success('ইনকোয়ারি স্ট্যাটাস আপডেট হয়েছে');
      await fetchInquiries();
    } catch {
      toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ডিলিট হ্যান্ডলার
  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই আবেদনটি মুছে ফেলতে চান?')) return;
    setActionLoadingId(id);
    try {
      await homepageContentApi.inquiries.remove(id);
      toast.success('ইনকোয়ারি মুছে ফেলা হয়েছে');
      setInquiries((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('মুছে ফেলতে সমস্যা হয়েছে');
    } finally {
      setActionLoadingId(null);
    }
  };

  // নোট সেভ হ্যান্ডলার
  const handleSaveNote = async () => {
    if (!activeNoteInquiry) return;
    setSavingNote(true);
    try {
      await homepageContentApi.inquiries.update(activeNoteInquiry.id, { notes: noteText });
      toast.success('অভ্যন্তরীণ নোট সংরক্ষিত হয়েছে');
      setInquiries((prev) =>
        prev.map((i) => (i.id === activeNoteInquiry.id ? { ...i, notes: noteText } : i))
      );
      setActiveNoteInquiry(null);
      setNoteText('');
    } catch {
      toast.error('নোট সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSavingNote(false);
    }
  };

  const openNoteModal = (inquiry) => {
    setActiveNoteInquiry(inquiry);
    setNoteText(inquiry.notes || '');
  };

  return (
    <div className="space-y-6">
      {/* ১. হেডার ও স্ট্যাটস ব্যান্তো গ্রিড */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-black text-brand-navy flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-orange" />
            ভর্তি জিজ্ঞাসা ও কল ইনবক্স (Admission Inquiries)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            পাবলিক ওয়েবসাইট হতে শিক্ষার্থী ও অভিভাবকদের প্রেরিত ভর্তি সংক্রান্ত সরাসরি বার্তা
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInquiries}
          disabled={loading}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-orange disabled:opacity-60 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* স্ট্যাটস কার্ডস */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">মোট জিজ্ঞাসা</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-brand-navy">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold">নতুন অপেক্ষমাণ</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-800">{stats.pending}</p>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-bold">যোগাযোগ সম্পন্ন</span>
            <PhoneCall className="w-4 h-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-800">{stats.contacted}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">ভর্তি সম্পন্ন</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-800">{stats.resolved}</p>
        </div>
      </div>

      {/* ২. ফিল্টার ও সার্চ কন্ট্রোল */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="নাম, মোবাইল নম্বর বা জিজ্ঞাসা দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-orange-500/10 min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* স্ট্যাটাস ফিল্টার */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-brand-orange focus:outline-none min-h-[44px]"
          >
            <option value="ALL">সকল স্ট্যাটাস ({inquiries.length})</option>
            <option value="PENDING">অপেক্ষমাণ ({stats.pending})</option>
            <option value="CONTACTED">যোগাযোগ সম্পন্ন ({stats.contacted})</option>
            <option value="RESOLVED">ভর্তি সম্পন্ন ({stats.resolved})</option>
            <option value="DISMISSED">বাতিল</option>
          </select>

          {/* বিভাগ ফিল্টার */}
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-brand-orange focus:outline-none min-h-[44px]"
          >
            <option value="ALL">সকল বিভাগ</option>
            <option value="SCIENCE">বিজ্ঞান বিভাগ</option>
            <option value="BUSINESS">ব্যবসায় শিক্ষা</option>
            <option value="HUMANITIES">মানবিক বিভাগ</option>
          </select>
        </div>
      </div>

      {/* ৩. ইনকোয়ারি তালিকা */}
      {loading ? (
        <div className="p-8 text-center bg-white border rounded-2xl border-slate-200 shadow-sm animate-pulse space-y-3">
          <div className="w-36 h-4 bg-slate-200 rounded mx-auto" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-12 text-center bg-white border rounded-2xl border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">কোনো ভর্তি জিজ্ঞাসা পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1">পাবলিক হোমপেজ থেকে অভিভাবক ফর্ম পূরণ করলে এখানে স্বয়ংক্রিয়ভাবে তালিকাভুক্ত হবে।</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInquiries.map((item) => {
            const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusMeta.icon;
            const groupMeta = GROUP_LABELS[item.group] || { label: item.group, color: 'bg-slate-50 text-slate-700' };
            const telHref = `tel:${cleanPhoneNumber(item.phone)}`;
            const waUrl = toWhatsAppUrl(item.phone, item.name);
            const isActing = actionLoadingId === item.id;

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* শিক্ষার্থী ও যোগাযোগের তথ্য */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-brand-navy">
                        {item.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${statusMeta.badgeClass}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusMeta.label}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${groupMeta.color}`}>
                        <GraduationCap className="w-3 h-3" />
                        <span>{groupMeta.label}</span>
                      </span>
                    </div>

                    {/* মোবাইল ও তারিখ */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <a
                        href={telHref}
                        className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-brand-orange transition"
                        title="সরাসরি ফোন করুন"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.phone}</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatBanglaDate(item.created_at)}</span>
                      </span>
                      {item.contacted_by_name && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-blue-700 font-semibold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>কথা বলেছেন: {item.contacted_by_name} ({formatBanglaDate(item.contacted_at)})</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* বার্তা / প্রশ্ন */}
                    {item.message ? (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-700 leading-relaxed">
                        <strong className="block text-[11px] font-bold text-slate-500 mb-0.5">জিজ্ঞাসা / মন্তব্য:</strong>
                        <p className="whitespace-pre-wrap">{item.message}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] italic text-slate-400">কোনো মন্তব্য প্রদান করা হয়নি।</p>
                    )}

                    {/* অভ্যন্তরীণ নোট */}
                    {item.notes && (
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-2.5 text-xs text-amber-900 leading-relaxed">
                        <strong className="block text-[10px] font-black text-amber-700 uppercase tracking-wide mb-0.5">
                          ভর্তি সেল নোট:
                        </strong>
                        <p className="whitespace-pre-wrap">{item.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* অ্যাকশন বোতামসমূহ */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 lg:border-t-0 lg:pt-0 shrink-0">
                    {/* ফোন কল */}
                    <a
                      href={telHref}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white"
                      title="ফোনে ডায়াল করুন"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>কল</span>
                    </a>

                    {/* হোয়াটসঅ্যাপ */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm transition hover:bg-green-600 hover:text-white"
                      title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {/* যোগাযোগ সম্পন্ন মার্ক করুন */}
                    {item.status === 'PENDING' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(item.id, 'CONTACTED')}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white disabled:opacity-50 cursor-pointer"
                        title="যোগাযোগ সম্পন্ন মার্ক করুন"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>যোগাযোগ সম্পন্ন</span>
                      </button>
                    )}

                    {/* ভর্তি সম্পন্ন / নিষ্পন্ন */}
                    {item.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 cursor-pointer"
                        title="ভর্তি সম্পন্ন মার্ক করুন"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>নিষ্পন্ন</span>
                      </button>
                    )}

                    {/* নোট এন্ট্রি */}
                    <button
                      type="button"
                      onClick={() => openNoteModal(item)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand-navy cursor-pointer"
                      title="অভ্যন্তরীণ নোট যোগ করুন"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-orange" />
                      <span>{item.notes ? 'নোট সম্পাদন' : 'নোট লিখুন'}</span>
                    </button>

                    {/* মুছে ফেলুন */}
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleDelete(item.id)}
                      className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50 cursor-pointer"
                      title="আবেদন মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ৪. নোট লেখার মোডাল */}
      {activeNoteInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-brand-navy flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-orange" />
                <span>ভর্তি সেল নোট — {activeNoteInquiry.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveNoteInquiry(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500">
                অভিভাবকের সাথে আলোচনার সারসংক্ষেপ বা পরবর্তী পদক্ষেপ লিখে রাখুন (শুধুমাত্র অধ্যক্ষ ও স্টাফদের জন্য দৃশ্যমান):
              </p>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="যেমন: অভিভাবক আগামী রোববার ক্যাম্পাসে এসে সরাসরি ফর্ম সংগ্রহ করবেন..."
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-orange-500/10"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveNoteInquiry(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 min-h-[44px]"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={savingNote}
                onClick={handleSaveNote}
                className="rounded-xl bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-600 transition disabled:opacity-60 min-h-[44px] flex items-center gap-2"
              >
                {savingNote ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesSectionTab;
