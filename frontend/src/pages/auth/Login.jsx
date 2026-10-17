import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Phone, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Calendar, 
  Hash, 
  KeyRound,
  X,
  BookOpen,
  FileSpreadsheet,
  Wallet
} from 'lucide-react';

// ==========================================
// 1. CUSTOM CSS KEYFRAMES & SPRING PHYSICS
// (কোনো প্লাগইন ছাড়াই ১০০% স্মুথ মোশন নিশ্চিত করবে)
// ==========================================
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
        rgba(255, 255, 255, 0.65) 50%,
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
        rgba(255, 255, 255, 0.12) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes pageFadeUp {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.99);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-page-enter {
      animation: pageFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `}</style>
);

// ==========================================
// 2. SHIMMER SKELETON LOADER (Initial Load)
// ==========================================
const LoginPageSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-10">
    <CustomMotionStyles />
    
    {/* Mobile Top Bar Skeleton */}
    <div className="lg:hidden w-full max-w-[440px] mx-auto flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/70 mb-2">
      <div className="h-5 w-20 rounded-lg shimmer-box" />
      <div className="h-5 w-24 rounded-full shimmer-box" />
    </div>

    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-[440px] lg:max-w-5xl rounded-[28px] lg:rounded-[32px] bg-white shadow-[0_20px_60px_-15px_rgba(15,44,89,0.06)] border border-slate-200/80 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Panel Skeleton (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#0F2C59] p-10 xl:p-12 flex-col justify-between min-h-[580px]">
            <div className="space-y-6">
              <div className="flex justify-between">
                <div className="h-7 w-28 rounded-xl shimmer-dark" />
                <div className="h-7 w-24 rounded-full shimmer-dark" />
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <div className="h-12 w-12 rounded-2xl shimmer-dark shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-40 rounded-md shimmer-dark" />
                  <div className="h-3 w-32 rounded-md shimmer-dark" />
                </div>
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-7 w-3/4 rounded-lg shimmer-dark" />
                <div className="h-7 w-5/6 rounded-lg shimmer-dark" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded shimmer-dark" />
                <div className="h-3 w-4/5 rounded shimmer-dark" />
              </div>
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 w-full rounded-2xl shimmer-dark" />
                ))}
              </div>
            </div>
            <div className="h-10 w-full rounded-xl shimmer-dark mt-6" />
          </div>

          {/* Right Form Skeleton */}
          <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              {/* Mobile Brand Header Skeleton */}
              <div className="lg:hidden flex flex-col items-center justify-center space-y-2 pb-4 border-b border-slate-100">
                <div className="h-5 w-48 rounded-lg shimmer-box" />
                <div className="h-3.5 w-32 rounded shimmer-box" />
              </div>

              {/* Desktop Title Skeleton */}
              <div className="hidden lg:flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-7 w-48 rounded-lg shimmer-box" />
                  <div className="h-3.5 w-64 rounded-md shimmer-box" />
                </div>
                <div className="h-7 w-24 rounded-xl shimmer-box" />
              </div>

              {/* Tab Switcher Skeleton */}
              <div className="h-12 w-full rounded-2xl shimmer-box" />

              {/* Input Fields Skeleton */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-7 space-y-2">
                    <div className="h-3 w-28 rounded shimmer-box" />
                    <div className="h-11 w-full rounded-2xl shimmer-box" />
                  </div>
                  <div className="sm:col-span-5 space-y-2">
                    <div className="h-3 w-20 rounded shimmer-box" />
                    <div className="h-11 w-full rounded-2xl shimmer-box" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-28 rounded shimmer-box" />
                    <div className="h-3 w-20 rounded shimmer-box" />
                  </div>
                  <div className="h-11 w-full rounded-2xl shimmer-box" />
                </div>
                <div className="h-12 w-full rounded-2xl shimmer-box mt-2" />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-3.5 w-24 rounded shimmer-box" />
                <div className="h-3.5 w-32 rounded shimmer-box" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div className="h-4 w-64 rounded shimmer-box mx-auto my-2" />
  </div>
);

// ==========================================
// 3. MAIN LOGIN COMPONENT
// ==========================================
const Login = () => {
  const [loginType, setLoginType] = useState('student'); // 'student' | 'staff'
  const [credentials, setCredentials] = useState({
    ssc_roll: '',
    passing_year: '2024',
    pin: '',
    username: '',
    password: '',
  });
  const [showStudentPin, setShowStudentPin] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Two-Phase Smooth Modal State (Mount + Visibility Animation)
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Dynamic Height Measurement for Silky-Smooth Tab Morphing
  const studentFormRef = useRef(null);
  const staffFormRef = useRef(null);
  const [formContainerHeight, setFormContainerHeight] = useState('auto');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Initial Smooth Skeleton Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Measure active form height so switching tabs smoothly animates height
  useEffect(() => {
    if (isPageLoading) return;
    const updateHeight = () => {
      const activeEl = loginType === 'student' ? studentFormRef.current : staffFormRef.current;
      if (activeEl) {
        setFormContainerHeight(`${activeEl.scrollHeight}px`);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [loginType, isPageLoading]);

  // Smooth Modal Open & Close Handlers
  const openHelpModal = () => {
    setIsModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const closeHelpModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalMounted(false);
    }, 320); // Wait for exit transition to complete
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalVisible) closeHelpModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTabSwitch = (type) => {
    if (type === loginType || isSubmitting) return;
    setLoginType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isStudentLogin = loginType === 'student';
    const isValid = isStudentLogin
      ? credentials.ssc_roll && credentials.passing_year && credentials.pin
      : credentials.username && credentials.password;
      
    if (!isValid) {
      toast.error(isStudentLogin
        ? 'SSC Roll, Passing Year এবং PIN প্রদান করুন'
        : 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = isStudentLogin
        ? {
            ssc_roll: credentials.ssc_roll.trim(),
            passing_year: credentials.passing_year.trim(),
            pin: credentials.pin.trim(),
          }
        : { 
            username: credentials.username.trim(), 
            password: credentials.password.trim() 
          };

      const loggedInUser = await login(payload);
      toast.success(`স্বাগতম, ${loggedInUser.full_name || loggedInUser.username}!`);

      const roleRedirects = {
        PRINCIPAL: '/principal',
        TEACHER: '/teacher',
        ACCOUNTANT: '/accountant',
        STUDENT: '/student',
      };
      navigate(roleRedirects[loggedInUser.role] || '/');
    } catch (error) {
      const responseData = error.response?.data;
      const errMsg = responseData?.detail
        || responseData?.message
        || responseData?.non_field_errors?.[0]
        || 'লগইন ব্যর্থ হয়েছে। ক্রেডেনশিয়াল বা পিন সঠিক নয়।';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <LoginPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between overflow-x-hidden selection:bg-orange-500 selection:text-white animate-page-enter">
      <CustomMotionStyles />
      
      {/* অ্যাম্বিয়েন্ট ব্যাকগ্রাউন্ড গ্লো */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div 
          className={`absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl transition-colors duration-700 ${
            loginType === 'student' ? 'bg-orange-500/12' : 'bg-blue-600/12'
          }`} 
        />
        <div 
          className={`absolute top-1/2 -left-40 h-96 w-96 rounded-full blur-3xl transition-colors duration-700 ${
            loginType === 'student' ? 'bg-blue-600/10' : 'bg-orange-500/10'
          }`} 
        />
      </div>

      {/* ১. মোবাইল ও ট্যাবলেট টপ নেভিগেশন বার */}
      <header className="lg:hidden relative z-10 w-full px-4 pt-4 pb-1">
        <div className="max-w-[440px] mx-auto flex items-center justify-between bg-white/85 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>হোমপেজ</span>
          </Link>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>EIIN: ১৩৪৫৬৭</span>
          </div>
        </div>
      </header>

      {/* ২. মূল রেসপনসিভ মেইন কন্টেইনার */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-[440px] lg:max-w-5xl rounded-[28px] lg:rounded-[32px] bg-white shadow-[0_20px_60px_-15px_rgba(15,44,89,0.09)] border border-slate-200/90 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* বাম পাশ: ব্র্যান্ডিং ও ফিচার প্যানেল (Desktop Exclusive) */}
            <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0A1D3B] via-[#0F2C59] to-[#163A70] text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
              
              {/* ব্যাকগ্রাউন্ড ডেকোরেটিভ প্যাটার্ন */}
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />
              <div 
                className="absolute inset-0 opacity-[0.04] pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
              />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <Link 
                    to="/" 
                    className="inline-flex items-center space-x-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold text-orange-200 hover:text-white backdrop-blur-md transition-all duration-200 group border border-white/10"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    <span>হোমপেজে ফিরুন</span>
                  </Link>

                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>EIIN: ১৩৪৫৬৭</span>
                  </span>
                </div>

                {/* কলেজ ব্র্যান্ডিং */}
                <div className="pt-2">
                  <div className="inline-flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 border border-white/20 transition-transform duration-300 hover:scale-105">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-wide text-white leading-tight">
                        STARLIGHT COLLEGE
                      </h2>
                      <p className="text-xs font-semibold text-orange-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> স্মার্ট সেন্ট্রাল অটোমেশন পোর্টাল
                      </p>
                    </div>
                  </div>

                  <h1 className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-snug">
                    শিক্ষা, শৃঙ্খলা ও <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                      সাফল্যের ডিজিটাল ঠিকানা
                    </span>
                  </h1>

                  <p className="mt-3 text-xs xl:text-sm text-slate-300 leading-relaxed">
                    শিক্ষার্থী, শিক্ষক ও প্রশাসনের জন্য এক ক্লিকে উপস্থিতি, ফলাফল, রুটিন ও সার্বিক ফি ব্যবস্থাপনার আধুনিক উচ্চমাধ্যমিক প্ল্যাটফর্ম।
                  </p>
                </div>

                {/* ফিচার কার্ডস */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:translate-x-1 p-3 border border-white/10 backdrop-blur-xs transition-all duration-300">
                    <div className="h-8 w-8 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-white block">ডিজিটাল মার্কশিট ও ফলাফল</span>
                      <span className="text-slate-400 text-[11px]">যেকোনো সময় সরাসরি একাডেমিক ট্রান্সক্রিপ্ট দেখুন</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:translate-x-1 p-3 border border-white/10 backdrop-blur-xs transition-all duration-300">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-white block">স্মার্ট হাজিরা ও কল ডায়েরি</span>
                      <span className="text-slate-400 text-[11px]">শ্রেণি ইনচার্জ ট্র্যাকিং ও অভিভাবক নোটিফিকেশন</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:translate-x-1 p-3 border border-white/10 backdrop-blur-xs transition-all duration-300">
                    <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-white block">অনলাইন ফি রসিদ ও খতিয়ান</span>
                      <span className="text-slate-400 text-[11px]">পেমেন্ট হিস্ট্রি ও ডিজিটাল মানি রিসিট ডাউনলোড</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* নিচের সিকিউরিটি ও বোর্ড ব্যাজ */}
              <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">সিলেট শিক্ষা বোর্ড অনুমোদিত</span>
                    <span className="text-[10px] text-slate-400">স্বীকৃত উচ্চমাধ্যমিক প্রতিষ্ঠান</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-orange-400 font-bold block bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                    256-BIT SSL
                  </span>
                </div>
              </div>
            </div>

            {/* ডান পাশ: ফর্ম এরিয়া (Mobile + Desktop) */}
            <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
              <div className="max-w-md mx-auto w-full space-y-6">
                
                {/* মোবাইল কার্ড ব্র্যান্ড হেডার (নো-আইকন এবং সেন্ট্রাল অ্যালাইনমেন্ট) */}
                <div className="lg:hidden text-center pb-4 border-b border-slate-100">
                  <h1 className="text-base sm:text-lg font-black text-[#0F2C59] tracking-tight">
                    STARLIGHT COLLEGE
                  </h1>
                  <p className="text-xs font-bold text-orange-600 mt-1">
                    স্মার্ট পোর্টাল সাইন-ইন
                  </p>
                </div>

                {/* ডেস্কটপ ফর্ম হেডার */}
                <div className="hidden lg:flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0F2C59] tracking-tight">
                      পোর্টালে প্রবেশ করুন
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      আপনার নির্ধারিত তথ্য ও গোপন পিন/পাসওয়ার্ড দিয়ে সাইন-ইন করুন
                    </p>
                  </div>
                  <span 
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-extrabold border transition-all duration-500 ${
                      loginType === 'student' 
                        ? 'bg-orange-50 text-orange-600 border-orange-200/80' 
                        : 'bg-slate-100 text-[#0F2C59] border-slate-200'
                    }`}
                  >
                    {loginType === 'student' ? (
                      <>
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>শিক্ষার্থী</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3.5 w-3.5" />
                        <span>স্টাফ প্যানেল</span>
                      </>
                    )}
                  </span>
                </div>

                {/* স্লাইডিং পিল ট্যাব সুইচার (Silky Spring Physics) */}
                <div 
                  role="tablist" 
                  aria-label="লগইন ধরণ নির্বাচন"
                  className="relative grid grid-cols-2 rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200/70 overflow-hidden select-none"
                >
                  {/* Animated Sliding Background Pill */}
                  <div
                    style={{
                      transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
                      transform: loginType === 'staff' ? 'translateX(100%)' : 'translateX(0%)',
                    }}
                    className="pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80"
                  />

                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginType === 'student'}
                    onClick={() => handleTabSwitch('student')}
                    className={`relative z-10 rounded-xl py-2.5 px-3 text-xs sm:text-[13px] font-extrabold transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
                      loginType === 'student'
                        ? 'text-[#0F2C59]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GraduationCap 
                      className={`h-4 w-4 transition-all duration-300 ${
                        loginType === 'student' ? 'text-orange-600 scale-110' : 'text-slate-400 scale-100'
                      }`} 
                    />
                    <span>শিক্ষার্থী সাইন-ইন</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={loginType === 'staff'}
                    onClick={() => handleTabSwitch('staff')}
                    className={`relative z-10 rounded-xl py-2.5 px-3 text-xs sm:text-[13px] font-extrabold transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer ${
                      loginType === 'staff'
                        ? 'text-[#0F2C59]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <User 
                      className={`h-4 w-4 transition-all duration-300 ${
                        loginType === 'staff' ? 'text-[#0F2C59] scale-110' : 'text-slate-400 scale-100'
                      }`} 
                    />
                    <span>শিক্ষক ও স্টাফ</span>
                  </button>
                </div>

                {/* =========================================================
                    SMOOTH SLIDING & HEIGHT-MORPHING FORM CONTAINER
                    (ট্যাব পরিবর্তন করলে বাম-ডানে স্লাইড ও স্মুথ উচ্চতা পরিবর্তন হবে)
                   ========================================================= */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div 
                    style={{ 
                      height: formContainerHeight,
                      transition: 'height 420ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                    className="relative overflow-hidden -mx-1 px-1"
                  >
                    {/* PANEL 1: STUDENT LOGIN FIELDS */}
                    <div
                      ref={studentFormRef}
                      aria-hidden={loginType !== 'student'}
                      style={{
                        transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease',
                        transform: loginType === 'student' ? 'translateX(0%) scale(1)' : 'translateX(-104%) scale(0.98)',
                        opacity: loginType === 'student' ? 1 : 0,
                        pointerEvents: loginType === 'student' ? 'auto' : 'none',
                      }}
                      className={`${loginType === 'student' ? 'relative' : 'absolute inset-x-1 top-0'} space-y-4 py-0.5`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {/* ১. SSC Roll */}
                        <div className="sm:col-span-7 group">
                          <label 
                            htmlFor="ssc_roll" 
                            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-[#0F2C59]"
                          >
                            এসএসসি রোল (SSC Roll)
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
                              <Hash className="h-4 w-4" />
                            </div>
                            <input
                              id="ssc_roll"
                              type="text"
                              inputMode="numeric"
                              name="ssc_roll"
                              tabIndex={loginType === 'student' ? 0 : -1}
                              value={credentials.ssc_roll}
                              onChange={handleChange}
                              placeholder="যেমন: 101001"
                              autoComplete="username"
                              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                            />
                          </div>
                        </div>

                        {/* ২. Passing Year */}
                        <div className="sm:col-span-5 group">
                          <label 
                            htmlFor="passing_year" 
                            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-[#0F2C59]"
                          >
                            পাসের সাল (Year)
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <input
                              id="passing_year"
                              type="text"
                              inputMode="numeric"
                              name="passing_year"
                              tabIndex={loginType === 'student' ? 0 : -1}
                              value={credentials.passing_year}
                              onChange={handleChange}
                              placeholder="2024"
                              maxLength={4}
                              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ৩. 6-Digit PIN */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <label 
                            htmlFor="pin" 
                            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-[#0F2C59]"
                          >
                            গোপন পিন (6-Digit PIN)
                          </label>
                          <button
                            type="button"
                            tabIndex={loginType === 'student' ? 0 : -1}
                            onClick={openHelpModal}
                            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
                          >
                            পিন ভুলে গেছেন?
                          </button>
                        </div>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
                            <KeyRound className="h-4 w-4" />
                          </div>
                          <input
                            id="pin"
                            type={showStudentPin ? 'text' : 'password'}
                            inputMode="numeric"
                            name="pin"
                            tabIndex={loginType === 'student' ? 0 : -1}
                            value={credentials.pin}
                            onChange={handleChange}
                            placeholder="৬ ডিজিটের পিন"
                            maxLength={6}
                            autoComplete="current-password"
                            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-11 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-mono tracking-widest"
                          />
                          <button
                            type="button"
                            tabIndex={loginType === 'student' ? 0 : -1}
                            onClick={() => setShowStudentPin(!showStudentPin)}
                            aria-label={showStudentPin ? 'পিন লুকান' : 'পিন দেখুন'}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {showStudentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PANEL 2: STAFF LOGIN FIELDS */}
                    <div
                      ref={staffFormRef}
                      aria-hidden={loginType !== 'staff'}
                      style={{
                        transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease',
                        transform: loginType === 'staff' ? 'translateX(0%) scale(1)' : 'translateX(104%) scale(0.98)',
                        opacity: loginType === 'staff' ? 1 : 0,
                        pointerEvents: loginType === 'staff' ? 'auto' : 'none',
                      }}
                      className={`${loginType === 'staff' ? 'relative' : 'absolute inset-x-1 top-0'} space-y-4 py-0.5`}
                    >
                      {/* ১. Staff Username */}
                      <div className="group">
                        <label 
                          htmlFor="username" 
                          className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-[#0F2C59]"
                        >
                          স্টাফ ইউজারনেম (Username)
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
                            <User className="h-4 w-4" />
                          </div>
                          <input
                            id="username"
                            type="text"
                            name="username"
                            tabIndex={loginType === 'staff' ? 0 : -1}
                            value={credentials.username}
                            onChange={handleChange}
                            placeholder="যেমন: chemistry001"
                            autoComplete="username"
                            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-sans placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-mono"
                          />
                        </div>
                      </div>

                      {/* ২. Staff Password */}
                      <div className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <label 
                            htmlFor="password" 
                            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-[#0F2C59]"
                          >
                            পাসওয়ার্ড (Password)
                          </label>
                          <button
                            type="button"
                            tabIndex={loginType === 'staff' ? 0 : -1}
                            onClick={openHelpModal}
                            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
                          >
                            পাসওয়ার্ড সহায়তা
                          </button>
                        </div>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            id="password"
                            type={showStaffPassword ? 'text' : 'password'}
                            name="password"
                            tabIndex={loginType === 'staff' ? 0 : -1}
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="আপনার গোপন পাসওয়ার্ড"
                            autoComplete="current-password"
                            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-11 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                          />
                          <button
                            type="button"
                            tabIndex={loginType === 'staff' ? 0 : -1}
                            onClick={() => setShowStaffPassword(!showStaffPassword)}
                            aria-label={showStaffPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* সাবমিট বাটন */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-gradient-to-r from-[#EA580C] to-amber-600 hover:from-[#D9460F] hover:to-amber-700 py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-75 cursor-pointer group"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2.5">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>যাচাই করা হচ্ছে...</span>
                        </div>
                      ) : (
                        <>
                          <span>লগইন করুন</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* নিচের কুইক হেল্প বার */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>সুরক্ষিত কানেকশন</span>
                  </span>
                  <button
                    type="button"
                    onClick={openHelpModal}
                    className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer group"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-orange-500 group-hover:rotate-12 transition-transform duration-200" />
                    <span>লগইন করতে সমস্যা হচ্ছে?</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ৩. ফুটার স্ট্রিপ */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-500 border-t border-slate-200/70 bg-white/70 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px]">
          <span className="font-medium">© ২০২৬ স্টারলাইট কলেজ, সিলেট। সর্বস্বত্ব সংরক্ষিত।</span>
          <span className="flex items-center gap-1.5">
            <span>জরুরি হেল্পলাইন:</span>
            <a 
              href="tel:+8801712345678" 
              className="font-extrabold text-[#0F2C59] hover:text-orange-600 transition-colors"
            >
              +৮৮০১৭১২-৩৪৫৬৭৮
            </a>
          </span>
        </div>
      </footer>

      {/* =========================================================
          ৪. পিন ও পাসওয়ার্ড সহায়তা মডাল (True Spring Enter & Exit Motion)
          মোবাইলে নিচ থেকে স্লাইড হয়ে উঠবে এবং পিসিতে স্মুথ জুম-ইন হবে
         ========================================================= */}
      {isModalMounted && (
        <div 
          role="dialog"
          aria-modal="true"
          style={{
            transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
            opacity: isModalVisible ? 1 : 0,
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={closeHelpModal}
        >
          <div 
            style={{
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
              transform: isModalVisible 
                ? 'translateY(0px) scale(1)' 
                : 'translateY(36px) scale(0.95)',
              opacity: isModalVisible ? 1 : 0,
            }}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle Indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-center pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-xl bg-orange-50 p-2 text-orange-600 border border-orange-100">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F2C59]">পিন ও পাসওয়ার্ড সহায়তা</h3>
                  <p className="text-[11px] text-slate-500">অ্যাকাউন্ট অ্যাক্সেস পুনরুদ্ধার নির্দেশিকা</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={closeHelpModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 hover:rotate-90 transition-all duration-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 hover:border-orange-200 transition-colors">
                <strong className="text-[#0F2C59] flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>শিক্ষার্থীদের পিন রিকভারি:</span>
                </strong>
                <p className="pl-5.5 text-slate-600">
                  • ভর্তির সময় প্রদানকৃত অফিশিয়াল এসএমএসে আপনার ৬-ডিজিটের গোপন পিন দেওয়া হয়েছে।
                </p>
                <p className="pl-5.5 text-slate-600">
                  • পিন ভুলে গেলে আপনার সেকশনের <strong>শ্রেণি ইনচার্জ (Class In-Charge)</strong> অথবা কলেজের আইসিটি সেলে যোগাযোগ করুন।
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-1.5 hover:border-slate-300 transition-colors">
                <strong className="text-[#0F2C59] flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-[#0F2C59] shrink-0" />
                  <span>শিক্ষক ও স্টাফ পাসওয়ার্ড:</span>
                </strong>
                <p className="pl-5.5 text-slate-600">
                  • পাসওয়ার্ড রিসেট বা ইউজারনেম সংক্রান্ত যেকোনো পরিবর্তনের জন্য প্রিন্সিপাল অফিস বা সিস্টেম অ্যাডমিনিস্ট্রেটরের সহায়তা নিন।
                </p>
              </div>

              <div className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-teal-50/80 rounded-2xl border border-emerald-200/90 text-emerald-950">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-emerald-950">আইসিটি হেল্পডেস্ক</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
                          সকাল ১০:০০ - বিকাল ৩:০০
                        </span>
                      </div>
                      <a 
                        href="tel:+8801712345678" 
                        className="text-xs sm:text-[13px] font-black text-emerald-900 font-mono tracking-wider hover:underline block mt-0.5"
                      >
                        +৮৮০১৭১২-৩৪৫৬৭৮
                      </a>
                    </div>
                  </div>

                  <a 
                    href="tel:+8801712345678"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-sm shadow-emerald-600/20 transition-all shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>সরাসরি কল করুন</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={closeHelpModal}
                className="w-full rounded-2xl bg-[#0F2C59] py-3 text-xs font-black text-white hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer"
              >
                বুঝতে পেরেছি
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;