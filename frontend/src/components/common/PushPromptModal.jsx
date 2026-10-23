import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeToPushNotifications, isPushNotificationSupported } from '../../utils/pushManager';
import { useAuth } from '../../context/AuthContext';

const DISMISSAL_KEY = 'starlight_push_prompt_dismissed_until';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const PushPromptModal = () => {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(dismissTimerRef.current);
  }, []);

  useEffect(() => {
    // শুধুমাত্র লগইন থাকা অবস্থায় এবং ব্রাউজার পুশ সাপোর্ট করলে
    if (!user || !isPushNotificationSupported()) return;

    // পারমিশন ইতোমধ্যে দেওয়া থাকলে বা ব্লক করা থাকলে সফট প্রম্পট দেখানোর প্রয়োজন নেই
    if (Notification.permission !== 'default') return;

    // বিগত ১৪ দিনে ব্যবহারকারী এটি বাতিল করে থাকলে
    const dismissedUntil = parseInt(localStorage.getItem(DISMISSAL_KEY) || '0', 10);
    if (Date.now() < dismissedUntil) return;

    // লগইনের ২ সেকেন্ড পরে শান্তভাবে প্রম্পট প্রদর্শন
    const timer = setTimeout(() => {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISSAL_KEY, String(Date.now() + FOURTEEN_DAYS_MS));
    } catch {
      // Storage safety
    }
    clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => setIsMounted(false), 320);
  };

  const handleEnablePush = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        await subscribeToPushNotifications();
        toast.success('নোটিফিকেশন সফলভাবে চালু করা হয়েছে!');
        setIsVisible(false);
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = setTimeout(() => setIsMounted(false), 320);
      } else if (permission === 'denied') {
        toast.error('নোটিফিকেশন পারমিশন দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে পরবর্তীতে চালু করতে পারেন।');
        handleDismiss();
      } else {
        handleDismiss();
      }
    } catch (err) {
      console.warn('Push registration error:', err);
      toast.error('নোটিফিকেশন চালু করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।');
      handleDismiss();
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: isVisible ? 1 : 0,
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={handleDismiss}
    >
      <div
        style={{
          transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease',
          transform: isVisible ? 'translateY(0px) scale(1)' : 'translateY(24px) scale(0.96)',
          opacity: isVisible ? 1 : 0,
        }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-premium border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start pb-3">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-brand-navy">নোটিফিকেশন চালু করবেন?</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Sparkles className="h-3 w-3 text-brand-orange" /> গুরুত্বপূর্ণ একাডেমিক আপডেট তাৎক্ষণিক পান
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>দৈনিক ক্লাসের রুটিন ও শিক্ষক পরিবর্তন নোটিশ</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>পরীক্ষার সময়সূচি, সিট প্ল্যান ও ফলাফল প্রকাশ</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>জরুরি কলেজ বন্ধ ও অধ্যক্ষের বিশেষ বার্তা</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            পরে করব
          </button>
          <button
            type="button"
            disabled={isSubscribing}
            onClick={handleEnablePush}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:from-brand-orange-hover hover:to-amber-700 active:scale-95 transition cursor-pointer disabled:opacity-75"
          >
            {isSubscribing ? (
              <span>চালু করা হচ্ছে...</span>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>এখনই চালু করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushPromptModal;
