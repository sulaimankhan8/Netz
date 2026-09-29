
## 4. Detailed Per-Module Implementation Plans

---

### Plan A — Algorithm Suite: Solvers, Registry & Hub [COMPLETED - Registry & Solvers]

> **Status Update**: All 34 numerical algorithms across Units 1–5 have been implemented with verified numerical solvers, KaTeX step derivations, iteration tables, and default parameters in `src/app/(Primary.pages)/Notes/utils/algorithmRegistry.js`. The Algorithm Hub (`/Algorithems`) and Notes Embedded Math Widget (`EmbeddedMathWidget.js`) now natively support all 34 algorithms with dynamic unit badge counts and parameter matrix grids.

#### A1. Secant Method (`/secant-method`) [COMPLETED in Registry & Route]

**Route**: `src/app/(pages.algorithems)/(UNIT-1)/secant-method/page.js`

Algorithm: Approximates roots without requiring derivatives. Uses two initial guesses x0/x1, converges at ~order 1.618.

Formula: `x_{n+1} = x_n - f(x_n) * (x_n - x_{n-1}) / (f(x_n) - f(x_{n-1}))`

Steps:
1. Copy page scaffold from `bisection-method/page.js` (BlockMath, InlineMath, AlgorithmNavigation, EditorialThemeToggle pattern)
2. Create `algorithems.secant-method.js` solver:
   - Input: exprStr, x0, x1, tol, maxIter
   - Use `parseUserFunction` from evaluateMath.js
   - Guard: if abs(fx1 - fx0) < 1e-14 throw "Denominator near zero"
   - Output: iteration table rows with {iter, x0, x1, x2, fx0, fx1, ea}
3. Reuse Chart.js convergence plot pattern from bisection
4. Register in sitemap.js and AlgorithmNavigation

**Effort**: ~4 hours

---

#### A2. Gauss Quadrature (`/gauss-quadrature`)

**Route**: `src/app/(pages.algorithems)/(UNIT-3)/gauss-quadrature/page.js`

Algorithm: Fixed-node quadrature; approximates integrals with degree 2n-1 precision using n points.

Hardcoded nodes/weights (no runtime computation):
- n=2: nodes [-0.5773502692, 0.5773502692], weights [1.0, 1.0]
- n=3: nodes [-0.7745966692, 0, 0.7745966692], weights [0.5556, 0.8889, 0.5556]
- n=4 and n=5: standard Gauss-Legendre values

Transformation: `I = ((b-a)/2) * sum(w_i * f(((b-a)/2)*t_i + (a+b)/2))`

Steps:
1. Inputs: f(x), a, b, n (dropdown 2/3/4/5)
2. Use parseUserFunction from evaluateMath.js
3. Table: Node(t_i), Weight(w_i), x_i(mapped), f(x_i), product
4. Verification row comparing to Simpson 3/8

**Effort**: ~3 hours

---

#### A3. Advanced Matrix Suite (Unit 4)

New routes: `/gauss-elimination`, `/gauss-jordan`, `/lu-decomposition`, `/jacobi-method`, `/matrix-inverse`

Shared component: `MatrixInputGrid.js`
- n x (n+1) augmented matrix of input cells
- Size selector 2x2 to 6x6
- "Random Example" button with diagonally dominant values

Gauss Elimination (partial pivoting):
- Forward elimination with row swapping for numerical stability
- Back substitution for solution vector
- Show each elimination step as animated table

LU Decomposition (Doolittle):
- Decompose A into L (lower triangular, 1s on diagonal) and U (upper triangular)
- Forward substitution: Ly = b -> solve y
- Back substitution: Ux = y -> solve x
- Display L and U matrices visually

Jacobi Iterative Method:
- Decompose A = D + R
- Iterate: x^(k+1) = D^{-1}(b - R*x^k) until convergence
- Guard: check diagonal dominance, warn if not strictly dominant

**Effort**: ~10 hours total

---

#### A4. Polyglot Code Export Engine

Files:
- CREATE: `src/app/utils/codeExportEngine.js` — template generator functions
- CREATE: `src/app/components/CodeExportPanel.js` — tab UI component

CodeExportPanel renders language tabs: [Python] [MATLAB] [C++] [JavaScript]
Each tab: syntax-highlighted pre/code block + copy-to-clipboard button

Template pattern (Bisection):
- Python: uses numpy, for loop, print result
- MATLAB: uses @(x) anonymous function, fprintf
- C++: #include cmath, double main
- JavaScript: plain ES6 function, console.log

Integration: Add `<CodeExportPanel lastRun={runState} algorithm="bisection" />` at bottom of each algorithm page after results table.

**Effort**: ~6 hours

---

#### A5. WebWorker Offloading

File: `src/app/utils/workers/algorithmWorker.js`

Use native `new Worker(new URL('...', import.meta.url))` (Next.js 16 supports this natively).

Worker protocol:
- Receive: { algorithm: 'bisection', params: { expr, a, b, tol, maxIter } }
- Post back: { status: 'done', result } OR { status: 'error', message }

Usage in each algorithm page:
- useRef for worker instance
- useEffect to create + cleanup worker
- 200ms spinner threshold; 5s hard timeout -> terminate + error

**Effort**: ~4 hours

---

### Plan B — Notes Module: QuizBlock, PDF Export, Community [COMPLETED]

#### B1. QuizBlock Widget [COMPLETED]

Files:
- CREATED: `src/app/(Primary.pages)/Notes/components/QuizBlock.js`
- EDITED: `NoteBlockItem.js` — handles `block.type === 'quiz'`
- EDITED: `SlashCommandMenu.js` — registered `/quiz` command
- EDITED: `NoteEditor.js` — default quiz block template generator
- EDITED: `sampleNotes.js` — sample notes pre-populated with MCQ and numeric tolerance quizzes

Block data schema:
```json
{
  "id": "b-123456789",
  "type": "quiz",
  "content": "Interactive Quiz Block",
  "quizConfig": {
    "question": "What is the order of convergence for Newton-Raphson method?",
    "mode": "mcq",
    "options": ["Linear (Order 1)", "Quadratic (Order 2)", "Superlinear (Order 1.618)", "Cubic (Order 3)"],
    "correctOptionIndex": 1,
    "correctNumericValue": 2.7065,
    "tolerance": 0.001,
    "explanation": "Newton-Raphson exhibits quadratic convergence (order 2) near simple roots."
  }
}
```

Features delivered:
- Dual Mode: Multiple Choice Question (MCQ, 2 to 6 dynamic options) or Numeric Tolerance ($|x - x_0| \le \text{tol}$).
- Live KaTeX rendering for math in questions, options, and step-by-step explanations.
- Author / Solve Mode toggle: Creators configure problems; students test knowledge with instant visual validation.
- Attempt counter and reset/try-again functionality.

---

#### B2. Academic PDF Export [COMPLETED]

Files:
- CREATED: `src/app/(Primary.pages)/Notes/utils/pdfExport.js`
- EDITED: `NoteEditor.js` — added "Export PDF" gradient button in the header toolbar

Features delivered:
- High-resolution $2\times$ retina rasterization using `html2canvas`.
- Multi-page pagination splitting on standard A4 format ($210 \times 297$ mm) via `jspdf`.
- Dynamic filename sanitization (`[title].pdf`) and automatic loading spinner state during export.

---

#### B3. Handwritten Ink Block [COMPLETED]

Files:
- CREATED: `src/app/(Primary.pages)/Notes/components/InkSketchBlock.js`
- EDITED: `NoteBlockItem.js` — renders `block.type === 'ink'`
- EDITED: `SlashCommandMenu.js` — registered `/ink` command
- EDITED: `NoteEditor.js` — ink block initializer

Features delivered:
- Upgraded beyond a static SVG viewer into an interactive HTML5 drawing canvas.
- Stylus, pen, and eraser tools with customizable stroke widths and 6 curated color swatches.
- Touch & pointer smoothing with pressure-like path stroke rendering.
- Import from Whiteboard queue (`netz_whiteboard_export` / `netz_pendingInkBlocks`).
- Local PNG/SVG/JPEG image upload and instant block snapshot download.

---

#### B4. Community Notes Feed [COMPLETED - Phase 1]

Files:
- EDITED: `src/app/(Primary.pages)/Notes/components/NoteShareModal.js`
- EDITED: `src/app/(Primary.pages)/Notes/page.js` — integrated `handleCloneCommunityNote`

Features delivered:
- Dual-tab sharing modal: **Share Note** (key generation, public/private toggle, direct URL copying) and **Explore Community**.
- Curated engineering lecture notes across Units 1–5 (Bisection, Gauss-Seidel, Simpson's Rules, Runge-Kutta).
- Instant search filter by note title, subject, and syllabus unit tags.
- 1-Click "Clone to Workspace" with automatic unique access key generation and state synchronization.

---

#### B5. Notes Navigation & Header Polish [COMPLETED]

Files:
- EDITED: `src/app/(Primary.pages)/Notes/components/NoteEditor.js`
- EDITED: `src/app/(Primary.pages)/Notes/components/NoteSidebar.js`

Features delivered:
- Removed duplicate sidebar expand arrow button (`>>`) from the note editor header.
- Preserved clean single-rail collapsed sidebar with expand button (`>>`), quick note creation (`+`), and studio branding.

---

### Plan C — Playground: OCR, Auto-Eval, Multi-Curve, R-Tree

#### C1. Live Math Auto-Evaluation

Target: `src/app/(Primary.pages)/Playground/components/blocks/EquationBlock.js`

Logic: useEffect watching block.content -> if content.trim().endsWith('=') -> strip '=' -> math.evaluate() -> setAutoResult

No new dependency (mathjs already in evaluateMath.js).

JSX overlay (below KaTeX render):
- div with emerald-500 color, font-mono
- "= [autoResult] auto" with fadeIn animation

**Effort**: ~2 hours

---

#### C2. Drag-to-Connect Multi-Curve Graph Layering

Current state: GraphBlock.js already has curves[] array and renders multiple datasets. Missing: drop target detection.

SmartBlockWrapper.js changes:
- Add onDrop handler: read blockId from dataTransfer
- If this block.type === 'graph' and dragged block.type === 'equation' -> call onMergeEquationIntoGraph

PlaygroundCanvasContainer.js:
- mergeEquationIntoGraph(graphBlockId, equationExpr) function
- Finds graph block, appends new curve: { id: nanoid(), expr: 'y = '+equationExpr, color: CURVE_COLORS[n], visible: true }

Visual: pulsing green ring on Graph Blocks during equation drag-over

**Effort**: ~4 hours

---

#### C3. OCR WebWorker (Tesseract immediate + ONNX Phase 3)

Immediate — Tesseract.js in WebWorker:
- File: `src/app/utils/workers/ocrWorker.js`
- createWorker('eng') with char_whitelist for math chars
- Message protocol: OCR_START(imageData) -> OCR_RESULT(text)

Phase 3 — INT8 ONNX:
- Model: Pix2Tex or MathBERT quantized to INT8 (~15MB)
- Runtime: onnxruntime-web with WASM SIMD
- Pipeline: Binarize -> pad 224x224 -> inference -> decode LaTeX
- Message protocol: INIT_MODEL -> RUN_INFERENCE(imageData) -> RESULT(latexString)

**Effort**: Tesseract ~4h, ONNX ~20h

---

#### C4. R-Tree Spatial Indexing

Library: rbush (npm install rbush) — high-perf 2D R-Tree

File: `src/app/(Primary.pages)/Playground/utils/spatialIndexRTree.js`

StrokeRTree class:
- insertStroke(stroke) — compute bbox from points array, insert with id
- removeStroke(strokeId) — find + remove from tree
- queryAtPoint(x, y, radius=4) — search with minX/maxX/minY/maxY
- queryInRect(x1, y1, x2, y2) — lasso selection

Integration in WhiteboardCanvas.js:
- Instantiate tree on mount
- Replace O(n) stroke loop with O(log n) tree.queryAtPoint in erase mode
- Update tree on every stroke commit and delete

**Effort**: ~4 hours

---

#### C5. Global CAS Symbol Scope Manager

File: `src/app/(Primary.pages)/Playground/utils/scopeManager.js`

Singleton scope Map shared across all blocks:
- set(varName, value) -> update Map + dispatch 'scopeUpdated' CustomEvent
- get(varName) -> Map.get
- getAll() -> Object.fromEntries(globalScope)
- clear() -> Map.clear()

Each EquationBlock listens to 'scopeUpdated' window events and re-evaluates using math.evaluate(expr, scopeManager.getAll()).

**Effort**: ~3 hours

---

### Plan D — Profile & Gamification

#### D1. Profile Page Dashboard

Replace: `src/app/(Primary.pages)/Profile/page.js`

7 sections:
1. User Stats Card — initials avatar, editable display name, join date (first-visit timestamp)
2. Algorithm Completion Grid — reads netz_solved_algorithms, renders icon grid with solved/unsolved state
3. Activity Heatmap — 52-week SVG grid from netz_activity_log (date -> count), hover tooltip
4. Streak Counter — netz_streak.current + longest, animated flame icon
5. Notebook Counter — count from noteStorage.js
6. XP Progress Bar — netz_xp.total, level badge, progress to next level (100 XP each)
7. Badge Showcase — unlocked badges from netz_badges_unlocked, glow on recent unlock

localStorage keys:
- netz_solved_algorithms: { 'bisection-method': true }
- netz_activity_log: { '2026-09-28': 5 }
- netz_streak: { current:7, longest:14, lastActiveDate:'2026-09-28' }
- netz_xp: { total:340, level:4 }
- netz_badges_unlocked: ['first_root', 'week_streak']

XP rewards: SOLVE_ALGORITHM +10, CREATE_NOTE +5, COMPLETE_QUIZ +15, DAILY_LOGIN +20, SHARE_NOTE +8

**Effort**: ~8 hours

---

#### D2. Gamification Utility

File: `src/app/utils/gamification.js`

Functions:
- awardXP(action) — read netz_xp, add reward, recalculate level, persist, call updateActivity()
- updateStreak() — compare lastActiveDate to yesterday/today, increment or reset, persist netz_streak
- updateActivity() — increment netz_activity_log[today] count

**Effort**: ~3 hours

---

#### D3. Badge System

File: `src/app/utils/badges.js`

BADGES array with objects: { id, name, desc, icon (emoji), condition: (stats) => boolean }

Badge examples:
- first_root: solvedCount >= 1
- bisection_master: bisectionRuns >= 10
- matrix_wizard: matrixSolved >= 5
- note_scholar: notesCount >= 10
- week_streak: streak.current >= 7
- quiz_ace: quizzesSolved >= 20
- level_5: level >= 5

checkAndUnlockBadges(stats):
- Compare BADGES against netz_badges_unlocked
- Return array of newly unlocked badges
- Show toast notification for each

**Effort**: ~2 hours

---

### Plan E — AI Tutor & OCR Scanner

#### E1. Step-by-Step AI Solver Sidebar

Option A — Client-Side CAS (offline, no backend):
- Use nerdamer and mathjs (already installed)
- Derive step-by-step rule outputs for simplification, differentiation, integration
- Sidebar component AITutorSidebar.js with history in sessionStorage

Option B — Gemini API (Phase 3):
- API route /api/ai-tutor (POST)
- Streamed response via ReadableStream
- react-markdown + remark-math + rehype-katex for render

**Effort**: Option A ~8h, Option B +4h

---

#### E2. Photo Textbook OCR Scanner

UI flow:
1. Toolbar button "Scan Problem" opens modal
2. [Upload Image] or [Take Photo via getUserMedia/camera]
3. Resize to max 1200px, convert to ImageData
4. Send to ocrWorker.js (Tesseract.js)
5. Parse result for math expressions with regex
6. Present checklist of detected expressions
7. User selects -> inserted as EquationBlocks on canvas

Math pattern regex: `/[\d\+\-\*\/\^\(\)=a-zA-Z]{3,}/g`

**Effort**: ~6 hours

---

### Plan F — Platform Infrastructure

#### F1. Zustand Stores

Install: npm install zustand

Files in src/app/stores/:
- useAuthStore.js — userId (UUID v4), displayName, joinDate
- useGamificationStore.js — xp, level, streak, badges (persist middleware)
- useCanvasStore.js — blocks[], strokes[], undoHistory (Dexie-backed)
- useNotesStore.js — notes[] (Dexie-backed)
- useUIStore.js — sidebarOpen, theme, activeModal
- useSubscriptionStore.js — tier: 'free' | 'pro'

Pattern: create(persist((set, get) => ({...}), { name: 'netz-store-name' }))

**Effort**: ~8 hours

---

#### F2. Dexie.js IndexedDB Persistence

Install: npm install dexie

File: src/app/utils/db.js
- NetzDB v1 schema:
  - canvasSessions: ++id, name, updatedAt, data
  - notes: ++id, title, tags, updatedAt, blocks
  - activityLog: ++id, date, actions

Migration: Replace localStorage note writes in noteStorage.js with db.notes.put(). Bypasses 5MB ceiling.

**Effort**: ~5 hours

---

#### F3. Stripe Billing

Install: @stripe/stripe-js (client), stripe (server)

API routes:
- /api/checkout POST — create Stripe Checkout Session, return URL
- /api/webhook POST — handle checkout.session.completed, update Supabase subscription
- /api/subscription GET — return current user tier

Tiers (env vars):
- STRIPE_PRICE_PRO_MONTHLY — $1.99/mo
- STRIPE_PRICE_PRO_YEARLY — $12.99/yr
- STRIPE_PRICE_LIFETIME — $49.99 one-time

Paywall triggers: free tier limited to 3 Playground sessions/day, 5 notes, no PDF export. Show upgrade modal when limit reached.

**Effort**: ~12 hours

---

## 5. Analytic Model & KPI Framework

> Defines measurement framework for product health, engagement, and business viability. Phase 1 uses client-only localStorage events. Phase 2 upgrades to Supabase backend.

---

### 5.1 North Star Metric

| Metric | Definition | Target |
| :--- | :--- | :--- |
| **Weekly Active Solvers (WAS)** | Unique users who run >= 1 algorithm calculation in 7 days | 1,000 WAS within 90 days of launch |

Rationale: WAS measures core value delivery (problem solving) — better than pageviews or DAU alone.

---

### 5.2 Module-Level Engagement KPIs

| Metric | Formula | Target |
| :--- | :--- | :--- |
| Algorithm Solve Rate | (Run clicks) / (Algorithm page visitors) | >= 60% |
| Notes Creation Rate | (Users creating >= 1 note) / (/Notes visitors) | >= 35% |
| Playground Block Rate | (Users adding >= 1 Smart Block) / (/Playground opens) | >= 40% |
| Quiz Completion Rate | (Quizzes submitted) / (Quizzes rendered) | >= 70% |
| Audio Activation Rate | (Ambient audio starts) / (Playground sessions) | >= 25% |

Implementation: Store events in `netz_analytics_events[]` in localStorage. Flush to analytics backend on page unload via navigator.sendBeacon().

---

### 5.3 Retention & Streak Analytics

| Metric | Formula | Target |
| :--- | :--- | :--- |
| Day-1 Retention | Active Day 1 / New users | >= 40% |
| Day-7 Retention | Active Day 7 / New users on Day 0 | >= 20% |
| Day-30 Retention | Active Day 30 / New users on Day 0 | >= 10% |
| Median Streak Length | Median of netz_streak.current | >= 3 days at 60-day mark |
| Streak Reset Rate | Streak resets / Streaking users daily | <= 30% |

Engagement loop: Daily login -> +20 XP -> streak update -> badge unlock toast -> return next day.

---

### 5.4 Technical Performance SLAs

| Metric | Measurement | Target |
| :--- | :--- | :--- |
| Algorithm Compute Latency | performance.now() from Run to table render | <= 200ms (n <= 100 iterations) |
| Canvas Frame Rate | rAF FPS during drawing | >= 60 FPS mid-range hardware |
| OCR Latency | Image capture to LaTeX string (Tesseract) | <= 3,000ms |
| Note Load Time | 50-block note render from IndexedDB | <= 400ms |
| PWA Offline Load | Full interactive from SW cache | <= 1,500ms |
| Largest Contentful Paint | Core Web Vital | <= 2,500ms |
| R-Tree Hit-Test | Erase hit across 10,000 strokes | <= 8ms |

Measurement: performance.now() timestamps on critical ops, logged to `netz_perf_log`, surfaced as "System Health" card on Profile page.

---

### 5.5 Monetization Funnel KPIs

| Stage | Metric | Target |
| :--- | :--- | :--- |
| Awareness | Unique visitors/month | 10,000 by Month 3 |
| Activation | Users completing >= 1 solve | >= 60% of visitors |
| Paywall Encounter | Free users hitting Pro gate | >= 20% of active free users |
| Conversion (Free -> Pro) | Pro signups / Paywall encounters | >= 5% |
| MRR Growth | Month-over-month MRR | >= 20% MoM for 6 months |
| LTV / CAC | Lifetime Value / Acquisition Cost | >= 3:1 |
| Churn | Monthly Pro cancellations | <= 5%/month |
| Ad Revenue per Free User | CPM x impressions / free users | $0.50/user/month |

Free tier limits triggering upgrade: 3 Playground sessions/day, 5 notes max, no PDF export.

---

### 5.6 Community & Viral Growth KPIs

| Metric | Definition | Target |
| :--- | :--- | :--- |
| Shared Note Clicks | Clicks on NETZ-XXXX links | 500/month by Month 2 |
| Notes Published/Week | Community notes published weekly | >= 50/week at Day 90 |
| Viral Coefficient (K) | (Invites sent/user) x (acceptance rate) | K >= 0.5, strong at K >= 1.0 |
| Teacher Adoption | Educators using Quiz Blocks | 10% of power users |
| Cross-Device Sync | Users on 2+ devices | >= 15% of active users |

---

### 5.7 Feature Rollout Success Gates

| Feature | Shipped When |
| :--- | :--- |
| QuizBlock | >= 30% of note creators add >= 1 quiz within 14 days |
| Profile Dashboard | >= 50% of users visit /Profile >= 1x/week |
| Live Math Auto-Eval | >= 40% of Playground sessions trigger >= 1 auto-eval |
| Secant Method | >= 200 unique solves in first 30 days |
| PDF Export | >= 20% of note sessions end with PDF export within 30 days |

---

### 5.8 Analytic Data Collection Architecture

**Phase 1 — Client Only** (`src/app/utils/analytics.js`):
```
export function trackEvent(eventName, properties = {}) {
  const events = JSON.parse(localStorage.getItem('netz_events') || '[]');
  events.push({
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSessionId(),
  });
  if (events.length > 500) events.splice(0, events.length - 500);
  localStorage.setItem('netz_events', JSON.stringify(events));
}
```

Usage: trackEvent('ALGORITHM_SOLVED', { algorithm:'bisection', iterations:8 })

**Phase 2 — Supabase Backend**:
- Batch-flush via navigator.sendBeacon() on visibilitychange
- Supabase `events` table for KPI dashboards
- Admin route: GET /api/analytics/dashboard returns aggregated metrics

---

## 6. Recommended 12-Week Sprint Sequence

| Sprint | Weeks | Deliverables | Analytic Gate |
| :--- | :--- | :--- | :--- |
| Sprint 1 | 1-2 | Secant Method, Gauss Elimination, QuizBlock (MCQ), Live Auto-Eval in EquationBlock, analytics.js | 200 Secant solves, 30% quiz block adoption |
| Sprint 2 | 3-4 | Profile Dashboard + Streak + Gamification + Badges, Gauss Quadrature, PDF Export | 50% Profile visit rate, >= 3 day median streak |
| Sprint 3 | 5-6 | Multi-Curve Drag-Drop, Code Export Engine (5 algorithms x 4 languages), R-Tree indexing | Canvas >= 60 FPS, <= 8ms R-Tree hit-test |
| Sprint 4 | 7-8 | Zustand stores, Dexie.js IndexedDB, Full Matrix Suite (LU, Jacobi, Inverse) | Note load <= 400ms, canvas undo/redo stable |
| Sprint 5 | 9-10 | Tesseract OCR Scanner modal, Ink Block bridge, AI Tutor Sidebar (CAS Option A), Scope Manager | OCR <= 3s, 40% auto-eval session rate |
| Sprint 6 | 11-12 | Supabase backend, Community Notes Feed, Stripe billing + paywalls, Navigation Ad Engine | K-Factor >= 0.5, 5% Free-to-Pro conversion |
