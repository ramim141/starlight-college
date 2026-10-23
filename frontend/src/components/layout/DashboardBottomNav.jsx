import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getBottomNavConfig } from './menuConfig';
import { SPRING } from '../../utils/motion';
import { Grid, X, ChevronRight, Sparkles } from 'lucide-react';
import SheetNavItem from './SheetNavItem';

/**
 * DashboardBottomNav
 * Authenticated mobile bottom navigation bar for student, teacher, accountant, principal.
 */
const DashboardBottomNav = ({ badges = {} }) => {
  const auth = useAuth();
  const { user, isClassIncharge } = auth;
  const location = useLocation();

  const [isSheetMounted, setIsSheetMounted] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const sheetTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(sheetTimerRef.current);
  }, []);

  const { primaryItems, secondaryItems, groupedSecondaryItems } = getBottomNavConfig(auth);

  // ২-ফেজ বটম শীট ওপেন (Double RAF)
  const openSheet = () => {
    clearTimeout(sheetTimerRef.current);
    setIsSheetMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsSheetVisible(true));
    });
  };

  // ২-ফেজ বটম শীট ক্লোজ (৩২০ms এক্সিট ট্রানজিশন)
  const closeSheet = () => {
    setIsSheetVisible(false);
    clearTimeout(sheetTimerRef.current);
    sheetTimerRef.current = setTimeout(() => setIsSheetMounted(false), 320);
  };

  // রুট পরিবর্তন হলে স্বয়ংক্রিয়ভাবে বটম শীট ক্লোজ করা
  useEffect(() => {
    if (isSheetMounted) {
      closeSheet();
    }
  }, [location.pathname]);

  // Escape key প্রেস করলে বটম শীট বন্ধ করা
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSheetVisible) {
        closeSheet();
      }
    };
    if (isSheetVisible) {
      window.addEventListener('keydown', handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isSheetVisible]);

  // বর্তমান রুট কি সেকেন্ডারি আইটেমগুলোর কোনোটিতে আছে কিনা
  const isSecondaryActive = groupedSecondaryItems
    ? groupedSecondaryItems.some((g) => g.items.some((i) => i.path === location.pathname))
    : secondaryItems.some((item) => item.path && location.pathname === item.path);

  const columnCountClass = primaryItems.length === 3 ? 'grid-cols-4' : 'grid-cols-5';

  return (
    <>
      {/* ১. স্টিকি মোবাইল অ্যাপ বটম বার */}
      <nav
        aria-label="ড্যাশবোর্ড মোবাইল নেভিগেশন"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none safe-area-pb"
      >
        <div className={`grid ${columnCountClass} min-h-[56px] h-15 max-w-lg mx-auto px-1.5`}>
          {/* প্রাইমারি আইটেমস */}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const badgeCount = badges[item.path] || item.badge;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => {
                  const active = item.matchPaths ? item.matchPaths.includes(location.pathname) : isActive;
                  return `relative flex flex-col items-center justify-center min-h-[48px] min-w-[44px] py-1 transition-colors duration-150 cursor-pointer ${
                    active ? 'text-brand-orange font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`;
                }}
              >
                {({ isActive }) => {
                  const active = item.matchPaths ? item.matchPaths.includes(location.pathname) : isActive;
                  return (
                    <>
                      {/* স্লাইডিং অ্যাক্টিভ ইন্ডিকেটর বার */}
                      {active && (
                        <motion.div
                          layoutId="activeDashboardBottomIndicator"
                          className="absolute top-0 w-8 h-1 rounded-full bg-brand-orange shadow-sm shadow-brand-orange/40"
                          transition={SPRING.snappy}
                        />
                      )}

                      {/* আইকন ও স্কেলিং */}
                      <div
                        className={`relative p-1 rounded-xl transition-transform duration-200 ${
                          active ? 'scale-110 bg-orange-50/80 text-brand-orange' : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />

                        {/* ব্যাজ স্লট */}
                        {badgeCount ? (
                          <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-brand-orange text-[9px] font-extrabold text-white shadow-sm ring-1 ring-white">
                            {badgeCount > 9 ? '9+' : badgeCount}
                          </span>
                        ) : null}
                      </div>

                      {/* টাইটেল */}
                      <span className="mt-0.5 text-[10px] font-bold tracking-tight leading-none truncate max-w-[64px]">
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}

          {/* আরও (More) বাটন */}
          <button
            type="button"
            onClick={openSheet}
            className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[44px] py-1 transition-colors duration-150 cursor-pointer ${
              isSecondaryActive || isSheetVisible
                ? 'text-brand-orange font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            aria-label="আরও মেনু ও সেবা"
            aria-expanded={isSheetVisible}
          >
            {(isSecondaryActive || isSheetVisible) && (
              <motion.div
                layoutId="activeDashboardBottomIndicator"
                className="absolute top-0 w-8 h-1 rounded-full bg-brand-orange shadow-sm shadow-brand-orange/40"
                transition={SPRING.snappy}
              />
            )}

            <div
              className={`relative p-1 rounded-xl transition-transform duration-200 ${
                isSecondaryActive || isSheetVisible ? 'scale-110 bg-orange-50/80 text-brand-orange' : ''
              }`}
            >
              <Grid className="h-5 w-5" />
            </div>

            <span className="mt-0.5 text-[10px] font-bold tracking-tight leading-none">
              আরও
            </span>
          </button>
        </div>
      </nav>

      {/* ২. "আরও" বটম শীট (Two-Phase Spring Animation) */}
      {isSheetMounted && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="আরও সেবা ও মেনু"
        >
          {/* ব্যাকড্রপ */}
          <div
            onClick={closeSheet}
            style={{
              transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: isSheetVisible ? 1 : 0,
            }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* শীট কন্টেইনার (Apple Spring Motion) */}
          <div
            style={{
              transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isSheetVisible ? 'translateY(0%)' : 'translateY(100%)',
            }}
            className="relative z-10 rounded-t-3xl bg-white p-5 shadow-2xl border-t border-slate-200 max-h-[82vh] overflow-y-auto safe-area-pb"
          >
            {/* ড্র্যাগ ইন্ডিকেটর বার */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

            {/* হেডার */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0F2C59] text-white">
                  <Grid className="h-4 w-4 text-brand-orange" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-navy">আরও সেবা ও মেনু</h3>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {user?.role_display || user?.role} ড্যাশবোর্ড
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* শ্রেণি ইনচার্জ হলে কুইক ব্যাজ */}
            {isClassIncharge && (
              <div className="mb-3 flex items-center space-x-1.5 rounded-xl bg-orange-50 px-3 py-2 text-[11px] font-bold text-brand-orange border border-orange-200/60">
                <Sparkles className="h-4 w-4 shrink-0 text-orange-600" />
                <span>শ্রেণি ইনচার্জ কন্ট্রোল প্যানেল সক্রিয়</span>
              </div>
            )}

            {/* সেকেন্ডারি আইটেম লিস্ট: গ্রুপড অথবা ফ্ল্যাট */}
            {groupedSecondaryItems ? (
              <div className="space-y-4">
                {groupedSecondaryItems.map((groupObj) => (
                  <div key={groupObj.group} className="space-y-1">
                    <div className="pt-1 pb-1 px-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-orange">
                        {groupObj.group}
                      </p>
                    </div>
                    {groupObj.items.map((item) => (
                      <SheetNavItem
                        key={item.path}
                        item={item}
                        isCurrent={location.pathname === item.path}
                        onClick={closeSheet}
                        badge={badges[item.path]}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {secondaryItems.map((item, index) => {
                  if (item.sectionTitle) {
                    return (
                      <div key={index} className="pt-3 pb-1 px-1">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-orange">
                          {item.sectionTitle}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <SheetNavItem
                      key={item.path}
                      item={item}
                      isCurrent={location.pathname === item.path}
                      onClick={closeSheet}
                      badge={badges[item.path]}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardBottomNav;
