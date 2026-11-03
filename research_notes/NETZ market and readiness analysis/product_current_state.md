# NETZ product: current state, gaps and launch blockers (audit of local code + docs, 2026-11-03)

Method: read-only audit of `C:\Users\Sulaiman\Desktop\netz1\Netz` (src tree, supabase/, package.json, public/, ~40 plan .md files, test files, git log) and `..\NETZ_SOCIAL_SERIES.md`. Sources are local file paths, all relative to `Netz/` unless stated. Nothing was run (no dev server, no tests), so "works" means "built and reported as checked in the project's own check logs", not independently re-verified. Git: 192 commits, first 2024-09-17, latest `d0b718a` on 2026-11-03; working tree clean at audit time.

## 1. What features/modules exist and work today

### Takeaway
NETZ is far more built than its older roadmap docs claim: 34 numerical-methods solver pages with steps/graphs/tables and Pro code/LaTeX export, a touch-first handwriting whiteboard (Playground) with 3 on-device ONNX models and WPS-style insert tools, a block Notes app with tables/quiz/assets/publishing, a full tasks/streaks/medals/gems system with shop and robot mascot, Supabase sign-in/sync, Razorpay billing and an ads stack. Nearly all of it is code-complete; what is missing is real-world switch-on (live payments, AdSense) and real-device testing.

### Cited Findings
**App shell / stack**
- Next.js 16.3, React 18.3, Supabase (`@supabase/ssr`, `supabase-js`), Drizzle + `postgres`, `onnxruntime-web` 1.30, MathLive 0.111, KaTeX, mathjs, nerdamer, Chart.js, jsPDF, pdfjs, `@ducanh2912/next-pwa` + Workbox, `@vercel/analytics`, `@vercel/speed-insights`, `next-sitemap`; Node ≥22 — [package.json](package.json)
- Routes: `(Primary.pages)` = Home, Algorithems (hub), Notes, Playground (+ `/Playground/collect`), Pricing, Profile, Setting, Contact, Privacy, Refund, Terms, offline, `p/[slug]` (public notes); `(pages.algorithems)` = UNIT-1..UNIT-5 method pages; `auth/callback` — [src/app/](src/app)
- API routes: `api/ads/reward`, `api/billing/{start,status,cancel,webhook}`, `api/health`, `api/notes/{assets,publish,published,sync,unpublish}`, `api/progress/sync`, `api/shop/{buy,equip}` — [src/app/api/](src/app/api)
- Supabase migrations: progress (2026-10-19), notes, public_notes, billing, note_assets (2026-10-24) — [supabase/migrations/](supabase/migrations)

**Algorithm Hub / solver pages (34)**
- 34 `page.js` method pages under UNIT-1..5 (list in section 2) — [src/app/(pages.algorithems)/](src/app/(pages.algorithems))
- Shared components: `AlgorithmNavigation`, `ConvergenceBanner`, `LongTables` (first 15/last 5 rows + "Show all"), `MatrixInputGrid`, `DataPointsInput`, `UnifiedPlot`, `FitMath`, editorial step viewer/sidebar/export — [src/app/components/](src/app/components)
- Code export: one description per method compiled to Python, MATLAB, C++, JavaScript, Rust, Go on all 34 pages; LaTeX export on solver pages, Notes and Playground; both Pro-only; `test_code_export.mjs` 650/650 (Python/JS/C++/Go compiled and run with same answers; Rust/MATLAB generated but not compiled) — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md), [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §A, [src/app/utils/codeExport/](src/app/utils/codeExport)
- Worst-case input audit 2026-11-03: 15 findings (e.g. root finders showed green "convergence reached" for x²+1 with no real root; RK with 10,000 steps froze tab; Simpson n=10,000 froze ~7 s; matrix cells clipped on phones) all reported fixed same day; 63 worst-case browser runs no freezes; 2,000-step caps added; "Not done: optional Simpson accuracy hint" — [METHOD_PAGES_WORST_CASE_REPORT.md](METHOD_PAGES_WORST_CASE_REPORT.md)
- Algorithm audit findings all fixed 2026-10-18; registry duplicates engines (memory note) — [ALGORITHM_STEPS_AUDIT.md](ALGORITHM_STEPS_AUDIT.md)
- Phone layout for all 34 pages via one CSS layer (`alg.css .alg-body`) + FitMath, 2026-11-02 — user memory index (MEMORY.md "NETZ method pages on phones")
- Algorithm Hub redesign was reverted 2026-10-22 (owner disliked it); old editorial pages are live — MEMORY.md; [ALGORITHM_HUB_REDESIGN_PLAN.md](ALGORITHM_HUB_REDESIGN_PLAN.md)

**Playground (handwriting whiteboard)**
- Infinite page; 3 on-device models (router 0.4 MB, maths HMER 28.4 MB, text HTR 7.4 MB) + ~28 MB ONNX wasm runtime; typed blocks (equation, graph, text, image, audio, table); live "=" answers; undo/redo; eraser; lasso; highlighter; pressure pen; SVG/PNG/PDF export; offline cache cut 142.7 MB → 7.4 MB; 3,000-stroke page pen-up freeze 460–820 ms → <100 ms — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §5; [public/models/](public/models)
- Touch-first: every pointer draws, two-finger pan/pinch, palm guard, 2-finger-tap undo / 3-finger redo, ≥44 px targets, phone compact dock, bottom-sheet dialogs; screens.mjs: 0 off-screen / 0 under 44 px at 390×844, 844×390, 820×1180, 1366×768 — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §6 B1–B5, B8
- Models are not fetched before the first stroke; MB progress, Retry on failure, Save-Data prompt (B9 "mostly done", not measured on a real phone) — same, B9
- Insert tools copying WPS Office: 187 Office preset shapes, format bar (42 styles, outlines, shadows, text), Symbol menu with 4,296 characters in 31 Unicode subsets — [PLAYGROUND_INSERT_TOOLS_PLAN.md](PLAYGROUND_INSERT_TOOLS_PLAN.md) §11. Plan says Equation (step 4), Screenshot (5), Arrange (6) "still to do" as of 2026-10-16, but `Playground/components/equation/` and `screenshot/` folders and `tests/browser/insert-equations.mjs` / `insert-screenshot.mjs` / `insert-shapes-arrange.mjs` exist, and launch checks on 2026-10-21 ran insert-equations (32/35) — so the plan's progress table is stale — [src/app/(Primary.pages)/Playground/components/](src/app/(Primary.pages)/Playground/components); [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)
- Per-block "Draw on it" (ink over pictures/graphs) built 2026-10-21 — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) C2
- Rule: no Google handwriting endpoint in the app (only in `benchmark_recognition.mjs --google`); maths model frozen — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §2

**Notes**
- Block editor with KaTeX, embedded live solver widgets (AlgorithmPicker/EmbeddedMathWidget), QuizBlock, ink sketch block, slash menu, share modal, cloud status, Training data panel — [src/app/(Primary.pages)/Notes/components/](src/app/(Primary.pages)/Notes/components)
- Built 2026-10-25: `.netz` file format (Pro), exports Markdown/HTML/LaTeX .zip/.netz, Assets library (PDF viewer, board render, Playground "Save to Notes Studio"), Insert from file, Writing mode reading each line with the text model, Tables in Notes and Playground — [NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md](NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md)
- Public notes at `/p/[slug]` work on a production build against a test DB: live Newton-Raphson solver, quiz, "Copy to my notes", no ads — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)

**Rewards (tasks, streaks, medals, gems, shop, mascot)**
- No XP/levels; 50 tasks + 5 onboarding + 20 streak medals = 75 permanent medals, plus monthly medals (20 active days) and a year badge (1,500 gems in the shop); daily goal (3 tasks); streak freeze; robot mascot "Bolt" with 9 skins and banners; 10 Pro tasks per year (banner at 3, skin at 6, medal at 10, kept forever) — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §0–2, §8; [NETZ_TASK_SHEET.md](NETZ_TASK_SHEET.md); [src/app/utils/progress/](src/app/utils/progress); [src/app/components/mascot/](src/app/components/mascot)
- Gem economy: first-time task 20, repeat 5 (once/day/task), onboarding 25, daily goal +15, monthly medal 200, rewarded ad 10 (max 3/day), cap 60/day on repeats+goal; freeze 200 gems (task sheet) — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §2.5; [NETZ_TASK_SHEET.md](NETZ_TASK_SHEET.md)
- Server is authoritative for gems/streaks (faked localStorage gem number ignored; concurrent shop buys charge once) — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)

**Auth, sync, payments, ads**
- Google sign-in via Supabase, Mumbai region; all migrations except `note_assets` run; Vercel env vars set; GitHub Action "keep database awake" — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §C, §E; [.github/workflows/keep-database-awake.yml](.github/workflows)
- Razorpay: subscriptions (monthly/yearly) + order (lifetime); webhook is the only thing that grants Pro (HMAC, idempotent per event id, refunds end Pro, 2-day grace); cancel keeps Pro to paid date — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §5.4; [src/app/api/billing/](src/app/api/billing)
- Ads: AdSense slots on landing, all 34 algorithm pages, hub, Notes list, Profile; never on Playground/Pricing/`/p/`/offline/Pro; 15-active-minute Google Ad Manager interstitial (max 4/day); rewarded ads (+10 gems, 3/day); everything off until `NEXT_PUBLIC_ADSENSE_CLIENT` etc. are set — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §6.6; [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §H
- Legal pages (Terms, Refund, Privacy, Contact) built with owner details filled in — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §B

**Landing, phone nav, PWA**
- Landing redesign (bg1, floating cards, tours) built 2026-10-18; phone-only layout 2026-10-27; H1 "Maths you can write, solve and keep." — MEMORY.md; [src/app/(Primary.pages)/page.js](src/app/(Primary.pages)/page.js)
- Phone navigation: 5 bottom buttons (`PhoneNav.js`), 2026-10-26 — MEMORY.md; [src/app/components/PhoneNav.js](src/app/components/PhoneNav.js)
- PWA: service worker (`public/sw.js`, workbox), `manifest.json`, `/offline` page — [public/](public)
- Guided tours (`components/tour`, react-joyride) — [src/app/components/tour/](src/app/components/tour)

### Inferences
- NETZ is effectively feature-complete for a v1 launch on the web; remaining risk is operational (accounts, live payments, ads approval) and real-device QA rather than missing features.
- The scope is unusually broad for a solo build (calculator + whiteboard + notes + gamification), which is both a differentiator and a maintenance burden.

### Gaps
- Could not run the app or tests; all "pass" statuses are self-reported in project docs.
- No AI tutor / photo-problem scanner exists in code (only a CAS action button, `AIActionButton.js`), despite the blueprint's "Module E".

## 2. Subjects covered and intended user

### Takeaway
Coverage is a classic 5-unit undergraduate "Numerical Methods / Computer-Oriented Numerical & Statistical Methods" syllabus (roots, interpolation, integration/differentiation, ODEs + linear systems, statistics/curve fitting). Docs target students in India first (rupee pricing, Razorpay, Mumbai region) but never name a specific university, course code or year.

### Cited Findings
- Unit 1 (roots, 6): Bisection, False Position, Newton-Raphson, Secant, Iteration (fixed point), Gauss-Seidel — [src/app/(pages.algorithems)/(UNIT-1)](src/app/(pages.algorithems))
- Unit 2 (interpolation, 6): Newton Forward, Newton Backward, Gauss Forward, Gauss Backward (equal intervals); Lagrange, Newton Divided Difference (unequal) — same tree
- Unit 3 (7): Trapezoidal, Simpson 1/3, Simpson 3/8, Boole, Weddle, Gauss Quadrature, Numerical Differentiation — same tree
- Unit 4 (8): Euler, Modified Euler, Runge-Kutta, Taylor Series, Gauss Elimination, Gauss-Jordan, Jacobi, LU Decomposition — same tree
- Unit 5 (7): Chi-square, F-test, t-test, Test of Significance, Fitting Straight Line, Fitting Parabola, Least Squares — same tree
- Tasks list mirrors the same 5 units + Notes/Playground/Sharing — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §2.2
- Origin story: started as a Gauss-Seidel Chrome extension (June 2024), website Sept 2024, PWA Oct 2024, "getting through numerical methods without pages of hand calculation" — [../NETZ_SOCIAL_SERIES.md](../NETZ_SOCIAL_SERIES.md) Part 1
- Target devices: phone, tablet, laptop; touch first; "Most people will use a finger or a stylus" — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §1
- India-first signals: ₹ prices, Razorpay, UPI, Supabase Mumbai, PAN-based KYC, Indian jurisdiction on legal pages — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md); [src/app/utils/pricing.js](src/app/utils/pricing.js)
- Blueprint pitches a much broader "Interactive Math, Algorithm, Scientific & Engineering Operating System" incl. eigenvalues, matrix inversion, CS algorithms — [NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md](NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md) §1–2 (aspirational; not in code)

### Inferences
- The unit grouping and method set (incl. Weddle, Boole, Gauss forward/backward, chi-square/F/t tests) matches typical Indian B.Tech/BCA/B.Sc. numerical-methods courses (e.g. 3rd–4th semester), but this is an inference; no doc names AKTU or any university.
- Teachers are a secondary target ("teachers making quizzes bring whole classes") — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §5.1.

### Gaps
- No user research, personas, or named syllabus found in the repo (grep for AKTU/B.Tech/semester/syllabus returned nothing specific).
- No usage numbers for the 2024 site/PWA/extension found locally.

## 3. Business model as planned

### Takeaway
Freemium: everything core (all 34 solvers, Notes, Playground handwriting, tasks/gems) is free with ads; Pro (₹199/month, ₹1,499/year, ₹3,499 lifetime; USD $2.99/$19.99/$49.99 deferred) removes ads and adds clean/advanced exports, more cloud/public notes and yearly Pro cosmetic tasks. Revenue = Razorpay subscriptions + AdSense/Ad Manager. No refunds.

### Cited Findings
- Price table (paise): monthly 19900, yearly 149900, lifetime 349900; USD 299/1999/4999; USD only when `NEXT_PUBLIC_USD_PAYMENTS=on` — [src/app/utils/pricing.js](src/app/utils/pricing.js)
- Free vs Pro: public note links 2 vs 25; cloud notes 20 vs unlimited; exports PNG + PDF with "Made with NETZ" mark vs clean PDF, SVG, LaTeX, code export, `.netz` file; ads yes vs none (script not even loaded); Pro tasks + yearly skin/banner/medal; 1 free streak freeze/month — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §5.1, §5.4; [src/app/utils/proLimits.js](src/app/utils/proLimits.js); [NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md](NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md) (D3)
- Asset storage: 50 MB free / 1 GB Pro (owner to watch Supabase free 1 GB storage) — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §A
- Handwriting and quiz-making intentionally free (runs on device, zero cost) — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §5.1
- Refunds: none; cancel any time and keep Pro to paid date; double/mistaken charges refunded — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §A
- Gems are cosmetic-only (skins, banners, freezes, year badge 1,500); gem amounts "a first guess", to retune after a few weeks — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §A
- Older blueprint economics: total fixed cost $0/mo at 0–10k users, ~$75/mo at 100k+, "profitable on under 40 Pro subscribers"; stack Cloudflare Pages/Vercel + Supabase + Upstash + R2 + Gemini Vision fallback — [NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md](NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md) §5 (last committed 2026-08-22; superseded by the launch plan)
- Launch plan explicitly replaces the XP/levels parts of the backend plan, master roadmap Module D and the SaaS growth plan — [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) header

### Inferences
- Yearly is ~37% cheaper than 12× monthly (1 − 1499/2388). Lifetime ≈ 2.3 years of yearly.
- Because handwriting/solvers are free and ads are excluded from the Playground, ad inventory is concentrated on solver pages and the hub; revenue depends on SEO traffic to the 34 method pages.

### Gaps
- No revenue forecast, conversion assumptions, or competitor price benchmarking in current docs (SaaS growth plan/blueprint are aspirational and pre-date the real pricing).

## 4. What is pending or blocked

### Takeaway
Engineering is mostly done; the critical path is owner-only: Razorpay Live mode (new keys/plans/webhook), AdSense account from scratch (+ approval wait), one Supabase migration, end-to-end tests by the owner, secret rotation, GST advice, and the dataset-licence decision. Engineering gaps are real-device testing, the faster text model, and a handful of Playground items.

### Cited Findings
**Owner-only blockers** — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) (last updated 2026-10-25)
- Done: Supabase project + 4 migrations, Google OAuth, Vercel env vars, Razorpay test keys + INR plans + webhook, KYC (PAN, no GST), legal details.
- Open: run `20261024000000_note_assets.sql` (cloud copy of Assets library); F "Try it yourself" (sign in on laptop+phone, publish a note, buy monthly/yearly/lifetime in test mode, cancel, refund) — not done; Razorpay Live mode keys/plans/webhook; international payments + USD plans (Razorpay refuses USD until on); GST advice from an accountant; AdSense sign-up, publisher id, site review (days to 2–4 weeks), EU consent message, ad units, Auto ads off, payments; optional Ad Manager interstitial/rewarded units; read legal pages / lawyer; rotate Supabase DB password and Razorpay secrets that were "shared in chat" (2026-10-20); assets storage limits; training-data upload consent; dataset licence decision; commit (now done per git).
- Yearly INR plan flagged "**redo**: the first one was made with 'every 1 month'" — status ambiguous (checkbox ticked) — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §D2
- Launch checks: Google sign-in, real Razorpay, real ads all "**waiting on owner**" — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)

**Engineering gaps**
- "Nothing has been tried on a real phone, tablet or stylus" (Playground); B6 on-screen keyboard, B7 rotation/resizing, B10 real-device matrix (iPhone Safari, Android, iPad+Pencil, etc.) not done — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §5–6
- Phase C leftovers: graph pan/zoom by touch (C3), per-page IndexedDB storage (C4), multi-page PDF (C7), picture crop (C8), recognition in a Web Worker (C11) — same, Phase C
- Insert tools Arrange step (align/distribute/group/connectors) listed as to-do — [PLAYGROUND_INSERT_TOOLS_PLAN.md](PLAYGROUND_INSERT_TOOLS_PLAN.md) §11 (may be partly stale)
- Known failing browser checks on 2026-10-21 (also failing on prior commit): visual 81/88, algorithms 32/33, notes 51/54, insert-equations 32/35, insert-shapes-format 40/41, screens (one save error); new owner decision needed on graphs-under-ink default — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)
- HTR v2 (fast conv CTC text model): plan only; no `htrFeaturesV2.js` or `test_htr_*.mjs` exists; step 4 (Kaggle training) is the owner's — [HTR_FROM_SCRATCH_PLAN.md](HTR_FROM_SCRATCH_PLAN.md); [src/app/(Primary.pages)/Playground/utils/recognition/](src/app/(Primary.pages)/Playground/utils/recognition)
- Notes: board's typed text not searchable from notes list; step 7 not started — [NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md](NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md)
- Metadata: both layouts set `APP_DESCRIPTION = "Best PWA app in the world!"` (weak SEO description) — [src/app/(Primary.pages)/layout.js](src/app/(Primary.pages)/layout.js)
- Sitemap misses several method pages (secant, gauss-quadrature, numerical-differentiation, gauss-elimination, gauss-jordan, jacobi, lu-decomposition), lists `/Profile` and `/Setting`, and has `lastModified` 2024-10-01 — [src/app/sitemap.js](src/app/sitemap.js)
- README is the unmodified create-next-app boilerplate — [README.md](README.md)

**Stale docs (flag)**
- `MASTER_ROADMAP_AND_PENDING_TASKS.md` (2026-10-14/15) says Profile is `<UnderConstruction />`, gamification ~10%, code export and public notes pending, XP engine planned — all superseded by built code — [MASTER_ROADMAP_AND_PENDING_TASKS.md](MASTER_ROADMAP_AND_PENDING_TASKS.md) §2
- `PENDING_ROADMAP.md` (committed 2026-09-30), `NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md` and `SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md` (2026-08-22) are pre-launch-plan vision docs (Zustand/TanStack/Dexie, Cloudflare, AI tutor, community quiz bank).
- `handwriting_recognition_definitive_report.md` (2026-09-30) describes a Google Digital Ink tier-0 engine and Tesseract/TrOCR tiers, links to a `netznew` folder — contradicts current rule "No Google handwriting endpoint in the app" and the 3-ONNX-model design.
- `NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md` says DB is "Vercel + Neon" and webhook at `/api/billing/razorpay/webhook`; actual is Supabase and `/api/billing/webhook`.
- `NETZ_LAUNCH_PLAN.md` §5.4 says "LaTeX and code export do not exist yet" in one place while §8 says built 2026-10-21; Refund page "7 days" in §5.3/5.4 vs no-refund decision.
- `PLAYGROUND_HANDOFF.md` §7.2 says BRUSH is off the training plan (commercial), but the 2026-10-25 owner decision says use DeepWriting + BRUSH and treat NETZ as educational — [HTR_FROM_SCRATCH_PLAN.md](HTR_FROM_SCRATCH_PLAN.md).

### Inferences
- Shortest path to taking money: owner does F (test-mode end-to-end), then Live-mode Razorpay swap; ads can follow later since AdSense approval is the slowest step.

### Gaps
- Whether the owner actually completed the F tests after 2026-10-25 is not recorded anywhere.
- Whether the live site `netz-ruby.vercel.app` currently runs this latest commit is unknown.

## 5. Handwriting / maths recognition quality, datasets and licences

### Takeaway
There is no trustworthy real-handwriting accuracy number for the shipped models: the only in-domain figure is the text model's 4.5% character error on its own test set; maths model accuracy is not reported; older "95–99%" claims come from a stale report about a Google-based pipeline no longer used. Licence risk is significant: the shipped text model (IAM-OnDB) and maths model (MathWriting, CC BY-NC-SA 4.0 per its paper) are non-commercial, and the planned retrain uses DeepWriting + BRUSH, also non-commercial, while NETZ charges money and runs ads.

### Cited Findings
- Shipped models: `netz_hmer.onnx` 28.4 MB (maths, frozen), `netz_htr.onnx` 7.4 MB (text), `netz_router.onnx` 0.4 MB, dated 2026-10-05 — [public/models/](public/models)
- "The text model scores 4.5% character error on its own test set ... The gap in the app comes from elsewhere" — [PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md](PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md) l.270
- Current text model speed on dev PC: 12.9 ms (T=128) to 81.6 ms (T=1024); HTR v2 ship gate targets ≤5 ms/line PC, ≤30 ms mid-range phone, CER ≤7% greedy, WER ≤18% with beam search, ≤3 MB — [HTR_FROM_SCRATCH_PLAN.md](HTR_FROM_SCRATCH_PLAN.md) §6
- Notes-mode text shortcut 0.18 s vs 33.8 s maths model on a paragraph; whether it triggers on real handwriting unknown (needs router confidence ≥0.85; synthetic reached 0.66) — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §5
- Accuracy work "cannot be judged without real handwriting"; Phase D blocked (was blocked on owner collection; owner later said he cannot collect) — [PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md](PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md); [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) Phase D; memory `netz-handwriting-data-decisions.md`
- Stale claims: "Google Digital Ink IME ... 99% accuracy", "4-Tier Hybrid ... 95–98% offline", Tesseract <25% on cursive — [handwriting_recognition_definitive_report.md](handwriting_recognition_definitive_report.md); also "~98% accuracy" target in [OFFLINE_HANDWRITING_RECOGNITION_UPGRADE_PLAN.md](OFFLINE_HANDWRITING_RECOGNITION_UPGRADE_PLAN.md) (targets, not measurements)
- Datasets: DeepWriting (ETH, IAM-OnDB-derived, 34,577 lines, 294 writers, custom non-commercial licence); BRUSH (Brown, 27,649 samples, 170 writers, "Non-commercial research only"; pickles can execute code); IAM-OnDB non-commercial and its site unreachable — [HTR_FROM_SCRATCH_PLAN.md](HTR_FROM_SCRATCH_PLAN.md) §1; [PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md](PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md) l.316–320, l.374
- "This conflicts with ads and paid tiers" — [PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md](PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md) l.374; owner to-do lists the licence question as open — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §A
- Owner decision 2026-10-25: treat NETZ as "educational, non-commercial" for licence purposes — [HTR_FROM_SCRATCH_PLAN.md](HTR_FROM_SCRATCH_PLAN.md) header

### Inferences
- Treating a product with ₹ subscriptions and AdSense as "non-commercial" is legally doubtful; the risk applies to the already-shipped models, not only the planned retrain. A market/readiness report should flag this as a top launch risk (options: seek permission from MathWriting/IAM/BRUSH owners, make the Playground recognition part of a clearly free non-commercial tier, or retrain on licensed/owned data).
- Recognition quality is the least-validated pillar; marketing should not claim accuracy figures.

### Gaps
- No measured maths-recognition accuracy (exact-match/expression rate) on real handwriting found.
- `benchmark_recognition.mjs` results are not stored in the repo (`reports/` is empty).
- MathWriting's own licence file was not checked (docs say "should be checked").

## 6. Hosting, infra and costs

### Takeaway
Runs on Vercel (domain `netz-ruby.vercel.app`) + Supabase free plan (Mumbai) with a GitHub Action keeping the free DB awake; a Lightsail VPS migration is documented for later. The heaviest load is static: ~83 MB ONNX runtime, ~36 MB models, ~19 MB audio served from the CDN. Free-tier storage (≈1 GB) and Vercel bandwidth are the first limits.

### Cited Findings
- Vercel now; Lightsail later when Vercel bill > bigger Lightsail plan or limits bite; NETZ needs >1 GB RAM to build (build in GitHub Actions, push to GHCR); runtime 150–300 MB; recommend 2 GB plan; 700 MB container limit; big files `public/onnx` 83 MB, `public/models` 36 MB, `public/audio` 19 MB — [NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md](NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md) §1–3
- `@vercel/analytics` and speed insights do nothing off Vercel — same, §2
- Supabase free plan ≈1 GB file storage total; assets 50 MB free/1 GB Pro per student → watch it — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §A
- Keep-awake workflow — [.github/workflows/keep-database-awake.yml](.github/workflows)
- Blueprint cost model ($0 → ~$75/mo at 100k users) — [NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md](NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md) §5 (aspirational, different stack)

### Inferences
- Since handwriting runs on-device, marginal compute cost per user is low; cost scales with bandwidth (first Playground visit can pull tens of MB) and Supabase storage/egress.
- Vercel Hobby plan terms prohibit commercial use; a paid Vercel plan (or the VPS) is likely needed once taking money (not stated in docs — verify).

### Gaps
- No current Vercel/Supabase bills or usage numbers in the repo; Lightsail price "check the current price".

## 7. Tests and known bugs

### Takeaway
Strong automated coverage for a solo project: 30 Node logic test files at repo root, 51 Puppeteer browser scripts (touch + pen via CDP), and Postgres-in-Docker DB tests. Known failures are a few long-standing browser checks; the biggest QA gap is zero real-device testing.

### Cited Findings
- 30 `test_*.mjs` files (billing, pro, ads, shop, progress engine/sync, notes sync, code export, feature parity, shapes, symbols, tables, eraser, etc.); 51 `tests/browser/*.mjs`; `tests/db/{billing-db,sync-db,seed-public}.mjs` — [Netz/](.) file listing
- 2026-10-20 run: Node tests (26 files) all pass; sync-db 19/19, billing-db 18/18; lint clean; production build 67 pages; 34 solver pages report right task; 375 px no sideways scroll on 12 key pages — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)
- 2026-10-21 run: exports.mjs 41/41; shop 24/24; failures visual 81/88, algorithms 32/33, notes 51/54, insert-equations, insert-shapes-format, screens — "same failures on the last commit's build: older" — same
- Playground production-build suites 213/213 (A1); visual 88/88 on 2026-10-17 — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md)
- Not checked: LaTeX output with a real LaTeX compiler; Rust and MATLAB code compiled; real midnight on a device — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)
- Known limits: localStorage copy dropped for sessions >~4 MB; changes <350 ms before a crash may be lost; PNG/PDF block sharpness depends on screen; recognition confidence shows >100% — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §8
- No automated accessibility checker run — same, C10

### Inferences
- The test logs are dated 2026-10-20/21; several large features (Notes Studio, phone nav, phone method pages, worst-case fixes) landed after, with targeted checks only; a full re-run is due before launch.

### Gaps
- No CI test workflow (only keep-awake workflow found).

## 8. Analytics, SEO and marketing

### Takeaway
Google Analytics (gtag `G-MH5QX2N0Q0`) + Vercel Analytics/Speed Insights are wired in; SEO is basic (static sitemap with gaps, robots.txt, placeholder meta description). Marketing assets exist: a 7-part LinkedIn/X launch series and 22 screenshots.

### Cited Findings
- gtag loaded lazily with id `G-MH5QX2N0Q0`; `<Analytics/>` and `<SpeedInsights/>` in both layouts — [src/app/(Primary.pages)/layout.js](src/app/(Primary.pages)/layout.js) l.95–101; [src/app/(pages.algorithems)/layout.js](src/app/(pages.algorithems)/layout.js)
- `next-sitemap.config.js` siteUrl `https://netz-ruby.vercel.app`; `src/app/sitemap.js` 34 URLs; robots.txt allow all — [next-sitemap.config.js](next-sitemap.config.js); [public/robots.txt](public/robots.txt)
- Meta description "Best PWA app in the world!" — [src/app/(Primary.pages)/layout.js](src/app/(Primary.pages)/layout.js) l.16
- `NETZ_SOCIAL_SERIES.md`: 7 parts (journey, Algorithm Explorer, Playground handwriting → live maths, Notes, platform/accounts/streaks, take your work anywhere, launch), one every 2–3 days, LinkedIn + X thread; says "in testing right now, and launching soon"; hashtags #BuildInPublic #EdTech — [../NETZ_SOCIAL_SERIES.md](../NETZ_SOCIAL_SERIES.md)
- `../social-shots/`: 22 PNGs (landing laptop dark/light/phone, algorithm hub, method graph/learn, …) produced by `tests/browser/social-shots.mjs` — [../social-shots/](../social-shots)
- No custom domain yet; AdSense notes a custom domain is approved more easily than `vercel.app` — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md) §H1

### Inferences
- Method pages are the natural SEO acquisition channel ("bisection method calculator with steps"), but the sitemap gaps, generic description and vercel.app domain weaken it.

### Gaps
- No analytics data, search-console data, or traffic figures available locally.
- No per-page metadata audit done (only layout-level checked).

## 9. Overall: differentiators and gaps vs launch-ready

### Takeaway
Differentiation = one place where an Indian numerical-methods student can solve every syllabus method with full steps, export code in 6 languages, write maths by hand (offline, on-device) and keep everything in notes with a Duolingo-style habit loop, at ₹199/month. The clearest gaps to launch-ready are: live payments switch-on and owner end-to-end tests, AdSense approval, dataset-licence risk on the handwriting models, zero real-device testing, unmeasured recognition accuracy, and weak SEO basics/domain.

### Cited Findings
- Full worked steps + graphs + tables for 34 methods with convergence honesty fixes — [METHOD_PAGES_WORST_CASE_REPORT.md](METHOD_PAGES_WORST_CASE_REPORT.md)
- Code export to Python/MATLAB/C++/JS/Rust/Go from the page's own inputs — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)
- On-device recognition, no server cost, works offline — [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §1; [NETZ_LAUNCH_PLAN.md](NETZ_LAUNCH_PLAN.md) §5.1
- Live solver widgets and quizzes embedded inside notes and public note pages — [NETZ_LAUNCH_CHECKS.md](NETZ_LAUNCH_CHECKS.md)
- Gamification: 75 medals, streaks, gems, mascot skins — [NETZ_TASK_SHEET.md](NETZ_TASK_SHEET.md)
- Blockers — [NETZ_OWNER_TODO.md](NETZ_OWNER_TODO.md); [PLAYGROUND_HANDOFF.md](PLAYGROUND_HANDOFF.md) §5 "Not yet verified", §7

### Inferences
- Launch-ready checklist (ordered): (1) owner F tests in test mode; (2) Razorpay Live + rotate leaked secrets; (3) run note_assets migration; (4) real-device pass on iPhone/Android/iPad; (5) licence decision for handwriting models; (6) fix sitemap/meta description, buy custom domain, then AdSense; (7) re-run full test suite on latest commit; (8) update stale docs so they don't mislead.
- Scope is narrow (one course family) — strong for focus and SEO, but the addressable market is bounded by numerical-methods enrolments unless more subjects are added.

### Gaps
- No competitor analysis exists in the repo; no user feedback or beta metrics recorded.
