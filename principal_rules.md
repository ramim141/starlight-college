PRINCIPAL PANEL STANDARDS (apply to every page you touch)
1. Role: only PRINCIPAL reaches /principal/* (ProtectedRoute). Never show other roles' data here.
2. Page shell: consistent header (Bangla title, one-line purpose, primary action), then content. Use the existing DashboardLayout; do not create a second layout.
3. Data: TanStack Query. All requests through src/api/principal.js, src/api/adminFinance.js or the relevant api file. Check whether the needed function already exists before writing a new one. Read the backend urls.py/views.py/serializers.py of the matching app (read-only) to get exact endpoints, fields, filters and permissions: never guess.
4. Every list screen needs: skeleton (shimmer), empty state with a short Bangla message, error state with retry, search and filters where the backend supports them, pagination or infinite scroll (backend default page size is 20, responses may be {count, next, previous, results}), and manual refresh.
5. Every approve/reject/delete/resolve action needs: a confirm step (two-phase modal or bottom-sheet), a required reason field for rejections, button spinner and lock during the request, toast on success/failure in Bangla, and cache invalidation of affected queries (including the dashboard counts).
6. Money values: show exactly what the backend returns, formatted with Bangla digits and ৳, never recompute totals on the client except for a clearly labeled preview.
7. Dates and times: Bangla locale, Asia/Dhaka.
8. Mobile first: below md render cards instead of wide tables, bottom-sheets instead of centered modals, sticky action bar for primary actions, touch targets >= 44px. Desktop: tables with sticky header.
9. Sensitive data: the principal may see identities hidden from others (e.g. anonymous complaints); show a visible badge and never copy that data into notifications or logs.
10. Do not change existing endpoints' payloads. If something needed is missing on the backend, build the UI, stub the API function with a TODO and list exactly what the backend must add.
11. Large components stay under ~300 lines per file; extract hooks into src/hooks/.
12. Keep design system (02-design-system.md): navy/orange, spring easing, two-phase modals, shimmer skeletons.

WORKFLOW (mandatory)
Step A: Read the listed files. Output a GAP TABLE: Feature | Status (Present / Partial / Missing) | Evidence (file:line or endpoint) | Proposed work. Do not edit code yet.
Step B: Wait for my approval of the table.
Step C: Implement approved items only, then run npm run build and npm run lint.
Step D: Give a short summary: files changed, new API functions, backend gaps found.