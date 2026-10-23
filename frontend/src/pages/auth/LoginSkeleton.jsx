import React from 'react';

export const CustomMotionStyles = () => (
  <style>{`
    @keyframes shimmerSweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-box {
      position: relative;
      overflow: hidden;
      background-color: #E2E8F0;
    }
    .shimmer-box::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.65) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    .shimmer-dark {
      position: relative;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.08);
    }
    .shimmer-dark::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.12) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes pageFadeUp {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.99);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-page-enter {
      animation: pageFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
  `}</style>
);

export const LoginPageSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-10">
    <CustomMotionStyles />

    {/* Mobile Top Bar Skeleton */}
    <div className="lg:hidden w-full max-w-[440px] mx-auto flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/70 mb-2">
      <div className="h-5 w-20 rounded-lg shimmer-box" />
      <div className="h-5 w-24 rounded-full shimmer-box" />
    </div>

    {/* Main Container Skeleton */}
    <div className="w-full max-w-[440px] lg:max-w-5xl mx-auto rounded-[32px] bg-white border border-slate-200/90 overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0F2C59] p-10 flex-col justify-between min-h-[580px]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-7 w-28 rounded-xl shimmer-dark" />
              <div className="h-6 w-24 rounded-full shimmer-dark" />
            </div>
            <div className="space-y-3 pt-6">
              <div className="h-12 w-12 rounded-2xl shimmer-dark" />
              <div className="h-8 w-60 rounded-xl shimmer-dark" />
              <div className="h-4 w-44 rounded-md shimmer-dark" />
            </div>
            <div className="space-y-2.5 pt-4">
              <div className="h-14 w-full rounded-2xl shimmer-dark" />
              <div className="h-14 w-full rounded-2xl shimmer-dark" />
              <div className="h-14 w-full rounded-2xl shimmer-dark" />
            </div>
          </div>
          <div className="h-8 w-48 rounded-xl shimmer-dark" />
        </div>

        {/* Right Side */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-7 w-44 rounded-xl shimmer-box" />
                <div className="h-3.5 w-64 rounded-md shimmer-box" />
              </div>
              <div className="h-7 w-24 rounded-xl shimmer-box" />
            </div>

            {/* Tab Switcher Skeleton */}
            <div className="h-12 w-full rounded-2xl shimmer-box" />

            {/* Input Fields Skeleton */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7 space-y-2">
                  <div className="h-3 w-28 rounded shimmer-box" />
                  <div className="h-11 w-full rounded-2xl shimmer-box" />
                </div>
                <div className="sm:col-span-5 space-y-2">
                  <div className="h-3 w-20 rounded shimmer-box" />
                  <div className="h-11 w-full rounded-2xl shimmer-box" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-28 rounded shimmer-box" />
                  <div className="h-3 w-20 rounded shimmer-box" />
                </div>
                <div className="h-11 w-full rounded-2xl shimmer-box" />
              </div>
              <div className="h-12 w-full rounded-2xl shimmer-box mt-2" />
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <div className="h-3.5 w-24 rounded shimmer-box" />
              <div className="h-3.5 w-32 rounded shimmer-box" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="h-4 w-64 rounded shimmer-box mx-auto my-2" />
  </div>
);

export default LoginPageSkeleton;
