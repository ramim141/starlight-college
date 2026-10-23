import { subscribeDevicePushApi } from '../api/notification';

/**
 * Converts a base64 string to a Uint8Array for PushManager applicationServerKey.
 */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Checks if the current browser environment supports Push Notifications.
 */
export const isPushNotificationSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * Subscribes the current device to browser Web Push and registers with Django backend.
 */
export const subscribeToPushNotifications = async () => {
  if (!isPushNotificationSupported()) {
    throw new Error('PUSH_NOT_SUPPORTED');
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn('VITE_VAPID_PUBLIC_KEY is not defined in environment.');
    return null;
  }

  // ১. সার্ভিস ওয়ার্কার রেজিস্ট্রেশন নিশ্চিত করা
  const registration = await navigator.serviceWorker.ready;

  // ২. ইতোমধ্যে কোনো সাবস্ক্রিপশন থাকলে তা ব্যবহার করা বা নতুন তৈরি করা
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  // ৩. ব্যাকএন্ডের কাঙ্ক্ষিত ফরম্যাটে p256dh ও auth কী প্রস্তুত করা
  const rawP256dh = subscription.getKey('p256dh');
  const p256dh_key = rawP256dh
    ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawP256dh)))
    : '';

  const rawAuth = subscription.getKey('auth');
  const auth_key = rawAuth
    ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuth)))
    : '';

  const payload = {
    device_type: 'WEB',
    endpoint: subscription.endpoint,
    p256dh_key,
    auth_key,
  };

  // ৪. জ্যাঙ্গো ব্যাকএন্ডে সাবস্ক্রিপশন সংরক্ষণ
  const response = await subscribeDevicePushApi(payload);
  return response;
};

/**
 * Unsubscribes the current browser device from PushManager.
 */
export const unsubscribeFromPushNotifications = async () => {
  if (!isPushNotificationSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch (err) {
    console.warn('Failed to unsubscribe from push manager:', err);
  }
};

export default {
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
};
