import React from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { toBanglaNumber } from './RoutineDayChips';

// সময় ফরম্যাটকে বাংলায় রূপান্তর (e.g. "09:00:00" -> "০৯:০০ AM")
export const formatTimeBn = (timeStr) => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const isPm = h >= 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;

  const hFormatted = h < 10 ? `0${h}` : `${h}`;
  const period = isPm ? 'PM' : 'AM';
  return `${toBanglaNumber(hFormatted)}:${toBanglaNumber(m)} ${period}`;
};

// সময় থেকে মোট মিনিট
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((n) => parseInt(n, 10) || 0);
  return h * 60 + m;
};

const PERIOD_ORDINALS = [
  '১ম পিরিয়ড',
  '২য় পিরিয়ড',
  '৩য় পিরিয়ড',
  '৪র্থ পিরিয়ড',
  '৫ম পিরিয়ড',
  '৬ষ্ঠ পিরিয়ড',
  '৭ম পিরিয়ড',
  '৮ম পিরিয়ড',
];

const RoutinePeriodCard = ({ 
  slot, 
  index, 
  isToday = false, 
  nowMinutes = 0, 
  isNextUpcoming = false 
}) => {
  const startMin = timeToMinutes(slot.start_time);
  const endMin = timeToMinutes(slot.end_time);

  // লাইভ স্ট্যাটাস নির্ণয়
  let status = 'UPCOMING';
  let progressPercent = 0;
  let remainingMinutes = 0;
  let minutesUntilStart = 0;

  if (isToday) {
    if (nowMinutes >= startMin && nowMinutes < endMin) {
      status = 'LIVE';
      const duration = Math.max(1, endMin - startMin);
      progressPercent = Math.min(100, Math.max(0, Math.round(((nowMinutes - startMin) / duration) * 100)));
      remainingMinutes = endMin - nowMinutes;
    } else if (nowMinutes >= endMin) {
      status = 'PAST';
    } else if (isNextUpcoming) {
      status = 'NEXT';
      minutesUntilStart = startMin - nowMinutes;
    }
  }

  const periodLabel = PERIOD_ORDINALS[index] || `${toBanglaNumber(index + 1)}ম পিরিয়ড`;

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition space-y-4 ${
        status === 'LIVE'
          ? 'bg-linear-to-br from-emerald-500/10 via-white to-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
          : status === 'NEXT'
          ? 'bg-linear-to-br from-amber-500/10 via-white to-white border-amber-300 shadow-sm'
          : status === 'PAST'
          ? 'bg-slate-50/70 border-slate-200 opacity-80'
          : 'bg-white border-slate-200/90 shadow-soft hover:shadow-premium'
      }`}
    >
      {/* টপ হেডার বার: পিরিয়ড ক্রম ও স্ট্যাটাস ট্যাগ */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span
            className={`rounded-xl px-2.5 py-1 text-xs font-black tracking-tight ${
              status === 'LIVE'
                ? 'bg-emerald-600 text-white'
                : status === 'NEXT'
                ? 'bg-amber-600 text-white'
                : status === 'PAST'
                ? 'bg-slate-200 text-slate-600'
                : 'bg-brand-navy/10 text-brand-navy'
            }`}
          >
            {periodLabel}
          </span>

          {slot.subject_code && (
            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-500">
              কোড: {slot.subject_code}
            </span>
          )}
        </div>

        {/* স্ট্যাটাস ব্যাজ */}
        {status === 'LIVE' && (
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-black border border-emerald-300 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>চলমান ক্লাস</span>
          </div>
        )}

        {status === 'NEXT' && (
          <div className="inline-flex items-center space-x-1 rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-[11px] font-black border border-amber-300">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>
              পরবর্তী ক্লাস (আর {toBanglaNumber(minutesUntilStart)} মিনিট পর)
            </span>
          </div>
        )}

        {status === 'PAST' && (
          <div className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
            <span>সম্পন্ন হয়েছে</span>
          </div>
        )}
      </div>

      {/* চলমান ক্লাসের লাইভ প্রগ্রেস বার */}
      {status === 'LIVE' && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-[11px] font-bold text-emerald-900">
            <span>ক্লাসের অগ্রগতি ({toBanglaNumber(progressPercent)}%)</span>
            <span>আর {toBanglaNumber(remainingMinutes)} মিনিট বাকি</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* মূল বিষয় ও প্রক্সি তথ্য */}
      <div>
        <h3 className="text-base sm:text-lg font-black text-brand-navy tracking-tight leading-snug">
          {slot.subject_name}
        </h3>

        {/* প্রক্সি ক্লাস তথ্য থাকলে (যদি ব্যাকএন্ড দেয়) */}
        {slot.proxy_teacher_name && (
          <div className="mt-1.5 inline-flex items-center space-x-1.5 rounded-xl bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 border border-purple-200">
            <AlertCircle className="h-3.5 w-3.5 text-purple-500" />
            <span>প্রক্সি শিক্ষক: {slot.proxy_teacher_name}</span>
          </div>
        )}
      </div>

      {/* মেটা ইনফো গ্রিড: সময়, শিক্ষক, কক্ষ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
        {/* সময় */}
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Clock className="h-4 w-4 text-brand-orange shrink-0" />
          <span className="font-bold">
            {formatTimeBn(slot.start_time)} — {formatTimeBn(slot.end_time)}
          </span>
        </div>

        {/* শিক্ষক */}
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <User className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="font-medium truncate">
            শিক্ষক: <strong className="text-slate-800">{slot.teacher_name || 'নির্ধারিত হয়নি'}</strong>
          </span>
        </div>

        {/* ক্লাসরুম / ল্যাব */}
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="font-medium truncate">
            স্থান: <strong className="text-brand-navy">{slot.room_number ? `রুম ${toBanglaNumber(slot.room_number)}` : 'মূল শ্রেণিকক্ষ'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoutinePeriodCard;
