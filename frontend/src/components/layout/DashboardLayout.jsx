import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import InstallPWA from '../InstallPWA';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-canvas">
      {/* রেসপনসিভ সাইডবার */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* প্রধান কন্টেন্ট উইন্ডো */}
      <div className="flex flex-col lg:pl-72">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* পেজের সাব-কম্পোনেন্ট রেন্ডার এলাকা */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* মোবাইল ইনস্টল প্রম্পট ব্যানার */}
      <InstallPWA />
    </div>
  );
};

export default DashboardLayout;