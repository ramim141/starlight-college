import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, getUnreadCountApi, markNotificationReadApi, markAllNotificationsReadApi } from '../../api/notification';
import { Bell, Menu, LogOut, CheckCheck, Clock, ExternalLink, User, KeyRound, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Header = ({ onToggleSidebar, isSidebarCollapsed = false, isSidebarOpen = false }) => {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  const isNavigationExpanded = isDesktop ? !isSidebarCollapsed : isSidebarOpen;
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // TanStack Query: পোলিং ও উইন্ডো ফোকাসে আনরিড নোটিফিকেশন সিঙ্ক (ট্যাব ব্যাকগ্রাউন্ডে থাকলে পোলিং বিরতি)
  const { data: unreadData } = useQuery({
    queryKey: ['unread_notifications_count'],
    queryFn: getUnreadCountApi,
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible' ? 60000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    enabled: !!user,
  });

  const unreadCount = unreadData?.unread_count ?? 0;

  // সার্ভিস ওয়ার্কার থেকে পুশ নোটিফিকেশন রিসিভ ইভেন্ট শুনলে স্বয়ংক্রিয়ভাবে ক্যাশ রিফ্রেশ করা
  useEffect(() => {
    const handleSwMessage = (event) => {
      if (event.data?.type === 'PUSH_NOTIFICATION_RECEIVED') {
        queryClient.invalidateQueries({ queryKey: ['unread_notifications_count'] });
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, [queryClient]);

  const handleOpenDropdown = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    setUserMenuOpen(false);
    if (nextOpen) {
      try {
        const res = await getNotificationsApi();
        if (res.success) {
          setNotifications(res.notifications || []);
          if (typeof res.unread_count === 'number') {
            queryClient.setQueryData(['unread_notifications_count'], (old) => ({
              ...old,
              unread_count: res.unread_count,
            }));
          }
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
      queryClient.setQueryData(['unread_notifications_count'], (old) => {
        if (!old) return old;
        return { ...old, unread_count: Math.max(0, (old.unread_count || 0) - 1) };
      });
      queryClient.invalidateQueries({ queryKey: ['unread_notifications_count'] });
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
      queryClient.setQueryData(['unread_notifications_count'], (old) => {
        if (!old) return old;
        return { ...old, unread_count: 0 };
      });
      queryClient.invalidateQueries({ queryKey: ['unread_notifications_count'] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between bg-white px-4 sm:px-6 border-b border-slate-200/80 shadow-soft">
      {/* বাম পাশ: মেনু টগল ও শিরোনাম */}
      <div className="flex items-center space-x-3">
        {/* মোবাইল বটম নেভ সক্রিয় থাকায় মোবাইলের রিডানড্যান্ট সাইডবার টগল লুকানো (ডেস্কটপ অপরিবর্তিত) */}
        <button
          onClick={onToggleSidebar}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange cursor-pointer"
          aria-label="সাইডবার মেনু টগল"
          aria-expanded={isNavigationExpanded}
          title={isSidebarCollapsed ? 'সাইডবার খুলুন' : 'সাইডবার ছোট করুন'}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-brand-navy">
            {user?.full_name || user?.username}
          </h1>
          <p className="text-[9px] font-semibold text-brand-orange">
            {user?.role_display || user?.role} ড্যাশবোর্ড
          </p>
        </div>
      </div>

      {/* ডান পাশ: নোটিফিকেশন বেল ও ইউজার মেনু */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* রিয়েল-টাইম নোটিফিকেশন বেল */}
        <div className="relative">
          <button
            onClick={handleOpenDropdown}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-brand-sky hover:text-brand-navy cursor-pointer"
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
                    className="flex items-center space-x-1 text-[11px] font-semibold text-brand-orange hover:underline cursor-pointer"
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

              {user?.role === 'STUDENT' && (
                <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                  <Link
                    to="/student/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-bold text-brand-orange hover:underline inline-flex items-center space-x-1"
                  >
                    <span>সকল নোটিফিকেশন দেখুন</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ইউজার মেনু ড্রপডাউন */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setIsOpen(false);
            }}
            className="flex items-center space-x-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 p-1.5 sm:px-3 text-slate-700 transition cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F2C59] text-white text-xs font-bold">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-800 max-w-[120px] truncate">
              {user?.full_name || user?.username}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl bg-white shadow-premium border border-slate-200/90 z-50 divide-y divide-slate-100">
              <div className="p-3.5 bg-slate-50/70">
                <p className="text-xs font-bold text-brand-navy truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  @{user?.username} • {user?.role_display || user?.role}
                </p>
              </div>

              <div className="p-1.5 space-y-1">
                {user?.role === 'STUDENT' && (
                  <Link
                    to="/student/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-brand-orange transition cursor-pointer"
                  >
                    <User className="h-4 w-4 text-brand-navy" />
                    <span>আমার প্রোফাইল</span>
                  </Link>
                )}

                <Link
                  to="/change-password"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-brand-orange transition cursor-pointer"
                >
                  <KeyRound className="h-4 w-4 text-orange-600" />
                  <span>পাসওয়ার্ড পরিবর্তন</span>
                </Link>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;