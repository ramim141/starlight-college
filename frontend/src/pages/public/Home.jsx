import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { homepageContentApi } from '../../api/homepage';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import MobileBottomNav from '../../components/public/MobileBottomNav';
import {
  CustomMotionStyles,
  HeroSection,
  ServicesSection,
  DepartmentsSection,
  NoticesSection,
  AboutSection,
  AdmissionSection,
  ContactSection,
  NoticeDetailModal,
  ServiceHubModal,
  ResultSearchModal,
} from '../../components/public/home';

const defaultNotices = [
  {
    id: 'n1',
    title: '২০২৬-২০২৭ শিক্ষাবর্ষে একাদশ শ্রেণিতে ভর্তি কার্যক্রম সংক্রান্ত কেন্দ্রীয় বিজ্ঞপ্তি',
    category: 'ADMISSION',
    category_display: 'ভর্তি ২০২৬',
    created_at: '2026-10-15',
    content: 'স্টারলাইট কলেজে একাদশ শ্রেণিতে বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় অনলাইন ভর্তি কার্যক্রম শুরু হয়েছে। মাধ্যমিক (SSC) পরীক্ষায় উত্তীর্ণ শিক্ষার্থীরা অনলাইনে আবেদন করতে পারবেন। গোল্ডেন জিপিএ-৫ প্রাপ্তদের জন্য শতভাগ টিউশন ফি ফ্রি এবং অসচ্ছল শিক্ষার্থীদের জন্য রয়েছে প্রিন্সিপাল ওয়েলফেয়ার স্কলারশিপ।',
  },
  {
    id: 'n2',
    title: 'দ্বাদশ শ্রেণির প্রাক-নির্বাচনী (Pre-Test) পরীক্ষা ২০২৬-এর সময়সূচি প্রকাশ',
    category: 'EXAM',
    category_display: 'পরীক্ষা',
    created_at: '2026-10-12',
    content: 'দ্বাদশ শ্রেণির বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখার শিক্ষার্থীদের অবগতির জন্য জানানো যাচ্ছে যে আগামী ১ নভেম্বর ২০২৬ হতে প্রাক-নির্বাচনী পরীক্ষা অনুষ্ঠিত হবে। প্রত্যেক শিক্ষার্থীকে স্টুডেন্ট পোর্টাল থেকে ডিজিটাল প্রবেশপত্র (Admit Card) ডাউনলোড করে প্রিন্ট নিতে হবে।',
  },
  {
    id: 'n3',
    title: 'কলেজ পরিবহন (বাস সার্ভিস) নতুন ৩টি শীতাতপ নিয়ন্ত্রিত বাস সংযোজন ও রুট শিডিউল',
    category: 'TRANSPORT',
    category_display: 'পরিবহন',
    created_at: '2026-10-10',
    content: 'শিক্ষার্থীদের আরামদায়ক ও নিরাপদ যাতায়াতের সুবিধার্থে সিলেট সদর, দক্ষিণ সুরমা ও বিমানবন্দর রোডে নতুন ৩টি এসি বাস সংযোজন করা হয়েছে। বাসে সার্বক্ষণিক জিপিএস ট্র্যাকিং ও সিসিটিভি নজরদারি রয়েছে।',
  },
  {
    id: 'n4',
    title: 'বার্ষিক বিজ্ঞান মেলা ও আন্তঃকলেজ বিতর্ক প্রতিযোগিতা ২০২৬-এর রেজিস্ট্রেশন',
    category: 'EVENT',
    category_display: 'সহ-শিক্ষা',
    created_at: '2026-10-08',
    content: 'আগামী ২৫ অক্টোবর কলেজ কেন্দ্রীয় অডিটোরিয়ামে বিজ্ঞান ও প্রযুক্তি প্রদর্শনী এবং বিতর্ক উৎসব অনুষ্ঠিত হবে। প্রতিটি শাখার শিক্ষার্থীদের প্রজেক্ট জমা দেওয়ার জন্য বিভাগীয় প্রধানের সাথে যোগাযোগের আহ্বান জানানো হচ্ছে।',
  },
];

let cachedNotices = null;

const Home = () => {
  const [notices, setNotices] = useState(cachedNotices || defaultNotices);
  const [homepageContent, setHomepageContent] = useState({});

  // নোটিশ টু-ফেজ মডাল স্টেট (Rule 3)
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isNoticeMounted, setIsNoticeMounted] = useState(false);
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);

  // সার্ভিস হাব টু-ফেজ মডাল স্টেট (Rule 3)
  const [serviceModalTab, setServiceModalTab] = useState('transport');
  const [isServiceMounted, setIsServiceMounted] = useState(false);
  const [isServiceVisible, setIsServiceVisible] = useState(false);

  // রেজাল্ট সার্চ টু-ফেজ মডাল স্টেট (Rule 3)
  const [resultPrefillRoll, setResultPrefillRoll] = useState('');
  const [isResultMounted, setIsResultMounted] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('main [data-home-reveal]');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('operations/notices/');
        const list = res.data.results || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          cachedNotices = list;
          setNotices(list);
        }
      } catch {
        if (!cachedNotices) setNotices(defaultNotices);
      }
    };
    fetchNotices();
    const fetchHomepageContent = async () => {
      try {
        const [hero, services, departments, about, admission, contact] = await Promise.all([
          homepageContentApi.hero.list(),
          homepageContentApi.services.list(),
          homepageContentApi.departments.list(),
          homepageContentApi.about.list(),
          homepageContentApi.admission.list(),
          homepageContentApi.contact.list(),
        ]);
        setHomepageContent({
          hero: (hero.results || hero)[0],
          services: services.results || services,
          departments: departments.results || departments,
          about: (about.results || about)[0],
          admission: (admission.results || admission)[0],
          contact: (contact.results || contact)[0],
        });
      } catch {
        // Keep the designed defaults when the public CMS endpoint is unavailable.
      }
    };
    fetchHomepageContent();
  }, []);

  // মডাল স্ক্রোল লক
  useEffect(() => {
    if (isNoticeMounted || isServiceMounted || isResultMounted) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isNoticeMounted, isServiceMounted, isResultMounted]);

  // Two-Phase Modal Refs for Unmount Clearance
  const noticeTimerRef = useRef(null);
  const serviceTimerRef = useRef(null);
  const resultTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(noticeTimerRef.current);
      clearTimeout(serviceTimerRef.current);
      clearTimeout(resultTimerRef.current);
    };
  }, []);

  // Two-Phase Modal Handlers
  const openNoticeModal = (notice) => {
    clearTimeout(noticeTimerRef.current);
    setSelectedNotice(notice);
    setIsNoticeMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsNoticeVisible(true)));
  };
  const closeNoticeModal = () => {
    setIsNoticeVisible(false);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setIsNoticeMounted(false);
      setSelectedNotice(null);
    }, 320);
  };

  const openServiceModal = (tab = 'transport') => {
    clearTimeout(serviceTimerRef.current);
    setServiceModalTab(tab);
    setIsServiceMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsServiceVisible(true)));
  };
  const closeServiceModal = () => {
    setIsServiceVisible(false);
    clearTimeout(serviceTimerRef.current);
    serviceTimerRef.current = setTimeout(() => {
      setIsServiceMounted(false);
    }, 320);
  };

  const openResultModal = (roll = '') => {
    clearTimeout(resultTimerRef.current);
    if (roll) setResultPrefillRoll(roll);
    setIsResultMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsResultVisible(true)));
  };
  const closeResultModal = () => {
    setIsResultVisible(false);
    clearTimeout(resultTimerRef.current);
    resultTimerRef.current = setTimeout(() => {
      setIsResultMounted(false);
    }, 320);
  };

  // Escape Key Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isNoticeVisible) closeNoticeModal();
        if (isServiceVisible) closeServiceModal();
        if (isResultVisible) closeResultModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNoticeVisible, isServiceVisible, isResultVisible]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
      <CustomMotionStyles />

      {/* নেভিগেশন বার */}
      <PublicNavbar onOpenResultModal={openResultModal} />

      <main className="flex-1">
        <HeroSection content={homepageContent.hero} />
        <ServicesSection content={homepageContent.services} onOpenServiceModal={openServiceModal} onOpenResultModal={openResultModal} />
        <DepartmentsSection content={homepageContent.departments} />
        <NoticesSection notices={notices} onSelectNotice={openNoticeModal} />
        <AboutSection content={homepageContent.about} />
        <AdmissionSection content={homepageContent.admission} />
        <ContactSection content={homepageContent.contact} />
      </main>

      {/* ফুটার ও বটম মোবাইল বার */}
      <PublicFooter onOpenResultModal={openResultModal} />
      <MobileBottomNav onOpenResultModal={openResultModal} />

      {/* টু-ফেজ স্প্রিং মডালসমূহ */}
      <NoticeDetailModal
        isMounted={isNoticeMounted}
        isVisible={isNoticeVisible}
        notice={selectedNotice}
        onClose={closeNoticeModal}
      />

      <ServiceHubModal
        isMounted={isServiceMounted}
        isVisible={isServiceVisible}
        activeTab={serviceModalTab}
        onClose={closeServiceModal}
      />

      <ResultSearchModal
        isMounted={isResultMounted}
        isVisible={isResultVisible}
        initialRoll={resultPrefillRoll}
        onClose={closeResultModal}
      />
    </div>
  );
};

export default Home;