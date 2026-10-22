# NETZ launch checks (NETZ_LAUNCH_PLAN.md section 7)

Run on **2026-10-20** after sections 2–6 were built, against the production build (`next build` + `next start`)
and a throwaway Postgres in Docker. What needs the owner's accounts is marked **waiting on owner**: those parts
are built and tested locally, but not against the real services yet (`NETZ_OWNER_TODO.md`).

## Summary

| Area | Result |
| :--- | :--- |
| Node tests (26 files) | all pass |
| Database tests (Postgres in Docker) | `sync-db` 19/19, `billing-db` 18/18 |
| All 34 solver pages report the right task | all match (34 pages, 34 one-method tasks, right units, no gaps or duplicates) |
| Lint, whole project | clean |
| Production build | passes, 67 pages |
| Touch and pen browser suites (17) | see the 2026-10-21 run below |
| Public note page in the browser | works: note, author, live solver, quiz, no ads |
| Phone width 375 px, dark and light | no sideways scroll on 12 key pages |
| Mascot at 32 px and 300 px | clear on dark and light, with hats |
| Google sign-in, real Razorpay, real ads | **waiting on owner** |

## Section 7, item by item

**Tasks** — each of the 50 + 5 finishes from the right activity; a repeat gives 5 gems once per day; pressing
Calculate many times gives nothing extra; the 60-gem cap holds.
Covered by `test_progress_engine.mjs` (25), `test_progress_sync.mjs` (18, "gem cap still holds on the server"),
and the new solver check: every solver page reports the method and unit its task expects.

**Streak** — a day counts with 1 task; a missed day uses a freeze; with no freeze it goes back to 0 and medals stay;
time zones; the monthly medal on the 20th day. Covered by `test_progress_engine.mjs` ("missed day ends the
streak", "freeze used and streak reaches 10", "month medal on the 20th day") and `test_progress_sync.mjs`
("dayAt uses the student time zone"). Real midnight on a real device: not checked by hand.

**Server** — a changed `localStorage` gem number is fixed by the server ("faked gem number ignored"); shop buys
cannot go below 0 gems (`test_shop.mjs`, `sync-db`: two buys at once charge once); the same webhook sent twice
gives Pro only once (`billing-db`: duplicate, three in parallel, forged signature refused).

**Pro yearly** — a 1-month Pro member who does all 10 Pro tasks keeps the skin, banner and medal after Pro ends
(`test_pro.mjs` 22: all 10 within one month, rewards at 3/6/10, kept after Pro ends, nothing new counts after).

**Sign-in** on phone, tablet and laptop; first sign-in keeps every device note — **waiting on owner** (Supabase and
Google setup, `NETZ_OWNER_TODO.md` C, F). The sync logic is covered by `test_progress_sync`, `test_notes_sync` and `sync-db`.

**Public note** opens without signing in; solvers and quizzes work there — checked in the browser on the production
build against the test database (`/p/newton-raphson-x7k2`): Newton-Raphson solver gives root ≈ 2.706528 in 4 steps,
the quiz answers "Correct", "Copy to my notes" is there, no ad script.

**Razorpay test mode** (monthly, yearly, lifetime, cancel, international card) — **waiting on owner** (keys and
plans, `NETZ_OWNER_TODO.md` D, F). Webhook handling is covered by `test_billing` (28) and `billing-db` (18);
with no keys the routes answer "not configured" and a forged webhook is refused.

**Ads** — free users only see ads in the allowed places; never on Pricing, the Playground or shared notes; no
full-screen ad before 15 active minutes; rewarded gems at most 3 a day (`test_ads.mjs` 15; in the browser the
AdSense script is absent on Pricing and the Playground and there is one ad place on each allowed page). "No ad script
for Pro" and real ads — **waiting on owner** (needs a signed-in Pro account and the AdSense / Ad Manager units).

**Art** — light and dark, 32 px and 300 px mascot, phone width with no sideways scroll: checked (above).

**Existing browser harness** (`tests/browser`, touch + pen): see the 2026-10-21 run below.

## Fixed during this run

- `test_equations.mjs` expected every item in WPS's chemistry list to be a `\ce{}` reaction, but the list (copied
  from WPS) also has ordinary formulas such as pV = nRT. The data was right; the check now tests that reactions use
  `\ce{}` and no maths or physics item does.
- Three lint errors in older solver-page text (a plain `'`): Newton-Raphson's table heading is now f′(xₙ) with a
  real prime, and "Simpson’s Rule", "iteration’s values" use the typographic apostrophe.
- The production build regenerates `public/sw.js` and its workbox files; the committed copies were put back
  afterwards so the build left no changes.

## Run of 2026-10-21 (owner decisions, code and LaTeX export, ink over blocks)

Production build of the working copy (built in a scratch copy, served on port 3211) and, for comparison,
a production build of the last commit `8407317` (port 3212).

| Check | Result |
| :--- | :--- |
| Node tests (27 files, incl. new `test_code_export.mjs`) | all pass; code export 650/650: all 34 methods in 6 languages, Python, JavaScript, C++ (`-Wall -Werror`) and Go compiled and run, same answer in each and as on the pages. Rust and MATLAB are generated only (no compiler here). |
| `test_shop.mjs` | 24/24, incl. year badge for 1,500 gems, only in its year, once |
| Lint, whole project | 0 errors (5 old warnings) |
| Production build | passes |
| New `tests/browser/exports.mjs` | 41/41: Pro lock for free, code in 6 languages from the page inputs, LaTeX with tables, phone menu, 17 method pages, Notes LaTeX, graph under the ink, Select lifts it, LaTeX button in the page menu |
| blocks, touch-blocks, export, notes-export, ux-fixes | all pass |
| visual 81/88, algorithms 32/33, notes 51/54, shell-phone (/Profile menu), screens (one save error), insert-equations, insert-shapes-format | same failures on the last commit's build: older, not from this work |
| visual: "graph: a mouse over the plot shows the values there" | **new**: a graph now sits under the ink by default ("Draw on it" on), so the pointer reaches the ink layer, not the plot. Owner to choose: graphs off by default, or keep. |

Not checked: the LaTeX files with a real LaTeX compiler (none installed here); Rust and MATLAB code with their compilers.
