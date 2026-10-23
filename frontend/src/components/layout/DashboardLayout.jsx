import React, { useState, Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from '../../utils/motion';
import Sidebar from './Sidebar';
import Header from './Header';
import InstallPWA from '../InstallPWA';
import PushPromptModal from '../common/PushPromptModal';
import DashboardBottomNav from './DashboardBottomNav';
import DashboardSkeleton from '../common/DashboardSkeleton';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleSidebarToggle = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) setSidebarCollapsed((collapsed) => !collapsed);
    else setSidebarOpen((open) => !open);
  };
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-canvas">
      {/* রেসপনসিভ সাইডবার */}
      <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} />

      {/* প্রধান কন্টেন্ট উইন্ডো */}
      <div className={`flex flex-col motion-safe:transition-[padding] motion-safe:duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-56'}`}>
        <Header onToggleSidebar={handleSidebarToggle} isSidebarCollapsed={sidebarCollapsed} isSidebarOpen={sidebarOpen} />
        
        {/* পেজের সাব-কম্পোনেন্ট রেন্ডার এলাকা (মোবাইলে বটম নেভের জন্য pb-24) */}
        <main className="flex-1 p-4 pb-24 sm:p-5 lg:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <Suspense fallback={<DashboardSkeleton />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* মোবাইল ইনস্টল প্রম্পট ব্যানার ও পুশ সফট-প্রম্পট */}
      <InstallPWA />
      <PushPromptModal />

      {/* মোবাইল অ্যাপ বটম নেভিগেশন বার */}
      <DashboardBottomNav />
    </div>
  );
};

export default DashboardLayout;