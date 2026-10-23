import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollManager
 * Handles smooth hash-scrolling and instantaneous scroll-to-top on route change.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Allow slight frame delay for DOM nodes to be rendered
      const frame = requestAnimationFrame(() => {
        const id = hash.replace('#', '');
        const el = document.getElementById(id) || document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
      return () => cancelAnimationFrame(frame);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
