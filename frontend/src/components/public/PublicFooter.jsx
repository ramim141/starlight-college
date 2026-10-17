import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowUp, 
  ShieldCheck, 
  Globe, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

const PublicFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#071731] text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-white/10 relative overflow-hidden select-none">
      
      {/* ব্যাকগ্রাউন্ড ডেকোরেশন গ্লো */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#FF6B00]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ১. শীর্ষ কল টু অ্যাকশন ও হেল্পলাইন কার্ড */}
        <div className="mb-14 rounded-3xl bg-gradient-to-r from-[#0F2C59] via-[#16386B] to-[#0A1F3F] p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#EA580C] p-3.5 text-white shadow-lg shadow-orange-500/30 shrink-0">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#FF851B]">
                ২০২৬-২০২৭ শিক্ষাবর্ষে একাদশ শ্রেণিতে ভর্তি
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-0.5">
                বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক শাখায় আপনার আসন নিশ্চিত করুন
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য ১০০% পর্যন্ত বিশেষ শিক্ষা বৃত্তি ও পরিবহন সুবিধা প্রযোজ্য।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:+8801712345678"
              className="flex items-center space-x-2 rounded-2xl bg-white/10 hover:bg-white/15 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition-all duration-200 border border-white/10 active:scale-[0.98]"
            >
              <Phone className="h-4 w-4 text-emerald-400" />
              <span className="font-mono">+৮৮০১৭১২-৩৪৫৬৭৮</span>
            </a>

            <Link
              to="/login"
              className="group flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#EA580C] hover:from-[#EA580C] hover:to-amber-700 px-6 py-3 text-xs font-black text-white shadow-lg shadow-orange-500/30 transition-all duration-200 active:scale-[0.98]"
            >
              <GraduationCap className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>অনলাইন আবেদন করুন</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ২. মূল ৪ কলাম ফুটার কনটেন্ট */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/10">
          
          {/* কলাম ১: কলেজ পরিচিতি ও অ্যাফিলিয়েশন */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#EA580C] flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-xl text-white tracking-tight leading-none">STARLIGHT COLLEGE</h3>
                <span className="text-[10px] font-bold text-[#FF851B] tracking-widest uppercase">
                  SYLHET | ESTD. 2012
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              স্টারলাইট কলেজ সিলেট বিভাগের শীর্ষস্থানীয় আধুনিক উচ্চমাধ্যমিক বিদ্যাপীঠ। মানসম্মত পাঠদান, অত্যাধুনিক বিজ্ঞান ও আইসিটি ল্যাবরেটরি এবং শতভাগ ডিজিটাল অটোমেশনের মাধ্যমে শিক্ষার্থীদের আলোকিত ভবিষ্যৎ নির্মাণে আমরা নিবেদিত।
            </p>

            {/* স্বীকৃতি ও কোড */}
            <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">শিক্ষা বোর্ড:</span>
                <strong className="text-white font-medium">সিলেট শিক্ষা বোর্ড</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">কলেজ কোড / EIIN:</span>
                <strong className="text-[#FF851B] font-mono font-bold">১৩৪৫৬৭ / কোড: ১২৩৪</strong>
              </div>
            </div>

            {/* সোশ্যাল আইকনস */}
            <div className="flex items-center space-x-2.5 pt-2">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:text-white hover:bg-blue-600 transition-all duration-200 active:scale-90"
                aria-label="ফেসবুক পেজ"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:text-white hover:bg-red-600 transition-all duration-200 active:scale-90"
                aria-label="ইউটিউব চ্যানেল"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href="https://starlightcollege.edu.bd" 
                className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:text-white hover:bg-[#EA580C] transition-all duration-200 active:scale-90"
                aria-label="অফিসিয়াল ওয়েবসাইট"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a 
                href="https://wa.me/8801712345678" 
                target="_blank" 
                rel="noreferrer" 
                className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:text-white hover:bg-emerald-600 transition-all duration-200 active:scale-90"
                aria-label="হোয়াটসঅ্যাপ হেল্পলাইন"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* কলাম ২: পোর্টাল ও দ্রুত লিঙ্কসমূহ */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-[#FF851B]" />
              <span>ডিজিটাল পোর্টাল ও অ্যাক্সেস</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>শিক্ষার্থী পোর্টাল (Student Portal)</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>শিক্ষক ও ইনচার্জ হাব (Teacher Portal)</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>অধ্যক্ষ কন্ট্রোল প্যানেল (Principal)</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>হিসাব ও অর্থ বিভাগ (Accounts Panel)</span>
                </Link>
              </li>
              <li>
                <a href="#results" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>অনলাইন মার্কশিট ও রেজাল্ট সার্চ</span>
                </a>
              </li>
              <li>
                <a href="#notices" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>কেন্দ্রীয় নোটিশ বোর্ড ও সার্কুলার</span>
                </a>
              </li>
            </ul>
          </div>

          {/* কলাম ৩: একাডেমিক বিভাগ ও সুবিধাসমূহ */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              একাডেমিক বিভাগ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#departments" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>বিজ্ঞান বিভাগ (Science)</span>
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>ব্যবসায় শিক্ষা (Business)</span>
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>মানবিক বিভাগ (Humanities)</span>
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>বিজ্ঞান ও আইসিটি ল্যাব</span>
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>সেন্ট্রাল ডিজিটাল লাইব্রেরি</span>
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#FF851B] transition flex items-center space-x-1.5 group">
                  <ChevronRight className="h-3 w-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-[#FF851B] transition-transform" />
                  <span>বাস সার্ভিস ও রুট ট্র্যাকার</span>
                </a>
              </li>
            </ul>
          </div>

          {/* কলাম ৪: যোগাযোগ ও হেল্পডেস্ক */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              যোগাযোগ ও ক্যাম্পাস
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#FF851B] shrink-0 mt-0.5" />
                <span>আম্বরখানা মেইন রোড, বিমানবন্দর সড়ক মোড়, সিলেট সদর, সিলেট-৩১০০।</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-mono font-medium">+৮৮০১৭১২-৩৪৫৬৭৮</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>admissions@starlightcollege.edu.bd</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>শনিবার হতে বৃহস্পতিবার: ৮:০০ - ১৬:০০</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#FF851B] hover:underline group"
              >
                <span>ক্যাম্পাস লোকেশন ও দিকনির্দেশনা</span>
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* ৩. কপিরাইট ও ফুটনোট বার */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-400">
          <p>
            © ২০২৬ <strong className="text-white">স্টারলাইট কলেজ, সিলেট</strong>। সর্বস্বত্ব সংরক্ষিত।
          </p>

          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-200 transition cursor-pointer">গোপনীয়তা নীতি</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition cursor-pointer">শর্তাবলি</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1.5 text-[#FF851B] hover:text-white transition-all font-bold cursor-pointer active:scale-95"
            >
              <span>উপরে উঠুন</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default PublicFooter;
