/**
 * Starlight College ERP - Centralized Motion & Animation Design System
 * Built on Framer Motion with hardware-accelerated transforms and zero-delay easing.
 */

/* ------------------------------------------------------------------ */
/* 1. Core Spec Tokens (Single Source of Truth)                        */
/* ------------------------------------------------------------------ */

export const DURATION = {
  instant: 0.12, // 120ms (press, hover)
  fast: 0.2,     // 200ms (small state change, tab crossfade)
  base: 0.28,    // 280ms (cards, tabs)
  slow: 0.38,    // 380ms (modals, page-level)
  exitFast: 0.14, // ~30% faster than fast (200ms)
  exitBase: 0.19, // ~30% faster than base (280ms)
};

export const EASE = {
  out: [0.22, 1, 0.36, 1],    // Entering: smooth natural decel curve
  in: [0.4, 0, 1, 1],         // Leaving: crisp exit curve
  inOut: [0.4, 0, 0.2, 1],
};

export const SPRING = {
  snappy: { type: 'spring', stiffness: 420, damping: 34 }, // Tabs, pills, toggles
  soft: { type: 'spring', stiffness: 260, damping: 28 },   // Sheets, modals
};

/* ------------------------------------------------------------------ */
/* 2. Legacy Token Exports (Preserved for existing screens)            */
/* ------------------------------------------------------------------ */

export const EASINGS = {
  easeOut: EASE.out,
  easeIn: EASE.in,
  easeInOut: EASE.inOut,
  springTactile: SPRING.snappy,
  springBouncy: { type: 'spring', stiffness: 350, damping: 25 },
  snappy: SPRING.snappy,
  soft: SPRING.soft,
};

export const DURATIONS = {
  instant: DURATION.instant,
  fast: DURATION.fast,
  normal: DURATION.base,
  base: DURATION.base,
  gentle: DURATION.slow,
  slow: DURATION.slow,
};

/* ------------------------------------------------------------------ */
/* 3. Standardized Variants (Supports both initial/animate & hidden/visible) */
/* ------------------------------------------------------------------ */

export const fade = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.exitFast, ease: EASE.in },
  },
  // Aliases for components using hidden/visible (e.g., Staff360Modal)
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
};

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: DURATION.exitFast, ease: EASE.in },
  },
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.97 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRING.soft,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: DURATION.exitFast, ease: EASE.in },
  },
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.soft,
  },
};

export const sheetUp = {
  initial: { opacity: 0, y: 32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: SPRING.soft,
  },
  exit: {
    opacity: 0,
    y: 32,
    transition: { duration: DURATION.exitBase, ease: EASE.in },
  },
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING.soft,
  },
};

// Stagger container: 0.04s step, capped in components to first 8 items (~0.34s total)
export const stagger = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.exitFast, ease: EASE.in },
  },
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

// Error feedback horizontal shake (3 steps, 300ms)
export const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.3, ease: EASE.out },
  },
};

/* ------------------------------------------------------------------ */
/* 4. Named Route, Tab, List & Modal Variants (Backward-Compatible)    */
/* ------------------------------------------------------------------ */

// Route & Page Transitions (250ms, 8px rise)
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.17, ease: EASE.in },
  },
};

// Tab Panel Transitions - Instant switch without fade or y-shift
export const tabContentVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0 } },
  exit: { opacity: 1, y: 0, transition: { duration: 0 } },
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};

// List & Card Stagger Animations
export const staggerContainerVariants = stagger;

export const staggerCardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: DURATION.exitFast, ease: EASE.in },
  },
};

// Modal & Dialog Transitions (Backdrop 200ms, Dialog scales 0.97 -> 1 with soft spring)
export const modalBackdropVariants = fade;
export const modalDialogVariants = scaleIn;

/* ------------------------------------------------------------------ */
/* 5. Interactive Micro-interactions Props                             */
/* ------------------------------------------------------------------ */

export const tapScale = {
  scale: 0.97,
  transition: { duration: DURATION.instant, ease: EASE.out },
};

export const cardHoverProps = {
  whileHover: { y: -3, transition: { duration: DURATION.fast, ease: EASE.out } },
  whileTap: { scale: 0.985, transition: { duration: DURATION.instant, ease: EASE.out } },
};

export const buttonTactileProps = {
  whileTap: tapScale,
};