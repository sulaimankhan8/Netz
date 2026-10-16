# NETZ Playground: UX fix plan

Written 2026-10-16. **Status: approved 2026-10-16** ("proceed"): the recommended answer to every decision in section 2 is accepted. Progress is recorded in section 9.

This plan fixes every finding in the UX audit of 2026-10-16 ("NETZ Playground — UX Audit", a Claude doc: https://claude.ai/code/artifact/4c34c34a-0f90-4713-87e9-91e95ee72fbf). Finding numbers (F1 to F36) refer to that audit. F21 was withdrawn: equation blocks already use the MathLive visual editor.

Read `PLAYGROUND_HANDOFF.md` sections 1 to 4 first. Its rules (section 2) apply to every step: the maths model is frozen, every pointer draws, strokes are never changed in place, and nothing is committed unless the owner asks. Before writing code, read the relevant guide in `node_modules/next/dist/docs/` (see `AGENTS.md`).

**Order of work.** Build every step in sections 3 to 7 in order, then run all the checks in section 8 together at the end. Do not stop to test between steps.

All paths are under `src/app/(Primary.pages)/Playground/` unless they say otherwise. *Container* means `components/PlaygroundCanvasContainer.js`.

---

## 1. What changes, in one view

| Phase | Steps | Findings fixed | Size |
|---|---|---|---|
| 0. Shared pieces | 0.1 Dialog, 0.2 Action notice, 0.3 UI wording | (used by everything below) | Small |
| 1. Quick wins | 1.1 to 1.7 | F1, F2, F4, F6, F7, F14, F16, F20, F24, F26 (sizes), F28, F31, F32, F33, F34, F36 | Small each |
| 2. Fill-ins | 2.1 to 2.7 | F11, F12, F15 (header), F17, F18, F19, F23, F25, F35, accessibility | Small each |
| 3. Big bets | 3.1 to 3.4 | F3, F5, F8, F9, F10, F13, F26, F27, F29, F30 | Medium to large |
| 4. Later | 4.1, 4.2 | F15, F22 | Needs a decision |

Section 7a maps every finding to its step.

---

## 2. Decisions for the owner

Each has a recommended answer. If the owner says "proceed", the recommended answers apply.

| # | Question | Recommended | Why |
|---|---|---|---|
| D1 | Remove the "Do you want to save?" prompt when leaving the Playground? | **Yes.** Ask only when the last save failed. | Everything is saved automatically. The prompt contradicts the "Saved" badge, and "Don't Save" discards nothing (F2). |
| D2 | After deleting a page, block or clearing a page: ask first, or offer Undo? | **Offer Undo** for 8 seconds; no question. | One less tap, and the mistake can still be fixed (F1, F6, F20). |
| D3 | What to call the "Theory" block? | **Text.** The stored type stays `'theory'` so saved sessions still load. | Students say "text" or "note", not "theory" (F24). |
| D4 | What to call "Notes mode", which is unrelated to the Notes workspace? | **Writing mode.** "Sync to Notes" becomes **Send to Notes**. | Two features called "Notes" (F14). |
| D5 | Where does the lo-fi music player go? | **Into the More menu as "Focus music"**, off screen until opened. While music plays, a small 44 px button stays near the top bar to pause it. | It covers the writing area on phones (F36). |
| D6 | One finger draws by default (handoff rule 2). How do phone users find the alternative? | **Keep the default.** After the first finger stroke, show a notice once: "One finger draws. Prefer one-finger scrolling? Change". | Keeps rule 2 and still tells people (F16). |
| D7 | Laptop dock layout (section 3.1). | **As drawn in 3.1**: tools, the WPS Insert group as approved, a Blocks menu, pen options, zoom, a Page menu. | 25 controls become 17 without moving the approved Insert group (F8). |
| D8 | Ink over blocks (handoff open decision 4). | **Later (step 4.1)**, with a per-block "Send behind ink" switch. | Needs a layering decision; not urgent. |

---

## 3. Phase 0: shared pieces

### 0.1 One dialog and sheet component

Files: new `components/ui/Dialog.js`; `components/symbols/SymbolDialog.js` (re-export from the new file).

Move the `Dialog` already exported by `SymbolDialog.js` into `components/ui/Dialog.js` and extend it:

- Two forms: `variant="dialog"` (centred on laptops, bottom sheet under 640 px, as today) and `variant="popover"` (anchored above a dock button on laptops and tablets, bottom sheet on phones).
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the title.
- Focus moves to the first control on open and returns to the button that opened it on close. Tab stays inside while open.
- Close button 44 x 44 px on coarse pointers, 32 px on fine pointers, always with `aria-label`.
- Escape closes. A press outside closes **and is swallowed**, so it never draws on the page (the rule `PlaygroundDock.js:137-156` uses today for the Insert menus).
- Phone sheets get a dimmed backdrop, so it is clear the page behind is not live.

Keep `export { Dialog } from '../ui/Dialog'` in `SymbolDialog.js` so `InsertLatexDialog.js` and `NumberDialog.js` keep working.

### 0.2 Notices with an action button

Files: Container (`showNotice`, the notice element near line 2160).

Extend `showNotice(message, durationMs)` to `showNotice(message, { duration, action: { label, onClick } })`, keeping the old call form working. The notice keeps `role="status"`. When there is an action:

- It gets `pointer-events-auto` and a 44 px button, for example "Page 3 deleted · **Undo**".
- It moves from `top-16` into the status area of step 1.3 so it never covers the top bar.
- It stays for 8 seconds, and stays while the pointer is over it.

### 0.3 One word for each thing

File: new `utils/uiText.js`, exporting the labels below. Every label, `title` and `aria-label` in the Playground uses it, so a name changes in one place.

| Old wording (where) | New wording |
|---|---|
| Move the Page, Move Canvas | Move page |
| Theory Block, Theory, THEORY BLOCK (block header) | Text |
| Graph Block | Graph |
| Notes Mode, Notes, Switch to Notes Mode | Writing mode (D4) |
| Sync to Notes, Sync Whiteboard to Notes Workspace, Transcribe to Notes Page | Send to Notes |
| Export Canvas (PNG / SVG / PDF), Export Page | Export |
| Stroke & Canvas Settings | Pen and page |
| More Whiteboard Tools, More Tools | More |
| Add Fresh Blank Page | Add page |
| Clear Current Page Ink & Blocks | Clear page |
| Contextual CAS & AI Transforms (`AIActionButton.js`) | Maths actions |
| OCR: Selection / Live Auto | Read my writing: When I select / As I write |
| Live OCR Tags | Show readings |
| Recognizing... | Reading… |
| Loading OCR engine..., Initializing Neural AI Models..., Loading Neural Router... | Getting the handwriting reader ready… |
| Neural Router ready, Neural Models Ready, AI Engine Ready | Handwriting reader ready |
| Router load failed (and the other "load failed" messages) | Handwriting reading is unavailable |
| Diagram / Drawing (Preserved as Ink) | Drawing, kept as ink |
| Handwriting (Raw Ink) | Handwriting |
| Force convert to typed block, Convert handwriting to editable typed block | Turn into typed text |
| Recognition failed | Couldn't read this |
| Open Soft Editor & Ambiguity Resolver; Soft Editor & Ambiguity Resolver | Fix |
| Verify, select hypotheses, or correct ink interpretation | Pick the right reading or type it |
| Semantic Type | This is |
| Semantic Lasso Assignment | What did you write? |
| 🔤 Text / ∑ Maths | Read as text / Read as maths |
| No active Smart Blocks found on canvas to convert. | There are no typed blocks on this page yet. |
| Save (unsaved-changes title) | see step 1.2 |

Block headers show the label for the block's type (`equation` → Equation, `theory` → Text, `graph` → Graph, `image` → Picture, `audio` → Voice memo, `sketch` → Sketch), not the raw type.

**Browser checks find buttons by `title`** (`clickTitle(page, 'Pen')`, the screens.mjs rule that `button[title^="Pen"]` exists). Keep "Pen" as the first word of the Pen button's title. In section 8, change the checks to find buttons by `aria-label` and update renamed labels.

---

## 4. Phase 1: quick wins

### 1.1 Undo after deleting a page, a block, or clearing a page (F1, F6, F20)

Files: Container (`handleDeletePage`, `handleClearPage`, the `onDeleteBlock` handlers), `components/PageManager.js`, `components/blocks/SmartBlockWrapper.js`.

- **Delete page.** Before removing it, keep `{ page, index, history }` in a ref (`history` once step 3.4 exists). Show "Page N deleted · Undo" (0.2). Undo puts the page back at the same index, opens it and saves. A second delete replaces the first one's undo.
- **Clear page.** It is already one undo step. Remove the browser `confirm()` (`PageManager.js:84-95`, and the phone menu). Show "Page cleared · Undo"; Undo calls `handleUndo`. Replace the refresh-arrow icon (`FiRefreshCw`) with an eraser or broom icon from the installed icon sets.
- **Delete block.** Replace the `FiX` icon with `FiTrash2`. Move Delete to the left end of the block's bar, away from Done (`SmartBlockWrapper.js:271, 384`). Show "Text deleted · Undo" (with the block's label from 0.3); Undo calls `handleUndo`.

Done when each of the three actions can be reversed from the notice, with touch and with a mouse.

### 1.2 Honest save status (F2, F4)

Files: `utils/smartBlockStore.js` (`saveSessionToIndexedDB`, `saveSession`), Container (`persistSession`, `scheduleSave`, the unsaved-changes code near line 505), `components/PageManager.js`, `components/UnsavedChangesModal.js`. The sidebar callers (`src/app/components/Sidenav.js:121`, `src/app/components/editorial/EditorialSidebar.js:173`) keep their API.

1. `saveSessionToIndexedDB` returns a Promise. It resolves on the transaction's `oncomplete` and rejects on `onerror`, `onabort` and on the open request's `onerror` / `onblocked`. `saveSession` returns `{ backup, stored }`, where `stored` is that Promise. Existing callers that ignore the result keep working.
2. Container holds `saveStatus`: `'saved' | 'saving' | 'failed'`. `scheduleSave` sets `'saving'`. `persistSession` waits for `stored`, then sets `'saved'` or `'failed'`. A failed save is tried again after the next change, and when the user presses Retry.
3. `PageManager.js`: replace the fixed "Auto-Saved" badge and the Save button (lines 126-148) with one status chip: **Saving…** (grey), **Saved** (green tick), **Couldn't save · Retry** (red, Retry is a 44 px button). On phones the chip shows only its icon unless the save failed. Ctrl+S still saves now and flashes "Saved". The phone page menu loses "Save Session".
4. `window.__NETZ_PLAYGROUND_HAS_UNSAVED_CHANGES__` becomes `saveStatus !== 'saved'`, not "the page has content". Before leaving with a save pending, flush it (`flushSave`) and go. Show `UnsavedChangesModal` only when the status is `'failed'`, reworded:
   - Title: "Your latest changes aren't saved"
   - Text: "The last save on this device failed. If you leave now, changes since then may be lost."
   - Buttons: **Try again** (saves; leaves if it works), **Leave anyway**, **Stay**.

Done when leaving a page with content asks nothing, and a forced IndexedDB failure shows "Couldn't save" and the prompt.

### 1.3 Status messages that never cover controls (F7)

Files: Container (notice element), `components/AIModelLoadingStatusPill.js`.

Make one status area: a column centred under the top bar (top = top bar's bottom + 8 px, so 72 px on laptops and 64 px on phones). The notice (0.2) and the model status pill render inside it, stacked, never on top of each other or of `PageManager`. On laptops, move the area to the right of the top bar if the column would overlap it.

Done when the status pill, a notice and the top bar do not overlap at any of the four screen sizes.

### 1.4 Tell phone users what one finger does (F16, D6)

Files: Container (`handleStrokesUpdated` or the pointer-up path), `components/WhiteboardCanvas.js` (it knows the pointer type).

After the first stroke drawn with a finger, if `localStorage['netz_playground_finger_draws']` has never been set and `localStorage['netz_playground_finger_hint_seen']` is not set, show once: "One finger draws. Two fingers move the page. · **Scroll with one finger instead**". The action calls `handleSetFingerDraws(false)` and shows "One finger now moves the page. Change in Pen and page." Set the hint flag either way. The stroke that was just drawn stays.

### 1.5 Send to Notes that tells the truth (F32, F33)

Files: `components/InkToBlockConverterModal.js`, Container (`onConfirmSync`, lines 2436-2465). Outside the Playground: `src/app/(Primary.pages)/Notes/page.js` (one small addition).

- `onConfirmSync` returns `{ ok: true, noteId }` or `{ ok: false, reason }`. A storage error (quota) gives the reason "Your browser's storage is full".
- The modal waits for it. On failure it stays open and shows the reason in red above the buttons. On success it shows **Sent to Notes** and an **Open note** button.
- Open note goes to `/Notes?open=<noteId>`. Add the small handler for `open` to the Notes page so it opens that note. If that is not wanted, go to `/Notes` (the new note is first in the list).
- Picture, voice memo and sketch blocks are shown but disabled, with "Notes can't hold this yet". The selected count only counts blocks that can be sent.
- Under the title, one line: "Sends typed blocks. Handwriting stays on this page; turn it into typed text first to send it."

### 1.6 Touch-sized controls after a tap (F20, F24, F26 sizes, F34)

Rule: **44 x 44 px on coarse pointers, at least 24 x 24 px on fine pointers.** Use the existing pattern (`min-w-[44px] min-h-[44px]` plus a `coarse` flag or `@media (pointer: coarse)`).

| Where | Today | File |
|---|---|---|
| Block Done, Delete, Edit | 36 px | `blocks/SmartBlockWrapper.js:258-384` |
| Text block toolbar (Heading, List, Task, Bold, Italic) | 26 px, no name | `blocks/TheoryBlock.js:485-518`: add `aria-label`s |
| Recognition pill buttons | 36 px | `LiveMathPreviewOverlay.js:144-311` |
| Pill edit field buttons (Save & Convert, Cancel) | about 24 px | same |
| Close buttons in Symbol, Equation, Screenshot menus, Shapes gallery | 32 px | `symbols/SymbolMenu.js:54`, `equation/EquationMenu.js:52, 73`, `screenshot/ScreenshotMenu.js:35`, `shapes/ShapeGallery.js:153` |
| Colour swatches, width, grid, preset, finger and reading buttons | 24 to 28 px on fine pointers | `PlaygroundDock.js:423-640` (replaced in 3.1; until then raise to 32 px) |
| Phone zoom − and + | no name | `PlaygroundDock.js:1108-1130`: add `aria-label`s |
| Unsaved-changes close × | no name | `UnsavedChangesModal.js` (replaced by 0.1) |

### 1.7 Plain words and the music player (F14, F28, F31, F36)

- Apply the wording table in 0.3 everywhere.
- **Music player (D5).** Stop rendering `BackgroundMusicPlayer` at all times (Container, line 2529). Add **Focus music** to the More menu (all screen sizes); it opens the player in a `Dialog` (0.1) as a popover or sheet. While music plays, show a 44 px pause button in the top bar. Remember "playing / hidden" in `localStorage['netz_playground_music']`.

---

## 5. Phase 2: fill-ins

### 2.1 Fit to content (F17)

Files: `utils/pageSvg.js` (`getPageBounds`), `utils/viewportMath.js`, Container (`zoomTo`), `PlaygroundDock.js`.

Compute the box of all strokes, shapes and block rectangles on the page. Zoom and pan so it fills the visible area minus 48 px margins, with zoom clamped to `MIN_ZOOM`..`MAX_ZOOM` and the dock and top bar heights kept clear. An empty page resets to 100%. Add a **Fit** button beside the zoom percentage (laptop, tablet), in the phone zoom row, and the shortcut Shift+1. Put the box calculation in `viewportMath.js` as a pure function so it gets a logic test.

### 2.2 Accessibility (cross-cutting findings)

Files: `PlaygroundDock.js`, every modal, the 10 inputs that use `outline-none`, `layout.js`.

- `aria-pressed` on Pen, Highlighter, Eraser, Lasso, Move and Shapes.
- Move `UnsavedChangesModal`, `InkToBlockConverterModal`, `SoftEditorModal` and `SemanticLassoModal` onto `Dialog` (0.1).
- A visible focus ring (`focus-visible:ring-2 focus-visible:ring-blue-500`) on every button. On the 10 inputs that remove the outline (`blocks/EquationBlock.js`, `GraphBlock.js`, `ImageBlock.js`, `TheoryBlock.js`, `InkToBlockConverterModal.js`, `LiveMathPreviewOverlay.js`, `screenshot/ScreenshotEditor.js`, `shapes/ShapeTextEditor.js`, `SoftEditorModal.js`, `HandwritingCollector.js`), add a `focus-visible` ring in its place.
- Label text in zinc-400 (contrast about 2.6:1) moves to zinc-500 or darker (4.5:1 or more). Text that people must read is at least 12 px; 10 to 11 px stays only for badges.
- `layout.js`: remove `maximumScale: 1` and `userScalable: false`. The canvas already blocks page zoom with `touch-action: none` and the `gesturestart` handler. Check on a real iPhone and Android phone (handoff B10) that pinching the canvas still zooms the canvas, not the page; if it does not, put the two settings back and note it here.

### 2.3 Touch feedback (F18, F19)

Files: `components/WhiteboardCanvas.js`, Container.

- While two fingers pinch, show the zoom percentage in the status area (1.3) and hide it 1 second after the fingers lift.
- While erasing with a finger, draw the eraser ring under the finger (`drawEraserCursor`, today only on hover, line 936). Clear it on lift.

### 2.4 Panels close the same way (F12)

Until 3.1 replaces them: add `showSettings`, `showExportMenu` and `showMoreMenu` to the outside-press handler in `PlaygroundDock.js:137-156`, so a press outside closes them and does not draw. Give the phone Export menu a title and a close button (F15), using `Dialog` (0.1).

### 2.5 Blocks with a mouse (F23)

File: `blocks/SmartBlockWrapper.js:96-118`.

With a mouse: a click selects the block (bar and resize handle appear), a double-click or the Edit button edits it, and dragging the selected block's frame or bar moves it. Touch keeps the current behaviour (tap selects, second tap edits, 350 ms press drags).

### 2.6 Voice memo, shapes tabs, colours (F25, F35, F11)

- `blocks/AudioMemoBlock.js:260-279`: remove Loop, Shuffle and Playlist. Keep play / pause and the scrubber; add speed (1x, 1.5x, 2x) and an editable title.
- `shapes/ShapeGallery.js`: the category tabs get a fade on the side that has more, and on fine pointers ‹ › buttons that scroll by one screen.
- `PlaygroundDock.js:44-54`: give each colour a name for `aria-label` and the tooltip (Black, Blue, Green, Purple, Pink, Amber, Cyan, Slate, White). Move White to the end and title it "White (for dark pictures)".

### 2.7 Small text and Insert arrows

The split-button arrows (Screenshot ▾, Equation ▾, `PlaygroundDock.js:300-310, 346-356`) are 20 px wide. Make them 24 px on fine pointers (touch already uses one button).

---

## 6. Phase 3: big bets

### 3.1 A smaller dock, pen options per tool, a Page menu (F8, F9, F10, F13; D7)

Files: `PlaygroundDock.js` (split into `dock/DockBar.js`, `dock/PenOptions.js`, `dock/PageMenu.js`, `dock/MoreSheet.js` if it helps), Container, `components/WhiteboardCanvas.js` (gestures).

**Laptop (1100 px and wider): 17 controls instead of 25.**

`Undo · Redo | Pen · Highlighter · Eraser · Lasso · Move | Picture · Screenshot ▾ · Shapes ▾ · Symbol ▾ · Equation ▾ | Blocks ▾ | ● Pen options | − 100% + | Page ▾`

- The Insert group stays exactly as approved in `PLAYGROUND_INSERT_TOOLS_PLAN.md`.
- **Blocks ▾** holds Graph, Text and Voice memo. Its label stays visible at every fold level.
- **100%** opens a small menu: Zoom to 100%, Fit (2.1), Zoom in, Zoom out.
- **Page ▾** (label always visible) holds: Writing mode (on/off), Page background (Dots, Grid, Lines, None), Send to Notes, Export, Focus music (1.7), Preferences.
- The fold steps stay: 1 hides labels except Blocks and Page; 2 folds zoom; 3 moves Move and Blocks into Page ▾.

**Tablet (640 to 1100 px).** As today, with Insert ▾, plus Blocks ▾ and Page ▾ in place of the separate buttons.

**Phone (under 640 px).** The bar stays `Undo · Pen · Highlighter · Eraser · Lasso · ● · More`. The More sheet gets headed sections in this order: **Insert** (five tiles, as today), **Blocks** (Graph, Text, Voice memo), **Page** (Move page, Writing mode, Page background, Send to Notes, Export, Focus music), **View** (zoom −, %, +, Fit), **Preferences**. Redo moves to gestures (below) and stays in the Page section.

**Pen options (the ● button) change with the tool:**

- Pen: named colour swatches; **Pen type** (Ballpoint, Fountain, Pencil, Marker) as one row of choices, with the active one always marked; **Width** as a slider from 1 to 16 px with a preview line drawn in the current colour, width and opacity, and the value shown ("3 px"). Moving the slider keeps the pen type's opacity. This removes the separate Fine / Medium / Bold row, so a width is always shown (F10).
- Highlighter: its colours and its own width (handoff C6).
- Eraser: Whole stroke / Part of stroke and the three sizes, moved here from the floating bar above the dock.
- Other tools: the button is hidden.

**Preferences** (a `Dialog`): One finger (Draws / Moves the page); Read my writing (3.2); Show readings.

**Gestures (handoff B8).** In `WhiteboardCanvas.js`: two fingers that touch down within 250 ms of each other, move less than 10 px and lift within 300 ms = Undo; three fingers the same way = Redo. Neither leaves a mark (the existing "second finger cancels the stroke" rule already removes the first finger's dot). Show "Undone" / "Redone" in the status area.

### 3.2 One way to read and fix handwriting (F26, F27, F30)

UI only. Do not change anything in `utils/recognition/` that handoff rule 1 protects (model files, `canonicalFeatures.js`, the decode loop in `hmerDecoder.js`).

Files: `LiveMathPreviewOverlay.js`, `SoftEditorModal.js`, `SemanticLassoModal.js`, Container (`ocrMode`, `showLiveOcr`, `notesMode`, lines 105-113 and 2510-2523), `PlaygroundDock.js` (settings).

- **One setting.** Replace `ocrMode` and `showLiveOcr` with `readMode`: `'off' | 'select' | 'live'`, in Preferences as "Read my writing: Off / When I select / As I write". Default `'select'` (today's behaviour). Writing mode switches it to `'live'` and restores the previous value when turned off (the `ocrBeforeNotesRef` logic). The setting shows the value Writing mode set, so nothing changes out of sight. Save `readMode` and Writing mode in localStorage.
- **Pills that do not cover writing.** A pill sits at the right end of the ink it reads (`bbox.maxX + 8`, centred on the line), not 48 px above it. If there is no room on the right, below the line. While drawing (`isDrawing`), pills shrink to a 12 px dot. Two pills that would overlap stack downwards. Pills keep clear of the top bar, the dock and the status area.
- **Collapsed by default.** A pill shows the reading and **Turn into typed text**. A **⋯** button (44 px) opens: Fix, Read as maths / Read as text, Plot graph (maths only).
- **One Fix editor.** Merge the inline pencil edit and `SoftEditorModal` into one `Dialog` titled "Fix", containing: the other readings as tappable choices (the hypotheses the Soft Editor already lists), "This is: Text / Maths" (the type picker), a field to type the correct reading with a live preview, and **Turn into typed text**. Remove the inline pencil edit field from the pill.
- **Lasso.** When a lasso selection's reading fails, open the same Fix editor with the type picker first, instead of `SemanticLassoModal`. Delete `SemanticLassoModal.js` once nothing uses it.

### 3.3 Model loading that can fail gracefully (F29; handoff B9)

Files: `utils/recognition/modelManager.js` (`notifyStatus`, `fetchWithCache`, `loadRouter`, `loadHTR`, `loadHMER`), `components/AIModelLoadingStatusPill.js`, Container (line 409, `loadRouter` on open).

The model files and their loading order are not changed; only status reporting and when large files are fetched.

- Status gains `state: 'loading' | 'ready' | 'failed'` and `progress: { loaded, total }`. `fetchWithCache` reads the response body as a stream and reports bytes against `Content-Length` (when there is no length, report loaded bytes only). Files from the cache report at once.
- **Bug today:** a failed load ends with `isLoading: false` and a message, which the pill shows with a green tick ("Router load failed" ✓). The pill must show failure as a warning: "Handwriting reading is unavailable. You can keep writing. · Retry".
- While loading: "Getting the handwriting reader ready… 12 of 36 MB".
- Check that only the router (0.4 MB) loads when the page opens, and that the maths and text models load on first use. Fix it if not.
- When `navigator.connection.saveData` is true, ask before the first large download: "Reading handwriting needs a one-time 36 MB download. · Download · Not now". "Not now" sets `readMode` to `'off'` for this visit.
- Recognition that cannot run never blocks drawing.

### 3.4 Undo per page, and a page sheet (F3, F5)

Files: `utils/historyStack.js`, Container (`historyRef`, `resetHistory`, `handleSelectPage`, `handleAddPage`, `handleDeletePage`, `handleDuplicatePage`), `components/PageManager.js`, new `components/PageSheet.js`, `utils/pageSvg.js` (thumbnails).

**Undo per page.** Keep a `Map` from page id to history stack. On a page switch, keep the current page's stack and restore the target page's stack (or start one from the page's state). Keep stacks for the five most recently visited pages to bound memory; older pages start fresh. Deleting a page keeps its stack inside the undo notice (1.1), so Undo restores the page with its history. Duplicate starts a fresh stack. Session restore starts fresh stacks, as today. Stroke objects stay shared by reference (rule 4).

**Page sheet.** Tapping the page counter ("2 / 5") opens a `Dialog`:

- A thumbnail per page, drawn with `pageSvg.js` at small size and cached by page id plus the page's last change time.
- Tap a page to open it. Rename inline (the `title` field already exists in the session). Drag to reorder (touch: press for 350 ms, then drag; keyboard and screen readers: Move up / Move down buttons).
- Per page: Duplicate, Delete (with the undo notice). At the end: Add page.
- New page titles use the highest existing "Page N" number plus 1, so titles do not repeat after a delete.
- The session shape does not change; reorder changes the order of `pages` and fixes `currentPageIndex`.

---

## 7. Phase 4: later, after the owner decides

### 4.1 Ink over blocks (F22; D8; handoff C2)

A per-block switch "Send behind ink" in the block's bar. Blocks behind ink render below the ink canvases and above the grid; the ink canvas must then pass presses through to those blocks only when the active tool is not a drawing tool. Plan this in detail when the owner decides.

### 4.2 Export all pages (F15; handoff C7)

Export asks "This page / All pages". All pages renders each page off screen (strokes, shapes and blocks), then writes one PDF with a page each. SVG and PNG export the current page only.

---

## 7a. Every finding and where it is fixed

| Finding | Step | Finding | Step | Finding | Step |
|---|---|---|---|---|---|
| F1 | 1.1 | F13 | 3.1 | F25 | 2.6 |
| F2 | 1.2 | F14 | 0.3, 1.7 | F26 | 1.6, 3.2 |
| F3 | 3.4 | F15 | 2.4, 4.2 | F27 | 3.2 |
| F4 | 1.2 | F16 | 1.4, 3.1 | F28 | 0.3, 1.7 |
| F5 | 3.4 | F17 | 2.1 | F29 | 3.3 |
| F6 | 1.1 | F18 | 2.3 | F30 | 3.2 |
| F7 | 1.3 | F19 | 2.3 | F31 | 0.3 |
| F8 | 3.1 | F20 | 1.1, 1.6 | F32 | 1.5 |
| F9 | 3.1 | F21 | withdrawn | F33 | 1.5 |
| F10 | 3.1 | F22 | 4.1 | F34 | 1.6, 2.7 |
| F11 | 2.6 | F23 | 2.5 | F35 | 2.6 |
| F12 | 0.1, 2.4 | F24 | 0.3, 1.6 | F36 | 1.7 |

The audit's cross-cutting accessibility findings are fixed in 0.1, 1.6 and 2.2.

---

## 8. Checks, run together at the end

Run these only after every step in sections 3 to 6 is built.

**Existing checks (handoff section 4), all must still pass:** lint (no new warnings), every `node test_*.mjs`, `node benchmark_recognition.mjs --self-test`, `node run-all.mjs` against the production build, `npm run build`. `test_feature_parity.mjs` and the model files are untouched.

**Update the browser checks first.** Change `clickTitle` callers in `tests/browser/` to find buttons by `aria-label`, and update renamed labels (0.3). Keep the screens.mjs Pen rule working.

**New logic tests (project root):**

| File | Checks |
|---|---|
| `test_canvas_helpers.mjs` | Per-page history: switch pages and undo on each; the five-page limit; deleted page restored with its history. Fit-to-content box: strokes, shapes, blocks, empty page, clamped zoom. |
| `test_session_and_images.mjs` | `saveSession` reports failure when IndexedDB fails; reorder and rename survive save and load. |

**New and extended browser checks (`tests/browser/`), at phone 390 x 844 with touch and at laptop 1366 x 768 with a mouse:**

| Check | Pass when |
|---|---|
| `screens.mjs`: open states | With Pen options, More sheet, Page menu, Page sheet, a block being edited, an open pill and its ⋯ menu, the Fix editor and every Insert menu open: 0 controls under 44 px on coarse pointers and under 24 px on fine pointers, 0 buttons without a name, 0 off screen. Status area, top bar and dock do not overlap. |
| `pages.mjs` | Delete page → Undo restores it in place with its ink; undo still works on a page after switching away and back; rename and reorder survive a reload; no duplicate "Page N" titles. |
| Save status | Normal use: leaving the Playground asks nothing. With `indexedDB.open` made to fail: "Couldn't save" shows, Retry works once IndexedDB is restored, and leaving shows the new prompt. |
| Send to Notes | With `localStorage.setItem` made to throw: the error shows and the dialog stays open. Success: Open note opens the new note. Picture blocks are disabled. |
| `touch.mjs` | Two-finger tap undoes, three-finger tap redoes, neither leaves a mark; the finger hint shows once after the first finger stroke; its action switches to one-finger scrolling. The existing 20 checks still pass. |
| Recognition UI | A pill never covers the ink line above the ink it reads; Fix opens one editor; with model URLs blocked (request interception), the warning state shows and drawing still works; on first visit only the router is fetched (network log). |
| Blocks | Mouse: click selects, double-click edits; deleting a block shows Undo and Undo brings it back. |
| Music | The player is not on screen until opened from More; a pause button shows while it plays. |

**On real devices (handoff B10):** two- and three-finger taps, the browser-zoom change in 2.2, the page sheet drag, and the phone keyboard over a Text block.

When all of this passes, update `PLAYGROUND_HANDOFF.md` sections 5 and 6 with what was measured, as its definition of done asks.

---

## 9. Progress

| Step | State | Notes |
|---|---|---|
| Decisions D1 to D8 | Accepted 2026-10-16 | Recommended answers |
| 0.1 to 0.3 | Done 2026-10-16 | `components/ui/Dialog.js` (Dialog, Popover, `TOUCH_TARGET`), action notices in the Container, `utils/uiText.js` |
| 1.1 to 1.7 | Done 2026-10-16 | See "Differences from the plan" below |
| 2.1 to 2.7 | Done 2026-10-16 | |
| 3.1 to 3.4 | Done 2026-10-16 | Laptop dock: 18 controls (was 25), plus the two split-button arrows |
| 4.1, 4.2 | Waiting on D8 and C7 | Not built |
| Section 8 checks | Done 2026-10-16 | Results below |

### Differences from the plan, and what was found while building

- **Bug fixed:** a model that failed to load ended with the failure message under a green tick. It now shows a warning with Retry (3.3).
- **Model loading (B9):** the large models already loaded only on first use, but creating the router session also fetched the 28 MB recognition runtime as soon as the page opened. The router now warms up after the first stroke (and never while reading is Off). Checked: no `/models/` or `/onnx/` request before the first stroke.
- **One reading setting:** "Show readings" was folded into "As I write" instead of being a third control, so "Read my writing" is the only switch (Off / When I select / As I write).
- **SemanticLassoModal** was never opened by anything (dead code), so it was deleted rather than merged. SoftEditorModal became `FixReadingDialog.js`.
- **F19:** the eraser ring already showed under a finger while erasing; the real defect was that it stayed on screen after the finger lifted. That is fixed.
- **Pills while drawing:** they stay hidden while a stroke is drawn (as before) rather than shrinking to a dot.
- **Lasso:** the pen options button also shows while the lasso is active, because the lasso's "apply the pen colour" needs a colour to be picked (found by `lasso.mjs`).
- **Pop-up height:** pop-ups above the dock are capped to the room there is (phone landscape, 390 px high, overflowed before; found by `screens.mjs`).
- **Notes page:** `src/app/(Primary.pages)/Notes/page.js` opens `?open=<note id>` for Open note.
- **Scrolling (reported by the owner 2026-10-16, older than this work):** the Container's wheel handler cancelled every wheel event, so menus and galleries inside the page (Shapes gallery, Maths actions "Try an example") could not be scrolled with a mouse. The wheel now scrolls whatever box under the pointer has its own scrollbar, and pans the canvas elsewhere. The Maths actions menu also ran off the bottom of the screen behind the dock; it now fits the room below its button, or opens above it. Checked in `ux-fixes.mjs` (now 45/45), including a finger scrolling the phone Shapes sheet.
- **Removed from the dock:** the always-visible eraser bar (now in the eraser's options) and the Notes button (now Page > Writing mode).

### Check results (production build, 2026-10-16)

| Check | Result |
|---|---|
| Lint | 0 errors, 0 warnings (the 2 old warnings went with the rewritten files) |
| `npm run build` | Succeeds |
| Logic tests | All pass, including new checks: `test_canvas_helpers.mjs` 94/94 (fit to content), `test_session_and_images.mjs` 75/75 (save failure reported). `test_equations.mjs` 13/14 fails on chemistry: its files are unchanged by this work |
| `test_feature_parity.mjs` | 6/6; model files untouched |
| `benchmark_recognition.mjs --self-test` | OK |
| `run-all.mjs` (16 suites) | 14 pass. undo 30, touch 20, eraser 13, lasso 21, export 16, pen 12, blocks 20, workspace 49, render 14, insert-shapes 54, insert-shapes-arrange 35, insert-symbols 35, insert-screenshot 38, **ux-fixes 40/40 (new)** |
| Failing suites | insert-equations 29 to 30/35 and insert-shapes-format 40/41. **Both fail the same way on the code from before this work** (built separately from the backup and run against the same checks, three times): the ribbon list, the Common Equations list, "editor fetched", Enter-to-finish after Linear/Professional, and the phone format bar's Rotate button. The checks and the code disagree from earlier work |
| `touch-blocks.mjs` | 13/13 |
| `screens.mjs` | Phone portrait, phone landscape, tablet: 0 off screen, 0 under 44 px, every panel and dialog fits. Laptop: 0 off screen; 3 under 44 px are the two 24 px split-button arrows (allowed for a mouse) and the app sidebar's profile link |

Browser checks now find buttons by title or accessible name (`clickTitle` in `lib.mjs`), and know where moved controls live (`MOVED`). New helpers: `zoomLabel`, `withToolOptions`, `setPenWidth`.

### Still to do

- Real devices (handoff B10): two- and three-finger taps, the browser-zoom change in 2.2, dragging pages in the page sheet, the phone keyboard over a Text block.
- Decide whether to update `insert-equations.mjs` and `insert-shapes-format.mjs` to the current Insert behaviour, or the code to the checks.
- 4.1 and 4.2 after the owner decides.
