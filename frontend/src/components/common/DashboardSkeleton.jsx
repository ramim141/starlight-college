import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      <style>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .dash-shimmer {
          position: relative;
          overflow: hidden;
        }
        .dash-shimmer::after {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
          animation: shimmerSweep 1.6s infinite ease-in-out;
          content: '';
        }
      `}</style>

      {/* Top Banner Skeleton */}
      <div className="h-28 sm:h-36 w-full rounded-3xl bg-slate-200/80 dash-shimmer" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 sm:h-28 rounded-3xl bg-slate-200/70 dash-shimmer p-4 flex flex-col justify-between">
            <div className="h-4 w-20 rounded-md bg-slate-300/80" />
            <div className="h-7 w-28 rounded-lg bg-slate-300/80" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-3xl bg-slate-200/70 dash-shimmer" />
        <div className="h-72 rounded-3xl bg-slate-200/70 dash-shimmer" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
