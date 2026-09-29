# NETZ â€” Completed Features vs. Pending Roadmap (Master Audit)

> **Document Status**: Complete Product & Engineering Status Audit  
> **Source Documents Synthesized**:
> 1. `NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md`
> 2. `NETZ_V2_IMPLEMENTATION_PLAN.md`
> 3. `PLAYGROUND_FEATURE_TECH_SPEC.md`
> 4. `NOTES_FEATURE_TECH_SPEC.md`
> 5. `SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md`

---

## 1. Executive Summary: Completed vs. Pending Overview

| Pillar / Module | Completion Status | What's Working Today | Key Missing / Pending Features |
| :--- | :---: | :--- | :--- |
| **Module A: Algorithm Suite (Units 1-5)** | **~85%** | 22 numerical solvers fully interactive with KaTeX derivations, steps tables, & Chart.js plots. | Secant Method, Gauss Quadrature, full Matrix operations (LU, Jacobi, Eigenvalues), 1-click code export generator (Python/MATLAB/C++). |
| **Module B: Notion-Style Notes Workspace** | **~75%** | Block editor (H1/H2/Text/KaTeX/Callout), live embedded math solver widgets, tags, search, access key sharing. | Interactive QuizBlock widgets (MCQ/numeric tolerance), direct ink-to-block auto-sync, public cloud community feed. |
| **Module C: Smart Whiteboard Playground** | **~80%** | Hardware-accelerated canvas, Catmull-Rom smoothing, Smart Blocks (Equation, Graph, Theory, Sketch, Audio, Image), Bezier links, offline ambient audio. | Quantized INT8 ONNX WebWorker OCR, live auto-evaluator overlay, drag-drop multi-curve graph layering, sketch-to-equation reverse fitting. |
| **Module D: Gamification & Community** | **~10%** | Dark/Light editorial theme toggle, static sitemaps, offline PWA caching. | /Profile is UnderConstruction. Streaks, XP system, badges, leaderboard, and viral classroom sharing loop are pending. |
| **Module E: AI Tutor & Solver** | **~20%** | Floating CAS action button, MathJS/Nerdamer symbol operations, OCR scaffolding. | Step-by-step AI problem tutor sidebar, photo textbook scanner, live multimodal chat assistant. |
| **Platform Infrastructure & Monetization** | **~25%** | Next.js 16 App Router, Workbox PWA service worker, static pre-rendering, responsive mobile dock. | Zustand stores + TanStack Query v5 migration, Supabase backend + Cloudflare R2, Stripe Pro billing ($1.99/mo), navigation ad counter. |

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
- [ ] **Interactive QuizBlock Widgets**:
  - Multiple Choice Questions (MCQ) with 2-4 options and answer explanation toggle.
  - Short Answer / Numerical Input evaluating answers within math tolerance (Â±0.001).
  - Self-check reveal step-by-step KaTeX solutions.
- [ ] **Handwritten Ink Blocks**:
  - Ability to embed raw vector sketches from the whiteboard directly into notes.
- [ ] **Academic PDF & Clean Vector SVG Export**:
  - High-resolution, un-watermarked academic PDF lab report generation via `jspdf`.
- [ ] **Global Community Notes Feed**:
  - Public note repository where students and teachers publish study notes with client-side indexing (FlexSearch / Fuse.js).

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

#### Pending Deliverables for Module C:
- [ ] **Quantized INT8 ONNX WebWorker OCR**:
  - Client-side stroke-to-LaTeX recognition running in background WebWorkers without external API latency.
- [ ] **Live Handwritten Math Auto-Evaluation (Apple Math Notes Parity)**:
  - Writing `24 * 5 =` or `d/dx(x^3)=` automatically evaluates and displays the result directly next to the `=` sign.
- [ ] **Drag-to-Connect Multi-Curve Graph Layering**:
  - Dragging an Equation Block over an existing Graph Block appends a secondary curve dataset to the same chart instead of creating duplicate widgets.
- [ ] **Reverse Sketch-to-Equation Fitting** (`graphToEquation.js` & `sketchShapeAnalyzer.js`):
  - Analyzing hand-drawn curves to classify candidate models (Linear, Polynomial, Sinusoidal, Exponential) and generating the best-fit equation with an R^2 confidence score.
- [ ] **Global CAS Symbol Scope Manager** (`scopeManager.js`):
  - Auto-propagating variable definitions across multiple blocks (a = 5 implies f(a) updates live).
- [ ] **R-Tree Spatial Indexing** (`spatialIndexRTree.js`):
  - Sub-8ms O(log N) hit-testing for scratch-out erasing and lasso selection across thousands of strokes.

---

### Module D: Gamification, Profile & Community

#### Completed & Verified Functionality:
- [x] Editorial theme toggles (Dark / Light / System) across all pages.
- [x] Local settings persistence in `/Setting`.
- [x] PWA offline caching via Workbox and dedicated `/offline` route.

#### Pending Deliverables for Module D:
- [ ] **Profile Page Implementation (`/Profile`)**:
  - Currently renders placeholder `<UnderConstruction />`.
  - Needs user statistics dashboard, solved algorithms tally, saved notebooks count, and activity graphs.
- [ ] **LeetCode-Style Gamification**:
  - **Daily Streaks**: Streak counter tracking consecutive days of problem solving.
  - **XP & Leveling System**: Earn XP for running algorithm calculations, creating study notes, and taking quizzes.
  - **Achievement Badges**: Unlock badges (e.g., "Numerical Wizard", "Matrix Master", "Calculus Architect").
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
- [ ] **Monetization & Tiered Paywalls**:
  - Stripe / Razorpay checkout integration for:
    - Free Tier ($0)
    - Pro Monthly ($1.99 / mo)
    - Pro Yearly ($12.99 / yr)
    - Lifetime Access ($49.99)
- [ ] **Smart Navigation-Based Ad Engine**:
  - Implementing `useAdNavigationTracker` hook to trigger interstitial ads only every 4 page transitions on the Free Tier (zero mid-stroke ads).
- [ ] **Cloud Backend Integration**:
  - Supabase PostgreSQL for user accounts, public shared notes, and RLS data security.
  - Cloudflare R2 bucket for zero-egress asset storage.

---

## 3. Prioritized Implementation Roadmap

### Phase 1: High-Impact Core Features (Immediate Priority)
1. **Implement QuizBlock Widget in Notes**: Add MCQ and numeric tolerance question blocks with answer explanations.
2. **Build /Profile Dashboard**: Replace `<UnderConstruction />` with active user stats, saved notes count, and local streak tracker.
3. **Live Handwritten Math Auto-Evaluation**: Connect `=` gesture detection to background MathJS evaluator in Playground canvas.
4. **Missing Numerical Algorithms**: Implement the Secant Method and Gauss Elimination.

### Phase 2: Platform Maturation (Medium Priority)
1. **Drag-to-Connect Multi-Curve Plotting**: Allow dragging an Equation Block over a Graph Block to plot multiple curves on one chart.
2. **Polyglot Code Generator**: Add Python, MATLAB, and C++ code export tabs to all algorithm pages.
3. **Zustand + Dexie State Migration**: Unify canvas state, undo/redo delta history, and notes storage into persistent IndexedDB stores.
4. **Academic PDF Lab Report Export**: Implement clean multi-page PDF generation in Notes and Playground.

### Phase 3: SaaS & Cloud Scale (Final Stage)
1. **Stripe Subscription Billing**: Pro Monthly, Yearly, and Lifetime tier paywalls.
2. **Supabase Cloud Sync & Public Notes Feed**: Global search and cloud sharing permalinks.
3. **Smart Navigation Ad Frequency Counter**: Non-intrusive page-transition ads for free-tier users.
4. **Multimodal AI Homework Assistant**: Cloud-assisted step-by-step problem solver.

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

**Implementation**: Store events in `localStorage` under `netz_analytics_events[]`. Flush to a serverless analytics endpoint (Vercel Analytics, Plausible, or Supabase `events` table) on page unload via `navigator.sendBeacon()`.

---

### 4.3 Retention & Streak Analytics

| Metric | Formula | Target |
| :--- | :--- | :--- |
| Day-1 Retention | Users active on Day 1 after first visit / New users | >= 40% |
| Day-7 Retention | Users active on Day 7 / New users on Day 0 | >= 20% |
| Day-30 Retention | Users active on Day 30 / New users on Day 0 | >= 10% |
| Median Streak Length | Median of `netz_streak.current` across all users | >= 3 days at 60-day mark |
| Streak Reset Rate | Users who reset streak (miss day) / Total streaking users | <= 30% daily |

**Streak engagement loop**: Daily login -> +20 XP -> streak counter update -> badge unlock toast -> re-engagement the next day.

---

### 4.4 Technical Performance SLAs

| Metric | Measurement | Target SLA |
| :--- | :--- | :--- |
| Algorithm Compute Latency | `performance.now()` from Run click to table render | <= 200ms for n <= 100 iterations |
| Canvas Frame Rate | `requestAnimationFrame` FPS during active drawing | >= 60 FPS on mid-range hardware |
| OCR Recognition Latency | Image capture to LaTeX string output (Tesseract) | <= 3,000ms |
| Note Load Time | Time to render a 50-block note from IndexedDB | <= 400ms |
| PWA Offline Load Time | Full interactive from service worker cache | <= 1,500ms |
| Largest Contentful Paint | Core Web Vital (LCP) | <= 2,500ms |
| R-Tree Hit-Test Latency | Eraser hit-test across 10,000 strokes | <= 8ms |

**Measurement tools**: `performance.now()` timestamps around critical operations, logged to `netz_perf_log` in localStorage, surfaced on the Profile dashboard as a "System Health" card.

---

### 4.5 Monetization Funnel Metrics

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
- Free tier limits: 3 Playground sessions/day, 5 notes total, no PDF export
- Show upgrade modal when limit is hit: "Upgrade to Pro â€” $1.99/mo"
- Track encounters via `useAdNavigationTracker` (counts page transitions)

---

### 4.6 Community & Viral Growth Metrics

| Metric | Definition | Target |
| :--- | :--- | :--- |
| Shared Note Clicks | Clicks on `NETZ-XXXX` access key links | 500/month by Month 2 |
| Notes Published to Feed | Community notes published per week | >= 50/week at 90-day mark |
| Viral Coefficient (K-Factor) | (Invites sent per user) x (Invite acceptance rate) | K >= 0.5 (strong if K >= 1.0) |
| Teacher Adoption Rate | Educators using Quiz Blocks in notes | Target 10% of power users |
| Cross-Device Sync Usage | Users who access notes on 2+ devices | >= 15% of active users |

---

### 4.7 Feature Rollout Success Gates

Each Phase 1 feature is considered successfully shipped when it meets the following analytics gate:

| Feature | Success Criterion |
| :--- | :--- |
| QuizBlock | >= 30% of note-creating users add >= 1 quiz block within 14 days |
| Profile Dashboard | >= 50% of users visit `/Profile` at least once per week |
| Live Math Auto-Eval | >= 40% of Playground sessions include >= 1 auto-evaluation event |
| Secant Method | Page gets >= 200 unique solves in first 30 days |
| PDF Export | >= 20% of note sessions end with a PDF export within 30 days |

---

### 4.8 Analytic Data Collection Architecture

**Phase 1 â€” Client-only** (`src/app/utils/analytics.js`):

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

// Usage examples:
// trackEvent('ALGORITHM_SOLVED', { algorithm: 'bisection', iterations: 8 });
// trackEvent('NOTE_CREATED', { blockCount: 5 });
// trackEvent('QUIZ_COMPLETED', { correct: true, mode: 'mcq' });
// trackEvent('PAYWALL_HIT', { feature: 'pdf_export' });
```

**Phase 2 â€” Supabase backend**:
- Batch-flush `netz_events[]` to Supabase `events` table via `navigator.sendBeacon()` on `visibilitychange`.
- Supabase dashboard or Metabase/Grafana for KPI visualization.
- `GET /api/analytics/dashboard` route returning aggregated KPIs for admin view.
