# NETZ â€” Completed Features vs. Pending Roadmap (Master Audit)

> **Document Status**: Complete Product & Engineering Status Audit  
> **Source Documents Synthesized**:
> 1. `NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md`
> 2. `NETZ_V2_IMPLEMENTATION_PLAN.md`
> 3. `PLAYGROUND_FEATURE_TECH_SPEC.md`
> 4. `NOTES_FEATURE_TECH_SPEC.md`
> 5. `SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md`
> 6. `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`

---

## 1. Executive Summary: Completed vs. Pending Overview

| Pillar / Module | Completion Status | What's Working Today | Key Missing / Pending Features |
| :--- | :---: | :--- | :--- |
| **Module A: Algorithm Suite (Units 1-5)** | **~95%** | 34 numerical solvers across Units 1–5 with KaTeX derivations, iteration steps tables, Chart.js plots, and Algorithm Hub. | 1-click polyglot code export generator (Python/MATLAB/C++/JS), WebWorker calculation offloading. |
| **Module B: Notion-Style Notes Workspace** | **~95%** | Block editor (H1/H2/Text/KaTeX/Callout), live embedded 34-algo math solver widgets, QuizBlock (MCQ+Numeric), Ink drawing pad, 2x Academic PDF Export, Community Feed. | Notion-style public notes hosting (`/p/[slug]` with ISR), cloud persistence via Neon PostgreSQL, note forking. |
| **Module C: Smart Whiteboard Playground** | **~95%** | Hardware-accelerated canvas, Catmull-Rom smoothing, Smart Blocks (Equation, Graph, Theory, Sketch, Audio, Image), Bezier links, offline ambient audio, **4-Tier Hybrid Handwriting Recognition (Google Ink + W3C Native OS + Word-Segmented TrOCR + Tesseract)**, live '=' math auto-eval, R-Tree spatial indexing. | Drag-drop multi-curve graph layering, sketch-to-equation reverse fitting, global CAS scope manager. |
| **Module D: Gamification & Community** | **~10%** | Dark/Light editorial theme toggle, static sitemaps, offline PWA caching. | /Profile is UnderConstruction. Quadratic XP ledger, academic leveling system ($\text{Level} = \lfloor \sqrt{\text{XP}/75} \rfloor + 1$), badges, and auth (streaks explicitly omitted). |
| **Module E: AI Tutor & Solver** | **~35%** | Floating CAS action button, MathJS/Nerdamer symbol operations, on-device handwriting neural network. | Step-by-step AI problem tutor sidebar, photo textbook scanner, live multimodal chat assistant. |
| **Platform Infrastructure & Monetization** | **~25%** | Next.js 16 App Router, Workbox PWA service worker, static pre-rendering, responsive mobile dock. | Single affordable Linux VPS ($4-$7/mo) hosting Dockerized NETZ, Signaturely & Discord app; containerized Redis + PostgreSQL/Neon; Dual Stripe & Razorpay billing; navigation ad counter. |

---

## 2. Detailed Breakdown by Module

---

### Module A: Interactive Numerical Algorithm Suite

#### Completed & Verified Functionality:
- [x] **Unit 1 (Roots of Equations)**:
  - Bisection Method (`/bisection-method`)
  - False Position / Regula-Falsi (`/false-position-method`)
  - Newton-Raphson Method (`/newton-raphson-method`)
  - Fixed-Point Iteration (`/iteration-method`)
  - Automatic sign-change interval search, convergence tolerance validation, step iteration tables, KaTeX formula derivations, and interactive curve plots.
- [x] **Unit 2 (Interpolation & Curve Fitting)**:
  - Newton's Forward Difference (`/newton-forward`)
  - Newton's Backward Difference (`/newton-backward`)
  - Newton's Divided Difference (`/newton-divided`)
  - Lagrange Interpolation (`/lagrange-interpolation`)
  - Gauss Forward (`/gauss-forward`) & Gauss Backward (`/gauss-backward`)
  - Least Squares Regression (`/least-squares`)
  - Straight Line Fitting (`/fitting-straight-lines`) & Parabola Fitting (`/fitting-parabola`)
- [x] **Unit 3 (Differentiation & Integration)**:
  - Numerical Differentiation (`/numerical-differentiation`)
  - Trapezoidal Rule (`/trapezoidal-Rule`)
  - Simpson's 1/3 Rule (`/simpson-1-3-Rule`) & Simpson's 3/8 Rule (`/simpson-3-8-Rule`)
  - Boole's Rule (`/boole-Rule`) & Weddle's Rule (`/weddle-Rule`)
- [x] **Unit 4 (Linear Algebra & Systems)**:
  - Gauss-Seidel Iterative Method (`/Gauss-seidal`) with diagonally dominant validation.
- [x] **Unit 5 (Differential Equations & Statistics)**:
  - Taylor's Series Method (`/taylor-s-series-method`)
  - Euler's Method (`/euler-s-method`) & Modified Euler's (`/modified-euler-s-method`)
  - Runge-Kutta 4th Order (`/runge-kutta-method`)
  - Statistical Tests: Chi-Square (`/chi-square`), t-Test (`/t-test`), F-Test (`/f-test`), and Test of Significance (`/test-significance`).

#### Pending Deliverables for Module A:
- [ ] **Secant Method**: Mentioned in master blueprint (Unit 1), currently missing dedicated route.
- [ ] **Gauss Quadrature (2-point & 3-point)**: Mentioned in master blueprint (Unit 3).
- [ ] **Advanced Matrix Suite (Unit 4)**:
  - Gauss Elimination & Gauss-Jordan Elimination
  - LU Decomposition (Doolittle / Crout)
  - Jacobi Iterative Solver
  - Matrix Inversion, Determinant & Eigenvalue Calculator
- [ ] **1-Click Polyglot Code Export**:
  - Blueprint specifies generating clean, executable code in **Python (NumPy/SciPy)**, **MATLAB**, **C++**, and **JavaScript** for any algorithm calculation run.
- [ ] **WebWorker Offloading**:
  - Moving heavy calculation iterations into background worker threads with 200ms watchdog timeouts to prevent UI thread stutter on large datasets.

---

### Module B: Notion-Style Block Workspace & Quiz Bank

#### Completed & Verified Functionality:
- [x] **Document Hierarchy & Sidebar** (`src/app/(Primary.pages)/Notes`):
  - Local-first document state stored via `localStorage` and `noteStorage.js`.
  - Live search bar filtering by note title, content, and category tags.
  - Category tag pill filtering (`#NumericalMethods`, `#DiffEq`, etc.).
  - Note pinning, duplicating, and deleting.
- [x] **Block Editor Canvas** (`NoteEditor.js`, `NoteBlockItem.js`):
  - Heading 1 & Heading 2 blocks.
  - Formatted text paragraph blocks.
  - KaTeX mathematical blocks with real-time preview.
  - Highlighted revision callout cards (tips/warnings).
  - Slash command menu (`/h1`, `/math`, `/callout`, `/widget`).
- [x] **Embedded Solver Widgets** (`EmbeddedMathWidget.js`, `AlgorithmPickerModal.js`):
  - Ability to embed interactive algorithm solvers directly inside study notes.
- [x] **Sharing & Access Keys** (`NoteShareModal.js`):
  - 8-character access key generator (`NETZ-XXXX`) for cross-device note sharing.
  - Note export to Markdown (`.md`) and formatted printing.

#### Pending Deliverables for Module B:
- [x] **Interactive QuizBlock Widgets**:
  - Multiple Choice Questions (MCQ) with 2-4 options and answer explanation toggle.
  - Short Answer / Numerical Input evaluating answers within math tolerance (±0.001).
  - Self-check reveal step-by-step KaTeX solutions.
- [x] **Academic PDF & Clean Vector SVG Export**:
  - High-resolution academic PDF lab report generation via `jspdf` + `html2canvas` (`src/app/(Primary.pages)/Notes/utils/pdfExport.js`).
- [ ] **Notion-Style Public Notes Hosting Engine**:
  - Public web links at `https://netz.app/p/[slug]` rendered with Next.js App Router and Incremental Static Regeneration (ISR).
  - Read-only interactive sandbox allowing visitors to execute embedded math widgets and answer quizzes.
  - One-click "Duplicate / Fork to My Notebook" button.
  - Public note quotas enforced by SaaS tier (Free: 2, Pro: 10, Lifetime: 60).
- [ ] **Handwritten Ink Blocks**:
  - Ability to embed raw vector sketches from the whiteboard directly into notes.
- [ ] **Global Community Notes Feed**:
  - Cloud-synced public note discovery with Neon PostgreSQL search, tags, and unit filters.

---

### Module C: Smart Whiteboard & CAS Playground

#### Completed & Verified Functionality:
- [x] **Hardware Canvas & Input Normalization** (`WhiteboardCanvas.js`, `PlaygroundCanvasContainer.js`):
  - HTML5 Pointer Events (`pointerdown`, `pointermove`, `pointerup`).
  - Pen, touch, and mouse input normalization with Catmull-Rom spline smoothing.
  - Continuous freehand drawing, highlighter mode, vector stroke eraser, and stroke width/color swatches.
  - Canvas pan and zoom navigation matrix.
- [x] **Smart Blocks Architecture** (`src/app/(Primary.pages)/Playground/components/blocks`):
  - `EquationBlock.js`: KaTeX preview, editable expression input, mini ink canvas.
  - `GraphBlock.js`: Chart.js reactive plotter with domain range sliders.
  - `TheoryBlock.js`: Rich text documentation block with inline LaTeX math.
  - `SketchBlock.js`: Shape sketching canvas.
  - `AudioMemoBlock.js`: Voice recorder using `MediaRecorder` API + 15-minute auto-splitting tracks.
  - `ImageBlock.js`: Drop and render image blocks on canvas.
  - `SmartBlockWrapper.js`: Draggable, resizable frames with minimum boundary enforcement preventing UI clipping.
- [x] **Bezier Block Connectors** (`BlockLinkRenderer.js`):
  - Dynamic SVG Bezier curves connecting related Equation and Graph blocks.
- [x] **Contextual CAS Actions** (`AIActionButton.js`):
  - Browser-native differentiation, integration, simplification, and root finding via MathJS and Nerdamer.
- [x] **Ambient Audio Soundscapes** (`BackgroundMusicPlayer.js`):
  - 6 studio-grade offline audio tracks (Lo-Fi Chill, Rain, Forest Birds, Cafe, Ocean Waves, Campfire) stored in `public/audio/ambient/`.
  - Non-clipping popover, animated equalizer bars, loop mode, and custom MP3 file upload support.
- [x] **Export Capabilities** (`exportEngine.js`):
  - Export canvas to PNG, SVG, and JSON session state.
- [x] **4-Tier Hybrid Handwriting Recognition Engine** (`localOCRService.js`, `trocrService.js`, `strokeRasterizer.js`):
  - **Tier 0 (Online)**: Google Digital Ink vector IME (99% cursive/equation accuracy, free, untethered).
  - **Tier 1 (Offline Native)**: W3C Handwriting Recognition API (`navigator.createHandwritingRecognizer`) tapping native OS neural networks (Windows Ink / Android ML Kit) in compiled C++ (<15ms, 0 MB download).
  - **Tier 2 (Offline WASM/WebGPU)**: Word-Segmented TrOCR Vision Transformer (`@xenova/transformers/dist/transformers.js` + `Xenova/trocr-small-handwritten`) with tight bounding box crops and inter-word whitespace gap detection (`segmentStrokesIntoWords`).
  - **Tier 3 (Offline Emergency)**: Tesseract.js WASM single-line worker fallback.
  - Offline cache warmer (`preloadOCREngine`) and dev testing harness (`window.__FORCE_OFFLINE_OCR = true`).
- [x] **R-Tree Spatial Indexing & Scratch-Out Erase** (`spatialIndexRTree.js`, `spatialClusterer.js`):
  - Fast $O(\log N)$ 2D bounding-box spatial indexing.
  - Natural scribble/scratch-out erase gesture detection: 10+ rapid directional reversals pack high path density over target strokes to automatically delete handwriting.
- [x] **Live Handwritten Math Auto-Evaluation (Apple Math Notes Parity)**:
  - Trailing equals sign (`=`) gesture detection (`detectEqualsGesture` in `spatialClusterer.js`).
  - Evaluates arithmetic and algebraic equations (`evaluateLatexExpression` in `handwritingOCR.js`) displaying live computed results.

#### Pending Deliverables for Module C:
- [ ] **Drag-to-Connect Multi-Curve Graph Layering**:
  - Dragging an Equation Block over an existing Graph Block appends a secondary curve dataset to the same chart instead of creating duplicate widgets.
- [ ] **Reverse Sketch-to-Equation Fitting** (`graphToEquation.js` & `sketchShapeAnalyzer.js`):
  - Analyzing hand-drawn curves to classify candidate models (Linear, Polynomial, Sinusoidal, Exponential) and generating the best-fit equation with an R^2 confidence score.
- [ ] **Global CAS Symbol Scope Manager** (`scopeManager.js`):
  - Auto-propagating variable definitions across multiple blocks (a = 5 implies f(a) updates live).

---

### Module D: Gamification, Profile & Community

#### Completed & Verified Functionality:
- [x] Editorial theme toggles (Dark / Light / System) across all pages.
- [x] Local settings persistence in `/Setting`.
- [x] PWA offline caching via Workbox and dedicated `/offline` route.

#### Pending Deliverables for Module D:
- [ ] **Profile Page Implementation (`/Profile`)**:
  - Currently renders placeholder `<UnderConstruction />`.
- [ ] **Academic Gamification (XP & Leveling System)**:
  - **XP Ledger**: Earn XP for solving algorithm calculations (+15 XP), creating study notes (+30 XP), publishing to web (+50 XP), and solving quizzes (+25 XP). *(Daily streaks explicitly omitted).*
  - **Leveling Engine**: Quadratic level formula ($\text{Level} = \lfloor \sqrt{\text{XP}/75} \rfloor + 1$) with 6 rank titles from *Novice Calculator* to *Fields Pioneer*.
  - **Achievement Badges**: Unlock academic badges (e.g., "Roots Conqueror", "Matrix Master", "Calculus Architect").
- [ ] **Community Sharing & Discovery Feed**:
  - Public showcase of shared study notes, interactive quizzes, and custom algorithm presets.

---

### Module E: AI Multi-Modal Tutor & Multimodal Scanner

#### Completed & Verified Functionality:
- [x] In-browser symbolic math calculations via `evaluateMath.js`, MathJS, and Nerdamer.
- [x] OCR scaffolding (`tesseract.js`, `geminiVisionService.js` stub).

#### Pending Deliverables for Module E:
- [ ] **Step-by-Step AI Problem Solver Sidebar**:
  - Interactive AI assistant panel breaking down calculus, matrix algebra, and physics exercises.
- [ ] **Photo Textbook OCR Scanner**:
  - Uploading or snapping a photo of a textbook problem to import LaTeX equations directly onto the canvas or notes.
- [ ] **Context-Aware Math Assistant**:
  - Explaining algorithm errors, non-converging iterations, or invalid domain ranges with suggested corrections.

---

### Platform Infrastructure, State Management & Monetization

#### Completed & Verified Functionality:
- [x] Next.js 16 App Router architecture with statically pre-rendered algorithm and primary pages.
- [x] Tailwind CSS + KaTeX typography styling.
- [x] Offline Service Worker registration (`sw.js`).
- [x] Clean production build with 43 routes passing compilation.

#### Pending Deliverables for Architecture & SaaS:
- [ ] **Dual-Engine State Architecture Migration**:
  - Installing and setting up **Zustand stores** (`useAuthStore`, `useSubscriptionStore`, `useGamificationStore`, `useQuizEngineStore`, `useCanvasStore`, `useUIStore`).
  - Implementing **TanStack Query v5** for optimistic server state and cloud synchronization.
  - Implementing **Dexie.js (IndexedDB)** for local canvas session persistence bypassing 5MB `localStorage` limits.
- [ ] **Monetization & Dual-Gateway Tiered Paywalls**:
  - **Stripe Integration (Global)**:
    - Free Tier ($0)
    - Pro Monthly ($2.99 / mo)
    - Pro Yearly ($19.99 / yr)
    - Lifetime Access ($49.99 once)
  - **Razorpay Integration (India - UPI / Netbanking / Cards)**:
    - Free Tier (₹0)
    - Pro Monthly (₹199 / mo)
    - Pro Yearly (₹1,499 / yr)
    - Lifetime Access (₹3,499 once)
- [ ] **Smart Navigation-Based Ad Engine**:
  - Implementing `useAdNavigationTracker` hook to trigger interstitial ads only every 4 page transitions on the Free Tier (zero mid-stroke ads).
- [ ] **Multi-Project VPS & Docker Infrastructure (Predictable Flat Billing)**:
  - **Single Affordable Linux VPS** (Hetzner / Contabo / DigitalOcean, ~4-8GB RAM, ~$4-$7/mo) hosting 3 colocated production containers:
    - **NETZ** (Next.js 16 Full-Stack & Notion-Style public page ISR engine)
    - **Signaturely** (Signature service backend)
    - **Discord Application** (Bot worker & webhooks)
  - **Caddy Reverse Proxy**: Automatic Let's Encrypt SSL certificates & domain routing (`netz.app`, `signaturely.domain`, `discord.domain`).
  - **Shared Redis Container** (`redis:7-alpine`): In-memory cache, sliding-window XP anti-cheat rate limiting, and webhook idempotency across DB 0, DB 1, DB 2.
  - **PostgreSQL 16 Container** (or hybrid Neon connection): Relational schema for `users`, `profiles`, `notes`, `note_forks`, `xp_transactions`, and `subscriptions`.
  - **Notion-Style Public Page Hosting Engine**: Incremental Static Regeneration (ISR) at `/p/[slug]` with interactive sandbox widgets.

---

## 3. Prioritized Implementation Roadmap

### Phase 1: High-Impact Core Features
1. [x] **Implement QuizBlock Widget in Notes**: Added MCQ and numeric tolerance question blocks with live KaTeX step explanations and Author/Solve modes.
2. [x] **Live Handwritten Math Auto-Evaluation**: Connected `=` gesture detection to background MathJS evaluator in Playground canvas.
3. [x] **Numerical Algorithm Suite Completeness**: Implemented Secant Method, Gauss Elimination, Gauss-Jordan, LU Decomposition, Jacobi Method, and Gauss Quadrature.
4. [x] **4-Tier Hybrid Handwriting Recognition Engine**: Integrated Google Digital Ink Online, W3C Native OS API, Word-Segmented TrOCR Vision Transformer, and Tesseract WASM.
5. [ ] **Build /Profile Dashboard**: Replace `<UnderConstruction />` with active user stats, total XP, current academic rank title, quadratic level progress bar ($\text{Level} = \lfloor \sqrt{\text{XP}/75} \rfloor + 1$), published notes manager, and auth login/signup modal (streaks explicitly omitted).

### Phase 2: Platform Maturation
1. [x] **Academic PDF Lab Report Export**: Implemented clean high-DPI $2\times$ multi-page PDF generation in Notes via `jspdf` + `html2canvas`.
2. [ ] **Drag-to-Connect Multi-Curve Plotting**: Allow dragging an Equation Block over a Graph Block to plot multiple curves on one chart.
3. [ ] **Polyglot Code Generator**: Add Python, MATLAB, and C++ code export tabs to all algorithm pages.
4. [ ] **Zustand + Dexie State Migration**: Unify canvas state, undo/redo delta history, and notes storage into persistent IndexedDB stores.
5. [ ] **Reverse Sketch-to-Equation Fitting**: Curve classification (linear/poly/sinusoidal/exp) with $R^2$ confidence fitting.

### Phase 3: SaaS, Cloud Backend & Public Scale
1. [ ] **VPS Setup & Docker Compose Orchestration**: Deploy `docker-compose.yml` on single Linux VPS running Caddy, containerized Redis, PostgreSQL, and containers for NETZ, Signaturely, and Discord bot with memory caps and 4GB swapfile.
2. [ ] **Database Migration & Auth Endpoints**: Execute DDL schema (`users`, `profiles`, `notes`, `xp_transactions`, `subscriptions`), build `/api/auth/register`, `/api/auth/login`, and connect Zustand `useAuthStore`.
3. [ ] **Notion-Style Public Notes Hosting Engine**: Implement `/api/notes/publish`, dynamic Next.js App Router route `src/app/p/[slug]/page.js` with ISR, OpenGraph card generation, and read-only interactive sandbox with "Fork to My Notebook" CTA.
4. [ ] **Gamification Engine & XP Ledger**: Server-side XP calculation and atomic rate-limited transaction logging (streaks omitted).
5. [ ] **Dual Payment Gateway (Stripe + Razorpay)**: Global checkout with Stripe and Indian UPI/Card checkout with Razorpay; enforce public note quotas (Free: 2, Pro: 10, Lifetime: 60).
6. [ ] **Smart Navigation Ad Frequency Counter**: Non-intrusive page-transition ads for free-tier users.
7. [ ] **Multimodal AI Homework Assistant**: Cloud-assisted step-by-step problem solver.

---

## 4. Analytic Model & KPI Framework

> This section defines the measurement framework to track NETZ's product health, user engagement, and business viability. All metrics are observable from client-side events (Phase 1) or a lightweight backend (Phase 2+).

---

### 4.1 North Star Metric

| Metric | Definition | Target |
| :--- | :--- | :--- |
| **Weekly Active Solvers (WAS)** | Unique users who run at least one algorithm calculation in a 7-day window | 1,000 WAS within 90 days of launch |

**Rationale**: WAS captures core value delivery (solving problems) better than page views or retention alone.

---

### 4.2 Engagement Metrics (Module-Level)

| Metric | Measurement Method | Benchmark |
| :--- | :--- | :--- |
| Algorithm Solve Rate | (Users who click Run) / (Users who open an algorithm page) | >= 60% |
| Notes Creation Rate | (Users who create >= 1 note) / (Users who visit /Notes) | >= 35% |
| Playground Block Interaction Rate | (Users who add >= 1 Smart Block) / (Users who open /Playground) | >= 40% |
| Quiz Completion Rate | (Quizzes submitted) / (Quizzes rendered) | >= 70% |
| Audio Soundscape Activation Rate | (Users who start ambient audio) / (Playground sessions) | >= 25% |

**Implementation**: Store events in `localStorage` under `netz_analytics_events[]`. Flush to the serverless analytics endpoint or Neon PostgreSQL `events` table on page unload via `navigator.sendBeacon()`.

---

### 4.3 Retention & XP Progression Analytics (Streaks Omitted)

| Metric | Formula | Target |
| :--- | :--- | :--- |
| Day-1 Retention | Users active on Day 1 after first visit / New users | >= 40% |
| Day-7 Retention | Users active on Day 7 / New users on Day 0 | >= 20% |
| Day-30 Retention | Users active on Day 30 / New users on Day 0 | >= 10% |
| Daily Active XP Earners (DAX) | Users earning >= 15 XP per day / Daily active users | >= 55% |
| Median User Level | Median of `profiles.current_level` across all registered users | >= Level 5 within 30 days |
| Rank Velocity | Days required for an active user to advance from Novice to Math Explorer | <= 7 days |

**Academic progression loop**: Solve algorithm (+15 XP) / Complete Quiz (+25 XP) / Publish Note (+50 XP) -> Instant XP gain toast -> Level progress bar advancement -> Academic rank promotion (*Novice* -> *Math Explorer* -> *Algorithm Architect*).

---

### 4.4 Technical Performance SLAs

| Metric | Measurement | Target SLA |
| :--- | :--- | :--- |
| Algorithm Compute Latency | `performance.now()` from Run click to table render | <= 200ms for n <= 100 iterations |
| Canvas Frame Rate | `requestAnimationFrame` FPS during active drawing | >= 60 FPS on mid-range hardware |
| OCR Recognition Latency | Image capture to LaTeX string output (Tesseract / TrOCR) | <= 3,000ms |
| Note Load Time | Time to render a 50-block note from IndexedDB | <= 400ms |
| PWA Offline Load Time | Full interactive from service worker cache | <= 1,500ms |
| Largest Contentful Paint | Core Web Vital (LCP) | <= 2,500ms |
| R-Tree Hit-Test Latency | Eraser hit-test across 10,000 strokes | <= 8ms |

**Measurement tools**: `performance.now()` timestamps around critical operations, logged to `netz_perf_log` in localStorage, surfaced on the Profile dashboard as a "System Health" card.

---

### 4.5 Monetization Funnel Metrics (Dual Stripe + Razorpay)

| Funnel Stage | Metric | Target |
| :--- | :--- | :--- |
| Awareness | Unique visitors / month | 10,000 by Month 3 |
| Activation | Users completing >= 1 algorithm solve | >= 60% of visitors |
| Paywall Encounter Rate | Free users who hit a Pro feature gate | >= 20% of active free users |
| Conversion Rate (Free to Pro) | Pro signups / Paywall encounters | >= 5% |
| MRR Growth Rate | Month-over-month MRR change | >= 20% MoM for first 6 months |
| LTV / CAC Ratio | Lifetime Value / Customer Acquisition Cost | >= 3:1 |
| Churn Rate | Monthly Pro subscriber cancellations | <= 5% / month |
| Ad Revenue per Free User | Navigation ad CPM x impressions / free users | $0.50/user/month target |

**Paywall trigger logic**:
- Free tier limits: Max 2 public shared notes, view-only quiz access, standard PNG export.
- Upgrade modal:
  - Global Users: "Upgrade to Pro — $2.99/mo or $49.99 Lifetime via Stripe"
  - Indian Users: "Upgrade to Pro — ₹199/mo or ₹3,499 Lifetime via UPI / Razorpay"
- Track encounters via `useAdNavigationTracker` (counts page transitions).

---

### 4.6 Community & Viral Growth Metrics

| Metric | Definition | Target |
| :--- | :--- | :--- |
| Shared Note Clicks | Clicks on public URLs (`netz.app/p/[slug]`) | 500/month by Month 2 |
| Notes Published to Web | Public notes published per week | >= 50/week at 90-day mark |
| Note Fork Rate | (Public notes duplicated) / (Public note views) | >= 12% |
| Viral Coefficient (K-Factor) | (Invites/shares sent per user) x (Acceptance rate) | K >= 0.5 (strong if K >= 1.0) |
| Teacher Adoption Rate | Educators using Quiz Blocks in notes | Target 10% of power users |

---

### 4.7 Feature Rollout Success Gates

| Feature | Success Criterion |
| :--- | :--- |
| QuizBlock | >= 30% of note-creating users add >= 1 quiz block within 14 days |
| Profile Dashboard | >= 50% of active users visit `/Profile` at least once per week |
| Live Math Auto-Eval | >= 40% of Playground sessions include >= 1 auto-evaluation event |
| Secant Method | Page gets >= 200 unique solves in first 30 days |
| PDF Export | >= 20% of note sessions end with a PDF export within 30 days |
| Notion Public Notes | >= 25% of users with >= 2 notes publish at least 1 note to the web |

---

### 4.8 Analytic Data Collection Architecture

**Phase 1 — Client-only** (`src/app/utils/analytics.js`):

```js
export function trackEvent(eventName, properties = {}) {
  const events = JSON.parse(localStorage.getItem('netz_events') || '[]');
  events.push({
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
  });
  // Cap at 500 events to prevent storage bloat
  if (events.length > 500) events.splice(0, events.length - 500);
  localStorage.setItem('netz_events', JSON.stringify(events));
}
```

**Phase 2 — Neon Serverless PostgreSQL & Redis Backend**:
- Batch-flush `netz_events[]` to backend `/api/analytics/events` endpoint via `navigator.sendBeacon()` on `visibilitychange`.
- Stored in Neon PostgreSQL `analytics_events` table with partitioned daily indexing.
- Redis-cached dashboard stats for administrative health checks.

---

## 5. Immediate Implementation Backlog & Next Steps

Based on the architectural blueprints and pending roadmap, here is the prioritized execution sequence for the engineering team:

| Priority | Feature / Task | File / Path | Action Items |
| :---: | :--- | :--- | :--- |
| **P0** | **Build `/Profile` Dashboard** | `src/app/(Primary.pages)/Profile/page.js` | Replace `<UnderConstruction />` with active user profile: display name, level progress bar ($\text{Level} = \lfloor \sqrt{\text{XP}/75} \rfloor + 1$), rank badge, solved counters, published notes list, and auth modal trigger. |
| **P0** | **Backend Setup & Neon Migration** | `backend/` or `src/app/api/` | Execute DDL schema on Neon PostgreSQL (`users`, `profiles`, `notes`, `note_forks`, `xp_transactions`, `subscriptions`) and configure Redis connection pool. |
| **P1** | **Notion-Style Public Notes Hosting** | `src/app/p/[slug]/page.js` | Implement "Publish to Web" toggle in `NoteShareModal.js`, public slug generator, and ISR public reader page with embedded read-only solvers and "Fork Note" CTA. |
| **P1** | **User Authentication & Auth Store** | `src/app/store/useAuthStore.js` & `src/app/components/auth/` | Create login/signup modal dialogs, JWT cookie handling, and profile state sync. |
| **P2** | **Gamification Engine & XP Ledger** | `backend/modules/gamification` | Implement `/api/gamification/award-xp` with Redis sliding-window daily rate limits (+15 solver, +25 quiz, +30 note, +50 publish). |
| **P2** | **Dual Payment Integration** | `backend/modules/billing` | Implement Stripe checkout for global cards and Razorpay checkout for Indian UPI/Netbanking with signature verification. |
