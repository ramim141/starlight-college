# Project Rules for Antigravity (save as AGENTS.md or in the rules folder)

## Project
Starlight College Portal, a paperless college ERP. Monorepo: `backend/` (Django 5 + DRF + SimpleJWT) and `frontend/` (React 19 + Vite + Tailwind v4 + JavaScript/JSX).
Roles: PRINCIPAL, TEACHER (some are section in-charges), ACCOUNTANT, STUDENT. API base: `/api/v1/` (auth, academics, operations, finance, examination, library, system).
Most users are on mobile phones with average connections in Bangladesh.

## Golden rules
1. This is an EXISTING app. Read the relevant files first. NEVER rewrite a whole file or page from scratch unless the task says so.
2. Preserve all business logic, API payloads, endpoints, state handlers, route paths and Bangla text.
3. Work on ONE task at a time. Show a plan first and wait for approval before editing.
4. Do not install a new dependency without asking, and state its size and why.
5. Do not touch `backend/` unless the task explicitly says so.
6. After every task run `cd frontend && npm run build && npm run lint` and fix errors you introduced.

## Stack and conventions
- Language: JavaScript + JSX (do not convert to TypeScript).
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`). Use utility classes. Palette: see `02-design-system.md`.
- Data fetching: TanStack Query. All HTTP goes through `src/api/*.js` using `src/api/client.js`. Components must not call axios directly.
- Icons: lucide-react. Toasts: sonner.
- Animation split:
  - Framer Motion and the zero-dependency CSS spring engine (`utils/motion.js`, `CustomMotionStyles`) for component-level motion everywhere.
  - GSAP + ScrollTrigger and Lenis ONLY on the public site (`src/pages/public/`, `src/components/public/`), lazy-loaded.
  - Never animate the same element with two engines.
  - NO Lenis, NO GSAP, NO 3D inside dashboards (`/student`, `/teacher`, `/accountant`, `/principal`).
- All user-facing text is Bangla. Bangla headings need `line-height` 1.3 to 1.4 so matra and conjuncts are not clipped.
- Respect `prefers-reduced-motion` for every non-trivial animation.

## Performance rules
- Route-level code splitting with `React.lazy`. Heavy libs (charts, GSAP, three) load only where used.
- Animate only `transform` and `opacity`. No layout-thrashing animations.
- Every `useEffect` that adds listeners, timers, GSAP contexts, observers or subscriptions must clean up.
- Lists from the API are paginated (default 20): use pagination or infinite query.
- Touch targets at least 44px. Support safe-area insets on mobile.

## Security rules
- Never log tokens or personal data. Never commit `.env`.
- Role checks in the UI are for UX only, never rely on them for security.
- Public forms need a honeypot field and submit-button lock; real rate limiting is a backend job.

## Definition of done (every task)
- [ ] `npm run build` and `npm run lint` pass with no new warnings
- [ ] No console errors on the changed screens
- [ ] Verified at 375px and 1280px widths
- [ ] No behavior or API payload changes unless the task asked for them
- [ ] Short summary of changed files given at the end