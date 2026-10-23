import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const LoginHeaderMobile = () => {
  return (
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
  );
};

export default LoginHeaderMobile;
