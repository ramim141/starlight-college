import React from 'react';

const CustomMotionStyles = () => (
  <style>{`
    @keyframes shimmerSweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .shimmer-box {
      position: relative;
      overflow: hidden;
      background-color: #E2E8F0;
    }
    .shimmer-box::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.7) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    .shimmer-dark {
      position: relative;
      overflow: hidden;
      background-color: rgba(255, 255, 255, 0.08);
    }
    .shimmer-dark::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.16) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmerSweep 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes tickerMarquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-smooth-marquee {
      display: inline-flex;
      white-space: nowrap;
      animation: tickerMarquee 34s linear infinite;
    }
    .animate-smooth-marquee:hover {
      animation-play-state: paused;
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(-6deg); }
      50% { transform: translateY(-8px) rotate(-3deg); }
    }
    .animate-float-cap {
      animation: floatSlow 6s ease-in-out infinite;
    }
    @keyframes heroReveal {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .hero-stagger-1 { animation: heroReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
    .hero-stagger-2 { animation: heroReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
    .hero-stagger-3 { animation: heroReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both; }
    .hero-stagger-4 { animation: heroReveal 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both; }
    .hero-stagger-5 { animation: heroReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both; }
    .hero-image-skeleton {
      background:
        linear-gradient(112deg, rgba(7, 28, 61, 0.98) 0%, rgba(12, 48, 93, 0.86) 48%, rgba(15, 52, 91, 0.62) 100%),
        #071c3d;
      overflow: hidden;
    }
    .hero-image-skeleton::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(100deg, transparent 25%, rgba(255, 255, 255, 0.08) 50%, transparent 75%);
      animation: shimmerSweep 1.8s ease-in-out infinite;
    }
    html { scroll-behavior: smooth; }
    [data-home-reveal] {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
      transition: opacity 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    [data-home-reveal].is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
    :where(a, button, input, select, textarea, [role="button"]):focus-visible {
      outline: 3px solid rgba(255, 107, 0, 0.8);
      outline-offset: 3px;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
      [data-home-reveal] { opacity: 1 !important; transform: none !important; }
    }
  `}</style>
);

export default CustomMotionStyles;