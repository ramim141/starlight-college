import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, LayoutDashboard, Clock } from 'lucide-react';
import { SPRING } from '../../../utils/motion';

/**
 * StudentPlaceholder
 * A friendly, mobile-first placeholder for student portal routes under development.
 * Ensures zero dead links and provides clean navigation back to the student hub.
 */
const StudentPlaceholder = ({
  title,
  group = 'আমার সেবা',
  icon: Icon = Sparkles,
  description = 'এই ফিচারটি শীঘ্রই সবার জন্য উন্মুক্ত করা হচ্ছে। আমাদের টিম কাজ করছে।',
  expectedDate = 'শীঘ্রই চালু হবে',
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 pt-2 sm:pt-6">
      {/* টপ ন্যাভ ব্যাক বাটন */}
      <div className="flex items-center justify-between">
        <Link
          to="/student"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-orange transition min-h-[44px] px-2 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>ড্যাশবোর্ডে ফিরুন</span>
        </Link>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100/70 text-brand-orange border border-orange-200/50">
          {group}
        </span>
      </div>

      {/* মূল কার্ড */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={SPRING.snappy}
        className="rounded-3xl bg-white p-6 sm:p-8 text-center shadow-soft border border-slate-200/80 overflow-hidden relative"
      >
        {/* নরম গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড ব্লার */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-orange/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-brand-sky/20 blur-2xl pointer-events-none" />

        {/* আইকন কনটেইনার */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0F2C59] to-[#1E4A8A] text-brand-orange shadow-md shadow-brand-navy/15">
          <Icon className="h-8 w-8" />
        </div>

        {/* শিরোনাম ও বিবরণ */}
        <h2 className="text-lg sm:text-xl font-extrabold text-brand-navy leading-snug">
          {title}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>

        {/* টাইমলাইন / স্ট্যাটাস ব্যাজ */}
        <div className="mt-5 inline-flex items-center space-x-2 rounded-xl bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200/60">
          <Clock className="h-4 w-4 text-brand-orange" />
          <span>স্ট্যাটাস: <strong className="text-brand-orange">{expectedDate}</strong></span>
        </div>

        {/* প্রাইমারি থাম্ব-রিচেবল কল টু একশন (≥44px) */}
        <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/student"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-2xl bg-brand-orange px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-orange/30 hover:bg-orange-600 active:scale-98 transition min-h-[48px] cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>হোম ড্যাশবোর্ডে যান</span>
          </Link>
        </div>
      </motion.div>

      {/* হেল্প টিপ */}
      <p className="text-center text-[11px] text-slate-400">
        কোনো জরুরি তথ্যের জন্য কলেজ প্রশাসনের হেল্পলাইনে যোগাযোগ করুন।
      </p>
    </div>
  );
};

export default StudentPlaceholder;
