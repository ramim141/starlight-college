import React from 'react';

export const LoginFooter = () => {
  return (
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
  );
};

export default LoginFooter;
