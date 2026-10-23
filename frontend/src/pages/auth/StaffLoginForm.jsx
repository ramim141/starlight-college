import React from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export const StaffLoginForm = ({
  credentials,
  handleChange,
  showStaffPassword,
  setShowStaffPassword,
  openHelpModal,
  isStaff,
  formRef,
}) => {
  return (
    <div
      ref={formRef}
      aria-hidden={!isStaff}
      style={{
        transition: 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease',
        transform: isStaff ? 'translateX(0%) scale(1)' : 'translateX(104%) scale(0.98)',
        opacity: isStaff ? 1 : 0,
        pointerEvents: isStaff ? 'auto' : 'none',
      }}
      className={`${isStaff ? 'relative' : 'absolute inset-x-1 top-0'} space-y-4 py-0.5`}
    >
      {/* ১. Staff Username */}
      <div className="group">
        <label 
          htmlFor="username" 
          className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 transition-colors group-focus-within:text-[#0F2C59]"
        >
          স্টাফ ইউজারনেম (Username)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
            <User className="h-4 w-4" />
          </div>
          <input
            id="username"
            type="text"
            name="username"
            tabIndex={isStaff ? 0 : -1}
            value={credentials.username}
            onChange={handleChange}
            placeholder="যেমন: chemistry001"
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-4 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-sans placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-mono"
          />
        </div>
      </div>

      {/* ২. Staff Password */}
      <div className="group">
        <div className="flex items-center justify-between mb-1.5">
          <label 
            htmlFor="password" 
            className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider transition-colors group-focus-within:text-[#0F2C59]"
          >
            পাসওয়ার্ড (Password)
          </label>
          <button
            type="button"
            tabIndex={isStaff ? 0 : -1}
            onClick={openHelpModal}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
          >
            পাসওয়ার্ড সহায়তা
          </button>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showStaffPassword ? 'text' : 'password'}
            name="password"
            tabIndex={isStaff ? 0 : -1}
            value={credentials.password}
            onChange={handleChange}
            placeholder="আপনার গোপন পাসওয়ার্ড"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 py-3 pl-10 pr-11 text-sm font-bold text-slate-900 transition-all duration-200 placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10"
          />
          <button
            type="button"
            tabIndex={isStaff ? 0 : -1}
            onClick={() => setShowStaffPassword(!showStaffPassword)}
            aria-label={showStaffPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginForm;
