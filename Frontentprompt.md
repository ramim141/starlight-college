Act as a Principal Frontend Architect and UI/UX Motion Designer specializing in React.js, Tailwind CSS, and Lucide Icons. 

Please design/redesign the requested component/page with an Enterprise SaaS & Modern EdTech aesthetic. You MUST strictly enforce the following UI, Responsive, and Zero-Dependency Motion Engineering rules:

### 1. ZERO-DEPENDENCY SPRING PHYSICS (NO EXTERNAL PLUGINS)
- Do NOT rely on `tailwindcss-animate` classes (like `animate-in`, `fade-in`, `zoom-in`) because they fail if the plugin is missing.
- Instead, inject a `<CustomMotionStyles />` `<style>` block or inline styles using Apple-grade spring curves: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Use GPU-accelerated properties (`transform: translate3d / translateX / translateY / scale`, and `opacity`) for 60fps silky-smooth animations.

### 2. SMOOTH TAB & VIEW SWITCHING (NO LAYOUT JUMPS)
- Segmented Controls / Tabs MUST feature an animated sliding background pill (`translateX(0%)` to `translateX(100%)` with `transition: transform 450ms cubic-bezier(0.22, 1, 0.36, 1)`).
- Never abruptly unmount/mount tab panels with different heights. 
- Keep panels mounted inside a `relative overflow-hidden` wrapper, measure the active panel's `scrollHeight` via `useRef` + `useEffect`, and smoothly transition the parent container's `height` (`transition: height 420ms cubic-bezier(0.22, 1, 0.36, 1)`).
- Transition panels horizontally (`translateX(-104%) scale(0.98)` <-> `translateX(0%) scale(1)` <-> `translateX(104%) scale(0.98)`) with simultaneous `opacity` crossfade and `pointerEvents` toggling.

### 3. TWO-PHASE MODAL & DRAWER MOTION (ENTER + EXIT ANIMATION)
- Never use a single boolean (`showModal && <Modal />`) that snaps out of the DOM immediately on close.
- Always implement a Two-Phase State (`isMounted` + `isVisible`):
  - **Open:** Set `isMounted(true)`, then inside a double `requestAnimationFrame`, set `isVisible(true)`.
  - **Close:** Set `isVisible(false)`, then wait `320ms` (`setTimeout`) before setting `isMounted(false)`.
- **Responsive Modal UX:** Render as a bottom-sheet (`items-end`, `rounded-t-3xl`, drag handle indicator, `translateY(36px)`) on mobile, and a centered dialog (`sm:items-center`, `sm:rounded-3xl`, `scale(0.95)` to `scale(1)`) on desktop, with Escape key and backdrop-click support.

### 4. GLOSSY SHIMMER SKELETON LOADING
- Avoid flat, boring `animate-pulse` gray boxes for initial page loads or data fetching.
- Build a dedicated Skeleton Loader component matching the exact responsive layout (mobile & desktop) using a custom CSS `@keyframes shimmerSweep` gradient wave (`translateX(-100%)` to `translateX(100%)`).

### 5. MICRO-INTERACTIONS & FORM ERGONOMICS
- Wrap inputs in a `group` container. On focus (`group-focus-within`), smoothly animate the leading icon's color and scale (`group-focus-within:text-orange-600 group-focus-within:scale-110 transition-all duration-200`) and apply a soft focus ring (`focus:ring-4 focus:ring-orange-500/10 focus:bg-white`).
- Buttons must have tactile press feedback (`active:scale-[0.98]`), smooth hover elevation, animated trailing icons (`group-hover:translate-x-1`), and an inline spinner state during async submission (`isSubmitting`).

### 6. ADAPTIVE RESPONSIVE ARCHITECTURE (320px Mobile to 4K Desktop)
- **Color Palette:** Deep Navy (`#0F2C59`), Vibrant Orange (`#EA580C` / `amber-600`), Emerald accents (`#10B981`), and Slate surfaces (`#F8FAFC`). Always use safe hex/Tailwind classes so UI never breaks if custom config tokens are missing.
- **Mobile First:** Optimize padding, touch targets (min `44px` height), and stack grids cleanly on small screens (`320px+`), while expanding into balanced multi-column Bento/Split layouts (`grid-cols-12`) on `sm` and `lg` viewports.
- Preserve all existing business logic, API payloads, state handlers, and Bangla typography clarity.

Now, apply all the rules above to build/redesign the following page/component:
[আপনার পেজের কোড বা রিকোয়ারমেন্ট এখানে পেস্ট করুন]