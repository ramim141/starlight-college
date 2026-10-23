import React from 'react';
import { Hash, Calendar, KeyRound, Eye, EyeOff } from 'lucide-react';

export const StudentLoginForm = ({
  credentials,
  handleChange,
  showStudentPin,
  setShowStudentPin,
  openHelpModal,
  isStudent,
  formRef,
}) => {
  return (
    <div
      ref={formRef}
      aria-hidden={!isStudent}
      style={{
        transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease',
        transform: isStudent ? 'translateX(0%) scale(1)' : 'translateX(-104%) scale(0.98)',
        opacity: isStudent ? 1 : 0,
        pointerEvents: isStudent ? 'auto' : 'none',
      }}
      className={`${isStudent ? 'relative' : 'absolute inset-x-1 top-0'} space-y-4 py-0.5`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* ১. SSC Roll */}
        <div className="sm:col-span-7 group">
          <label 
            htmlFor="ssc_roll" 
            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-[#0F2C59]"
          >
            এসএসসি রোল (SSC Roll)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
              <Hash className="h-4 w-4" />
            </div>
            <input
              id="ssc_roll"
              type="text"
              inputMode="numeric"
              name="ssc_roll"
              tabIndex={isStudent ? 0 : -1}
              value={credentials.ssc_roll}
              onChange={handleChange}
              placeholder="যেমন: 101001"
              autoComplete="username"
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>

        {/* ২. Passing Year */}
        <div className="sm:col-span-5 group">
          <label 
            htmlFor="passing_year" 
            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-[#0F2C59]"
          >
            পাসের সাল (Year)
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              id="passing_year"
              type="text"
              inputMode="numeric"
              name="passing_year"
              tabIndex={isStudent ? 0 : -1}
              value={credentials.passing_year}
              onChange={handleChange}
              placeholder="2024"
              maxLength={4}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
        </div>
      </div>

      {/* ৩. 6-Digit PIN */}
      <div className="group">
        <div className="flex items-center justify-between mb-1.5">
          <label 
            htmlFor="pin" 
            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-[#0F2C59]"
          >
            গোপন পিন (6-Digit PIN)
          </label>
          <button
            type="button"
            tabIndex={isStudent ? 0 : -1}
            onClick={openHelpModal}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
          >
            পিন ভুলে গেছেন?
          </button>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
            <KeyRound className="h-4 w-4" />
          </div>
          <input
            id="pin"
            type={showStudentPin ? 'text' : 'password'}
            inputMode="numeric"
            name="pin"
            tabIndex={isStudent ? 0 : -1}
            value={credentials.pin}
            onChange={handleChange}
            placeholder="৬ ডিজিটের পিন"
            maxLength={6}
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-11 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-mono tracking-widest"
          />
          <button
            type="button"
            tabIndex={isStudent ? 0 : -1}
            onClick={() => setShowStudentPin(!showStudentPin)}
            aria-label={showStudentPin ? 'পিন লুকান' : 'পিন দেখুন'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {showStudentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginForm;
