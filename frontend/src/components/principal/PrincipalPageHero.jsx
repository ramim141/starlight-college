import React from 'react';
import { GraduationCap } from 'lucide-react';

/** Shared Principal page heading inspired by the Academic Control Hub. */
const PrincipalPageHero = ({
  icon: Icon = GraduationCap,
  eyebrow = 'অধ্যক্ষ প্রশাসন',
  title,
  englishTitle,
  description,
  topActions,
  footer,
  children,
  className = '',
}) => (
  <section className={`relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#0A2147] via-[#0F2C59] to-[#173D70] px-5 py-6 text-white shadow-[0_18px_42px_-28px_rgba(10,33,71,0.75)] sm:px-7 sm:py-7 lg:px-8 ${className}`}>
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
    <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[66%] opacity-80" viewBox="0 0 600 300" preserveAspectRatio="none">
      <defs><linearGradient id="principal-page-hero-arc" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FF6A1A" stopOpacity="0" /><stop offset="0.58" stopColor="#FF6A1A" stopOpacity="0.85" /><stop offset="1" stopColor="#FFB067" stopOpacity="0.18" /></linearGradient></defs>
      <path d="M0 300 C 160 130, 380 40, 600 18" fill="none" stroke="url(#principal-page-hero-arc)" strokeWidth="3" />
      <path d="M0 300 C 200 170, 400 90, 600 64" fill="none" stroke="url(#principal-page-hero-arc)" strokeWidth="1.5" opacity=".55" />
    </svg>
    <div className="relative z-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.07] px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm"><Icon className="h-4 w-4 text-brand-orange" aria-hidden="true" />{eyebrow}</span>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">{title}{englishTitle && <span className="mt-1 block text-brand-orange">{englishTitle}</span>}</h1>
          <svg aria-hidden="true" viewBox="0 0 300 12" className="mt-1 h-3 w-40 sm:w-56"><path d="M2 8 C 80 2, 200 2, 298 8" stroke="#FF6A1A" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
          {description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">{description}</p>}
        </div>
        {topActions && <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-2.5 md:justify-end">{topActions}</div>}
      </div>
      {footer && <div className="mt-5 border-t border-white/15 pt-4">{footer}</div>}
      {children && <div className="mt-5 flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  </section>
);

export default PrincipalPageHero;
