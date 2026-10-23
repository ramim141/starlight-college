/* eslint-disable no-undef */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';

// Immediate client claiming
clientsClaim();

// ১. প্রিক্যাশিং: বিল্ড টাইমে ইনজেক্টেড সকল অ্যাসেট
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// ২. অফলাইন ফলব্যাক পেজ হ্যান্ডলার
// ইউজার অফলাইনে কোনো অপঠিত রাউটে নেভিগেট করলে offline.html পরিবেশিত হবে
const offlineNavigationHandler = async (params) => {
  try {
    // সাধারণ নেটওয়ার্ক নেভিগেশন চেষ্টা করা
    const networkHandler = createHandlerBoundToURL('/index.html');
    return await networkHandler(params);
  } catch {
    // সংযোগ বিচ্ছিন্ন থাকলে ব্রান্ডেড অফলাইন ফলব্যাক
    const cache = await caches.open('offline-fallback-cache');
    const cachedOfflinePage = await cache.match('/offline.html');
    if (cachedOfflinePage) {
      return cachedOfflinePage;
    }
    return new Response(
      '<h1>ইন্টারনেট সংযোগ নেই</h1><p>দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
};

const navigationRoute = new NavigationRoute(offlineNavigationHandler, {
  // এপিআই বা অ্যাডমিন ইউআরএল নেভিগেশন রাউটে ধরবে না
  denylist: [/^\/api\//, /^\/admin\//],
});
registerRoute(navigationRoute);

// ৩. স্ট্যাটিক ফন্ট ও ইমেজ ক্যাশিং (Cache First)
registerRoute(
  ({ request, url }) =>
    request.destination === 'font' ||
    url.pathname.includes('/fonts/') ||
    (request.destination === 'image' && !url.pathname.startsWith('/api/')),
  new CacheFirst({
    cacheName: 'static-assets-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // ৩০ দিন
      }),
    ],
  })
);

// ৪. পাবলিক নোটিশ ও হোমপেজ CMS ডেটা (Stale While Revalidate)
// শুধুমাত্র নিরাপদ পাবলিক এপিআই ক্যাশ হবে; কোনো পার্সোনাল ডাটা নয়
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    (url.pathname.includes('/api/v1/operations/notices/') ||
      url.pathname.includes('/api/v1/system/homepage/')),
  new StaleWhileRevalidate({
    cacheName: 'public-api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60, // ২৪ ঘণ্টা
      }),
    ],
  })
);

// ৫. কঠোর ক্যাশ নিষেধাজ্ঞা (SECURITY / PRIVACY GUARD):
// অথেনটিকেশন, পরীক্ষার ফলাফল, বেতন/ইনভয়েস, হাজিরা, ছাত্র/শিক্ষক প্রোফাইল
// এবং সকল POST, PUT, PATCH, DELETE কল কখনোই সার্ভিস ওয়ার্কারে ক্যাশ হবে না!
registerRoute(
  ({ url, request }) =>
    request.method !== 'GET' ||
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/finance/') ||
    url.pathname.includes('/examination/') ||
    url.pathname.includes('/academics/') ||
    url.pathname.includes('/attendance/') ||
    url.pathname.includes('/invoices/') ||
    url.pathname.includes('/results/') ||
    url.pathname.includes('/me/'),
  new NetworkOnly()
);

// ৬. অফলাইন ফলব্যাক ক্যাশ প্রি-পপুলেশন
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-fallback-cache').then((cache) => {
      return cache.addAll(['/offline.html', '/favicon.svg']);
    })
  );
});

// ৭. ওয়েব পুশ নোটিফিকেশন হ্যান্ডলার
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'স্টারলাইট কলেজ পোর্টাল', body: event.data.text() };
    }
  }

  const title = data.title || 'স্টারলাইট কলেজ নোটিফিকেশন';
  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || data.action_url || '/',
      notification_id: data.notification_id,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // ওপেন ট্যাবে রিয়েল-টাইম বেল আপডেট করতে মেসেজ পাঠানো
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_RECEIVED',
            payload: data,
          });
        });
      });
    })
  );
});

// ৮. নোটিফিকেশন ক্লিক হ্যান্ডলার (ট্যাব ফোকাস বা ওপেন)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // ইতোমধ্যে খোলা ট্যাব থাকলে ফোকাস করে সেখানে রিডাইরেক্ট করা
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (client.url !== targetUrl && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // অন্যথায় নতুন উইন্ডো খোলা
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ৯. নিউ রিলিজ আপডেট হ্যান্ডলার
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
