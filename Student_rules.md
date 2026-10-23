STUDENT PORTAL STANDARDS (apply to every page you touch)
1. Role: only STUDENT reaches /student/* via ProtectedRoute. A student sees only their own data; never request other students' data.
2. Audience: 15 to 19 year olds on mid-range Android phones with average connections. Mobile-first at 360 to 390px, one-hand use, thumb-reachable primary actions, touch targets >= 44px, bottom navigation and bottom-sheets, safe-area support.
3. Tone: all text in simple Bangla; friendly, short sentences; Bangla digits for numbers where the app already does so.
4. Data: TanStack Query with src/api/student.js (or the feature's api file). Check if the API function exists before creating one. Read the backend urls.py/views.py/serializers.py of the matching app (read-only) for exact endpoints, filters, field names, permissions and the pagination shape ({count,next,previous,results} vs array); never guess.
5. Every screen needs: shimmer skeleton, friendly empty state (illustration/icon + one line + next action), error state with retry, pull-to-refresh style refetch button, and works offline-gracefully (shows cached data with an "অফলাইন" badge when the request fails, only for non-sensitive public-ish data; never cache invoices/results in the service worker).
6. Forms: Bangla inline validation, submit lock with spinner, success state (not just a toast), map DRF errors to fields, confirm before irreversible submissions.
7. Money, marks and attendance values come from the backend; never recompute official numbers on the client (only clearly labeled previews).
8. Privacy: the student's data is personal; no data in URLs, logs or analytics; "গোপন" features (complaints) never echo content in toasts.
9. Motion: the zero-dependency spring system only (see 02-design-system.md): staggered card entrance, two-phase sheets, sliding tab pill, shimmer skeletons. No GSAP, Lenis or 3D in the student portal. Respect prefers-reduced-motion.
10. Delight with restraint: small celebratory touches are welcome (e.g. a soft confetti-free checkmark animation when all dues are clear, streak/attendance badges), but must be cheap (CSS/SVG only).
11. Do not change existing endpoint payloads. If something needed is missing on the backend, build the UI, stub the API function with a TODO, and list exactly what the backend must add.
12. Keep every file under ~300 lines; extract hooks into src/hooks/ and shared pieces into src/components/student/.

WORKFLOW (mandatory)
Step A: Read the listed files. Output a GAP TABLE: Feature | Status (Present / Partial / Missing) | Evidence (file:line or endpoint) | Proposed work. No code edits yet.
Step B: Wait for my approval.
Step C: Implement approved items only; run npm run build and npm run lint.
Step D: Summarize: files changed, new API functions, backend gaps found.