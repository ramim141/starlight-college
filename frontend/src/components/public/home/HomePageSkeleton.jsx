import React from 'react';
import CustomMotionStyles from './CustomMotionStyles';

const HomePageSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
    <CustomMotionStyles />
    
    <div className="flex items-center justify-between w-full h-16 px-4 mx-auto bg-white border-b border-slate-100 sm:px-6 max-w-7xl">
      <div className="flex items-center space-x-3">
        <div className="h-11 w-11 rounded-2xl shimmer-box" />
        <div className="space-y-2">
          <div className="w-32 h-4 rounded-lg shimmer-box" />
          <div className="h-2.5 w-24 rounded-lg shimmer-box" />
        </div>
      </div>
      <div className="hidden space-x-3 lg:flex">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="w-16 h-7 rounded-xl shimmer-box" />
        ))}
      </div>
      <div className="h-10 w-28 rounded-2xl shimmer-box" />
    </div>

    <div className="bg-[#051B44] py-12 sm:py-20 px-4 sm:px-6">
      <div className="mx-auto space-y-6 max-w-7xl">
        <div className="h-8 rounded-full w-72 shimmer-dark" />
        <div className="space-y-3">
          <div className="w-4/5 h-12 max-w-xl sm:h-16 rounded-2xl shimmer-dark" />
          <div className="w-3/5 h-12 max-w-md sm:h-16 rounded-2xl shimmer-dark" />
        </div>
        <div className="max-w-lg pt-2 space-y-2">
          <div className="w-full h-4 rounded shimmer-dark" />
          <div className="w-5/6 h-4 rounded shimmer-dark" />
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="rounded-full h-13 w-60 shimmer-dark" />
          <div className="rounded-full h-13 w-44 shimmer-dark" />
        </div>
      </div>
    </div>

    <div className="w-full px-4 py-12 mx-auto max-w-7xl sm:px-6">
      <div className="w-56 mx-auto mb-8 rounded-lg h-7 shimmer-box" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-32 rounded-3xl shimmer-box" />
        ))}
      </div>
    </div>
  </div>
);

export default HomePageSkeleton;