import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  FlaskConical, 
  Users, 
  BarChart3 
} from 'lucide-react';

const HeroSection = ({ content = {} }) => {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  return (
    <section id="hero" className="relative overflow-hidden bg-[#041838] text-white select-none">
      {/* লাইভ ব্রেকিং টিকার বার */}
      <div className="relative z-20 bg-[#03122B]/85 backdrop-blur-md border-b border-white/10 py-2 px-4 sm:px-6">
        <div className="flex items-center mx-auto space-x-3 max-w-7xl">
          <span className="rounded-lg bg-gradient-to-r from-[#FF6B00] to-amber-500 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shrink-0 flex items-center shadow-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            <span>ব্রেকিং নোটিশ</span>
          </span>
          <div className="flex-1 overflow-hidden text-xs font-medium text-slate-200">
            <div className="animate-smooth-marquee">
              <span className="mx-4">📢 ২০২৬-২০২৭ শিক্ষাবর্ষে বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় একাদশ শ্রেণিতে ভর্তি চলছে</span>
              <span className="text-orange-400">•</span>
              <span className="mx-4">দ্বাদশ শ্রেণির নির্বাচনী পরীক্ষার রুটিন প্রকাশিত হয়েছে</span>
              <span className="text-orange-400">•</span>
              <span className="mx-4">পরিবহন সার্ভিসের নতুন ৩টি শীতাতপ নিয়ন্ত্রিত বাস উদ্বোধন!</span>
              <span className="text-orange-400">•</span>
              <span className="mx-4">📢 ২০২৬-২০২৭ শিক্ষাবর্ষে বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় একাদশ শ্রেণিতে ভর্তি চলছে</span>
            </div>
          </div>
        </div>
      </div>

      {/* হিরো কন্টেন্ট */}
      <div className="relative min-h-[540px] sm:min-h-[600px] lg:min-h-[640px] flex items-center py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 z-0">
          <div
            aria-hidden="true"
            className={`hero-image-skeleton absolute inset-0 transition-opacity duration-700 ${heroImageLoaded ? 'opacity-0' : 'opacity-100'}`}
          />
          <picture>
            <source srcSet="/hero-campus-bg.webp" type="image/webp" />
            <img
              src="/hero-campus-bg.webp"
              alt="স্টারলাইট কলেজ ক্যাম্পাস"
              width="1812"
              height="868"
              fetchPriority="high"
              decoding="async"
              className={`h-full w-full object-cover object-[70%_center] sm:object-[65%_center] lg:object-right transition-opacity duration-700 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setHeroImageLoaded(true)}
              onError={(e) => { e.currentTarget.style.display = 'none'; setHeroImageLoaded(true); }}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-[#031535]/95 via-[#062356]/85 to-[#062356]/40 lg:from-[#031535]/85 lg:via-[#062356]/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03122B]/90 via-transparent to-transparent lg:from-[#03122B]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,rgba(255,155,64,0.14),transparent_48%)] mix-blend-screen" />
        </div>

        {/* ডেকোরেটিভ ওয়াটারমার্ক ক্যাপ */}
        <div className="absolute inset-0 z-10 mx-auto overflow-hidden pointer-events-none max-w-7xl">
          <div className="hidden sm:block absolute top-14 left-[42%] lg:left-[45%] opacity-[0.14] animate-float-cap">
            <GraduationCap className="h-28 w-28 lg:h-36 lg:w-36 text-sky-200 stroke-[1.2]" />
          </div>
        </div>

        <div className="relative z-20 w-full px-4 mx-auto max-w-7xl sm:px-6">
          <div className="max-w-2xl lg:max-w-[650px] space-y-5 sm:space-y-6">
            
            {/* টপ ব্যাজ */}
            <div className="hero-stagger-1 inline-flex items-center space-x-2.5 rounded-full bg-[#092552]/80 px-4 py-1.5 backdrop-blur-md border border-sky-300/25 shadow-lg">
              <GraduationCap className="h-4 w-4 text-[#FF6B00] shrink-0" />
              <span className="text-xs sm:text-[13px] font-bold text-slate-100 tracking-wide">
                  {content.badge || 'সিলেট বিভাগের শীর্ষ ডিজিটাল উচ্চমাধ্যমিক বিদ্যাপীঠ'}
              </span>
            </div>

            {/* মেইন হেডলাইন */}
            <div className="space-y-1 hero-stagger-2 sm:space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.18]">
                {content.title || 'জ্ঞান, শৃঙ্খলা ও নেতৃত্বের'}
              </h1>

              <div className="relative inline-block pt-0.5">
                <span className="text-3xl sm:text-5xl lg:text-[54px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF851B] to-[#FFA726] leading-[1.18]">
                  {content.highlighted_title || 'ডিজিটাল উৎকর্ষতা'}
                </span>

                <svg className="inline-block ml-2 sm:ml-3 -mt-3 sm:-mt-5 h-6 w-6 sm:h-9 sm:w-9 text-[#FF6B00]" viewBox="0 0 36 36" fill="none">
                  <path d="M6 10L20 4" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M8 18L24 18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M6 26L20 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>

                <svg className="w-48 sm:w-72 h-3 sm:h-4 mt-1 text-[#FF6B00]" viewBox="0 0 260 14" fill="none">
                  <path d="M3 10C65 2 155 2 257 9" stroke="#FF6B00" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <p className="hero-stagger-3 text-xs sm:text-base lg:text-[17px] text-slate-200/95 max-w-xl leading-relaxed font-medium">
              {content.description || 'স্টারলাইট কলেজ, সিলেট — একাদশ ও দ্বাদশ শ্রেণির বিশ্বাসযোগ্য পাঠদান, অভিজ্ঞ শিক্ষকমণ্ডলী, আধুনিক বিজ্ঞান ও আইসিটি ল্যাব এবং শতভাগ ডিজিটাল অটোমেশনের অনন্য বিদ্যাপীঠ।'}
            </p>

            {/* বাটনসমূহ */}
            <div className="hero-stagger-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 pt-2">
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-center space-x-2.5 rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FF6200] to-[#E65100] px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-white shadow-[0_10px_30px_-5px_rgba(255,107,0,0.55)] hover:shadow-[0_14px_35px_-5px_rgba(255,107,0,0.75)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 border border-orange-300/30"
              >
                <GraduationCap className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
                <span>{content.primary_button_text || 'পোর্টাল প্রবেশ করুন (Portal Login)'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#admission"
                className="group inline-flex items-center justify-center space-x-2.5 rounded-full bg-[#061C3E]/80 hover:bg-[#0A2B5E] px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white backdrop-blur-md border border-sky-300/30 hover:border-orange-400/60 shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
              >
                <BookOpen className="h-4 w-4 text-[#FF6B00] transition-transform duration-300 group-hover:scale-110" />
                <span>{content.secondary_button_text || 'ভর্তি নির্দেশিকা ২০২৬'}</span>
              </a>
            </div>

            {/* ৪টি হাইলাইট */}
            <div className="pt-4 hero-stagger-5 sm:pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-0 rounded-2xl bg-[#041531]/65 sm:bg-transparent p-3 sm:p-0 backdrop-blur-md sm:backdrop-blur-none border border-white/10 sm:border-none">
                <div className="flex items-center space-x-2.5 sm:pr-4 sm:border-r sm:border-white/15">
                  <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-tight">
                    <span className="block font-bold text-white">অভিজ্ঞ</span>
                    <span className="font-semibold text-slate-300">শিক্ষকমণ্ডলী</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 sm:px-4 sm:border-r sm:border-white/15">
                  <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-tight">
                    <span className="block font-bold text-white">আধুনিক</span>
                    <span className="font-semibold text-slate-300">বিজ্ঞান ও আইসিটি ল্যাব</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 sm:px-4 sm:border-r sm:border-white/15">
                  <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-tight">
                    <span className="block font-bold text-white">নিরাপদ ও</span>
                    <span className="font-semibold text-slate-300">শৃঙ্খলাবদ্ধ পরিবেশ</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 sm:pl-4">
                  <div className="h-10 w-10 rounded-xl bg-[#0D274D]/90 border border-white/15 flex items-center justify-center text-[#FF6B00] shrink-0 shadow-md">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-tight">
                    <span className="block font-bold text-white">১০০%</span>
                    <span className="font-semibold text-slate-300">ডিজিটাল অটোমেশন</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* নিচের ভাসমান স্ট্যাটস বার */}
      <div className="relative z-20 bg-[#071E42]/95 border-t border-white/10 backdrop-blur-xl py-5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 sm:gap-4 sm:text-left">
            <div className="flex items-center justify-center px-4 py-3 space-x-3 border rounded-2xl bg-white/5 border-white/10 sm:justify-start">
              <span className="text-xl sm:text-2xl font-black text-[#FF6B00]">৩,২০০+</span>
              <span className="text-[11px] font-bold text-slate-300 leading-tight">নিয়মিত<br />শিক্ষার্থী</span>
            </div>
            <div className="flex items-center justify-center px-4 py-3 space-x-3 border rounded-2xl bg-white/5 border-white/10 sm:justify-start">
              <span className="text-xl font-black sm:text-2xl text-emerald-400">৯৯.৪%</span>
              <span className="text-[11px] font-bold text-slate-300 leading-tight">এইচএসসি<br />পাসের হার</span>
            </div>
            <div className="flex items-center justify-center px-4 py-3 space-x-3 border rounded-2xl bg-white/5 border-white/10 sm:justify-start">
              <span className="text-xl font-black sm:text-2xl text-amber-300">৬০+</span>
              <span className="text-[11px] font-bold text-slate-300 leading-tight">অভিজ্ঞ<br />শিক্ষকমণ্ডলী</span>
            </div>
            <div className="flex items-center justify-center px-4 py-3 space-x-3 border rounded-2xl bg-white/5 border-white/10 sm:justify-start">
              <span className="text-xl font-black sm:text-2xl text-sky-400">EIIN</span>
              <span className="text-[11px] font-bold text-slate-300 leading-tight">১৩৪৫৬৭<br />সিলেট বোর্ড</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;