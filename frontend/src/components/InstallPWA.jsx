import React, { useEffect, useState, useRef } from 'react';
import { Download, X, Share } from 'lucide-react';

const DISMISSAL_KEY = 'starlight_pwa_dismissed_until';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOSPrompt, setIsIOSPrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(dismissTimerRef.current);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ১. ইতোমধ্যে ইনস্টল করা থাকলে (Standalone মোড) ব্যানার কখনো দেখানো হবে না
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // ২. বিগত ৭ দিনের মধ্যে বাতিল করা থাকলে দেখানো হবে না
    const dismissedUntil = parseInt(localStorage.getItem(DISMISSAL_KEY) || '0', 10);
    if (Date.now() < dismissedUntil) return;

    // ৩. iOS Safari সনাক্তকরণ (যেখানে beforeinstallprompt ইভেন্ট নেই)
    const userAgent = window.navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/.test(userAgent) && !window.MSStream;
    const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

    if (isIOS && isSafari) {
      setIsIOSPrompt(true);
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return;
    }

    // ৪. Android Chrome, Edge ও Desktop ক্রোম ব্রাউজারের জন্য ইভেন্ট লিসেনার
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, String(Date.now() + SEVEN_DAYS_MS));
    } catch {
      // Storage access safety
    }
    clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setIsMounted(false);
    }, 320);
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice?.outcome === 'accepted') {
      setIsVisible(false);
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => setIsMounted(false), 320);
    }
    setInstallPrompt(null);
  };

  if (!isMounted) return null;

  return (
    <div
      role="region"
      aria-label="অ্যাপ ইনস্টলেশন বার্তা"
      style={{
        transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease',
        transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(24px) scale(0.96)',
        opacity: isVisible ? 1 : 0,
      }}
      className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:max-w-md"
    >
      <div className="flex flex-col gap-3 rounded-3xl bg-[#0F2C59] p-4 sm:p-5 text-white shadow-premium border border-white/10 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange shrink-0">
              {isIOSPrompt ? <Share className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">স্টারলাইট কলেজ অ্যাপ</h3>
              <p className="text-[11px] text-slate-300">
                {isIOSPrompt
                  ? 'সাফারি ব্রাউজার থেকে সরাসরি হোম স্ক্রিনে যোগ করুন'
                  : 'দ্রুত ব্যবহার ও অফলাইনে অ্যাক্সেসের জন্য ইনস্টল করুন'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissBanner}
            aria-label="ইনস্টল বার্তা বন্ধ করুন"
            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* iOS Safari গাইডেন্স ব্যানার */}
        {isIOSPrompt ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 text-[11px] text-orange-200 flex items-center space-x-2">
            <span className="font-bold">নির্দেশিকা:</span>
            <span>নিচের শেয়ার (Share) বোতাম চাপুন ➔ তারপর <strong>'Add to Home Screen'</strong> সিলেক্ট করুন।</span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={dismissBanner}
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              পরে করব
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-amber-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:from-brand-orange-hover hover:to-amber-700 transition cursor-pointer active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>ইনস্টল করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPWA;
