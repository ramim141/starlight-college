import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getSidebarNavItems } from './menuConfig';
import { GraduationCap, Sparkles, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isCollapsed = false }) => {
  const auth = useAuth();
  const { user, isClassIncharge } = auth;

  const navItems = getSidebarNavItems(auth);

  return (
    <>
      {/* মোবাইল ড্রপডাউন ব্যাকড্রপ */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* সাইডবার কন্টেইনার (Navy Blue Theme) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-56 flex-col bg-[#0F2C59] text-white motion-safe:transition-[width,transform] motion-safe:duration-300 ease-in-out lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-56'} ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ব্র্যান্ড হেডার */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <div className={`flex items-center space-x-2.5 ${isCollapsed ? 'lg:mx-auto' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-white shadow-md shadow-brand-orange/30">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className={isCollapsed ? 'lg:hidden' : ''}>
              <h2 className="font-extrabold text-sm tracking-tight text-white leading-none">STARLIGHT</h2>
              <span className="text-[8px] font-bold tracking-widest text-brand-orange">COLLEGE PORTAL</span>
            </div>
          </div>
          <button onClick={onClose} className="min-h-11 min-w-11 rounded-lg p-1.5 text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ইউজার কুইক স্ট্যাটাস ট্যাগ */}
        <div className={`mx-3 my-3 rounded-lg bg-white/5 p-2.5 border border-white/10 ${isCollapsed ? 'lg:mx-2 lg:px-1' : ''}`}>
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-brand-orange font-bold text-xs">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
            </div>
            <div className={`overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-[10px] font-bold text-white">{user?.full_name || user?.username}</p>
              <div className="mt-0.5 flex items-center space-x-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[8px] font-semibold text-slate-300 uppercase tracking-wider">{user?.role_display || user?.role}</span>
              </div>
            </div>
          </div>
          {isClassIncharge && !isCollapsed && (
            <div className="mt-2.5 flex items-center justify-center space-x-1.5 rounded-lg bg-orange-500/20 py-1 text-[10px] font-bold text-orange-300 border border-orange-500/30">
              <Sparkles className="h-3 w-3" />
              <span>শ্রেণি ইনচার্জ এক্সেস সক্রিয়</span>
            </div>
          )}
        </div>

        {/* মেনু নেভিগেশন লিস্ট */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-2 scrollbar-none">
          {navItems.map((item, index) => {
            if (item.sectionTitle) {
              return (
                <div key={index} className={`pt-4 pb-1 px-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange">
                    {item.sectionTitle}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                end={item.path === '/principal' || item.path === '/teacher' || item.path === '/accountant' || item.path === '/student'}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) =>
                  `relative flex items-center space-x-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold transition-colors duration-150 ${isCollapsed ? 'lg:justify-center lg:px-1' : ''} ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
                        className="absolute inset-0 rounded-lg bg-brand-orange shadow-md shadow-brand-orange/30"
                        transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center space-x-2 truncate ${isCollapsed ? 'lg:justify-center' : ''}`}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ফুটার কপিরাইট */}
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-slate-400">
          <span className={isCollapsed ? 'lg:hidden' : ''}>Starlight College ERP v1.0</span>{isCollapsed && <span className="hidden lg:inline">ERP v1.0</span>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;