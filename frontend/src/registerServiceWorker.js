import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

export const initServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast('নতুন সংস্করণ পাওয়া গেছে', {
        description: 'সর্বশেষ আপডেট ও ফিচার পেতে অ্যাপটি রিলোড করুন।',
        duration: Infinity,
        action: {
          label: 'রিফ্রেশ',
          onClick: () => {
            updateSW(true);
          },
        },
      });
    },
    onOfflineReady() {
      // PWA অফলাইন ব্যবহারের জন্য প্রস্তুত
    },
  });
};

export default initServiceWorker;
