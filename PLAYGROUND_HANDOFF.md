# NETZ Playground: implementation handoff

Written 2026-10-13 for whoever continues this work, human or coding agent. It is self-contained: read sections 1 to 4 before changing anything, then take tasks from section 6 in order.

This document is the source of truth for **status and next steps**. The older `PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md` (Revision 4) still holds the background analysis and the handwriting-model plan, but its status tables stop before the last two rounds of work.

---

## 1. What this is

NETZ is a study app that runs entirely in the browser (Next.js 16, React 18, no server). The **Playground** is its handwriting whiteboard: you write and draw on an infinite page, three on-device models read the ink (a router, a maths recogniser, a text recogniser), and typed "blocks" (equation, graph, text, image, audio) sit on the page next to the ink.

Code lives in `src/app/(Primary.pages)/Playground/`.

### Who it is for

**Every device: phone, tablet and laptop. Touch screens come first.** Most people will use a finger or a stylus; mouse and keyboard must keep working but are not the main case. A feature is not finished until it works on a 390 px wide phone with a finger.

---

## 2. Rules that do not change

1. **The maths model is frozen.** Do not change `public/models/netz_hmer.onnx`, its vocab or meta files, `train_hmer.ipynb`, the shared feature extractor `utils/recognition/canonicalFeatures.js`, or the decode loop in `utils/recognition/hmerDecoder.js`. `node test_feature_parity.mjs` must keep passing 6/6.
2. **Every pointer draws.** Mouse, trackpad, finger and pen all draw by default. Never make drawing stylus-only. Two fingers pan and pinch. "One finger moves the page" is an optional setting, off by default.
3. **No Google handwriting endpoint in the app.** It exists only in the developer benchmark script (`benchmark_recognition.mjs --google`).
4. **Stroke objects are never changed in place.** Undo history shares them by reference. To move, scale, recolour or erase, build new stroke objects (`utils/strokeTransform.js`, `utils/strokeEraser.js`).
5. **Do not commit unless the owner asks.** Nothing from this work is committed yet (about 45 files changed or new).
6. **Text-model work follows the notebooks' design**: real handwriting data only, the shared 8-column feature spec, parity test vectors. IAM-OnDB is not available to this project.
7. **Verify in a real browser before calling something done.** Unit tests alone have missed real defects here several times.

---

## 3. Map of the code

All paths are under `src/app/(Primary.pages)/Playground/`.

| File | What it does |
|---|---|
| `components/PlaygroundCanvasContainer.js` | The page: state, pages, blocks, undo history, saving, zoom, keyboard, export. Largest file. |
| `components/WhiteboardCanvas.js` | The two ink canvases, all pointer input, eraser, lasso selection, palm guard, pinch and pan. |
| `components/PlaygroundDock.js` | The bottom toolbar and its pop-up panels. |
| `components/PageManager.js` | The top bar (page number, add, delete, duplicate). |
| `components/blocks/SmartBlockWrapper.js` | Frame around every block: drag, resize, view and edit modes. |
| `components/blocks/*.js` | Equation, Graph, Theory (text), Image, AudioMemo, Sketch blocks. |
| `components/LiveMathPreviewOverlay.js` | The recognition "pills" shown over ink. |
| `components/InkToBlockConverterModal.js` | "Sync to Notes" dialog. |
| `components/HandwritingCollector.js`, `collect/page.js` | `/Playground/collect`: collects handwriting samples and a device report. |
| `utils/smartBlockStore.js` | Block reducer and session storage (IndexedDB plus localStorage backup). |
| `utils/historyStack.js` | Undo and redo snapshots. |
| `utils/viewportMath.js` | Zoom about a point, visible world rectangle. |
| `utils/strokeSmoother.js` | How a stroke is drawn on a canvas (curve, pressure widths, sharp shapes). |
| `utils/pageSvg.js`, `utils/exportEngine.js` | Whole-page export to SVG, PNG, PDF. |
| `utils/pointerEventsHandler.js` | Turns pointer events into stroke points; palm rejection rule. |
| `utils/shapeRecognizer.js` | Snaps drawn shapes (line, triangle, rectangle, polygon, circle). |
| `utils/imageSizing.js` | Shrinks inserted pictures, keeps proportions. |
| `utils/spatialClusterer.js` | Groups strokes into words and expressions for recognition. |
| `utils/recognition/` | Model loading, router, maths and text decoders, line segmenter, pipeline. |

### Things worth knowing before editing

- **Coordinates.** `screen = canvas * zoom + pan`. Strokes are stored in canvas (world) coordinates.
- **Two canvases.** `canvas.z-10` holds committed ink; `canvas.z-20` holds the stroke being drawn and overlays. Both are backed by device pixels (CSS size x `devicePixelRatio`).
- **Painting.** A new stroke is painted on top of the committed layer by itself (`paintNewStroke`). Anything else repaints the layer (`redrawStaticLayer`), skipping ink that is off screen.
- **Saving.** `scheduleSave()` writes the session 350 ms after the last change and never during a stroke. It is flushed on `pagehide`, when the tab is hidden, and on unmount. IndexedDB is the real store. localStorage is a fast start-up copy that is dropped once the session is too large for it. On load the newer of the two copies wins. `window.__NETZ_PLAYGROUND_SAVE_PENDING__` is `true` while a save is waiting (the browser checks use it).
- **Session shape.** `{ pages: [{ id, title, strokes, blocks, links }], currentPageIndex, blocks, links, updatedAt }`.
- **Stroke shape.** `{ id, color, width, tool, points: [{ x, y, pressure, timestamp, pointerType, tiltX?, tiltY? }], bbox, shape?, opacity?, hasPressure? }`.
- **Dev mode runs effects twice** (React StrictMode). A bug that appears only in dev is often a real ordering problem; one was (blocks lost on reload).
- **`next dev` writes `AGENTS.md` and `CLAUDE.md`** into the project root. They are generated, not project documentation.

---

## 4. How to run and check

```bash
# App
npm install
npx next dev -p 3210            # development
npm run build                   # production build (must succeed)
npx next start -p 3210          # serve the production build

# Lint: 0 errors expected, 2 old warnings (BackgroundMusicPlayer, AudioMemoBlock)
npx eslint "src/app/(Primary.pages)/Playground"

# Logic tests (project root, no server needed)
node test_feature_parity.mjs        #   6  frozen feature extractor
node test_latex_evaluator.mjs       #  36  "=" answers
node test_line_segmenter.mjs        #  74  splitting text into lines
node test_text_fast_path.mjs        #  18  Notes-mode text shortcut
node test_cluster_equals.mjs        #  13  grouping strokes
node test_canvas_helpers.mjs        #  85  history, zoom, visibility, graph helpers
node test_shape_recognizer.mjs      # 206  shape snapping
node test_stroke_eraser.mjs         #  24  partial eraser
node test_page_export.mjs           #  37  export and stroke transforms
node test_session_and_images.mjs    #  73  storage safety, picture sizing
node benchmark_recognition.mjs --self-test    # models load and every stage runs

# Browser checks (app must be running on port 3210)
cd tests/browser
npm install                     # once; installs puppeteer-core only
node run-all.mjs                # undo 30, touch 20, eraser 13, lasso 21, export 16, pen 12, blocks 18, workspace 49, render 14
node screens.mjs                # how the page fits a phone, a tablet and a laptop
node perf.mjs 3000              # drawing work on a 3,000-stroke page
```

`tests/browser/lib.mjs` expects Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`; set `CHROME_PATH` for another location and `NETZ_URL` for another address. It can send real touch and pen input (`Input.dispatchTouchEvent`, and `Input.dispatchMouseEvent` with `pointerType: 'pen'`), so most touch behaviour can be checked without a device.

Two traps in browser checks:

- **Comparing canvas pixels.** After a few `getImageData` calls Chrome moves a canvas from GPU to software drawing, and the two anti-alias differently. Launch with `--disable-accelerated-2d-canvas --disable-gpu` when comparing pictures (`render.mjs` does).
- **Reading the saved session.** Saves are delayed. `lib.mjs` waits for a pending save before any check that reads the session backup; use `settle(page)` before reading IndexedDB yourself.

### Definition of done for any task

1. Lint has no new warnings and every logic test above still passes.
2. `node run-all.mjs` passes, and new behaviour has its own browser check, including at phone size with touch input where it applies.
3. `npm run build` succeeds.
4. The model files and `test_feature_parity.mjs` are untouched.
5. Section 5 and section 6 of this document are updated: move the task to "done" with what was measured.

---

## 5. What is finished

Everything below was checked in a real browser (headless Chrome) with mouse, touch and pen input, in development mode.

| Area | State |
|---|---|
| "=" answers (multi-digit, fractions, variables) | Done |
| Offline cache size (142.7 MB down to 7.4 MB) | Done |
| Data loss: adding a page, first visit not saved, blocks lost on reload | Fixed |
| Tap draws a dot; first point of a stroke no longer dropped | Fixed |
| Undo and redo (ink, blocks and links, one step per action, Ctrl+Z / Ctrl+Shift+Z) | Done |
| Sharp ink on high-density screens | Done |
| Zoom anchored at cursor, pinch point or screen centre | Done |
| Input: every pointer draws, two-finger pan and pinch, palm guard around pen use, optional "finger moves page" | Done |
| Shapes: line, triangle, rectangle, polygon, circle, with sharp corners | Done |
| Eraser: whole-stroke or partial, three sizes, one undo step per drag | Done |
| Lasso: move, resize, duplicate, recolour, delete | Done |
| Highlighter drawn under writing, never read as writing, never erases it | Done |
| Pen: pressure-sensitive width, tilt recorded, presets, any colour | Done |
| Export of the whole page: SVG (vector), PNG, PDF | Done |
| Graph blocks linked to their equation, re-plot on change | Done |
| Microphone recording format picked per browser (MP4 on Safari) | Done |
| Notes mode: text shortcut that skips the slow maths model (0.18 s instead of 33.8 s on a paragraph) | Done |
| Blocks: open ready to type, Done and Enter close them, image captions editable | Fixed |
| Blocks: move and resize with finger or pen, finger-sized resize handle, no drag lag | Done |
| Saving: newer copy wins, oversized backup removed, saves deferred to pauses | Done |
| Pictures: scaled to 1600 px on insert, own proportions, proportional resize | Done |
| Keyboard: P H E L S M tools, Ctrl + / - / 0 zoom, Ctrl+S, Ctrl+D, Esc, Delete | Done |
| Pen can move the page with the Move tool | Done |
| Drawing speed on large pages (see numbers below) | Done |
| B1. Mobile viewport foundations (100dvh, cover, touch-action: none) | Done |
| B2. Responsive dock & top bar (compact sheet < 640px, 0 off-screen) | Done |
| B3. Touch targets >= 44px on coarse pointers (0 under 44px) | Done |
| B4. Touch-first block interaction (tap select, 2nd tap edit, 350ms drag) | Done |
| B5. Small-screen block clamping & bottom sheet dialogs (all fit) | Done |
| UX fix plan (`PLAYGROUND_UX_FIX_PLAN.md`, 2026-10-16): Undo after deletes, honest save status, per-page undo, page sheet, smaller dock, pen options per tool, one reading setting and one Fix dialog, model progress and failure state, Send to Notes that reports failure, music off the page, plain wording | Done (ux-fixes.mjs 40/40; results in that plan's section 9) |
| B8. Two-finger tap undo, three-finger tap redo, one-time "one finger draws" hint | Done (ux-fixes.mjs) |
| C1. Fit to content (Shift+1, Zoom menu, phone More) | Done |

### Measured on a 3,000-stroke page (desktop Chrome)

| | Before | After |
|---|---|---|
| Canvas draw calls to add one stroke | 3,001 | 1 |
| Page frozen after each pen-up | 460 to 820 ms | under 100 ms |
| Draw calls for 20 pan steps at 100% | 60,020 | 2,723 |
| Draw calls for 20 pan steps at 317% zoom | 60,020 | 315 |

The picture on screen is pixel-identical before and after (`render.mjs`).

### Not yet verified

- **Nothing has been tried on a real phone, tablet or stylus.** All touch and pen results come from emulated input in desktop Chrome.
- **The browser suites now pass 100% against the production build** (`next start -p 3210`): 9/9 suites, 213/213 checks, plus 13/13 in `touch-blocks.mjs` and 4/4 screen audit in `screens.mjs`.
- The "∑ Maths" re-read button on recognition pills has no browser check.
- Whether the Notes-mode text shortcut triggers on real handwriting is unknown (it needs router confidence of at least 0.85; synthetic shapes reached 0.66).

---

## 6. Work queue

Take these in order. Phase B is the priority the owner set last: the app has to work on phones and by touch.

### Phase A: close the current round

**A1. Run everything against the production build.**
Done. `npm run build`, `npx next start -p 3210`, then `node run-all.mjs` in `tests/browser`: all 9 suites pass (213/213 checks: undo 30, touch 20, eraser 13, lasso 21, export 16, pen 12, blocks 18, workspace 49, render 14) with 0 console errors.

**A2. Ask the owner whether to commit.** If yes: a new branch, not `main`. Leave out the generated `AGENTS.md` and `CLAUDE.md` unless the owner wants them, and leave out `tests/browser/node_modules`.

### Phase B: touch first, every screen size

**Current Status (B1 through B5 Complete & Verified against Production Build):**

| Screen | Audit Result (`screens.mjs`) |
|---|---|
| Phone portrait, 390 x 844 | 0 off-screen, 0 under 44px (median 44px, smallest 44px). Dock 372x58 fits within 390px. Page scrolls: false. Sync dialog and Unsaved changes dialog fit as bottom sheets. |
| Phone landscape, 844 x 390 | 0 off-screen, 0 under 44px. Dock 801x62 fits within 844px. Page scrolls: false. All dialogs fit. |
| Tablet portrait, 820 x 1180 | 0 off-screen, 0 under 44px. Dock 801x62 fits within 820px. Page scrolls: false. All dialogs fit. |
| Laptop, 1366 x 768 | 0 off-screen, 0 under 44px. Full dock fits with 0 off-screen. |

**B1. Page foundations for mobile browsers.** [Done]
Files: `PlaygroundCanvasContainer.js`, `Playground/page.js`, `Playground/layout.js`.
- Sized with dynamic viewport units (`100dvh`), `viewportFit: 'cover'`, `touch-action: none` on drawing surface.
- `overscroll-behavior: none`, transparent tap highlight, `env(safe-area-inset-*)` padding.
- Measured: `screens.mjs` reports layout width equal to device width (390px, not 514px) with 0 page scroll.

**B2. A dock that fits every width.** [Done]
Files: `PlaygroundDock.js`, `PageManager.js`, `AIModelLoadingStatusPill.js`.
- Under 640px: 1-row compact dock with Pen, Highlighter, Eraser, Lasso, Undo, and "More Tools" bottom sheet.
- 640 to 1100px: responsive folded dock.
- Panels (stroke settings, eraser sizes, export) adapt to mobile bottom sheets.
- Top bar (`PageManager.js`) uses compact form on phones without clipping.
- Measured: `screens.mjs` reports 0 controls off screen across all 4 screen viewports.

**B3. Touch-sized targets.** [Done]
Files: `PlaygroundDock.js`, `PageManager.js`, `LiveMathPreviewOverlay.js`, `EditorialSidebar.js`.
- Every control is at least 44 x 44 CSS px on coarse pointers (`@media (pointer: coarse)`).
- Measured: `screens.mjs` reports 0 controls under 44px on phone portrait, phone landscape, and tablet portrait.

**B4. Nothing depends on hover.** [Done]
Files: `SmartBlockWrapper.js`, `EquationBlock.js`, `GraphBlock.js`.
- Tapping a block selects it and shows its bar (move, edit, delete) and 44px corner resize handle.
- Second tap, or edit button, opens edit mode. Tapping outside deselects.
- 350ms long press on block body triggers drag.
- Measured: `tests/browser/touch-blocks.mjs` passes 13/13 touch-only checks at 390x844; `blocks.mjs` passes 18/18 desktop checks.

**B5. Blocks and dialogs on small screens.** [Done]
Files: `PlaygroundCanvasContainer.js`, `InkToBlockConverterModal.js`, `SemanticLassoModal.js`, `SoftEditorModal.js`, `UnsavedChangesModal.js`.
- New block widths and coordinates clamped to viewport width minus margins.
- Modal dialogs adapt into mobile bottom sheets with `max-h-[85vh]` and internal scroll.
- Measured: `screens.mjs` confirms all modals fit within 390x844 and 844x390.

**B6. The on-screen keyboard.** When a block's field has focus, use `window.visualViewport` (its `resize` and `scroll` events) to move the page so the field stays above the keyboard, and hide the dock while typing. Done when, on a real phone, an equation block near the bottom of the screen stays visible while typing. This one needs a device; emulation does not show a keyboard.

**B7. Rotation and resizing.** The page size comes from `window.innerWidth` and `innerHeight` on `resize`. Also react to `visualViewport` resize and `orientationchange`, and re-read `devicePixelRatio` (it changes when a window moves between screens). Done when rotating in `screens.mjs` (`page.setViewport`) leaves sharp ink, a correctly sized canvas and a fitting dock.

**B8. Touch gestures.** [Done 2026-10-16 through the UX fix plan; checks in `ux-fixes.mjs`, not yet in `touch.mjs`.] Present today: one finger draws, two fingers pan and pinch, a palm is ignored around pen use. Add:
- Two-finger tap for undo, three-finger tap for redo (the convention in drawing apps). They must never leave a mark.
- Make the "Finger: draws / moves page" choice easy to find on phones, because someone reading a page with one finger will otherwise scribble on it.
- Done when `touch.mjs` has checks for both taps, and the existing 20 still pass.

**B9. Weight on phones.** [Mostly done 2026-10-16: nothing from `/models/` or `/onnx/` is fetched before the first stroke; loading shows progress in MB; failure shows a warning with Retry; Save-Data asks before the large download. Not yet measured on a real phone.] Files on disk: maths model 28.4 MB, text model 7.4 MB, router 0.4 MB, plus a 28.3 MB runtime file. The router is loaded when the page opens; check when the two large models load and make sure neither is fetched before it is needed.
- Show loading progress, and if a model cannot load (memory, connection) say so and keep the whiteboard working without recognition.
- Honour `navigator.connection.saveData`.
- Do not change, re-export or quantise the maths model (rule 1).
- Done when a first visit at phone size downloads no large model until recognition is first used, measured from the network log in a browser check.

**B10. Real devices.** Emulation cannot show: Safari's behaviour, real palm contact, stylus pressure and tilt, the on-screen keyboard, or speed. Before calling Phase B finished, run through this on hardware and record the result here.

| Device | Browser | Check |
|---|---|---|
| iPhone | Safari | dock fits, finger draws, pinch, blocks, keyboard |
| Android phone | Chrome | the same |
| iPad, with and without Apple Pencil | Safari | pressure, palm resting on screen, speed on a full page |
| Android tablet with stylus | Chrome | the same |
| Windows touch laptop | Edge or Chrome | touch plus mouse plus keyboard together |
| Mac laptop | Safari and Chrome | trackpad pinch, keyboard shortcuts |

### Phase C: remaining whiteboard work

None of this depends on handwriting recognition. Rough order of value:

- **C1. Fit to content.** A zoom control that shows everything on the page (`getPageBounds` in `pageSvg.js` already computes the box; block rectangles must be included).
- **C2. Ink over blocks.** Blocks always sit above ink today, so you cannot annotate a picture or a graph. Needs a decision on layering (for example a per-block "send behind ink" switch) before building.
- **C3. Graph blocks.** Pan and zoom inside the graph by touch, and remember the chosen view in the block.
- **C4. Storage for very large notebooks.** A save still copies the whole session into IndexedDB: about 0.1 to 0.2 s on a 3,000-stroke page, once per pause. Store each page as its own record and write only pages that changed. Needs a migration from the current single record; the newer-copy-wins rule must survive.
- **C5. Shape tool.** Arrows, a preview of the snapped shape while drawing, corner handles after drawing.
- **C6. Highlighter.** Its own width setting and a straight-line assist.
- **C7. Multi-page PDF.** Export all pages in one file. Blocks are captured from the live page (`html-to-image`), so other pages need to be rendered off screen first.
- **C8. Pictures.** Crop, and replace the picture in an existing block.
- **C9. Equation blocks.** A visual maths keyboard instead of typing LaTeX, which matters most on phones.
- **C10. Accessibility.** `aria-label` and `aria-pressed` on all dock controls, focus order, visible focus rings. [Largely done 2026-10-16 by the UX fix plan: shared Dialog with `role="dialog"`, focus moved in and back, `aria-pressed` on tools, focus rings on inputs, named colours. No automated accessibility checker has been run.]
- **C11. Recognition off the main thread.** Run the models in a Web Worker so reading ink never freezes drawing. Infrastructure only: same models, same features, same decode. Results must be identical to today's (compare with `benchmark_recognition.mjs`).
- **C12. Insert tools like WPS Office: Shapes, Screenshot, Symbol, Equation.** Proposed 2026-10-15, waiting for the owner's decisions. Full plan: `PLAYGROUND_INSERT_TOOLS_PLAN.md`. It covers C5 (shape tool) and C9 (visual maths input).

### Phase D: handwriting accuracy (blocked)

Blocked on the owner collecting real handwriting at `/Playground/collect` on a touch device, and exporting the samples and the device report. With that data: tune the text shortcut threshold, measure the text model on real writing, and train the next text model on BRUSH plus the collected samples. Details are in `PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md`, section 7. Rule 1 and rule 6 apply.

---

## 7. Open decisions for the owner

1. Commit this work to a branch? (Nothing is committed.)
2. Is the app commercial? The BRUSH handwriting dataset is for non-commercial use only.
3. May synthetic handwriting be used for training, or real data only? (The notebooks say real only.)
4. C2: should ink be able to go over blocks, and how should the user choose?
5. Phone dock: which five tools belong on the main bar? (B2 proposes Pen, Highlighter, Eraser, Lasso, Undo.)

---

## 8. Known limits

- The localStorage copy is dropped for sessions over roughly 4 MB of text. Such sessions load a moment later, from IndexedDB, instead of instantly. Nothing is lost.
- A change made less than 350 ms before a crash or a forced kill may not be saved. Closing or reloading the tab does save it.
- Exported PNG and PDF capture blocks as images of the live page, so their sharpness depends on the screen.
- Recognition logs show confidence above 100% in places (a score, not a probability). Cosmetic, and inside the recognition code, so left alone.
