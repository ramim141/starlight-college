import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Bell, 
  Grid, 
  BookOpen, 
  User, 
  X, 
  Award, 
  CreditCard, 
  Bus, 
  Calendar, 
  HelpCircle,
  GraduationCap,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const MobileBottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isSheetMounted, setIsSheetMounted] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const navigate = useNavigate();

  // ২-ফেজ বটম শীট ওপেন (Double RAF)
  const openPortalSheet = () => {
    setIsSheetMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsSheetVisible(true));
    });
  };

  // ২-ফেজ বটম শীট ক্লোজ (৩২০ms এক্সিট ট্রানজিশন)
  const closePortalSheet = () => {
    setIsSheetVisible(false);
    setTimeout(() => setIsSheetMounted(false), 320);
  };

  // Escape key সাপোর্ট
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSheetVisible) {
        closePortalSheet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSheetVisible]);

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

  const scrollTo = (id, tabName) => {
    setActiveTab(tabName);
    closePortalSheet();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const quickServices = [
    { label: 'ডিজিটাল রেজাল্ট', desc: 'মার্কশিট ও জিপিএ', icon: Award, href: '#results', color: 'from-amber-500 to-orange-500' },
    { label: 'অনলাইন ফি পেমেন্ট', desc: 'বকেয়া ও ট্রানজেকশন', icon: CreditCard, to: '/login', color: 'from-emerald-500 to-teal-600' },
    { label: 'কলেজ বাস ট্র্যাকার', desc: 'রুট ও শিডিউল', icon: Bus, href: '#services', color: 'from-blue-500 to-indigo-600' },
    { label: 'ক্লাস রুটিন', desc: 'দৈনিক ক্লাস সূচি', icon: Calendar, href: '#services', color: 'from-purple-500 to-violet-600' },
    { label: 'ভর্তি তথ্য ২০২৬', desc: 'বিজ্ঞান, মানবিক, ব্যবসায়', icon: GraduationCap, href: '#admission', color: 'from-rose-500 to-pink-600' },
    { label: 'অভিযোগ ও পরামর্শ', desc: 'গোপন মতামত বক্স', icon: HelpCircle, href: '#contact', color: 'from-slate-600 to-slate-800' },
  ];

  return (
    <>
      {/* ১. স্টিকি মোবাইল অ্যাপ বটম বার */}
      <nav 
        aria-label="মোবাইল অ্যাপ্লিকেশন নেভিগেশন"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          
          {/* হোম */}
          <button
            type="button"
            onClick={() => scrollTo('hero', 'home')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 cursor-pointer min-h-[44px] active:scale-95 ${
              activeTab === 'home' ? 'text-[#EA580C]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === 'home' ? 'bg-orange-50 scale-105' : ''}`}>
              <Home className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-tight leading-none">হোম</span>
          </button>

          {/* নোটিশ */}
          <button
            type="button"
            onClick={() => scrollTo('notices', 'notices')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative cursor-pointer min-h-[44px] active:scale-95 ${
              activeTab === 'notices' ? 'text-[#EA580C]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === 'notices' ? 'bg-orange-50 scale-105' : ''}`}>
              <Bell className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-tight leading-none">নোটিশ</span>
            <span className="absolute top-2.5 right-3.5 h-2 w-2 rounded-full bg-[#FF6B00] animate-pulse" />
          </button>

          {/* পোর্টালস ও দ্রুত সেবা (সেন্ট্রাল অ্যাকশন বাটন) */}
          <div className="flex items-center justify-center -mt-5">
            <button
              type="button"
              onClick={openPortalSheet}
              className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0F2C59] via-[#163A70] to-[#FF6B00] text-white shadow-lg shadow-[#0F2C59]/35 hover:shadow-orange-500/25 active:scale-90 transition-all duration-300 cursor-pointer border-2 border-white"
              aria-label="সব সেবা মেনু"
            >
              <Grid className="h-6 w-6 text-amber-300" />
            </button>
          </div>

          {/* বিভাগ ও অ্যাকাডেমিক */}
          <button
            type="button"
            onClick={() => scrollTo('departments', 'departments')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 cursor-pointer min-h-[44px] active:scale-95 ${
              activeTab === 'departments' ? 'text-[#EA580C]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === 'departments' ? 'bg-orange-50 scale-105' : ''}`}>
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-tight leading-none">বিভাগ</span>
          </button>

          {/* একাউন্ট / লগইন */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate(getDashboardPath())}
              className="flex flex-col items-center justify-center space-y-1 text-emerald-600 transition-all duration-200 cursor-pointer min-h-[44px] active:scale-95"
            >
              <div className="p-1.5 rounded-xl bg-emerald-50">
                <User className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black tracking-tight leading-none">ড্যাশবোর্ড</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-[#EA580C] transition-all duration-200 min-h-[44px] active:scale-95"
            >
              <div className="p-1.5 rounded-xl">
                <User className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black tracking-tight leading-none">লগইন</span>
            </Link>
          )}

        </div>
      </nav>

      {/* ২. মোবাইল পোর্টালস ও কুইক সার্ভিসেস বটম শীট (Two-Phase Spring Animation) */}
      {isSheetMounted && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* ব্যাকড্রপ */}
          <div 
            onClick={closePortalSheet}
            style={{
              transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: isSheetVisible ? 1 : 0,
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* শীট কন্টেইনার (Apple Spring Motion) */}
          <div 
            style={{
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isSheetVisible ? 'translateY(0%)' : 'translateY(100%)',
            }}
            className="relative z-10 rounded-t-3xl bg-white p-5 shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto"
          >
            {/* ড্র্যাগ ইন্ডিকেটর */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-xl bg-orange-50 p-2 text-[#EA580C]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F2C59]">স্টারলাইট স্মার্ট সেবা হাব</h3>
                  <p className="text-[11px] text-slate-500">অনলাইন পোর্টাল ও শিক্ষার্থী সুবিধাসমূহ</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={closePortalSheet}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer active:scale-95 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* পোর্টাল লগইন বাটনস */}
            <div className="my-4 grid grid-cols-2 gap-2.5">
              <Link
                to="/login"
                onClick={closePortalSheet}
                className="rounded-2xl bg-gradient-to-r from-[#0F2C59] to-[#163A70] p-3.5 text-white shadow-sm active:scale-98 transition-all hover:shadow-md"
              >
                <GraduationCap className="h-5 w-5 text-[#FF6B00] mb-1" />
                <strong className="text-xs font-black block">শিক্ষার্থী পোর্টাল</strong>
                <span className="text-[10px] text-slate-300">রোল ও পিন দিয়ে প্রবেশ</span>
              </Link>

              <Link
                to="/login"
                onClick={closePortalSheet}
                className="rounded-2xl bg-gradient-to-r from-amber-600 to-[#EA580C] p-3.5 text-white shadow-sm active:scale-98 transition-all hover:shadow-md"
              >
                <User className="h-5 w-5 text-white mb-1" />
                <strong className="text-xs font-black block">শিক্ষক ও স্টাফ</strong>
                <span className="text-[10px] text-orange-100">ইনচার্জ ও প্রিন্সিপাল</span>
              </Link>
            </div>

            {/* কুইক সার্ভিসেস গ্রিড */}
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5">
              জনপ্রিয় ডিজিটাল সুবিধাসমূহ
            </h4>
            <div className="grid grid-cols-2 gap-2 pb-6">
              {quickServices.map((srv, idx) => {
                const IconComponent = srv.icon;
                if (srv.to) {
                  return (
                    <Link
                      key={idx}
                      to={srv.to}
                      onClick={closePortalSheet}
                      className="flex items-center space-x-2.5 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 hover:bg-orange-50/40 hover:border-orange-300 transition-all duration-200 active:scale-98"
                    >
                      <div className={`rounded-xl bg-gradient-to-br ${srv.color} p-2 text-white shrink-0 shadow-xs`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-800 truncate block">{srv.label}</span>
                        <span className="text-[10px] text-slate-400 truncate block">{srv.desc}</span>
                      </div>
                    </Link>
                  );
                }
                return (
                  <a
                    key={idx}
                    href={srv.href}
                    onClick={() => scrollTo(srv.href.replace('#', ''), 'home')}
                    className="flex items-center space-x-2.5 rounded-2xl bg-slate-50 p-3 border border-slate-200/80 hover:bg-orange-50/40 hover:border-orange-300 transition-all duration-200 active:scale-98"
                  >
                    <div className={`rounded-xl bg-gradient-to-br ${srv.color} p-2 text-white shrink-0 shadow-xs`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-800 truncate block">{srv.label}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{srv.desc}</span>
                    </div>
                  </a>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;