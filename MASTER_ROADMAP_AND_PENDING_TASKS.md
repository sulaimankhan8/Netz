# NETZ — Master Roadmap & Pending Deliverables Audit (2026)

> **Document Status**: Definitive Product & Engineering Roadmap  
> **Creation Date**: October 14, 2026  
> **Scope**: Comprehensive audit of all 15+ architectural blueprints, feature specs, handoffs, and ongoing implementations.  
> **Operating Rule**: Strict architectural reference — Zero code edits performed in this audit.

---

## 1. Executive Summary & Source Document Synthesis

This document consolidates and reconciles all forward-looking plans, technical specifications, and handoff notes in the NETZ workspace:
1. `NETZ_MASTER_PRODUCT_AND_TECHNICAL_BLUEPRINT.md` (Product & Mathematical Architecture)
2. `PENDING_ROADMAP.md` (Prior Status Audit & KPI Framework)
3. `PLAYGROUND_HANDOFF.md` (Playground State of the Art, Phase A–D, Touch-First Benchmarks)
4. `PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md` (Handwriting Engine & Benchmark Analysis)
5. `PLAYGROUND_DUAL_MODE_ANALYSIS_AND_FEASIBILITY.md` (Normal vs. Notes Mode, Ray-Casting Lasso, Ruled Line Snapping)
6. `PLAYGROUND_MODES_SPECIFICATION.md` (Detailed Dual-Mode State Contract)
7. `CODE_EXPORT_AND_WEBWORKER_IMPLEMENTATION_PLAN.md` (Polyglot Code Generator & Worker Watchdog)
8. `NETZ_BACKEND_IMPLEMENTATION_PLAN.md` (Multi-Project VPS, Neon PostgreSQL, Redis, Dual Stripe/Razorpay)
9. `NOTES_FEATURE_TECH_SPEC.md` (Block Architecture, Embedded Solvers, Sharing)
10. `SAAS_STATE_MANAGEMENT_AND_GROWTH_PLAN.md` (Zustand, Dexie.js, Dual-Gateway Paywalls)
11. `NETZ_ONNX_HEURISTIC_ARCHITECTURE_IMPLEMENTATION_PLAN.md` (Continuous Multi-Hypothesis Neural Ink Engine)
12. `HANDWRITING_SYSTEM_EVOLUTION_PART1.md` & `PART2.md` (Stroke Segmentation & CTC/Transformer Decoders)

---

## 2. Pillar-by-Pillar Status Matrix (Completed vs. Pending)

| Pillar / Module | Completion | What Is Shipped & Verified Today | What Is Strictly Pending / Left To Do |
| :--- | :---: | :--- | :--- |
| **Module A: Algorithm Suite (Units 1–5)** | **~90%** | 34+ numerical solvers across Units 1–5 with KaTeX derivations, iteration tables, Chart.js plots, and Algorithm Hub. | **1.** Polyglot Code Export Engine (`codeExportEngine.js` + modal for Python/MATLAB/C++/JS).<br>**2.** WebWorker Calculation Watchdog (`algorithmWorker.js` with 4s timeout). |
| **Module B: Notion-Style Notes Workspace** | **~85%** | Block editor (H1, H2, Paragraph, KaTeX, Callouts), live embedded 34-algo math widgets, QuizBlock (MCQ + Numeric with step reveal), 2x Academic PDF Export. | **1.** Notion-style public notes hosting (`/p/[slug]` with Next.js ISR).<br>**2.** Neon PostgreSQL cloud persistence & note forking.<br>**3.** Handwritten Ink Block integration (embedding whiteboard sketches directly in notes).<br>**4.** Global community notes discovery feed. |
| **Module C: Smart Whiteboard Playground** | **~80%** | Hardware canvas, Catmull-Rom smoothing, Smart Blocks (Equation, Graph, Theory, Sketch, Audio, Image), Bezier links, offline ambient audio, 3 on-device ONNX models (Router, HMER, HTR), live `=` auto-eval, Phase B1–B5 mobile responsiveness verified. | **1.** VisualViewport keyboard handling (B6).<br>**2.** Orientation/rotation handling (B7).<br>**3.** Multi-finger tap gestures (2-finger undo, 3-finger redo) & drawing/moving toggle (B8).<br>**4.** Phone network load deferral (B9).<br>**5.** Physical hardware testing (B10).<br>**6.** Fit-to-content zoom (C1).<br>**7.** Ink layering over blocks (C2).<br>**8.** Interactive graph pan/zoom (C3).<br>**9.** Per-page IndexedDB delta storage (C4).<br>**10.** Snapped shape editing & arrows (C5).<br>**11.** Straight-line highlighter (C6).<br>**12.** Multi-page PDF export (C7).<br>**13.** Picture crop & replace (C8).<br>**14.** Visual math keypad for mobile (C9).<br>**15.** ARIA accessibility (C10).<br>**16.** ONNX inference in Web Worker (C11).<br>**17.** Multi-line sentence/paragraph segmentation into individually convertible parts.<br>**18.** Notes-mode ruled line baseline snapping ($Y_{\text{line}}$).<br>**19.** Ray-casting polygon lasso for figure isolation.<br>**20.** Reverse sketch-to-equation fitting & global CAS scope manager. |
| **Module D: Gamification & Profile** | **~10%** | Dark/Light editorial theme toggle, static sitemaps, offline PWA caching. | **1.** `/Profile` dashboard (currently `<UnderConstruction />`).<br>**2.** Quadratic XP progression engine ($\text{Level} = \lfloor \sqrt{\text{XP}/75} \rfloor + 1$) — streaks explicitly omitted.<br>**3.** Academic rank titles & unlockable badges.<br>**4.** Anti-cheat daily XP rate limits in Redis. |
| **Module E: AI Tutor & Scanner** | **~30%** | Floating CAS action button, MathJS/Nerdamer symbol operations, local OCR scaffolding. | **1.** Step-by-step AI problem tutor sidebar.<br>**2.** Photo textbook OCR problem scanner.<br>**3.** Context-aware math error/convergence advisor. |
| **Platform Infrastructure & Monetization** | **~20%** | Next.js 16 App Router, Workbox PWA service worker, static pre-rendering, responsive mobile dock. | **1.** Dual-engine state migration (Zustand + TanStack Query + Dexie.js).<br>**2.** Single VPS Docker Compose orchestration (NETZ, Signaturely, Discord bot, Redis, PostgreSQL).<br>**3.** Neon PostgreSQL DDL schema & JWT auth endpoints.<br>**4.** Dual payment gateways: Stripe (Global) + Razorpay (India UPI/Cards).<br>**5.** Navigation ad frequency tracker (every 4 page changes on Free tier). |
| **Navigation & Editorial UI** | **~85%** | Responsive desktop & mobile sidebar, theme toggle, algorithms directory. | **1.** Fix sidebar hover transitions & sub-menu persistence.<br>**2.** Rail hover flyouts for collapsed state. |

---

## 3. Comprehensive Pending Backlog by Technical Domain

### 3.1 Domain A: Numerical Engine Upgrades (Module A)

#### Task A-1: Polyglot Code Export Engine & Modal
- **Source Plan**: `CODE_EXPORT_AND_WEBWORKER_IMPLEMENTATION_PLAN.md`
- **Target Files**:
  - `src/app/utils/codeExportEngine.js` (NEW)
  - `src/app/components/CodeExportPanel.js` (NEW)
  - Integration into all 34 algorithm pages and `EmbeddedMathWidget.js`.
- **Scope**:
  - Generates standalone, verified, copy-pasteable source scripts in **Python (NumPy)**, **MATLAB (.m)**, **C++17**, and **JavaScript (Node ES6)**.
  - Automatically injects current user inputs (function string, initial guesses, tolerance, max iterations).
  - UI modal with language selector tabs, syntax-highlighted code viewer, "Copy Code" button, and 1-click direct file download (`.py`, `.m`, `.cpp`, `.js`).

#### Task A-2: WebWorker Watchdog Engine for Numerical Solvers
- **Source Plan**: `CODE_EXPORT_AND_WEBWORKER_IMPLEMENTATION_PLAN.md`
- **Target Files**:
  - `src/app/utils/workers/algorithmWorker.js` (NEW)
  - `src/app/utils/hooks/useAlgorithmWorker.js` (NEW)
- **Scope**:
  - Offloads heavy iterative math loops (e.g. Runge-Kutta high step count, large matrix inversions) from the main UI thread.
  - Hard **4,000 ms watchdog timer**: Terminates worker (`worker.terminate()`) on infinite asymptotic loops or non-converging guesses, preventing UI freezes.
  - Surfaces actionable convergence failure messages.

---

### 3.2 Domain B: Notion-Style Notes Workspace (Module B)

#### Task B-1: Notion-Style Public Notes Hosting Engine (`/p/[slug]`)
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`, `PENDING_ROADMAP.md`
- **Target Files**:
  - `src/app/p/[slug]/page.js` (NEW)
  - `src/app/api/notes/publish/route.js` (NEW)
  - `src/app/(Primary.pages)/Notes/components/NoteShareModal.js`
- **Scope**:
  - "Publish to Web" toggle in `NoteShareModal.js` generating a unique URL slug (`netz.app/p/[slug]`).
  - Next.js App Router dynamic route using Incremental Static Regeneration (ISR).
  - Read-only interactive sandbox allowing visitors to test embedded math widgets and answer quizzes.
  - "Fork to My Notebook" button duplicating the note into the visitor's local workspace.
  - Quota enforcement (Free: 2 public notes, Pro: 10, Lifetime: 60).

#### Task B-2: Cloud Note Persistence & Neon Synchronization
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`
- **Target Files**:
  - `src/app/api/notes/route.js` (NEW)
  - `src/app/(Primary.pages)/Notes/utils/noteStorage.js`
- **Scope**:
  - Seamless background synchronization between local `noteStorage.js` and Neon PostgreSQL `notes` table.
  - Offline-first conflict resolution (last-write-wins with client timestamps).

#### Task B-3: Handwritten Vector Ink Blocks in Notes
- **Source Plan**: `NOTES_FEATURE_TECH_SPEC.md`
- **Target Files**:
  - `src/app/(Primary.pages)/Notes/components/blocks/InkBlock.js` (NEW)
  - `src/app/(Primary.pages)/Notes/components/NoteEditor.js`
- **Scope**:
  - Ability to insert a vector ink drawing pad directly between text and KaTeX blocks.
  - Supports stylus/touch drawing and preserves strokes as SVG/JSON within the note data structure.

#### Task B-4: Community Discovery Feed
- **Source Plan**: `PENDING_ROADMAP.md`
- **Target Files**:
  - `src/app/(Primary.pages)/Notes/components/CommunityNotesFeed.js` (NEW)
- **Scope**:
  - Public directory of published study notes, filterable by subject tags (`#Calculus`, `#LinearAlgebra`, `#NumericalMethods`).

---

### 3.3 Domain C: Smart Whiteboard & Handwriting AI (Module C)

#### Task C-1: Mobile On-Screen Keyboard Handling (Phase B6)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`
- **Target Files**: `PlaygroundCanvasContainer.js`, `SmartBlockWrapper.js`
- **Scope**: Use `window.visualViewport` (`resize` and `scroll` events) when a block text field has focus to adjust page pan, ensuring the active field stays above the virtual keyboard; auto-hide dock during typing.

#### Task C-2: Device Orientation & Dynamic DPI Handling (Phase B7)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`
- **Target Files**: `PlaygroundCanvasContainer.js`, `WhiteboardCanvas.js`
- **Scope**: React to `orientationchange` and `visualViewport` resize; dynamically re-read `devicePixelRatio` to prevent ink blurring when moving between external displays or rotating tablets.

#### Task C-3: Multi-Finger Touch Gestures & Mode Switcher (Phase B8)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`
- **Target Files**: `WhiteboardCanvas.js`, `PlaygroundDock.js`
- **Scope**:
  - Two-finger tap for Undo, three-finger tap for Redo (industry drawing app convention; must never leave ink points).
  - Prominent mobile toggle for "Finger: Draws vs. Moves Page" in the phone dock.

#### Task C-4: Phone Network Load Deferral (Phase B9)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`
- **Target Files**: `modelManager.js`, `recognitionPipeline.js`
- **Scope**: Defer fetching the 28.4 MB HMER math model and 7.4 MB HTR text model until handwriting recognition is explicitly invoked; respect `navigator.connection.saveData`.

#### Task C-5: Physical Hardware Verification Suite (Phase B10)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`
- **Scope**: Manual touch/stylus certification across iPhone (Safari), iPad (Apple Pencil), Android (Chrome/Stylus), and Windows touchscreen.

#### Task C-6: Multi-Line Paragraph Breakdown into Individually Convertible Segments
- **Source Plan**: User Request & `HANDWRITING_SYSTEM_EVOLUTION_PART2.md`
- **Target Files**: `spatialClusterer.js`, `lineSegmenter.js`, `LiveMathPreviewOverlay.js`
- **Scope**:
  - Prevent monolithic paragraph clustering where multi-line text is lumped into one massive slow cluster.
  - Break handwriting into distinct sub-line or phrase clusters with individual recognition pills.
  - Allow the student to convert individual lines or select "Convert All" on demand.

#### Task C-7: Ruled Guideline Snapping ("Apt Position") in Notes Mode
- **Source Plan**: `PLAYGROUND_DUAL_MODE_ANALYSIS_AND_FEASIBILITY.md`
- **Target Files**: `PlaygroundCanvasContainer.js`, `WhiteboardCanvas.js`
- **Scope**: When handwriting is converted to printed text in Notes Mode, snap converted text blocks directly onto the notebook background's horizontal ruled lines ($Y_{\text{line}}$).

#### Task C-8: Arbitrary Ray-Casting Polygon Lasso Selection
- **Source Plan**: `PLAYGROUND_DUAL_MODE_ANALYSIS_AND_FEASIBILITY.md`
- **Target Files**: `WhiteboardCanvas.js`, `spatialIndexRTree.js`
- **Scope**: Replace rectangular AABB bounding-box checks with true Point-in-Polygon (PIP) ray casting so students can loop L-shaped text wrapping around anatomical/circuit diagrams without selecting diagram strokes.

#### Task C-9: Canvas Feature Extensions (Phase C1–C11)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`
- **Sub-tasks**:
  - **C-9.1 (C1)**: "Fit to content" zoom control computing bounding box of strokes + blocks.
  - **C-9.2 (C2)**: Layering control allowing ink over blocks (e.g. annotating graphs/images).
  - **C-9.3 (C3)**: Interactive touch pan/zoom inside Graph Blocks.
  - **C-9.4 (C4)**: Per-page IndexedDB delta storage for notebooks with >3,000 strokes.
  - **C-9.5 (C5)**: Enhanced shape tool (arrows, live preview, post-draw control handles).
  - **C-9.6 (C6)**: Straight-line highlighter assist with dedicated width settings.
  - **C-9.7 (C7)**: Multi-page unified PDF export.
  - **C-9.8 (C8)**: In-place picture crop and image replacement.
  - **C-9.9 (C9)**: Visual math formula keypad for mobile users.
  - **C-9.10 (C10)**: Comprehensive ARIA accessibility and focus rings on dock controls.
  - **C-9.11 (C11)**: Move ONNX model execution into Web Worker to eliminate UI thread pauses.

#### Task C-10: Real Handwriting Dataset Collection & Tuning (Phase D)
- **Source Plan**: `PLAYGROUND_HANDOFF.md`, `PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md`
- **Scope**: Collect real student samples at `/Playground/collect` on touch devices; export dataset and retrain HTR on real student ink; tune router confidence threshold.

---

### 3.4 Domain D: Gamification, Profile & Academic Leveling (Module D)

#### Task D-1: Build `/Profile` Academic Dashboard
- **Source Plan**: `PENDING_ROADMAP.md`
- **Target Files**: `src/app/(Primary.pages)/Profile/page.js`
- **Scope**:
  - Replace `<UnderConstruction />` with active user dashboard.
  - Academic level progress bar using quadratic formula:
    $$\text{Level} = \lfloor \sqrt{\text{XP} / 75} \rfloor + 1$$
  - Display 6 academic rank titles (*Novice Calculator* $\to$ *Fields Pioneer*).
  - Solved algorithms counter, quiz accuracy rate, and list of published public notes.
  - Auth login/signup modal trigger.
  - *(Streaks explicitly omitted per user requirement).*

#### Task D-2: Server-Side XP Ledger & Anti-Cheat Rate Limiter
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`
- **Target Files**: `src/app/api/gamification/award-xp/route.js` (NEW)
- **Scope**:
  - Atomic XP transaction ledger (+15 XP solver, +25 XP quiz, +30 XP note, +50 XP publish).
  - Redis sliding-window daily rate limits to prevent script manipulation.

---

### 3.5 Domain E: AI Multi-Modal Tutor & Scanner (Module E)

#### Task E-1: Step-by-Step AI Problem Solver Sidebar
- **Source Plan**: `PENDING_ROADMAP.md`
- **Target Files**: `src/app/components/ai/AITutorSidebar.js` (NEW)
- **Scope**: Slide-out conversational AI panel breaking down calculus, matrix algebra, and physics homework with interactive step derivations.

#### Task E-2: Photo Textbook OCR Scanner
- **Source Plan**: `PENDING_ROADMAP.md`
- **Target Files**: `src/app/components/ai/TextbookScannerModal.js` (NEW)
- **Scope**: Camera/upload scanner extracting LaTeX math expressions from printed textbook photos and placing them as editable blocks on canvas or notes.

---

### 3.6 Domain F: Cloud Backend, Dual Billing & Infrastructure

#### Task F-1: Single Low-Cost Linux VPS & Docker Compose Orchestration
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`
- **Target Files**: `docker-compose.yml`, `Caddyfile`
- **Scope**:
  - Colocates 3 production containers on a single affordable VPS ($4–$7/mo, Hetzner/Contabo/DigitalOcean):
    1. **NETZ** (Next.js 16 Full-Stack with ISR public pages)
    2. **Signaturely** (E-signature backend)
    3. **Discord Bot** (Community automation)
  - Caddy Reverse Proxy for automated Let's Encrypt SSL certificates.
  - Containerized Redis 7 (`redis:7-alpine`) with partitioned databases (DB 0, 1, 2).

#### Task F-2: Neon PostgreSQL DDL Schema & Authentication
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`
- **Target Files**: `backend/schema.sql`, `src/app/api/auth/`
- **Scope**:
  - DDL schema: `users`, `profiles`, `notes`, `note_forks`, `xp_transactions`, `subscriptions`.
  - Registration and login endpoints with Argon2/Bcrypt password hashing and secure HTTP-only JWT cookies.
  - Frontend Zustand store (`useAuthStore.js`).

#### Task F-3: Dual Payment Gateway Integration (Stripe + Razorpay)
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`
- **Target Files**: `src/app/api/billing/`
- **Scope**:
  - **Stripe (Global Users)**: Pro Monthly ($2.99), Pro Yearly ($19.99), Lifetime ($49.99).
  - **Razorpay (Indian Users)**: Pro Monthly (₹199), Pro Yearly (₹1,499), Lifetime (₹3,499) with UPI/QR support.
  - Webhook handlers validating cryptographic signatures (`stripe-signature`, `x-razorpay-signature`).
  - Feature entitlement enforcement (public note limits, premium exports).

#### Task F-4: Smart Navigation Ad Frequency Tracker
- **Source Plan**: `NETZ_BACKEND_IMPLEMENTATION_PLAN.md`
- **Target Files**: `src/app/utils/hooks/useAdNavigationTracker.js` (NEW)
- **Scope**: Counts client-side route transitions and renders interstitial ads strictly every 4 page navigations on Free tier (zero ads during drawing/calculating).

---

### 3.7 Domain G: Navigation & Editorial Polish

#### Task G-1: Sidebar Hover Transitions & Flyout Submenus
- **Source Plan**: User Request & `EditorialSidebar.js` / `Sidenav.js`
- **Target Files**: `src/app/components/editorial/EditorialSidebar.js`, `src/app/components/Sidenav.js`
- **Scope**:
  - Restore smooth hover animations and flyout menus when the sidebar is collapsed into rail mode.
  - Prevent submenus from abruptly collapsing while hovering over child unit topics.

---

## 4. Prioritized Execution Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: CLIENT-SIDE CORE COMPLETION (Zero Backend Cost)              │
├────────────────────────────────────────────────────────────────────────┤
│ 1.1 Build /Profile Dashboard (XP progress, rank badges, stats)         │
│ 1.2 Polyglot Code Export Engine (Python, MATLAB, C++, JS)             │
│ 1.3 WebWorker Watchdog Engine (4s math timeout guard)                  │
│ 1.4 Mobile Keyboard VisualViewport & Tap Gestures (Playground B6, B8)  │
│ 1.5 Multi-Line Stroke Segmentation into individual convertible parts   │
│ 1.6 Fix Sidebar Hover Transitions & Rail Flyouts                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: CLOUD BACKEND & PUBLIC PUBLISHING (SaaS Foundation)          │
├────────────────────────────────────────────────────────────────────────┤
│ 2.1 Single VPS Docker Compose Setup (NETZ + Signaturely + Discord)     │
│ 2.2 Neon PostgreSQL Schema & JWT Authentication Endpoints              │
│ 2.3 Notion-Style Public Notes Hosting (/p/[slug] with Next.js ISR)    │
│ 2.4 Server-Side Anti-Cheat XP Ledger in Redis                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: DUAL MONETIZATION & ADVANCED PLAYGROUND                       │
├────────────────────────────────────────────────────────────────────────┤
│ 3.1 Dual Stripe (Global) & Razorpay (India UPI) Billing Integration    │
│ 3.2 Navigation Ad Frequency Counter (Free tier)                        │
│ 3.3 Playground Canvas Phase C (Fit zoom, ink over blocks, large IDB)   │
│ 3.4 Ray-Casting Polygon Lasso & Ruled Line Snapping                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: AI TUTOR, SCANNER & DATASET COLLECTION                        │
├────────────────────────────────────────────────────────────────────────┤
│ 4.1 Step-by-Step AI Problem Tutor Sidebar                              │
│ 4.2 Photo Textbook OCR Problem Scanner                                 │
│ 4.3 Move ONNX Model Inference to Dedicated Web Worker                  │
│ 4.4 In-App Student Handwriting Collection (/Playground/collect) & Tune │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Summary Table: Next Action Items by File

| Priority | Task ID | Deliverable | Target File(s) | Dependencies |
| :---: | :---: | :--- | :--- | :--- |
| **P0** | **D-1** | Build `/Profile` Academic Dashboard | `src/app/(Primary.pages)/Profile/page.js` | None (Client-side first) |
| **P0** | **A-1** | Polyglot Code Export (Python/MATLAB/C++/JS) | `src/app/utils/codeExportEngine.js`<br>`src/app/components/CodeExportPanel.js` | None |
| **P0** | **A-2** | WebWorker Numerical Watchdog (4s guard) | `src/app/utils/workers/algorithmWorker.js` | None |
| **P0** | **C-6** | Multi-Line Paragraph Ink Breakdown | `src/app/(Primary.pages)/Playground/utils/spatialClusterer.js` | None |
| **P1** | **G-1** | Sidebar Hover States & Rail Flyouts | `src/app/components/editorial/EditorialSidebar.js` | None |
| **P1** | **C-1** | Mobile Keyboard VisualViewport (B6) | `src/app/(Primary.pages)/Playground/components/PlaygroundCanvasContainer.js` | Mobile device testing |
| **P1** | **C-3** | 2-Finger Undo / 3-Finger Redo (B8) | `src/app/(Primary.pages)/Playground/components/WhiteboardCanvas.js` | None |
| **P1** | **B-1** | Notion Public Notes Hosting (`/p/[slug]`) | `src/app/p/[slug]/page.js`<br>`src/app/api/notes/publish/route.js` | Backend/Neon setup |
| **P2** | **F-1** | Single VPS Docker Compose Setup | `docker-compose.yml`, `Caddyfile` | VPS server access |
| **P2** | **F-2** | Neon PostgreSQL DDL & Auth API | `src/app/api/auth/`<br>`src/app/store/useAuthStore.js` | Neon connection |
| **P2** | **F-3** | Dual Payment (Stripe + Razorpay) | `src/app/api/billing/` | Gateway API credentials |
| **P3** | **C-9** | Playground Canvas Extensions (C1–C11) | `PlaygroundCanvasContainer.js`<br>`WhiteboardCanvas.js` | None |
| **P3** | **E-1** | AI Problem Tutor Sidebar | `src/app/components/ai/AITutorSidebar.js` | LLM API provider |
| **P3** | **E-2** | Photo Textbook OCR Scanner | `src/app/components/ai/TextbookScannerModal.js` | Vision API provider |
