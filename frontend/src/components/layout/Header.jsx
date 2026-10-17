import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsApi, getUnreadCountApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../api/notification';
import { Bell, Menu, LogOut, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // প্রতি ৬০ সেকেন্ড পর পর নোটিফিকেশন চেক করা
  const fetchUnread = async () => {
    try {
      const res = await getUnreadCountApi();
      if (res.success) setUnreadCount(res.unread_count);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      try {
        const res = await getNotificationsApi();
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unread_count || 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleMarkRead = async (notif) => {
    try {
      await markNotificationReadApi(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (notif.action_url) {
        setIsOpen(false);
        navigate(notif.action_url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white px-4 sm:px-8 border-b border-slate-200/80 shadow-soft">
      {/* বাম পাশ: মেনু টগল ও শিরোনাম */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-brand-navy">
            {user?.full_name || user?.username}
          </h1>
          <p className="text-[11px] font-semibold text-brand-orange">
            {user?.role_display || user?.role} ড্যাশবোর্ড
          </p>
        </div>
      </div>

      {/* ডান পাশ: নোটিফিকেশন বেল ও প্রোফাইল */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* রিয়েল-টাইম নোটিফিকেশন বেল */}
        <div className="relative">
          <button
            onClick={handleOpenDropdown}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-brand-sky hover:text-brand-navy"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-extrabold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* নোটিফিকেশন ড্রপডাউন কার্ড */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden rounded-2xl bg-white shadow-premium border border-slate-200 z-50">
              <div className="flex items-center justify-between bg-[#0F2C59] px-4 py-3 text-white">
                <span className="text-xs font-bold">নোটিফিকেশনসমূহ</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-brand-orange hover:underline"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>সব পঠিত চিহ্নিত করুন</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    কোনো নতুন নোটিফিকেশন নেই
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkRead(notif)}
                      className={`cursor-pointer p-3.5 transition hover:bg-slate-50 ${
                        !notif.is_read ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-brand-navy">{notif.title}</h4>
                        {!notif.is_read && (
                          <span className="h-2 w-2 rounded-full bg-brand-orange mt-1"></span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 line-clamp-2">{notif.body}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {notif.action_url && (
                          <span className="flex items-center text-brand-orange font-semibold">
                            বিস্তারিত <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* লগআউট বাটন */}
        <button
          onClick={logout}
          title="লগআউট"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;