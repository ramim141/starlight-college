import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { preloadChunk } from '../../utils/chunkPreload';
import { getErrorMessage, getRetryAfterSeconds } from '../../api/errors';
import { GraduationCap, User, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

import { CustomMotionStyles } from './LoginSkeleton';
import LoginHeaderMobile from './LoginHeaderMobile';
import LoginBrandPanel from './LoginBrandPanel';
import StudentLoginForm from './StudentLoginForm';
import StaffLoginForm from './StaffLoginForm';
import LoginHelpModal from './LoginHelpModal';
import LoginFooter from './LoginFooter';

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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Two-Phase Smooth Modal State (Mount + Visibility Animation)
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Dynamic Height Measurement for Silky-Smooth Tab Morphing
  const studentFormRef = useRef(null);
  const staffFormRef = useRef(null);
  const [formContainerHeight, setFormContainerHeight] = useState('auto');

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to role dashboard
  useEffect(() => {
    if (user?.role) {
      const roleRedirects = {
        PRINCIPAL: '/principal',
        TEACHER: '/teacher',
        ACCOUNTANT: '/accountant',
        STUDENT: '/student',
      };
      navigate(roleRedirects[user.role] || '/', { replace: true });
    }
  }, [user, navigate]);

  // 429 Rate Limit Cooldown Countdown Timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Measure active form height so switching tabs smoothly animates height
  useEffect(() => {
    const updateHeight = () => {
      const activeEl = loginType === 'student' ? studentFormRef.current : staffFormRef.current;
      if (activeEl) {
        setFormContainerHeight(`${activeEl.scrollHeight}px`);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [loginType]);

  // Two-Phase Help Modal Ref for Unmount Clearance
  const helpModalTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(helpModalTimerRef.current);
  }, []);

  // Smooth Modal Open & Close Handlers
  const openHelpModal = () => {
    clearTimeout(helpModalTimerRef.current);
    setIsModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const closeHelpModal = () => {
    setIsModalVisible(false);
    clearTimeout(helpModalTimerRef.current);
    helpModalTimerRef.current = setTimeout(() => {
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

    if (cooldownSeconds > 0) {
      toast.error(`দয়া করে আরও ${cooldownSeconds} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    const isStudentLogin = loginType === 'student';
    const isValid = isStudentLogin
      ? credentials.ssc_roll && credentials.passing_year && credentials.pin
      : credentials.username && credentials.password;

    if (!isValid) {
      toast.error(
        isStudentLogin
          ? 'SSC Roll, Passing Year এবং PIN প্রদান করুন'
          : 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন'
      );
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
            password: credentials.password.trim(),
          };

      const loggedInUser = await login(payload);
      toast.success(`স্বাগতম, ${loggedInUser.full_name || loggedInUser.username}!`);

      // Preload target dashboard chunk during state transition
      const rolePreloaders = {
        PRINCIPAL: () => import('../principal/PrincipalDashboard'),
        TEACHER: () => import('../teacher/TeacherDashboard'),
        ACCOUNTANT: () => import('../accountant/AccountantDashboard'),
        STUDENT: () => import('../student/StudentDashboard'),
      };
      if (rolePreloaders[loggedInUser.role]) {
        preloadChunk(rolePreloaders[loggedInUser.role]);
      }

      const roleRedirects = {
        PRINCIPAL: '/principal',
        TEACHER: '/teacher',
        ACCOUNTANT: '/accountant',
        STUDENT: '/student',
      };
      navigate(roleRedirects[loggedInUser.role] || '/');
    } catch (error) {
      const retryAfter = getRetryAfterSeconds(error);
      if (retryAfter) {
        setCooldownSeconds(retryAfter);
      }
      const errMsg = getErrorMessage(error, 'লগইন ব্যর্থ হয়েছে। ক্রেডেনশিয়াল বা পিন সঠিক নয়।');
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between overflow-x-hidden selection:bg-orange-500 selection:text-white animate-page-enter">
      <CustomMotionStyles />

      {/* অ্যাম্বিয়েন্ট ব্যাকগ্রাউন্ড গ্লো (হাই-পারফর্মেন্স রেডিয়াল গ্রেডিয়েন্ট) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className={`absolute -top-40 -right-40 h-96 w-96 rounded-full transition-opacity duration-700 ${
            loginType === 'student' ? 'opacity-100' : 'opacity-80'
          }`}
          style={{
            background: loginType === 'student'
              ? 'radial-gradient(circle, rgba(249, 115, 22, 0.14) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 70%)',
          }}
        />
        <div
          className={`absolute top-1/2 -left-40 h-96 w-96 rounded-full transition-opacity duration-700 ${
            loginType === 'student' ? 'opacity-100' : 'opacity-80'
          }`}
          style={{
            background: loginType === 'student'
              ? 'radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(249, 115, 22, 0.10) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ১. মোবাইল ও ট্যাবলেট টপ নেভিগেশন বার */}
      <LoginHeaderMobile />

      {/* ২. মূল রেসপনসিভ মেইন কন্টেইনার */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-[440px] lg:max-w-5xl rounded-[28px] lg:rounded-[32px] bg-white shadow-[0_20px_60px_-15px_rgba(15,44,89,0.09)] border border-slate-200/90 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* বাম পাশ: ব্র্যান্ডিং ও ফিচার প্যানেল (Desktop Exclusive) */}
            <LoginBrandPanel />

            {/* ডান পাশ: ফর্ম এরিয়া (Mobile + Desktop) */}
            <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
              <div className="max-w-md mx-auto w-full space-y-6">
                {/* মোবাইল কার্ড ব্র্যান্ড হেডার */}
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
                        loginType === 'student'
                          ? 'text-orange-600 scale-110'
                          : 'text-slate-400 scale-100'
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
                        loginType === 'staff'
                          ? 'text-[#0F2C59] scale-110'
                          : 'text-slate-400 scale-100'
                      }`}
                    />
                    <span>শিক্ষক ও স্টাফ</span>
                  </button>
                </div>

                {/* ফর্ম কন্টেইনার (হাইট মরফিং সহ) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div
                    style={{
                      height: formContainerHeight,
                      transition: 'height 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className="relative overflow-hidden -mx-1 px-1"
                  >
                    {/* PANEL 1: STUDENT LOGIN FIELDS */}
                    <StudentLoginForm
                      credentials={credentials}
                      handleChange={handleChange}
                      showStudentPin={showStudentPin}
                      setShowStudentPin={setShowStudentPin}
                      openHelpModal={openHelpModal}
                      isStudent={loginType === 'student'}
                      formRef={studentFormRef}
                    />

                    {/* PANEL 2: STAFF LOGIN FIELDS */}
                    <StaffLoginForm
                      credentials={credentials}
                      handleChange={handleChange}
                      showStaffPassword={showStaffPassword}
                      setShowStaffPassword={setShowStaffPassword}
                      openHelpModal={openHelpModal}
                      isStaff={loginType === 'staff'}
                      formRef={staffFormRef}
                    />
                  </div>

                  {/* সাবমিট বাটন */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting || cooldownSeconds > 0}
                      className="w-full rounded-2xl bg-gradient-to-r from-[#EA580C] to-amber-600 hover:from-[#D9460F] hover:to-amber-700 py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-75 cursor-pointer group"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2.5">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>যাচাই করা হচ্ছে...</span>
                        </div>
                      ) : cooldownSeconds > 0 ? (
                        <span>অপেক্ষা করুন ({cooldownSeconds}s)</span>
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
      <LoginFooter />

      {/* ৪. পিন ও পাসওয়ার্ড সহায়তা মডাল */}
      <LoginHelpModal
        isModalMounted={isModalMounted}
        isModalVisible={isModalVisible}
        closeHelpModal={closeHelpModal}
      />
    </div>
  );
};

export default Login;