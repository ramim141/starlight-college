import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-4 rounded-2xl bg-brand-navy p-4 text-white shadow-premium sm:left-auto sm:max-w-sm">
      <p className="text-sm font-medium">দ্রুত ব্যবহারের জন্য অ্যাপটি ইনস্টল করুন</p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-2 text-xs font-bold transition hover:bg-brand-orange-hover"
        >
          <Download className="h-4 w-4" />
          ইনস্টল
        </button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="ইনস্টল বার্তা বন্ধ করুন"
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
