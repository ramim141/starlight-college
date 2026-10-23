import React from 'react';

const HomePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-brand-canvas w-full">
      <style>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .home-shimmer {
          position: relative;
          overflow: hidden;
        }
        .home-shimmer::after {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          animation: shimmerSweep 1.6s infinite ease-in-out;
          content: '';
        }
      `}</style>

      {/* Top Navbar Skeleton */}
      <div className="h-16 w-full bg-white border-b border-slate-100 flex items-center justify-between px-6">
        <div className="h-9 w-40 rounded-xl bg-slate-200 home-shimmer" />
        <div className="hidden sm:flex items-center space-x-4">
          <div className="h-6 w-20 rounded-md bg-slate-200 home-shimmer" />
          <div className="h-6 w-20 rounded-md bg-slate-200 home-shimmer" />
          <div className="h-9 w-28 rounded-xl bg-slate-200 home-shimmer" />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="min-h-[540px] sm:min-h-[600px] w-full bg-[#031535] home-shimmer relative flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full space-y-6">
          <div className="h-7 w-48 rounded-full bg-slate-800/80" />
          <div className="h-12 sm:h-16 w-3/4 max-w-xl rounded-2xl bg-slate-800/80" />
          <div className="h-5 w-2/3 max-w-md rounded-lg bg-slate-800/80" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-36 rounded-2xl bg-slate-800/80" />
            <div className="h-12 w-36 rounded-2xl bg-slate-800/80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageSkeleton;
