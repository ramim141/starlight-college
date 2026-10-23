import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  LogIn, 
  LayoutDashboard, 
  ChevronRight, 
  Users
} from 'lucide-react';

const PublicNavbar = ({ onOpenResultModal }) => {
  const { user, isAuthenticated } = useAuth();
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(drawerTimerRef.current);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ২-ফেজ মোবাইল ড্রয়ার ওপেন (Double RAF)
  const openMobileDrawer = () => {
    clearTimeout(drawerTimerRef.current);
    setIsDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsDrawerVisible(true));
    });
  };

  // ২-ফেজ মোবাইল ড্রয়ার ক্লোজ (৩২০ms এক্সিট ট্রানজিশন)
  const closeMobileDrawer = () => {
    setIsDrawerVisible(false);
    clearTimeout(drawerTimerRef.current);
    drawerTimerRef.current = setTimeout(() => setIsDrawerMounted(false), 320);
  };

  const toggleMobileDrawer = () => {
    if (isDrawerVisible) closeMobileDrawer();
    else openMobileDrawer();
  };

  // Escape key সাপোর্ট
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerVisible) {
        closeMobileDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerVisible]);

  useEffect(() => {
    closeMobileDrawer();
  }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'PRINCIPAL': return '/principal';
      case 'TEACHER': return '/teacher';
      case 'ACCOUNTANT': return '/accountant';
      case 'STUDENT': return '/student';
      default: return '/login';
    }
  };

  const navLinks = [
    { label: 'হোম', href: '#hero' },
    { label: 'এক নজরে', href: '#about' },
    { label: 'বিভাগসমূহ', href: '#departments' },
    { label: 'সেবাসমূহ', href: '#services' },
    { label: 'নোটিশ বোর্ড', href: '#notices' },
    { label: 'ফলাফল', href: '#results' },
    { label: 'ভর্তি তথ্য', href: '#admission' },
    { label: 'যোগাযোগ', href: '#contact' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    closeMobileDrawer();
    if (href === '#results' && onOpenResultModal) {
      onOpenResultModal();
      return;
    }
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/' + href);
      }
    }
  };

  return (
    <>
      {/* ১. শীর্ষ তথ্য স্ট্রিপ (Top Mini Bar) */}
      <div className="bg-[#04142E] text-slate-300 text-[11px] py-1.5 px-4 hidden sm:block border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-[#FF6B00]" />
              <span>আম্বরখানা রোড, সিলেট সদর, সিলেট-৩১০০</span>
            </span>
            <span className="flex items-center space-x-1">
              <Phone className="h-3 w-3 text-emerald-400" />
              <span className="font-mono">হেল্পলাইন: +৮৮০১৭১২-৩৪৫৬৭৮</span>
            </span>
            <span className="flex items-center space-x-1">
              <Mail className="h-3 w-3 text-cyan-400" />
              <span>info@starlightcollege.edu.bd</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="rounded-full bg-[#FF6B00]/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-300 border border-[#FF6B00]/30 animate-pulse">
              ২০২৬-২০২৭ শিক্ষাবর্ষে একাদশ শ্রেণিতে ভর্তি চলছে
            </span>
            <span className="text-slate-400 font-bold font-mono">EIIN: ১৩৪৫৬৭</span>
          </div>
        </div>
      </div>

      {/* ২. মূল স্টিকি নেভিগেশন বার */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 select-none ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2 sm:py-2.5 border-b border-slate-200/80' 
            : 'bg-white py-2.5 sm:py-3.5 border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          
          {/* কলেজ অফিশিয়াল নেভ লোগো */}
          <Link to="/" className="flex items-center group min-w-0 py-0.5 shrink-0" aria-label="স্টারলাইট কলেজ হোমপেজ">
            <img 
              src="/nav-logo.webp" 
              alt="Starlight College Sylhet" 
              width="734"
              height="233"
              decoding="async"
              className="h-9 sm:h-11 md:h-12 w-auto max-w-[210px] sm:max-w-[280px] object-contain transition-transform duration-200 group-hover:scale-[1.02]" 
            />
          </Link>

          {/* ডেস্কটপ নেভিগেশন লিংকসমূহ */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* ডান পাশের কল টু অ্যাকশন বাটন (ডেস্কটপে দৃশ্যমান, মোবাইলে হ্যামবার্গার ড্রয়ারের ভেতরে) */}
          <div className="flex items-center space-x-2 shrink-0">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate(getDashboardPath())}
                className="hidden lg:inline-flex items-center space-x-2 rounded-2xl bg-[#0F2C59] px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4 text-[#FF6B00]" />
                <span>আমার ড্যাশবোর্ড ({user?.role_display || user?.role})</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden lg:inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/25 hover:from-[#EA580C] hover:to-amber-700 transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                <LogIn className="h-4 w-4" />
                <span>পোর্টাল লগইন</span>
              </Link>
            )}

            {/* মোবাইল হ্যামবার্গার টগল */}
            <button
              type="button"
              onClick={toggleMobileDrawer}
              className="rounded-2xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-90"
              aria-label="মোবাইল মেনু"
            >
              {isDrawerVisible ? <X className="h-6 w-6 text-[#EA580C]" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ৩. মোবাইল ড্রপডাউন মেনু (Two-Phase Smooth Spring Drawer) */}
        {isDrawerMounted && (
          <div 
            style={{
              transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease',
              transform: isDrawerVisible ? 'translateY(0px)' : 'translateY(-14px)',
              opacity: isDrawerVisible ? 1 : 0,
            }}
            className="lg:hidden fixed inset-x-0 top-full bg-white/98 backdrop-blur-sm border-b border-slate-200 shadow-2xl"
          >
            <div className="max-w-md mx-auto p-4 space-y-4">
              
              {/* কুইক পোর্টাল সিলেক্টর গ্রিড (মোবাইলে লগইন অপশন) */}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileDrawer();
                    navigate(getDashboardPath());
                  }}
                  className="w-full flex items-center justify-between rounded-2xl bg-[#0F2C59] p-3.5 text-white font-extrabold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="rounded-xl bg-white/10 p-2 text-[#FF6B00]">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-black">আমার ড্যাশবোর্ড</span>
                      <span className="text-[10px] text-slate-300 font-medium">{user?.role_display || user?.role} প্যানেল</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pb-3 border-b border-slate-100">
                  <Link
                    to="/login"
                    onClick={closeMobileDrawer}
                    className="flex items-center space-x-2.5 rounded-2xl bg-orange-50/80 p-3 border border-orange-200/80 hover:bg-orange-100/80 transition-all duration-200 group active:scale-98"
                  >
                    <div className="rounded-xl bg-[#FF6B00] p-2 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0F2C59] block">স্টুডেন্ট লগইন</span>
                      <span className="text-[10px] text-slate-500">মার্কশিট ও আইডি</span>
                    </div>
                  </Link>

                  <Link
                    to="/login"
                    onClick={closeMobileDrawer}
                    className="flex items-center space-x-2.5 rounded-2xl bg-blue-50/80 p-3 border border-blue-200/80 hover:bg-blue-100/80 transition-all duration-200 group active:scale-98"
                  >
                    <div className="rounded-xl bg-[#0F2C59] p-2 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#0F2C59] block">শিক্ষক ও স্টাফ</span>
                      <span className="text-[10px] text-slate-500">ইনচার্জ ও অফিস</span>
                    </div>
                  </Link>
                </div>
              )}

              {/* মোবাইল নেভিগেশন লিংকসমূহ */}
              <div className="grid grid-cols-2 gap-1.5">
                {navLinks.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-all duration-150 active:scale-95"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  </a>
                ))}
              </div>

              {/* মোবাইল হেল্পলাইন বাটন */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold font-mono">+৮৮০১৭১২-৩৪৫৬৭৮</span>
                </div>
                <a
                  href="#admission"
                  onClick={(e) => scrollToSection(e, '#admission')}
                  className="rounded-xl bg-orange-50 px-3 py-1.5 font-extrabold text-[#EA580C] text-[11px] border border-orange-200/60 active:scale-95 transition-all"
                >
                  ভর্তি আবেদন
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default PublicNavbar;