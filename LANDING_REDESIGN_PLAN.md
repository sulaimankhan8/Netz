# NETZ landing page: redesign plan

Written 2026-10-18. **Status: Q1–Q6 answered (all yes); the board was revised with the owner's additions and is waiting for final approval.** Nothing is built yet.

Board "Netz Landing Redesign": https://claude.ai/artifact/AZGoPGnkdv7ZU8bwCJZZXh. Artboards: 1 audit (L1–L18), 2 look, motion and speed rules, 3 hero animation, 4 laptop page (has a Dark switch), 5 and 6 phone, 7 contour-band background, 8 dark mode, 9 onboarding tours.

## Owner's answers (2026-10-18)

| # | Question | Answer |
|---|---|---|
| Q1 | Drop the 30-second full-screen ad; one labelled inline ad block with reserved height | Yes |
| Q2 | Remove both placeholder sponsor boxes | Yes |
| Q3 | Light page in the Playground/Notes colours, dark with the app's dark setting | Yes |
| Q4 | Stop promising Sign up, Level Up, "Tier 2" and achievements | Yes |
| Q5 | Main button "Open the Playground"; Install second and quieter | Yes |
| Q6 | Footer with a new short Privacy page | Yes |

Additions the owner asked for in the same message:

- **Tour cards for every part of NETZ.** The old eight feature cards become nine cards in the new card style; each opens its page and starts an onboarding tour (Playground, Insert tools, Notes, Notes blocks, Algorithms hub, Gauss–Seidel, Settings, Install). Profile shows "Soon" because the Profile page is still under construction.
- **Floating cards, inspired by the old hero.** Graph, Steps, Tables and Export cards in a pile on a contour-band slab, spreading out as you scroll; tap brings one to the front.
- **The old swirl background, redrawn.** First attempt (contour bands) was rejected by the owner. Artboard 7 now shows six options from the bg1.png colours (A old waves, B horizon, C ripples, D contour lines, E Riemann bars, F dunes) in dark and light; then, from the owner's description ("flowing down", connected top to bottom, growing, nothing repeated), option G (a stroked river) looked bad to the owner; artboard 7b is now option H: the old nested waves bulging in from the left and right edges, then redone (owner: "too distorted, waves not accurate") with the two shapes traced from bg1.png, scaled only evenly, alternating sides with vertical overlap, one flipped and one mirrored for variety, growing 280 → 640 px; same-side overlaps merge band by band. One static SVG, about 3 KB. Facts become small cards and the footer sits on a plain strip. **Waiting for the owner to confirm**, then the landing and dark artboards get redrawn with it.

## Build steps (after approval)

Paths are under `src/app/` unless they say otherwise. The project is not in git: copy every file to the session scratchpad before changing it.

1. **Server page.** `(Primary.pages)/page.js` loses `"use client"`, `next/head`, the 30 s ad timer, the sponsor boxes, the Lottie and KaTeX imports and `h-[1000vh]`. It exports `metadata` (title, description, Open Graph and Twitter image).
2. **Tokens, font, background.** `landing.css` with the `--pg-*` colour values (light and `html.dark`), a faint grid, and the band opacity (0.22 light, 1 dark). DM Sans through `next/font`. `components/landing/Bands.js`: the two contour shapes as inline SVG, `aria-hidden`.
3. **Client parts, kept small.** `HeroDemo.js` (plays once, Replay, pauses off screen, final frame under "reduce motion"; ink is a recorded Playground stroke), `InstallButton.js` (only when `beforeinstallprompt` fired; iPhone/iPad hint otherwise), `MethodTable.js` (three method chips), `FloatingCards.js` (tap to bring forward; the spread is CSS `animation-timeline: view()` with a static fallback; a swipe row under 700 px), `Reveal.js` (one IntersectionObserver, 320 ms fade and 12 px rise, once).
4. **Tour cards.** `components/landing/TourCards.js` reads finished tours from `localStorage` (`netz.tours`) to show "Done · Replay" and "n of 8 tours done". Under 600 px the cards become a list.
5. **Tours system** (board 9). `components/tour/` with one shared bubble in NETZ tokens (light and dark; bottom sheet on phones; Escape, focus kept inside, 44 px buttons) on top of `react-joyride` (already a dependency), a `useTour(id)` hook that starts on `?tour=<id>`, removes the parameter, and saves completion, and `tours.js` listing each tour's steps against `data-tour="…"` targets. New tours: `playground`, `insert` (Playground), `notes`, `blocks` (Notes), `hub` (Algorithms), `settings` (Settings). Gauss–Seidel's existing tour moves onto the shared bubble. The install card stays on the landing page.
6. **Sections** as on board 4: hero, tour cards, floating cards, "Every step, shown", ad block, three facts, closing band, footer with Privacy. New short `(Primary.pages)/Privacy/page.js`.
7. **Third-party scripts.** In `(Primary.pages)/layout.js` load AdSense and Google Tag Manager with `next/script` `strategy="lazyOnload"`. This touches every Primary page: check that the Playground and Notes still load.
8. **Fonts.** Remove the Poppins `@import` from `styles/globals.css` after checking no page uses Poppins.
9. **Left alone:** `primary.css` (other Primary pages use its `bg1.png`), the app shell (`components/layout.js`, `NavBar.js`, sidebar), `steps.js`, `Animation.js`, the Profile page.

## Checks (all at the end, on the production build, port 3211 or higher)

- Page height equals its content; no horizontal scroll at 375 px; headline and main button inside the first phone screen.
- Every link and card leads somewhere other than `/`; each tour card opens its page and its tour starts, can be skipped with Escape, and shows a tick on the landing page when finished.
- Light and dark both match the board; the bands never sit under text.
- Floating cards: spread on scroll in Chrome and Edge, already spread elsewhere and under "reduce motion"; swipe row on phones.
- No ad or analytics request before the page is idle; no Lottie, KaTeX or Poppins requested.
- Lighthouse (mobile): LCP under 2.0 s, CLS under 0.05; keyboard reaches every control; text contrast at least 4.5 : 1.

## Built 2026-10-18

The owner approved artboard 4 and asked to **keep the original background** (bg1.png) instead of the redrawn options (artboards 7 and 7b are therefore not used).

What was built:

- `src/app/(Primary.pages)/page.js` is now a server page with real `metadata`; `/Home` renders it too (its `"use client"` was removed).
- `src/app/(Primary.pages)/landing.css`: `ld-` classes and tokens (light, and `html.dark`). The original art is the page background (`public/bg1.webp`, a WebP copy of `bg1.png` at 76 KB instead of 223 KB, PNG as fallback), repeating down the page; 0.28 strength in light mode, full strength in dark.
- `src/app/components/landing/`: `fonts.js` (DM Sans, DM Mono, Caveat via next/font), `icons.js`, `HeroDemo.js`, `install.js` (shared install prompt store, hint for iPhone/iPad/Safari/Firefox, hidden when installed), `TourCards.js` (9 cards, reads `netz.tours` and `gaussSeidelTourCompleted`), `FloatingCards.js`, `MethodTable.js`, `RevealObserver.js`, `AdSlot.js`.
- `src/app/(Primary.pages)/Privacy/page.js`: short privacy notice (no contact address yet: the owner should add one).
- `(Primary.pages)/layout.js`: AdSense and Google Analytics now load with `next/script` `lazyOnload`, after the page.
- `styles/globals.css`: Poppins import removed (nothing used it).

Differences from the board:

- Background: the original bg1.png, not the redrawn bands.
- Dark mode: text that sits straight on the background gets a soft dark panel (like the old hero's translucent box), because the bright bands made some text hard to read.
- Floating cards: no band slab behind them; they sit on the original background. On phones the heading comes before the swipe row.
- The hero handwriting uses the Caveat font with a left-to-right wipe, not a recorded Playground stroke.
- The tour count reads "n of 7 tours done" (the install card is not a tour).
- **The tours themselves are not built here.** The cards link to `?tour=<id>`; only Gauss–Seidel has a tour today. They were proposed as a separate session ("Build NETZ onboarding tours for the landing cards").

Checks: `tests/browser/landing.mjs` against `next start -p 3213` on the production build: 27/27 (page height, links, metadata, deferred third-party scripts, no Poppins/Lottie/KaTeX, method chips, floating cards, install hint, hero replay, dark mode, done states, scroll spread, reduce motion, phone layout and 44 px targets, Privacy page, no page errors). Screenshots in `tests/browser/shots/landing-*.png`. Not measured: Lighthouse on a real phone.
