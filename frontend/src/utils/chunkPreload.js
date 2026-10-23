/**
 * Idle-time dynamic chunk preloader.
 * Preloads high-probability next chunks (e.g. role dashboard after login)
 * when the browser main thread is idle, without competing with critical rendering.
 */
export const preloadChunk = (importFn) => {
  if (typeof window === 'undefined') return;

  const runner =
    window.requestIdleCallback ||
    ((cb) => setTimeout(cb, 120));

  runner(() => {
    try {
      importFn().catch(() => {
        // Silently swallow prefetch network errors; normal navigation handles errors.
      });
    } catch {
      // Ignored
    }
  });
};

export default preloadChunk;
