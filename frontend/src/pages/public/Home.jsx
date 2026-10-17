import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import MobileBottomNav from '../../components/public/MobileBottomNav';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Calendar, 
  Phone, 
  MapPin, 
  Clock, 
  Search, 
  CreditCard, 
  Bus, 
  ShieldCheck, 
  HelpCircle, 
  Users, 
  ChevronRight, 
  ChevronDown,
  Laptop,
  Check,
  Send,
  X,
  FlaskConical,
  BarChart3,
  FileText,
  Printer,
  ExternalLink,
  BookCheck,
  Layers,
  Sparkle
} from 'lucide-react';
import { toast } from 'sonner';

// হিরো ব্যানার ইমেজ পাথ
const HERO_BG_IMAGE = '/hero-campus-bg.png';

// =========================================================
// 1. ZERO-DEPENDENCY SPRING PHYSICS & SHIMMER STYLES
// =========================================================
const CustomMotionStyles = () => (
  <style>{`
    @keyframes shimmerSweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-box {
      position: relative;
      overflow: hidden;
      background-color: #E2E8F0;
    }
    .shimmer-box::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.7) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    .shimmer-dark {
      position: relative;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.08);
    }
    .shimmer-dark::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.16) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes tickerMarquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-smooth-marquee {
      display: inline-flex;
      white-space: nowrap;
      animation: tickerMarquee 34s linear infinite;
    }
    .animate-smooth-marquee:hover {
      animation-play-state: paused;
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(-6deg); }
      50% { transform: translateY(-8px) rotate(-3deg); }
    }
    .animate-float-cap {
      animation: floatSlow 6s ease-in-out infinite;
    }
    @keyframes heroReveal {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .hero-stagger-1 { animation: heroReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
    .hero-stagger-2 { animation: heroReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
    .hero-stagger-3 { animation: heroReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both; }
    .hero-stagger-4 { animation: heroReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both; }
    .hero-stagger-5 { animation: heroReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both; }
  `}</style>
);

// =========================================================
// 2. GLOSSY SHIMMER SKELETON LOADER (RULE 4)
// =========================================================
const HomePageSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
    <CustomMotionStyles />
    {/* Navbar Skeleton */}
    <div className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between max-w-7xl w-full mx-auto">
      <div className="flex items-center space-x-3">
        <div className="h-11 w-11 rounded-2xl shimmer-box" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-lg shimmer-box" />
          <div className="h-2.5 w-24 rounded-lg shimmer-box" />
        </div>
      </div>
      <div className="hidden lg:flex space-x-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-7 w-16 rounded-xl shimmer-box" />
        ))}
      </div>
      <div className="h-10 w-28 rounded-2xl shimmer-box" />
    </div>

    {/* Hero Skeleton */}
    <div className="bg-[#051B44] py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-72 rounded-full shimmer-dark" />
        <div className="space-y-3">
          <div className="h-12 sm:h-16 w-4/5 max-w-xl rounded-2xl shimmer-dark" />
          <div className="h-12 sm:h-16 w-3/5 max-w-md rounded-2xl shimmer-dark" />
        </div>
        <div className="space-y-2 max-w-lg pt-2">
          <div className="h-4 w-full rounded shimmer-dark" />
          <div className="h-4 w-5/6 rounded shimmer-dark" />
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="h-13 w-60 rounded-full shimmer-dark" />
          <div className="h-13 w-44 rounded-full shimmer-dark" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl shimmer-dark" />
          ))}
        </div>
      </div>
    </div>

    {/* Services Grid Skeleton */}
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-12">
      <div className="h-7 w-56 rounded-lg shimmer-box mx-auto mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-32 rounded-3xl shimmer-box" />
        ))}
      </div>
    </div>
  </div>
);

// =========================================================
// 3. MAIN HOME COMPONENT
// =========================================================
const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isPageLoading, setIsPageLoading] = useState(true);

  // নোটিশ বোর্ড ও ফিল্টার স্টেট
  const [notices, setNotices] = useState([]);
  const [noticeFilter, setNoticeFilter] = useState('ALL');
  const [noticeHeight, setNoticeHeight] = useState('auto');
  const noticeContainerRef = useRef(null);

  // নোটিশ টু-ফেজ মডাল স্টেট
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isNoticeModalMounted, setIsNoticeModalMounted] = useState(false);
  const [isNoticeModalVisible, setIsNoticeModalVisible] = useState(false);

  // স্মার্ট সার্ভিস হাব টু-ফেজ মডাল স্টেট
  const [serviceModalTab, setServiceModalTab] = useState('transport');
  const [isServiceModalMounted, setIsServiceModalMounted] = useState(false);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [serviceBodyHeight, setServiceBodyHeight] = useState('auto');
  const serviceBodyRef = useRef(null);

  // রেজাল্ট সার্চ স্টেট
  const [searchRoll, setSearchRoll] = useState('');
  const [searchExam, setSearchExam] = useState('HSC_TEST');
  const [searchResult, setSearchResult] = useState(null);
  const [searchingResult, setSearchingResult] = useState(false);
  const [resultTab, setResultTab] = useState('GRADES'); // 'GRADES' | 'SUMMARY'
  const [resultCardHeight, setResultCardHeight] = useState('auto');
  const resultCardRef = useRef(null);

  // বিভাগ সম্প্রসারণ স্টেট (In-place dynamic expander)
  const [expandedDept, setExpandedDept] = useState(null);

  // এফএকিউ অ্যাকর্ডিয়ন স্টেট
  const [openFaq, setOpenFaq] = useState(0);

  // কন্টাক্ট ফর্ম স্টেট
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', group: 'SCIENCE', message: '' });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // ডিফল্ট নোটিশ ডেটা
  const defaultNotices = [
    {
      id: 'n1',
      title: '২০২৬-২০২৭ শিক্ষাবর্ষে একাদশ শ্রেণিতে ভর্তি কার্যক্রম সংক্রান্ত কেন্দ্রীয় বিজ্ঞপ্তি',
      category: 'ADMISSION',
      category_display: 'ভর্তি ২০২৬',
      audience: 'ALL',
      created_at: '2026-10-15',
      content: 'স্টারলাইট কলেজে একাদশ শ্রেণিতে বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় অনলাইন ভর্তি কার্যক্রম শুরু হয়েছে। মাধ্যমিক (SSC) পরীক্ষায় উত্তীর্ণ শিক্ষার্থীরা অনলাইনে আবেদন করতে পারবেন। গোল্ডেন জিপিএ-৫ প্রাপ্তদের জন্য শতভাগ টিউশন ফি ফ্রি এবং অসচ্ছল শিক্ষার্থীদের জন্য রয়েছে প্রিন্সিপাল ওয়েলফেয়ার স্কলারশিপ।',
    },
    {
      id: 'n2',
      title: 'দ্বাদশ শ্রেণির প্রাক-নির্বাচনী (Pre-Test) পরীক্ষা ২০২৬-এর সময়সূচি প্রকাশ',
      category: 'EXAM',
      category_display: 'পরীক্ষা',
      audience: 'STUDENTS',
      created_at: '2026-10-12',
      content: 'দ্বাদশ শ্রেণির বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখার শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে আগামী ১ নভেম্বর ২০২৬ হতে প্রাক-নির্বাচনী পরীক্ষা অনুষ্ঠিত হবে। প্রত্যেক শিক্ষার্থীকে স্টুডেন্ট পোর্টাল থেকে ডিজিটাল প্রবেশপত্র (Admit Card) ডাউনলোড করে প্রিন্ট নিতে হবে।',
    },
    {
      id: 'n3',
      title: 'কলেজ পরিবহন (বাস সার্ভিস) নতুন ৩টি শীতাতপ নিয়ন্ত্রিত বাস সংযোজন ও রুট শিডিউল',
      category: 'TRANSPORT',
      category_display: 'পরিবহন',
      audience: 'ALL',
      created_at: '2026-10-10',
      content: 'শিক্ষার্থীদের আরামদায়ক ও নিরাপদ যাতায়াতের সুবিধার্থে সিলেট সদর, দক্ষিণ সুরমা ও বিমানবন্দর রোডে নতুন ৩টি এসি বাস সংযোজন করা হয়েছে। আগ্রহী শিক্ষার্থীদের দ্রুত পোর্টাল থেকে পরিবহন কার্ডের আবেদন করতে বলা হলো। বাসে সার্বক্ষণিক জিপিএস ট্র্যাকিং ও সিসিটিভি নজরদারি রয়েছে।',
    },
    {
      id: 'n4',
      title: 'বার্ষিক বিজ্ঞান মেলা ও আন্তঃকলেজ বিতর্ক প্রতিযোগিতা ২০২৬-এর রেজিস্ট্রেশন',
      category: 'EVENT',
      category_display: 'সহ-শিক্ষা',
      audience: 'STUDENTS',
      created_at: '2026-10-08',
      content: 'আগামী ২৫ অক্টোবর কলেজ কেন্দ্রীয় অডিটোরিয়ামে সাইন্স ক্লাব ও ডিবেটিং ক্লাবের যৌথ উদ্যোগে বিজ্ঞান ও প্রযুক্তি প্রদর্শনী এবং বিতর্ক উৎসব অনুষ্ঠিত হবে। প্রতিটি শাখার শিক্ষার্থীদের প্রজেক্ট জমা দেওয়ার জন্য বিভাগীয় প্রধানের সাথে যোগাযোগের আহ্বান জানানো হচ্ছে।',
    },
  ];

  // প্রারম্ভিক লোডিং ও ডেটা ফেচ
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 320);
    const fetchNotices = async () => {
      try {
        const res = await api.get('operations/notices/');
        const list = res.data.results || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setNotices(list);
        } else {
          setNotices(defaultNotices);
        }
      } catch {
        setNotices(defaultNotices);
      }
    };
    fetchNotices();
    return () => clearTimeout(timer);
  }, []);

  // নোটিশ ফিল্টার ট্যাব লিস্ট
  const noticeTabs = [
    { key: 'ALL', label: 'সকল নোটিশ' },
    { key: 'EXAM', label: 'পরীক্ষা' },
    { key: 'ADMISSION', label: 'ভর্তি ২০২৬' },
    { key: 'EVENT', label: 'সহ-শিক্ষা ও পরিবহন' },
  ];

  const activeNoticeTabIndex = noticeTabs.findIndex((t) => t.key === noticeFilter);

  // নোটিশ ফিল্টারিং
  const filteredNotices = notices.filter((n) => {
    if (noticeFilter === 'ALL') return true;
    if (noticeFilter === 'EXAM') return n.category === 'EXAM';
    if (noticeFilter === 'ADMISSION') return n.category === 'ADMISSION';
    if (noticeFilter === 'EVENT') return n.category === 'EVENT' || n.category === 'TRANSPORT';
    return true;
  });

  // নোটিশ কনটেইনারের উচ্চতা পরিমাপ (Rule 2: Smooth Tab Switching Without Height Jumps)
  useEffect(() => {
    if (noticeContainerRef.current) {
      setNoticeHeight(noticeContainerRef.current.scrollHeight);
    }
  }, [noticeFilter, filteredNotices]);

  // রেজাল্ট কার্ডের উচ্চতা পরিমাপ
  useEffect(() => {
    if (resultCardRef.current) {
      setResultCardHeight(resultCardRef.current.scrollHeight);
    }
  }, [searchResult, resultTab, searchingResult]);

  // সার্ভিস মডাল বডির উচ্চতা পরিমাপ
  useEffect(() => {
    if (serviceBodyRef.current && isServiceModalMounted) {
      setServiceBodyHeight(serviceBodyRef.current.scrollHeight);
    }
  }, [serviceModalTab, isServiceModalMounted]);

  // ২-ফেজ নোটিশ মডাল ওপেন
  const openNoticeModal = (notice) => {
    setSelectedNotice(notice);
    setIsNoticeModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsNoticeModalVisible(true));
    });
  };

  // ২-ফেজ নোটিশ মডাল ক্লোজ (৩২০ms এক্সিট)
  const closeNoticeModal = () => {
    setIsNoticeModalVisible(false);
    setTimeout(() => {
      setIsNoticeModalMounted(false);
      setSelectedNotice(null);
    }, 320);
  };

  // ২-ফেজ সার্ভিস মডাল ওপেন
  const openServiceModal = (tabKey) => {
    setServiceModalTab(tabKey);
    setIsServiceModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsServiceModalVisible(true));
    });
  };

  // ২-ফেজ সার্ভিস মডাল ক্লোজ (৩২০ms এক্সিট)
  const closeServiceModal = () => {
    setIsServiceModalVisible(false);
    setTimeout(() => {
      setIsServiceModalMounted(false);
    }, 320);
  };

  // Escape key হ্যান্ডলিং
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isNoticeModalVisible) closeNoticeModal();
        if (isServiceModalVisible) closeServiceModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNoticeModalVisible, isServiceModalVisible]);

  // রেজাল্ট সার্চ হ্যান্ডলার
  const handleResultSearch = (e) => {
    e.preventDefault();
    if (!searchRoll.trim()) {
      toast.error('শিক্ষার্থীর রোল নম্বর দিন');
      return;
    }
    setSearchingResult(true);
    setSearchResult(null);
    setTimeout(() => {
      setSearchingResult(false);
      setSearchResult({
        student_name: 'তানভীর আহমেদ চৌধুরী',
        roll: searchRoll,
        session: '২০২৫-২০২৬',
        group: 'বিজ্ঞান শাখা (Science)',
        gpa: '5.00',
        grade: 'A+',
        status: 'PASSED',
        total_marks: 622,
        attendance_rate: '৯৮%',
        subjects: [
          { name: 'Physics (পদার্থবিজ্ঞান)', marks: 92, grade: 'A+' },
          { name: 'Chemistry (রসায়ন)', marks: 88, grade: 'A+' },
          { name: 'Higher Math (উচ্চতর গণিত)', marks: 95, grade: 'A+' },
          { name: 'Biology (জীববিজ্ঞান)', marks: 85, grade: 'A+' },
          { name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)', marks: 96, grade: 'A+' },
          { name: 'Bangla (বাংলা)', marks: 82, grade: 'A+' },
          { name: 'English (ইংরেজি)', marks: 84, grade: 'A+' },
        ],
      });
    }, 600);
  };

  // ইনকোয়ারি ফর্ম সাবমিট
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone) {
      toast.error('আপনার নাম ও মোবাইল নম্বর দিন');
      return;
    }
    setSendingInquiry(true);
    setTimeout(() => {
      setSendingInquiry(false);
      toast.success('আপনার বার্তা সফলভাবে গৃহীত হয়েছে! ভর্তি সেল হতে অতি দ্রুত আপনার সাথে যোগাযোগ করা হবে।');
      setInquiryForm({ name: '', phone: '', group: 'SCIENCE', message: '' });
    }, 650);
  };

  // সার্ভিস হাবের ৫টি ট্যাব
  const serviceTabs = [
    { key: 'transport', label: 'পরিবহন', icon: Bus },
    { key: 'routine', label: 'রুটিন', icon: Calendar },
    { key: 'library', label: 'লাইব্রেরি', icon: BookOpen },
    { key: 'fees', label: 'ফি পেমেন্ট', icon: CreditCard },
    { key: 'idcard', label: 'ডিজিটাল আইডি', icon: ShieldCheck },
  ];
  const activeServiceTabIndex = serviceTabs.findIndex((t) => t.key === serviceModalTab);

  const faqs = [
    {
      q: 'একাদশ শ্রেণিতে ভর্তির ন্যূনতম যোগ্যতা কী?',
      a: 'বিজ্ঞান শাখায় ভর্তির জন্য মাধ্যমিক (SSC) পরীক্ষায় ন্যূনতম GPA 4.00, ব্যবসায় শিক্ষা শাখায় GPA 3.00 এবং মানবিক শাখায় GPA 2.50 প্রয়োজন।',
    },
    {
      q: 'কলেজের ডিজিটাল স্টুডেন্ট পোর্টাল কীভাবে ব্যবহার করতে হয়?',
      a: 'প্রত্যেক শিক্ষার্থীর জন্য রয়েছে স্বতন্ত্র প্রোফাইল। ভর্তির সময় প্রদত্ত SSC Roll, Passing Year এবং গোপন 6-Digit PIN দিয়ে লগইন করে ঘরে বসেই মার্কশিট, ক্লাস রুটিন, নোটিশ ও ডিজিটাল আইডি কার্ড পাওয়া যায়।',
    },
    {
      q: 'মেধাবী ও সুবিধাবঞ্চিত শিক্ষার্থীদের জন্য বৃত্তির সুযোগ আছে কি?',
      a: 'হ্যাঁ! এসএসসিতে গোল্ডেন জিপিএ-৫ প্রাপ্তদের জন্য ১০০% টিউশন ফি মওকুফ এবং দরিদ্র ও অসচ্ছল পরিবারের শিক্ষার্থীদের জন্য প্রিন্সিপাল ওয়েলফেয়ার ফান্ড থেকে বিশেষ ছাড় প্রদান করা হয়।',
    },
    {
      q: 'কলেজ বাস সার্ভিস কোন কোন রুটে চলাচল করে?',
      a: 'সিলেট শহরের আম্বরখানা, টিলাগড়, শিবগঞ্জ, কদমতলী, দক্ষিণ সুরমা, মদিনা মার্কেট এবং বিমানবন্দর রোডসহ প্রধান ৮টি রুটে নিজস্ব জিপিএস ট্র্যাকারযুক্ত শীতাতপ নিয়ন্ত্রিত বাস চলাচল করে।',
    },
    {
      q: 'অভিভাবক কীভাবে শিক্ষার্থীর ক্লাসের উপস্থিতি জানতে পারেন?',
      a: 'শ্রেণি ইনচার্জ প্রতিদিন ক্লাসে ডিজিটাল হাজিরা নেওয়ার সাথে সাথে অনুপস্থিত শিক্ষার্থীদের অভিভাবকদের ফোনে স্বয়ংক্রিয় এসএমএস পৌঁছে যায়। এছাড়া অভিভাবক ডায়েরির মাধ্যমে সার্বক্ষণিক যোগাযোগ রাখা হয়।',
    },
  ];

  if (isPageLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
      <CustomMotionStyles />
      
      {/* স্টিকি হেডার */}
      <PublicNavbar />

      <main className="flex-1">
        
        {/* ============================================================== */}
        {/* ১. হিরো সেকশন (Enterprise SaaS & Modern EdTech Aesthetic) */}
        {/* ============================================================== */}
        <section 
          id="hero" 
          className="relative overflow-hidden bg-[#041838] text-white select-none"
        >
          {/* ১.১: লাইভ ব্রেকিং নোটিশ টিকার বার */}
          <div className="relative z-20 bg-[#03122B]/85 backdrop-blur-md border-b border-white/10 py-2 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex items-center space-x-3">
              <span className="rounded-lg bg-gradient-to-r from-[#FF6B00] to-amber-500 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shrink-0 flex items-center shadow-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                <span>ব্রেকিং নোটিশ</span>
              </span>
              <div className="overflow-hidden flex-1 text-xs text-slate-200 font-medium">
                <div className="animate-smooth-marquee">
                  <span className="mx-4">📢 ২০২৬-২০২৭ শিক্ষাবর্ষে বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় একাদশ শ্রেণিতে ভর্তি চলছে</span>
                  <span className="text-orange-400">•</span>
                  <span className="mx-4">দ্বাদশ শ্রেণির প্রাক-নির্বাচনী পরীক্ষার রুটিন প্রকাশিত হয়েছে</span>
                  <span className="text-orange-400">•</span>
                  <span className="mx-4">পরিবহন সার্ভিসের নতুন ৩টি শীতাতপ নিয়ন্ত্রিত বাস উদ্বোধন!</span>
                  <span className="text-orange-400">•</span>
                  <span className="mx-4">📢 ২০২৬-২০২৭ শিক্ষাবর্ষে বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় একাদশ শ্রেণিতে ভর্তি চলছে</span>
                </div>
              </div>
            </div>
          </div>

          {/* ১.২: মূল হিরো ক্যানভাস */}
          <div className="relative min-h-[540px] sm:min-h-[600px] lg:min-h-[650px] flex items-center py-10 sm:py-14 lg:py-20">
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <img
                src={HERO_BG_IMAGE}
                alt="স্টারলাইট কলেজ ক্যাম্পাস"
                className="h-full w-full object-cover object-[72%_center] sm:object-[65%_center] lg:object-right transition-transform duration-1000 scale-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#031535]/95 via-[#062356]/85 to-[#062356]/40 lg:from-[#031535]/80 lg:via-[#062356]/45 lg:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03122B]/90 via-transparent to-transparent lg:from-[#03122B]/50" />
            </div>

            {/* ডেকোরেটিভ ওয়াটারমার্ক এলিমেন্টস */}
            <div className="pointer-events-none absolute inset-0 z-10 max-w-7xl mx-auto overflow-hidden">
              <div className="hidden sm:block absolute top-14 left-[42%] lg:left-[45%] opacity-[0.12] animate-float-cap">
                <GraduationCap className="h-28 w-28 lg:h-36 lg:w-36 text-sky-200 stroke-[1.2]" />
              </div>
              <div className="hidden sm:grid grid-cols-4 gap-2.5 absolute top-[38%] left-[41%] lg:left-[44%] opacity-25">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <span key={idx} className="h-1.5 w-1.5 rounded-full bg-sky-200" />
                ))}
              </div>
            </div>

            {/* ১.৩: হিরো মেইন কনটেন্ট কন্টেইনার */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="max-w-2xl lg:max-w-[650px] space-y-5 sm:space-y-6">
                
                {/* Top Pill Badge */}
                <div className="hero-stagger-1 inline-flex items-center space-x-2.5 rounded-full bg-[#092552]/80 hover:bg-[#092552] px-4 py-1.5 backdrop-blur-md border border-sky-300/25 shadow-lg transition-all duration-300">
                  <GraduationCap className="h-4 w-4 text-[#FF6B00] shrink-0" />
                  <span className="text-xs sm:text-[13px] font-bold text-slate-100 tracking-wide">
                    সিলেট বিভাগের শীর্ষ ডিজিটাল উচ্চমাধ্যমিক বিদ্যাপীঠ
                  </span>
                </div>

                {/* Main Two-Line Headline */}
                <div className="hero-stagger-2 space-y-1 sm:space-y-2">
                  <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[1.18]">
                    জ্ঞান, শৃঙ্খলা ও নেতৃত্বের
                  </h1>

                  <div className="relative inline-block pt-0.5">
                    <span className="text-3xl sm:text-5xl lg:text-[56px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF851B] to-[#FFA726] leading-[1.18]">
                      ডিজিটাল উৎকর্ষতা
                    </span>

                    {/* ৩টি অরেঞ্জ রেডিয়াল স্পার্ক রশ্মি */}
                    <svg 
                      className="inline-block ml-2 sm:ml-3 -mt-3 sm:-mt-5 h-6 w-6 sm:h-9 sm:w-9 text-[#FF6B00]" 
                      viewBox="0 0 36 36" 
                      fill="none"
                    >
                      <path d="M6 10L20 4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M8 18L24 18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M6 26L20 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>

                    {/* নিচে কার্ভড অরেঞ্জ সুইশ আন্ডারলাইন */}
                    <svg 
                      className="w-48 sm:w-72 h-3 sm:h-4 mt-1 text-[#FF6B00]" 
                      viewBox="0 0 260 14" 
                      fill="none"
                    >
                      <path 
                        d="M3 10C65 2 155 2 257 9" 
                        stroke="url(#heroUnderlineGrad)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />
                      <defs>
                        <linearGradient id="heroUnderlineGrad" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FF6B00" />
                          <stop offset="65%" stopColor="#FF851B" />
                          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Subtitle Paragraph */}
                <p className="hero-stagger-3 text-xs sm:text-base lg:text-[17px] text-slate-200/95 max-w-xl leading-relaxed font-medium">
                  স্টারলাইট কলেজ, সিলেট — একাদশ ও দ্বাদশ শ্রেণির বিশ্বাসযোগ্য পাঠদান, অভিজ্ঞ শিক্ষকমণ্ডলী, আধুনিক বিজ্ঞান ও আইসিটি ল্যাব এবং শতভাগ ডিজিটাল অটোমেশনের অনন্য বিদ্যাপীঠ।
                </p>

                {/* Two Pill Action Buttons */}
                <div className="hero-stagger-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2">
                  <Link
                    to="/login"
                    className="group relative inline-flex items-center justify-center space-x-2.5 rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FF6200] to-[#E65100] px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-white shadow-[0_10px_30px_-5px_rgba(255,107,0,0.55)] hover:shadow-[0_14px_35px_-5px_rgba(255,107,0,0.75)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 border border-orange-300/30"
                  >
                    <GraduationCap className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
                    <span>পোর্টাল প্রবেশ করুন (Portal Login)</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#admission"
                    className="group inline-flex items-center justify-center space-x-2.5 rounded-full bg-[#061C3E]/80 hover:bg-[#0A2B5E] px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white backdrop-blur-md border border-sky-300/30 hover:border-orange-400/60 shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
                  >
                    <BookOpen className="h-4 w-4 text-[#FF6B00] transition-transform duration-300 group-hover:scale-110" />
                    <span>ভর্তি নির্দেশিকা ২০২৬</span>
                  </a>
                </div>

                {/* Bottom 4 Feature Highlights */}
                <div className="hero-stagger-5 pt-4 sm:pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 rounded-2xl bg-[#041531]/65 sm:bg-transparent p-3 sm:p-0 backdrop-blur-md sm:backdrop-blur-none border border-white/10 sm:border-none">
                    
                    <div className="flex items-center space-x-2.5 sm:pr-4 sm:border-r sm:border-white/15">
                      <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] sm:text-xs leading-tight">
                        <span className="font-bold text-white block">অভিজ্ঞ</span>
                        <span className="font-semibold text-slate-300">শিক্ষকমণ্ডলী</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 sm:px-4 sm:border-r sm:border-white/15">
                      <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] sm:text-xs leading-tight">
                        <span className="font-bold text-white block">আধুনিক</span>
                        <span className="font-semibold text-slate-300">বিজ্ঞান ও আইসিটি ল্যাব</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 sm:px-4 sm:border-r sm:border-white/15">
                      <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] sm:text-xs leading-tight">
                        <span className="font-bold text-white block">নিরাপদ ও</span>
                        <span className="font-semibold text-slate-300">শৃঙ্খলাবদ্ধ পরিবেশ</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 sm:pl-4">
                      <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="text-[11px] sm:text-xs leading-tight">
                        <span className="font-bold text-white block">১০০%</span>
                        <span className="font-semibold text-slate-300">ডিজিটাল অটোমেশন</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ১.৪: ফ্লোটিং কুইক স্ট্যাটস বার (মাঝখানে বিন্যস্ত) */}
          <div className="relative z-20 bg-[#071E42]/95 border-t border-white/10 backdrop-blur-xl py-5 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl bg-white/5 hover:bg-white/[0.08] px-4 py-3 border border-white/10 flex items-center justify-center sm:justify-start space-x-3 transition-colors duration-200">
                  <span className="text-xl sm:text-2xl font-black text-[#FF6B00]">৩,২০০+</span>
                  <span className="text-[11px] font-bold text-slate-300 leading-tight">নিয়মিত<br/>শিক্ষার্থী</span>
                </div>
                <div className="rounded-2xl bg-white/5 hover:bg-white/[0.08] px-4 py-3 border border-white/10 flex items-center justify-center sm:justify-start space-x-3 transition-colors duration-200">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">৯৯.৪%</span>
                  <span className="text-[11px] font-bold text-slate-300 leading-tight">এইচএসসি<br/>পাসের হার</span>
                </div>
                <div className="rounded-2xl bg-white/5 hover:bg-white/[0.08] px-4 py-3 border border-white/10 flex items-center justify-center sm:justify-start space-x-3 transition-colors duration-200">
                  <span className="text-xl sm:text-2xl font-black text-amber-300">৬০+</span>
                  <span className="text-[11px] font-bold text-slate-300 leading-tight">অভিজ্ঞ<br/>শিক্ষকমণ্ডলী</span>
                </div>
                <div className="rounded-2xl bg-white/5 hover:bg-white/[0.08] px-4 py-3 border border-white/10 flex items-center justify-center sm:justify-start space-x-3 transition-colors duration-200">
                  <span className="text-xl sm:text-2xl font-black text-sky-400">EIIN</span>
                  <span className="text-[11px] font-bold text-slate-300 leading-tight">১৩৪৫৬৭<br/>সিলেট বোর্ড</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ============================================================== */}
        {/* ২. মোবাইল ওয়েব অ্যাপ কুইক সার্ভিসেস লঞ্চার (#services) */}
        {/* ============================================================== */}
        <section id="services" className="py-12 sm:py-16 bg-white border-b border-slate-100 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-orange-50 border border-orange-200/60 px-3.5 py-1 text-xs font-black text-[#EA580C] mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>এক ক্লিকে সকল সুযোগ-সুবিধা</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] tracking-tight">
                স্টারলাইট স্মার্ট অ্যাপ সার্ভিসেস
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                শিক্ষার্থী, অভিভাবক ও শিক্ষকদের জন্য আধুনিক ইন্টারেক্টিভ ওয়েব অ্যাপ্লিকেশন ইন্টারফেস
              </p>
            </div>

            {/* ৮টি সার্ভিস আইকন গ্রিড */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
              
              {/* ১. রেজাল্ট */}
              <a
                href="#results"
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-orange-50/40 hover:border-orange-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-[#EA580C] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">ডিজিটাল মার্কশিট</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">অনলাইন রেজাল্ট ও জিপিএ</p>
              </a>

              {/* ২. আইডি কার্ড */}
              <button
                type="button"
                onClick={() => openServiceModal('idcard')}
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">ডিজিটাল আইডি কার্ড</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">কিউআর কোড ভেরিফিকেশন</p>
              </button>

              {/* ৩. ফি পরিশোধ */}
              <button
                type="button"
                onClick={() => openServiceModal('fees')}
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">অনলাইন ফি প্রদান</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">বিকাশ/নগদ ও ডিজিটাল রসিদ</p>
              </button>

              {/* ৪. বাস ট্র্যাকার */}
              <button
                type="button"
                onClick={() => openServiceModal('transport')}
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-purple-50/40 hover:border-purple-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform duration-300">
                  <Bus className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">কলেজ বাস রুট</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">শিডিউল ও পিক-আপ পয়েন্ট</p>
              </button>

              {/* ৫. ক্লাস রুটিন */}
              <button
                type="button"
                onClick={() => openServiceModal('routine')}
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-cyan-50/40 hover:border-cyan-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">স্মার্ট ক্লাস রুটিন</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">পিরিয়ড ও রুম নম্বর</p>
              </button>

              {/* ৬. সেন্ট্রাল লাইব্রেরি */}
              <button
                type="button"
                onClick={() => openServiceModal('library')}
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-rose-50/40 hover:border-rose-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">সেন্ট্রাল লাইব্রেরি</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">১৫,০০০+ বই ক্যাটালগ</p>
              </button>

              {/* ৭. ভর্তি ২০২৬ */}
              <a
                href="#admission"
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-amber-50/40 hover:border-amber-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">ভর্তি আবেদন</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">একাদশ শ্রেণি ২০২৬-২৭</p>
              </a>

              {/* ৮. অভিযোগ ও মতামত */}
              <a
                href="#contact"
                className="group rounded-3xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-400 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 shadow-xs hover:shadow-md flex flex-col items-center text-center cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/20 group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-black text-[#0F2C59] mt-3">পরামর্শ ও হেল্প</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">গোপন মতামত বক্স</p>
              </a>

            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* ৩. অনলাইন রেজাল্ট ও মার্কশিট সার্চ উইজেট (#results) */}
        {/* ============================================================== */}
        <section id="results" className="py-14 sm:py-20 bg-[#F4F7FB]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,44,89,0.07)]">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200 inline-flex items-center space-x-1">
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                  <span>পরীক্ষা ও ফলাফল মূল্যায়ন সেল</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] mt-2">
                  অনলাইন রেজাল্ট ও মার্কশিট সার্চ
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  শিক্ষার্থীর রোল নম্বর ও পরীক্ষা নির্বাচন করে ডিজিটাল মার্কশিট ও জিপিএ তাৎক্ষণিকভাবে দেখুন।
                </p>
              </div>

              {/* ফর্ম কন্টেইনার (Rule 5: Form Ergonomics) */}
              <form onSubmit={handleResultSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                
                {/* রোল নম্বর ইনপুট */}
                <div className="sm:col-span-5 group">
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5 flex items-center space-x-1">
                    <span>শিক্ষার্থীর রোল নম্বর</span>
                  </label>
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#EA580C] group-focus-within:scale-110 transition-all duration-200 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="যেমন: ১০১"
                      value={searchRoll}
                      onChange={(e) => setSearchRoll(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-4 py-3 text-sm font-bold text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                      required
                    />
                  </div>
                </div>

                {/* পরীক্ষার নাম সিলেক্ট */}
                <div className="sm:col-span-4 group">
                  <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">
                    পরীক্ষার নাম
                  </label>
                  <div className="relative flex items-center">
                    <Award className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#EA580C] group-focus-within:scale-110 transition-all duration-200 pointer-events-none" />
                    <select
                      value={searchExam}
                      onChange={(e) => setSearchExam(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                    >
                      <option value="HSC_TEST">এইচএসসি নির্বাচনী পরীক্ষা ২০২৬</option>
                      <option value="HALF_YEARLY">অর্ধবার্ষিক মূল্যায়ন পরীক্ষা</option>
                      <option value="YEAR_FINAL">একাদশ শ্রেণি সমাপনী পরীক্ষা</option>
                    </select>
                  </div>
                </div>

                {/* সাবমিট বাটন (Rule 5: Micro-interactions & Tactile Feedback) */}
                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    disabled={searchingResult}
                    className="w-full rounded-2xl bg-[#0F2C59] hover:bg-[#163A70] py-3.5 px-4 text-xs font-black text-white shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer min-h-[44px] group"
                  >
                    {searchingResult ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>সার্চ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                        <span>রেজাল্ট দেখুন</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* স্মুথ রেজাল্ট লোডিং ও রেজাল্ট ডিসপ্লে কন্টেইনার (Rule 2: Smooth Height Transition) */}
              <div 
                style={{
                  height: searchingResult || searchResult ? (resultCardHeight ? `${resultCardHeight}px` : 'auto') : '0px',
                  transition: 'height 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className="overflow-hidden transition-all duration-400"
              >
                <div ref={resultCardRef} className="pt-8">
                  
                  {/* ১. গ্লসি শিমার স্কেলেটন লোডার (খোঁজার সময়ে) */}
                  {searchingResult && (
                    <div className="rounded-2xl border border-slate-100 p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="space-y-2">
                          <div className="h-4 w-36 rounded-lg shimmer-box" />
                          <div className="h-6 w-48 rounded-lg shimmer-box" />
                        </div>
                        <div className="h-8 w-28 rounded-full shimmer-box" />
                      </div>
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-8 rounded-xl shimmer-box w-full" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ২. পূর্ণাঙ্গ রেজাল্ট কার্ড (সার্চ সম্পন্ন হলে) */}
                  {searchResult && !searchingResult && (
                    <div className="rounded-3xl bg-slate-50/80 p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
                      
                      {/* রেজাল্ট হেডার */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
                        <div>
                          <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider block">
                            রোল: {searchResult.roll} • শিক্ষাবর্ষ: {searchResult.session} • {searchResult.group}
                          </span>
                          <h3 className="text-lg font-black text-[#0F2C59] mt-0.5">
                            {searchResult.student_name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="rounded-2xl bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-800 border border-emerald-300 shadow-xs flex items-center space-x-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>GPA {searchResult.gpa} ({searchResult.grade}) - উত্তীর্ণ</span>
                          </span>
                        </div>
                      </div>

                      {/* রেজাল্ট সাব-ট্যাব সুইচার (Sliding Pill Segmented Control - Rule 2) */}
                      <div className="flex justify-center">
                        <div className="relative inline-flex p-1 rounded-2xl bg-slate-200/70 border border-slate-300/60 w-full sm:w-auto">
                          <div 
                            className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-transform duration-400 ease-out"
                            style={{
                              width: 'calc(50% - 2px)',
                              transform: resultTab === 'GRADES' ? 'translateX(2px)' : 'translateX(calc(100% + 2px))',
                              transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setResultTab('GRADES')}
                            className={`relative z-10 flex-1 sm:flex-initial px-5 py-2 text-xs font-black transition-colors duration-200 cursor-pointer ${
                              resultTab === 'GRADES' ? 'text-[#0F2C59]' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span>বিষয়ভিত্তিক গ্রেডশিট</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setResultTab('SUMMARY')}
                            className={`relative z-10 flex-1 sm:flex-initial px-5 py-2 text-xs font-black transition-colors duration-200 cursor-pointer ${
                              resultTab === 'SUMMARY' ? 'text-[#0F2C59]' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span>সার্বিক মূল্যায়ন ও পারফরম্যান্স</span>
                          </button>
                        </div>
                      </div>

                      {/* ট্যাব ১: গ্রেডশিট টেবিল */}
                      {resultTab === 'GRADES' && (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#0F2C59] text-white text-[11px]">
                              <tr>
                                <th className="p-3">বিষয়</th>
                                <th className="p-3 text-center">নম্বর</th>
                                <th className="p-3 text-right">লেটার গ্রেড</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                              {searchResult.subjects.map((sub, i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-3 font-medium text-slate-800">{sub.name}</td>
                                  <td className="p-3 text-center font-mono font-bold text-[#0F2C59]">{sub.marks}</td>
                                  <td className="p-3 text-right font-black text-emerald-600">{sub.grade}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* ট্যাব ২: সামারি কার্ডস */}
                      {resultTab === 'SUMMARY' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-2xl bg-white p-4 border border-slate-200 text-center">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">মোট নম্বর</span>
                            <span className="text-xl font-black text-[#0F2C59] font-mono mt-1 block">{searchResult.total_marks} / ৭০০</span>
                            <span className="text-[10px] text-emerald-600 font-bold">৮৮.৮% প্রাপ্ত নম্বর</span>
                          </div>
                          <div className="rounded-2xl bg-white p-4 border border-slate-200 text-center">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">ক্লাস উপস্থিতি</span>
                            <span className="text-xl font-black text-[#0F2C59] font-mono mt-1 block">{searchResult.attendance_rate}</span>
                            <span className="text-[10px] text-emerald-600 font-bold">নিয়মিত শিক্ষার্থী</span>
                          </div>
                          <div className="rounded-2xl bg-white p-4 border border-slate-200 text-center">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">মেধা অবস্থান</span>
                            <span className="text-xl font-black text-[#EA580C] font-mono mt-1 block">৩য় স্থান</span>
                            <span className="text-[10px] text-slate-500 font-bold">শাখাভিত্তিক ক্রম</span>
                          </div>
                        </div>
                      )}

                      {/* প্রিন্ট ও ফুল গ্রেডশিট লিংক */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-slate-400 text-[11px]">
                          * এই রেজাল্টটি ওয়েবসাইট প্রদর্শনের জন্য। অফিশিয়াল ট্রান্সক্রিপ্ট প্রিন্ট করতে স্টুডেন্ট পোর্টালে লগইন করুন।
                        </span>
                        <Link
                          to="/login"
                          className="font-extrabold text-[#EA580C] hover:underline inline-flex items-center space-x-1 shrink-0"
                        >
                          <span>স্টুডেন্ট পোর্টালে লগইন করুন</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* ৪. একাডেমিক বিভাগসমূহ (#departments) */}
        {/* ============================================================== */}
        <section id="departments" className="py-14 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3.5 py-1 text-xs font-black text-[#EA580C]">
                উচ্চমাধ্যমিক পাঠ্যক্রম
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0F2C59] tracking-tight mt-2">
                আমাদের ৩টি একাডেমিক বিভাগ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                বাংলাদেশ শিক্ষা বোর্ড নির্ধারিত সিলেবাস অনুযায়ী বিশ্বমানের বিজ্ঞান, বাণিজ্য ও মানবিক অনুষদ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* বিভাগ ১: বিজ্ঞান */}
              <div className="group rounded-3xl bg-slate-50/70 p-6 border-2 border-slate-200/80 hover:border-[#EA580C] hover:bg-white hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                    <Laptop className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#0F2C59] mt-4">বিজ্ঞান বিভাগ (Science)</h3>
                  <p className="text-xs text-slate-500 mt-1">ভবিষ্যতের ডাক্তার, প্রকৌশলী ও বিজ্ঞানী তৈরির শ্রেষ্ঠ প্ল্যাটফর্ম।</p>

                  <div className="my-4 space-y-2 text-xs text-slate-700">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞান ল্যাব</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>মেডিকেল ও বুয়েট ভর্তি প্রস্তুতি ফাউন্ডেশন</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>ন্যূনতম ভর্তি যোগ্যতা: SSC GPA 4.00</span>
                    </div>
                  </div>

                  {/* ইন-প্লেস সম্প্রসারণ (Rule 2: Smooth Expand) */}
                  <div className={`grid transition-all duration-300 ease-out ${expandedDept === 'sci' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="pt-3 pb-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-1.5 bg-orange-50/50 p-2.5 rounded-xl">
                        <p><strong>বাধ্যতামূলক বিষয়:</strong> বাংলা, ইংরেজি, আইসিটি, পদার্থবিজ্ঞান, রসায়ন।</p>
                        <p><strong>ঐচ্ছিক বিষয়:</strong> উচ্চতর গণিত / জীববিজ্ঞান।</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpandedDept(expandedDept === 'sci' ? null : 'sci')}
                    className="text-xs font-bold text-slate-600 hover:text-[#EA580C] cursor-pointer flex items-center space-x-1"
                  >
                    <span>{expandedDept === 'sci' ? 'সংক্ষেপ করুন' : 'সিলেবাস দেখুন'}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedDept === 'sci' ? 'rotate-180' : ''}`} />
                  </button>
                  <a href="#admission" className="text-xs font-black text-[#EA580C] hover:underline">
                    ভর্তি তথ্য &rarr;
                  </a>
                </div>
              </div>

              {/* বিভাগ ২: ব্যবসায় শিক্ষা */}
              <div className="group rounded-3xl bg-slate-50/70 p-6 border-2 border-slate-200/80 hover:border-emerald-500 hover:bg-white hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#0F2C59] mt-4">ব্যবসায় শিক্ষা (Business Studies)</h3>
                  <p className="text-xs text-slate-500 mt-1">করপোরেট লিডার, ব্যাংকার ও সফল উদ্যোক্তা গড়ার বিশেষায়িত পাঠক্রম।</p>

                  <div className="my-4 space-y-2 text-xs text-slate-700">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>হিসাববিজ্ঞান, ফিন্যান্স ও ব্যবসায় সংগঠন</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>ডিজিটাল অ্যাকাউন্টিং ও সফটওয়্যার ল্যাব</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>ন্যূনতম ভর্তি যোগ্যতা: SSC GPA 3.00</span>
                    </div>
                  </div>

                  {/* ইন-প্লেস সম্প্রসারণ */}
                  <div className={`grid transition-all duration-300 ease-out ${expandedDept === 'bus' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="pt-3 pb-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-1.5 bg-emerald-50/50 p-2.5 rounded-xl">
                        <p><strong>বাধ্যতামূলক বিষয়:</strong> বাংলা, ইংরেজি, আইসিটি, হিসাববিজ্ঞান, ব্যবসায় সংগঠন।</p>
                        <p><strong>ঐচ্ছিক বিষয়:</strong> ফিন্যান্স ও ব্যাংকিং / উৎপাদন ব্যবস্থাপনা ও বিপণন।</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpandedDept(expandedDept === 'bus' ? null : 'bus')}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-600 cursor-pointer flex items-center space-x-1"
                  >
                    <span>{expandedDept === 'bus' ? 'সংক্ষেপ করুন' : 'সিলেবাস দেখুন'}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedDept === 'bus' ? 'rotate-180' : ''}`} />
                  </button>
                  <a href="#admission" className="text-xs font-black text-emerald-600 hover:underline">
                    ভর্তি তথ্য &rarr;
                  </a>
                </div>
              </div>

              {/* বিভাগ ৩: মানবিক */}
              <div className="group rounded-3xl bg-slate-50/70 p-6 border-2 border-slate-200/80 hover:border-purple-500 hover:bg-white hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#0F2C59] mt-4">মানবিক বিভাগ (Humanities)</h3>
                  <p className="text-xs text-slate-500 mt-1">আইনজীবী, বিসিএস ক্যাডার ও সমাজবিজ্ঞানীদের পাদপীঠ।</p>

                  <div className="my-4 space-y-2 text-xs text-slate-700">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>অর্থনীতি, পৌরনীতি, যুক্তিবিদ্যা ও সমাজকল্যাণ</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>বিশ্ববিদ্যালয় 'খ' ইউনিট ভর্তি গাইডেন্স</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>ন্যূনতম ভর্তি যোগ্যতা: SSC GPA 2.50</span>
                    </div>
                  </div>

                  {/* ইন-প্লেস সম্প্রসারণ */}
                  <div className={`grid transition-all duration-300 ease-out ${expandedDept === 'hum' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="pt-3 pb-2 text-[11px] text-slate-600 border-t border-slate-100 space-y-1.5 bg-purple-50/50 p-2.5 rounded-xl">
                        <p><strong>বাধ্যতামূলক বিষয়:</strong> বাংলা, ইংরেজি, আইসিটি, পৌরনীতি ও সুশাসন, অর্থনীতি।</p>
                        <p><strong>ঐচ্ছিক বিষয়:</strong> যুক্তিবিদ্যা / সমাজকর্ম / ইসলামের ইতিহাস।</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpandedDept(expandedDept === 'hum' ? null : 'hum')}
                    className="text-xs font-bold text-slate-600 hover:text-purple-600 cursor-pointer flex items-center space-x-1"
                  >
                    <span>{expandedDept === 'hum' ? 'সংক্ষেপ করুন' : 'সিলেবাস দেখুন'}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedDept === 'hum' ? 'rotate-180' : ''}`} />
                  </button>
                  <a href="#admission" className="text-xs font-black text-purple-600 hover:underline">
                    ভর্তি তথ্য &rarr;
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* ৫. কেন্দ্রীয় নোটিশ বোর্ড (#notices) */}
        {/* ============================================================== */}
        <section id="notices" className="py-14 sm:py-20 bg-[#F4F7FB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3 py-1 text-xs font-black text-[#EA580C]">
                  কেন্দ্রীয় সার্কুলার
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] tracking-tight mt-1">
                  কলেজ নোটিশ বোর্ড
                </h2>
              </div>

              {/* ফিল্টার বাটনস (Rule 2: Animated Sliding Background Pill) */}
              <div className="relative inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/60 backdrop-blur-md self-start sm:self-auto overflow-hidden">
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#0F2C59] shadow-md transition-all duration-400 ease-out pointer-events-none"
                  style={{
                    width: `calc(${100 / noticeTabs.length}% - 3px)`,
                    transform: `translateX(${activeNoticeTabIndex * 100}%)`,
                    transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
                {noticeTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setNoticeFilter(tab.key)}
                    className={`relative z-10 py-2 px-3 sm:px-4 text-xs font-black transition-colors duration-200 cursor-pointer ${
                      noticeFilter === tab.key ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* নোটিশ কার্ডস কন্টেইনার (Rule 2: Smooth Height Transition Without Jumps) */}
            <div 
              style={{
                height: noticeHeight ? `${noticeHeight}px` : 'auto',
                transition: 'height 420ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="overflow-hidden transition-all duration-400"
            >
              <div ref={noticeContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                {filteredNotices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => openNoticeModal(n)}
                    className="group rounded-3xl bg-white p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-orange-300 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                        <span className="rounded-lg bg-orange-50 px-2.5 py-0.5 text-[10px] font-black text-[#EA580C] border border-orange-200/60">
                          {n.category_display || n.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(n.created_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-[#0F2C59] group-hover:text-[#EA580C] transition-colors mt-2.5 leading-snug">
                        {n.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#EA580C]">
                      <span>বিস্তারিত পড়ুন</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* ৬. অধ্যক্ষের বাণী (#about) */}
        {/* ============================================================== */}
        <section id="about" className="py-14 sm:py-20 bg-white select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="rounded-3xl bg-gradient-to-r from-[#0A1D3B] via-[#0F2C59] to-[#163A70] p-7 sm:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                <div className="lg:col-span-4 text-center lg:text-left">
                  <div className="inline-block relative">
                    <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-3xl bg-gradient-to-br from-[#FF6B00] to-amber-500 p-1 shadow-2xl">
                      <div className="h-full w-full rounded-[20px] bg-[#0A1D3B] flex flex-col items-center justify-center text-white p-4">
                        <GraduationCap className="h-16 w-16 text-[#FF6B00] mb-2" />
                        <span className="text-xs font-black text-white">অধ্যক্ষের কার্যালয়</span>
                      </div>
                    </div>
                    <span className="absolute -bottom-2 right-2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow">
                      অধ্যক্ষ
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mt-4">প্রফেসর ড. মুহাম্মদ আব্দুল্লাহ</h3>
                  <p className="text-xs text-[#FF851B] font-bold">অধ্যক্ষ, স্টারলাইট কলেজ, সিলেট</p>
                  <p className="text-[11px] text-slate-300">পিএইচডি (ঢাকা বিশ্ববিদ্যালয়), সাবেক অধ্যাপক</p>
                </div>

                <div className="lg:col-span-8 space-y-4 text-slate-200 text-xs sm:text-sm leading-relaxed">
                  <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-black text-amber-300 border border-white/15">
                    অধ্যক্ষের বাণী ও দৃষ্টিভঙ্গি
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    "আমরা শুধু পরীক্ষার্থী গড়ি না, নৈতিক ও প্রযুক্তিজ্ঞানসম্পন্ন আগামী দিনের বিশ্বনাগরিক গড়ি।"
                  </h2>
                  <p>
                    বিসমিল্লাহির রাহমানির রাহিম। আধুনিক শিক্ষার মূল লক্ষ্য কেবল পাঠ্যপুস্তকের জ্ঞান অর্জন নয়, বরং আত্মমর্যাদাশীল, মানবিক ও প্রযুক্তিবিদ্যায় পারদর্শী ব্যক্তিত্বের বিকাশ। স্টারলাইট কলেজ প্রতিষ্ঠার শুরু থেকেই সিলেটে একটি আন্তর্জাতিক মানসম্পন্ন ডিজিটাল উচ্চমাধ্যমিক বিদ্যাপীঠ গড়ে তোলার স্বপ্ন বাস্তবায়ন করে চলেছে।
                  </p>
                  <p>
                    আমাদের স্বয়ংক্রিয় ক্লাসরুম, ইনচার্জ শিক্ষক তত্ত্বাবধান এবং ডিজিটাল অভিভাবক যোগাযোগ ব্যবস্থার মাধ্যমে প্রতিটি শিক্ষার্থীর প্রতি ব্যক্তিগত নজর রাখা হয়। আমি অভিভাবক ও শিক্ষার্থীদের আমাদের আলোকিত পরিবারে আন্তরিকভাবে স্বাগত জানাই।
                  </p>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* ৭. ভর্তি নির্দেশিকা ২০২৬ ও স্মুথ এফএকিউ অ্যাকর্ডিয়ন (#admission) */}
        {/* ============================================================== */}
        <section id="admission" className="py-14 sm:py-20 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3 py-1 text-xs font-black text-[#EA580C]">
                ভর্তি ২০২৬-২০২৭
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] tracking-tight mt-1.5">
                ভর্তি নির্দেশিকা ও সাধারণ জিজ্ঞাসাসমূহ
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                একাদশ শ্রেণিতে ভর্তি সংক্রান্ত যেকোনো তথ্যের জন্য নিচের রোডম্যাপ ও প্রশ্নোত্তর পড়ুন
              </p>
            </div>

            {/* ৪ ধাপের ভর্তি রোডম্যাপ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-10">
              {[
                { step: '১', title: 'অনলাইন আবেদন', desc: 'বোর্ড নিয়মে কলেজ চয়েস', color: 'bg-[#EA580C]' },
                { step: '২', title: 'মেধা তালিকা প্রকাশ', desc: 'এসএমএস কনফার্মেশন', color: 'bg-[#0F2C59]' },
                { step: '৩', title: 'ডকুমেন্ট ভেরিফিকেশন', desc: 'মার্কশিট ও সনদ যাচাই', color: 'bg-emerald-600' },
                { step: '৪', title: 'ডিজিটাল আইডি প্রাপ্তি', desc: 'স্টুডেন্ট পোর্টাল পিন', color: 'bg-purple-600' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl bg-white p-4 border border-slate-200/80 text-center shadow-xs hover:shadow-md transition-all active:scale-95">
                  <span className={`h-7 w-7 rounded-full ${item.color} text-white text-xs font-black flex items-center justify-center mx-auto mb-2 shadow-xs`}>
                    {item.step}
                  </span>
                  <strong className="text-xs font-extrabold text-[#0F2C59] block">{item.title}</strong>
                  <span className="text-[10px] text-slate-500">{item.desc}</span>
                </div>
              ))}
            </div>

            {/* স্মুথ গ্রিড-হাইট এফএকিউ অ্যাকর্ডিয়ন */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="rounded-2xl border border-slate-200/80 overflow-hidden transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs sm:text-sm text-[#0F2C59] bg-slate-50/70 hover:bg-slate-100/80 transition-colors cursor-pointer min-h-[44px]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown 
                        className={`h-4 w-4 shrink-0 ml-2 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#EA580C]' : 'text-slate-400'
                        }`} 
                      />
                    </button>
                    <div 
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* ৮. দ্রুত তথ্য জিজ্ঞাসা ও যোগাযোগ ফর্ম (#contact) */}
        {/* ============================================================== */}
        <section id="contact" className="py-14 sm:py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* বাম পাশ: সরাসরি যোগাযোগের তথ্য */}
              <div className="lg:col-span-5 space-y-5">
                <span className="rounded-full bg-orange-50 border border-orange-200/60 px-3 py-1 text-xs font-black text-[#EA580C]">
                  যোগাযোগ ও দিকনির্দেশনা
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59]">
                  ক্যাম্পাস পরিদর্শন ও ভর্তি তথ্য সেল
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  যেকোনো প্রশ্ন বা ভর্তি সংক্রান্ত পরামর্শের জন্য সরাসরি আমাদের ক্যাম্পাসে আসুন অথবা নিচের নম্বরে কল করুন।
                </p>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                    <MapPin className="h-5 w-5 text-[#EA580C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0F2C59] block">ক্যাম্পাস ঠিকানা:</strong>
                      <span className="text-slate-600">আম্বরখানা মেইন রোড, বিমানবন্দর সড়ক মোড়, সিলেট সদর, সিলেট-৩১০০।</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                    <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0F2C59] block">হটলাইন ও ভর্তি হেল্পডেস্ক:</strong>
                      <span className="text-slate-600 font-mono">+৮৮০১৭১২-৩৪৫৬৭৮, +৮৮০৮২১-৭৬৫৪৩২</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0F2C59] block">অফিস সময়সূচি:</strong>
                      <span className="text-slate-600">শনিবার হতে বৃহস্পতিবার: সকাল ৮:০০ হতে বিকাল ৪:০০ পর্যন্ত</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ডান পাশ: তাত্ক্ষণিক মেসেজ ফর্ম (Rule 5: Form Ergonomics) */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl bg-slate-50/80 p-6 sm:p-8 border border-slate-200/90 shadow-xs">
                  <h3 className="text-base font-black text-[#0F2C59] mb-1">
                    ভর্তি সংক্রান্ত কোনো জিজ্ঞাসা আছে? আমাদের লিখুন
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    আপনার তথ্য দিন, আমাদের ভর্তি অফিসার অতি দ্রুত আপনার সাথে ফোনে কথা বলবেন।
                  </p>

                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="group">
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">
                          আপনার বা শিক্ষার্থীর পূর্ণ নাম
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: সাকিব আল হাসান"
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200/90 p-3 text-xs font-bold text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-white"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">
                          মোবাইল নম্বর
                        </label>
                        <input
                          type="text"
                          placeholder="০১৭xxxxxxxx"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200/90 p-3 text-xs font-bold text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">
                        আগ্রহী বিভাগ
                      </label>
                      <select
                        value={inquiryForm.group}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, group: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200/90 p-3 text-xs font-bold text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-white"
                      >
                        <option value="SCIENCE">বিজ্ঞান বিভাগ (Science)</option>
                        <option value="BUSINESS">ব্যবসায় শিক্ষা (Business Studies)</option>
                        <option value="HUMANITIES">মানবিক বিভাগ (Humanities)</option>
                      </select>
                    </div>

                    <div className="group">
                      <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1.5">
                        আপনার জিজ্ঞাসা / মন্তব্য
                      </label>
                      <textarea
                        rows="3"
                        placeholder="আপনার কোনো প্রশ্ন থাকলে সংক্ষেপে লিখুন..."
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200/90 p-3 text-xs font-medium text-slate-800 transition-all duration-200 focus:border-[#EA580C] focus:outline-none focus:ring-4 focus:ring-orange-500/10 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingInquiry}
                      className="group rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:from-[#EA580C] hover:to-amber-700 px-7 py-3.5 text-xs font-black text-white shadow-md shadow-orange-500/25 transition-all duration-200 active:scale-[0.98] flex items-center space-x-2 cursor-pointer min-h-[44px]"
                    >
                      {sendingInquiry ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>পাঠানো হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          <span>বার্তা পাঠান</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* ফুটার */}
      <PublicFooter />

      {/* মোবাইল স্টিকি বটম অ্যাপ বার */}
      <MobileBottomNav />

      {/* =========================================================
          নোটিশ বিস্তারিত মডাল (Rule 3: Two-Phase Spring Animation)
         ========================================================= */}
      {isNoticeModalMounted && selectedNotice && (
        <div 
          style={{
            transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: isNoticeModalVisible ? 1 : 0,
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 select-none"
          onClick={closeNoticeModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            style={{
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
              transform: isNoticeModalVisible ? 'translateY(0px) scale(1)' : 'translateY(36px) scale(0.95)',
              opacity: isNoticeModalVisible ? 1 : 0,
            }}
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="rounded-md bg-orange-50 px-2.5 py-0.5 text-[10px] font-black text-[#EA580C]">
                  {selectedNotice.category_display || selectedNotice.category}
                </span>
                <h3 className="text-base font-black text-[#0F2C59] mt-1.5">{selectedNotice.title}</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  প্রকাশের তারিখ: {new Date(selectedNotice.created_at).toLocaleDateString('bn-BD')}
                </span>
              </div>
              <button
                type="button"
                onClick={closeNoticeModal}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-wrap select-text">
              {selectedNotice.content}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeNoticeModal}
                className="w-full sm:w-auto rounded-xl bg-[#0F2C59] hover:bg-[#163A70] px-6 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          স্মার্ট সার্ভিস হাব ইন্টারঅ্যাক্টিভ মডাল (Rules 2 & 3: Sliding Pill + Zero Layout Jumps)
         ========================================================= */}
      {isServiceModalMounted && (
        <div 
          style={{
            transition: 'opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: isServiceModalVisible ? 1 : 0,
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 select-none"
          onClick={closeServiceModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            style={{
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
              transform: isServiceModalVisible ? 'translateY(0px) scale(1)' : 'translateY(36px) scale(0.95)',
              opacity: isServiceModalVisible ? 1 : 0,
            }}
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* মোবাইল ড্র্যাগ হ্যান্ডল */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
            
            {/* মডাল হেডার */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#EA580C]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F2C59]">স্টারলাইট স্মার্ট সেবা পোর্টাল</h3>
                  <p className="text-[10px] text-slate-500">অনলাইন সার্ভিসেস ও শিডিউল গাইড</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={closeServiceModal} 
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ৫টি সার্ভিস সেগমেন্টেড কন্ট্রোল উইথ স্লাইডিং পিল (Rule 2) */}
            <div className="my-3.5 relative flex p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
              <div 
                className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-transform duration-400 ease-out pointer-events-none"
                style={{
                  width: `calc(${100 / serviceTabs.length}% - 2px)`,
                  transform: `translateX(${activeServiceTabIndex * 100}%)`,
                  transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
              {serviceTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setServiceModalTab(tab.key)}
                    className={`relative z-10 flex-1 py-2 text-center text-[11px] font-black transition-colors duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-1 ${
                      serviceModalTab === tab.key ? 'text-[#0F2C59]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TabIcon className="h-3.5 w-3.5 mb-0.5 sm:mb-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ডায়নামিক হাইট বডি রেপার (Zero Layout Jumps - Rule 2) */}
            <div 
              style={{
                height: serviceBodyHeight ? `${serviceBodyHeight}px` : 'auto',
                transition: 'height 420ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="overflow-hidden transition-all duration-400"
            >
              <div ref={serviceBodyRef} className="py-2">
                
                {/* ১. বাস পরিবহন প্যানেল */}
                {serviceModalTab === 'transport' && (
                  <div className="space-y-3 hero-stagger-1 text-xs text-slate-600">
                    <p className="font-medium">সিলেট মহানগর ও পার্শ্ববর্তী অঞ্চলের শিক্ষার্থীদের সুবিধার্থে ১০টি জিপিএস ট্র্যাকারযুক্ত শীতাতপ নিয়ন্ত্রিত বাস চলাচল করে।</p>
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                        <strong>রুট ১: কদমতলী &rarr; দক্ষিণ সুরমা &rarr; ক্যাম্পাস</strong>
                        <span className="text-[#EA580C] font-mono">সকাল ৭:৪৫</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                        <strong>রুট ২: টিলাগড় &rarr; শিবগঞ্জ &rarr; নয়াসড়ক &rarr; ক্যাম্পাস</strong>
                        <span className="text-[#EA580C] font-mono">সকাল ৭:৫০</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <strong>রুট ৩: মদিনা মার্কেট &rarr; পাঠানটুলা &rarr; চৌহাট্টা &rarr; ক্যাম্পাস</strong>
                        <span className="text-[#EA580C] font-mono">সকাল ৮:০০</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">বাস কার্ড সংগ্রহ ও ডিজিটাল সিট বুকিংয়ের জন্য স্টুডেন্ট পোর্টালে লগইন করুন।</p>
                  </div>
                )}

                {/* ২. ক্লাস রুটিন প্যানেল */}
                {serviceModalTab === 'routine' && (
                  <div className="space-y-3 hero-stagger-1 text-xs text-slate-600">
                    <p className="font-medium">একাদশ ও দ্বাদশ শ্রেণির দৈনিক ক্লাস সময়সূচি সকাল ৮:৩০ হতে দুপুর ১:৪৫ পর্যন্ত অনুষ্ঠিত হয়।</p>
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                        <span>১ম পিরিয়ড: পদার্থ / হিসাববিজ্ঞান / পৌরনীতি</span>
                        <span className="font-mono text-[#0F2C59] font-bold">০৮:৩০ - ০৯:১৫</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                        <span>২য় পিরিয়ড: বাংলা / ইংরেজি ফার্স্ট পেপার</span>
                        <span className="font-mono text-[#0F2C59] font-bold">০৯:১৫ - ১০:০০</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                        <span>টিফিন ও নামাজ বিরতি</span>
                        <span className="font-mono text-amber-600 font-bold">১১:৩০ - ১২:০০</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ব্যবহারিক বিজ্ঞান ও আইসিটি ল্যাব</span>
                        <span className="font-mono text-emerald-600 font-bold">১২:০০ - ০১:৪৫</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">শাখাভিত্তিক বিস্তারিত রুটিন প্রিন্ট করতে স্টুডেন্ট পোর্টালে প্রবেশ করুন।</p>
                  </div>
                )}

                {/* ৩. সেন্ট্রাল লাইব্রেরি প্যানেল */}
                {serviceModalTab === 'library' && (
                  <div className="space-y-3 hero-stagger-1 text-xs text-slate-600">
                    <p className="font-medium">কলেজের শীতাতপ নিয়ন্ত্রিত সেন্ট্রাল লাইব্রেরিতে রয়েছে বিজ্ঞান, ব্যবসায় ও সাহিত্যের ১৫,০০০+ পাঠ্য ও রেফারেন্স গ্রন্থ।</p>
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                      <p>• <strong>ই-লাইব্রেরি সুবিধা:</strong> আন্তর্জাতিক জার্নাল ও ডিজিটাল পিডিএফ সংগ্রহ।</p>
                      <p>• <strong>বই ইস্যু সময়সীমা:</strong> এককালীন ৩টি বই ১৪ দিনের জন্য ইস্যু করা যায়।</p>
                      <p>• <strong>লাইব্রেরি সময়:</strong> রবিবার থেকে বৃহস্পতিবার সকাল ৮:০০ - বিকাল ৫:০০।</p>
                    </div>
                    <p className="text-[11px] text-slate-400">ডিজিটাল ক্যাটালগ অনুসন্ধান ও বই রিনিউ করতে ডিজিটাল আইডি কার্ড প্রয়োজন।</p>
                  </div>
                )}

                {/* ৪. ফি ও পেমেন্ট প্যানেল */}
                {serviceModalTab === 'fees' && (
                  <div className="space-y-3 hero-stagger-1 text-xs text-slate-600">
                    <p className="font-medium">বিকাশ, নগদ, রকেট ও ভিসা/মাস্টারকার্ডের মাধ্যমে ঘরে বসেই কলেজের মাসিক বেতন ও পরীক্ষার ফি প্রদান করা যায়।</p>
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                      <p>• <strong>পেমেন্ট গেটওয়ে:</strong> SSLCommerz ও bKash Direct Checkout সাপোর্টেড।</p>
                      <p>• <strong>তাৎক্ষণিক রসিদ:</strong> টাকা জমা হওয়ার সাথে সাথে স্বয়ংক্রিয় ডিজিটাল ভাউচার তৈরি হয়।</p>
                      <p>• <strong>বকেয়া অনুসন্ধান:</strong> স্টুডেন্ট পোর্টালে শিক্ষার্থীর আইডি দিয়ে বকেয়া দেখা যায়।</p>
                    </div>
                    <p className="text-[11px] text-slate-400">ফি পরিশোধের জন্য শিক্ষার্থী পোর্টালে রোল ও পিন দিয়ে প্রবেশ করুন।</p>
                  </div>
                )}

                {/* ৫. ডিজিটাল আইডি কার্ড প্যানেল */}
                {serviceModalTab === 'idcard' && (
                  <div className="space-y-3 hero-stagger-1 text-xs text-slate-600">
                    <p className="font-medium">প্রতিটি শিক্ষার্থীর জন্য রয়েছে ইউনিক কিউআর কোড সংবলিত স্মার্ট ডিজিটাল পরিচয়পত্র।</p>
                    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-[11px]">
                      <p>• <strong>ডিজিটাল হাজিরা:</strong> ক্যাম্পাসে প্রবেশের সময় গেট স্ক্যানারে পাঞ্চ করতে হয়।</p>
                      <p>• <strong>লাইব্রেরি ও ল্যাব অ্যাক্সেস:</strong> আইডি কার্ড স্ক্যান করে ল্যাবে প্রবেশ নিশ্চিত করা হয়।</p>
                      <p>• <strong>অনলাইন ভেরিফিকেশন:</strong> অভিভাবক কিউআর স্ক্যান করে শিক্ষার্থীর প্রোফাইল দেখতে পারেন।</p>
                    </div>
                    <p className="text-[11px] text-slate-400">ডিজিটাল আইডি কার্ড ডাউনলোড ও প্রিন্ট করতে স্টুডেন্ট পোর্টালে লগইন করুন।</p>
                  </div>
                )}

              </div>
            </div>

            {/* মডাল ফুটার */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Link
                to="/login"
                className="text-xs font-black text-[#EA580C] hover:underline inline-flex items-center space-x-1"
              >
                <span>স্টুডেন্ট পোর্টালে লগইন</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={closeServiceModal}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;