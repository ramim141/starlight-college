/**
 * Cross-tab authentication event synchronization utility.
 * Uses BroadcastChannel when supported, falling back to window storage events.
 */

const CHANNEL_NAME = 'starlight_auth_sync';
const STORAGE_SYNC_KEY = 'starlight_auth_sync_event';

let channel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    channel = null;
  }
}

/**
 * Broadcast an authentication event to all other open tabs.
 * @param {'LOGIN' | 'LOGOUT' | 'SESSION_EXPIRED'} type
 * @param {any} payload
 */
export const broadcastAuthEvent = (type, payload = null) => {
  const message = { type, payload, timestamp: Date.now() };

  if (channel) {
    try {
      channel.postMessage(message);
      return;
    } catch {
      // Fallback to storage event below if channel post fails
    }
  }

  // Fallback via localStorage for environments without BroadcastChannel
  try {
    localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(message));
    setTimeout(() => {
      try {
        localStorage.removeItem(STORAGE_SYNC_KEY);
      } catch {
        // Ignored
      }
    }, 100);
  } catch {
    // Storage might be disabled in private mode
  }
};

/**
 * Subscribe to auth events triggered by other tabs.
 * @param {(event: { type: string, payload: any }) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const subscribeAuthEvents = (callback) => {
  if (typeof window === 'undefined') return () => {};

  if (channel) {
    const handleChannelMessage = (event) => {
      if (event?.data && typeof callback === 'function') {
        callback(event.data);
      }
    };
    channel.addEventListener('message', handleChannelMessage);
    return () => {
      channel.removeEventListener('message', handleChannelMessage);
    };
  }

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_SYNC_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (typeof callback === 'function') {
          callback(data);
        }
      } catch {
        // Ignored
      }
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('storage', handleStorageEvent);
  };
};

export default { broadcastAuthEvent, subscribeAuthEvents };
