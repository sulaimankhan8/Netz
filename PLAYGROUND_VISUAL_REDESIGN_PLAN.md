# NETZ Playground: visual redesign plan

Written 2026-10-17. **Status: approved 2026-10-17.** The owner approved the design board "as drawn", with the recommended answer to all four decisions (section 1). No code has been written yet. Progress is recorded in section 10.

This plan builds the design on the board "Netz Playground Redesign" (a Claude Design canvas: https://claude.ai/artifact/NeSq9psN8xKw64pnU5KHAS). Its artboards are: 1 the audit (findings V1 to V16), 2 the design language, 3 the laptop screen, 4 to 7 the phone screens (writing, pen options, + sheet, page menu). Finding numbers V1 to V16 refer to artboard 1.

This round changes **how the Playground looks and where controls live**. Behaviour built in the UX fix round (`PLAYGROUND_UX_FIX_PLAN.md`: undo notices, honest save status, per-page undo, Fix dialog, gestures) stays as it is unless a step below says otherwise.

Before starting:

- Read `PLAYGROUND_HANDOFF.md` sections 1 to 4. Its rules (section 2) apply: the maths model is frozen, every pointer draws, strokes are never changed in place, nothing is committed unless the owner asks.
- Read the Next.js font guides before step 0.2: `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` and `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` (section "Using a font definitions file"). See `AGENTS.md`.
- The project is not in git. Copy every file a phase changes to the session scratchpad before editing it.

**Order of work.** Build every step in sections 3 to 8 in order, then run all the checks in section 9 together at the end. Do not stop to test between steps.

All paths are under `src/app/(Primary.pages)/Playground/` unless they say otherwise. *Container* means `components/PlaygroundCanvasContainer.js`; *Dock* means `components/PlaygroundDock.js`.

---

## 1. Decisions (accepted 2026-10-17)

Named R1 to R4 so they are not confused with D1 to D8 of the UX fix plan.

| # | Decision | Where |
|---|---|---|
| R1 | **Graphite is the default ink** (`#18181B`, today's "Black" swatch). Blue stays in the ink palette. | 6.0 |
| R2 | **Zoom and the Page menu move from the dock to a top-right bar.** The dock keeps tools, the pen chip, the Insert group and Blocks: 14 controls (was 18). The Insert group keeps its items, order, names and split-button behaviour exactly. This replaces the dock layout approved as D7. | 4.1, 4.3 |
| R3 | **On phones, a + sheet ("Add to page") and a ⋯ page menu replace the More sheet.** Making things lives at the bottom, page settings at the top. | 4.2, 4.4, 4.5 |
| R4 | **Interface font: DM Sans**, loaded with `next/font/google`, for the Playground only. The app shell keeps Poppins. | 0.2 |

---

## 2. What changes, in one view

| Phase | Steps | Findings | Size |
|---|---|---|---|
| 0. Foundations | 0.1 tokens, 0.2 font, 0.3 shared parts, 0.4 panel shell, 0.5 wording | V1, V2, V5, V11 | Medium |
| 1. Chrome | 4.1 laptop and tablet dock, 4.2 phone dock, 4.3 top bars, 4.4 phone page menu, 4.5 + sheet, 4.6 status area | V4, V6, V7, V8, V9, V12 | Large |
| 2. Panels | 5.1 pen options, 5.2 Insert menus and dialogs, 5.3 Preferences | V3, V10, V11 | Medium |
| 3. On the page | 6.0 default ink, 6.1 selection look, 6.2 context bar, 6.3 reading pills, 6.4 blocks at rest, 6.5 page background, 6.6 empty page | V2, V13, V14, V15, V16 | Large |
| 4. Sweep | 7.1 colours, 7.2 text sizes and fonts, 7.3 dark mode | V1, V3, V5 | Medium |

Step 6.0 (default ink) is one line. Section 9a maps every finding to its step.

---

## 3. Phase 0: foundations

### 0.1 Design tokens

Files: new `playground.css` (imported from `layout.js`); `tailwind.config.js` (project root; add names only); new `components/ui/tokens.js`.

Define the colours once as CSS variables on `:root` and `html.dark` (the app uses Tailwind's `darkMode: 'class'`). They go on `:root`, not on a Playground element, because dialogs and sheets are portalled to `document.body`. The `--pg-` prefix keeps them from touching the rest of NETZ. Store each as space-separated RGB channels so Tailwind opacity modifiers work.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `paper` | `#F6F6F3` | `#141415` | The page behind the ink |
| `surface` | `#FFFFFF` | `#1E1E20` | Bars, menus, sheets, blocks |
| `tray` | `#EFEFEB` | `#2A2A2D` | Hover and press, segmented-control track, tiles |
| `line` | `#E4E4DF` | `#34343A` | 1 px borders, dividers |
| `ink` | `#1D1D1F` | `#F4F4F2` | Main text; **the active tool** |
| `on-ink` | `#FFFFFF` | `#1D1D1F` | Icon on the active tool, notice text |
| `text2` | `#55555A` | `#B4B4BA` | Secondary text, idle icons (contrast 7:1 on surface) |
| `muted` | `#ADADB2` | `#6B6B72` | Disabled only |
| `accent` | `#4F46E5` | `#A5B4FC` | Selection outlines and handles, focus rings, switch on |
| `accent-fill` | `#4F46E5` | `#4F46E5` | Main buttons (white text, 6.3:1) |
| `accent-tint` | `#EEF0FF` | `#2B2D52` | "Turn into typed text" and similar soft buttons |
| `accent-on-tint` | `#3730A3` | `#C7CBFF` | Text on `accent-tint` |
| `danger` | `#B42318` | `#F97066` | Couldn't save, Clear page, Delete page |
| `danger-tint` | `#FDECEA` | `#3A1D1B` | Background behind a failure |
| `notice-action` | `#C7CBFF` | `#4338CA` | The Undo word on a notice |

Also on `:root`: `--pg-shadow-bar: 0 1px 2px rgb(29 29 31 / .06), 0 8px 24px rgb(29 29 31 / .08)` and `--pg-shadow-menu: 0 2px 4px rgb(29 29 31 / .05), 0 16px 40px rgb(29 29 31 / .14)`; dark versions use black at higher opacity.

In `tailwind.config.js` `theme.extend`, add only:

- `colors.pg.<token>`: `rgb(var(--pg-<token>) / <alpha-value>)` for every row above, so classes read `bg-pg-surface`, `text-pg-text2`, `border-pg-line`, `ring-pg-accent`.
- `boxShadow`: `pg-bar`, `pg-menu` from the two variables.
- `fontFamily.pg`: `['var(--pg-font-sans)', 'Segoe UI', 'system-ui', 'sans-serif']`.
- `fontSize`: `pg-cap` 12/16, `pg-label` 13/18, `pg-body` 15/22, `pg-title` 18/24 (size/line height in px).

Radii use Tailwind's defaults: `rounded-lg` 8 (chips, swatches), `rounded-xl` 12 (buttons, blocks), `rounded-2xl` 16 (bars, menus), `rounded-3xl` 24 (phone sheets).

`components/ui/tokens.js` exports the same colours as hex strings for code that paints on a canvas or builds SVG attributes (the lasso box, shape handles, connector hints), plus `isDarkPage()` (`document.documentElement.classList.contains('dark')`) and `pgColour(name)` that returns the light or dark value. Put a comment in both files that they must change together.

### 0.2 The font

Files: new `utils/fonts.js` (a font definitions file, as the Next.js guide describes); Container (root element); `components/ui/Dialog.js`; `components/equation/EquationRibbon.js` and `components/screenshot/ScreenshotEditor.js` (their `createPortal` roots).

- `utils/fonts.js`: `export const pgSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--pg-font-sans' })` and `export const PG_FONT = \`${pgSans.variable} font-pg\``. DM Sans is a variable font, so no weight list is needed. `next/font` self-hosts the files, so the Playground keeps working offline.
- Add `PG_FONT` to the Container's root element **and to every portal root** (the Dialog backdrop, the Popover sheet on phones, the equation ribbon portal, the screenshot editor portal). A portal renders in `document.body`, outside the Playground root, and would otherwise fall back to Poppins or the system font.
- Numbers that change (zoom, page numbers, width in px, rotation and size readouts) use `tabular-nums`. Remove `font-mono` from them.

### 0.3 Shared parts

File: new `components/ui/parts.js`. Every bar, menu and sheet below uses these, so the looks live in one place.

- `toolButton({ active, expanded })`: 40 x 40 px with a mouse, 44 x 44 px on coarse pointers (`TOUCH_TARGET`), `rounded-xl`. Idle `text-pg-text2 hover:bg-pg-tray`; **active `bg-pg-ink text-pg-on-ink`** (one look for every tool, no glow); expanded (its menu is open) `bg-pg-tray text-pg-ink`; disabled `text-pg-muted`.
- `barShell`: `bg-pg-surface border border-pg-line rounded-2xl shadow-pg-bar`. Used by the dock and both top bars.
- `Divider`: 1 x 24 px `bg-pg-line`, 6 px side margins.
- `Segmented` (choose one of a few): a `bg-pg-tray rounded-[14px] p-1` track; the chosen segment `bg-pg-surface shadow-sm text-pg-ink font-semibold`; buttons carry `aria-pressed` (or `role="radio"` and `aria-checked` inside a `radiogroup` where they are today).
- `Tabs` (move between categories): one row that scrolls sideways, with faded edges where there is more and ‹ › buttons on fine pointers. The chosen tab is a graphite pill (`bg-pg-ink text-pg-on-ink`). Move the fade and arrow code already in `shapes/ShapeGallery.js` (UX plan 2.6) into this part.
- `Switch`: a real `button role="switch" aria-checked`; track 48 x 28 inside a 44 px target; on `bg-pg-accent-fill`, off `bg-pg-line`.
- `SwatchButton`: 44 px target, 28 to 30 px colour dot; chosen: 2 px graphite ring with a 2 px gap (`box-shadow: 0 0 0 2px surface, 0 0 0 4px ink`). No tick mark.
- Button levels: **main** `bg-pg-accent-fill text-white`; **secondary** `bg-pg-tray text-pg-ink`; **quiet** transparent with `hover:bg-pg-tray`; **destructive** `text-pg-danger`.

### 0.4 One panel shell

File: `components/ui/Dialog.js` (`Dialog`, `Popover`, `CloseButton`).

- Panel: `bg-pg-surface border-pg-line shadow-pg-menu`, solid (drop `bg-white/95` and `backdrop-blur-2xl`). `rounded-2xl` on laptops, `rounded-t-3xl` on phones.
- Title: 15 px semibold in popovers and laptop dialogs, 18 px in phone sheets. Remove the rule under the header; a panel that has a `Tabs` row puts its rule under the tabs instead.
- Body text 13 px (was 12 px `text-xs`); menu rows 15 px; section labels `text-pg-cap font-semibold text-pg-text2`.
- Phone sheets: a 36 x 5 px handle bar at the top (decoration only; swipe-to-close is not part of this round); backdrop `bg-black/20` (was 30%).
- Close button: unchanged sizes (32 px fine, 44 px coarse), icon `text-pg-text2`.
- Keep everything the UX round built: focus handling, Escape, outside presses swallowed, `data-insert-dialog`, `data-keep-panels`, `role`, `aria-*`.
- `Popover` gains a `placement` preset for bars at the top of the screen: below the anchor (`absolute top-full mt-2`), right-aligned for the top-right bar.

### 0.5 Wording

File: `utils/uiText.js`. Add: `addToPage: 'Add to page'`, `thisPage: 'This page'`, `background: 'Background'`, `zoom: 'Zoom'`, `moreColours: 'More colours'`, `penTypes: { ballpoint: 'Ballpoint', fountain: 'Fountain', pencil: 'Pencil', marker: 'Marker' }`, `pageOf: (n, total) => \`Page ${n} of ${total}\``, `recording: 'Recording'`, `emptyTitle: 'Write anything.'`, `emptyHint: 'End a sum with = and the answer appears.'`. Remove `more` once nothing uses it. `pageMenu` stays `'Page'` (the ⋯ button's accessible name).

---

## 4. Phase 1: chrome

### 4.1 Laptop and tablet dock (V1, V9)

File: Dock.

**Laptop (1100 px and wider), left to right:**

`Undo · Redo | Pen · Highlighter · Eraser · Lasso · Move · [pen chip] | [Insert tray: Picture · Screenshot ▾ · Shapes · Symbol · Equation ▾] | Blocks ▾`

- Remove the zoom group (Zoom out, the percentage, Zoom in) and the Page button: they move to the top-right bar (4.3).
- `tool()` loses its `activeClass` argument: every tool uses `toolButton({ active })` from 0.3. This removes `bg-blue-500`, `bg-yellow-500`, `bg-rose-500`, `bg-purple-500` and their coloured shadows (lines 1042 to 1046).
- **Pen chip** replaces the colour dot (lines 1112 to 1129): a bordered button, 40 px high, showing the colour dot and the width ("3 px", tabular). Eraser: a grey ring and the size name ("Medium"). Lasso: the colour dot only (it recolours with the pen colour). Accessible name "Pen options: Graphite, 3 px" (or Highlighter / Eraser options). Its `title` starts with "Pen options" (or Highlighter / Eraser). It opens the same options panel (5.1).
- **Insert tray:** the five Insert buttons sit in a `bg-pg-paper rounded-[13px] p-0.5` group (`role="group" aria-label="Insert"`), each with icon and a 13 px label. Picture gets its "Picture" label too, so all five match. Split buttons (Screenshot, Equation) join the main part and a 26 px full-height arrow with no gap, as one rounded shape. Same behaviour as today: on fine pointers the main part acts and the arrow opens the menu; on touch one button opens the menu.
- **Insert states:** a button whose menu is open uses the *expanded* look (tray). Shapes while a shape is armed (`activeTool === 'shape'`) uses the *active* look (graphite), because it is a tool mode. Remove every `bg-indigo-500 … shadow-indigo-500/30` (lines 506, 543, 586, 604, 1067).
- Blocks ▾: label always visible, 13 px. While recording, a `bg-pg-danger` dot and the accessible name "Blocks, recording".
- Bar: `barShell`, 56 px high with a mouse (60 px on coarse pointers), padding 6 px, gap 2 px.
- **Fold steps** (worked out as today, from 0, whenever the space changes): 1 hides the Insert labels (icons and split arrows stay; Blocks keeps its label); 2 moves Move into the ⋯ page menu. The zoom fold step goes away. Below 1100 px the tablet layout applies.
- Keep the rule in the code comment at line 1022: a `button[title^="Pen"]` must stay a direct child of the bar (screens.mjs).

**Tablet (640 to 1100 px):** `Undo · Redo | Pen · Highlighter · Eraser · Lasso · Move · [pen chip] | Insert ▾ | Blocks ▾`. Insert ▾ opens today's Insert popover of five tiles, restyled as the + sheet tiles (4.5). Move folds into the page menu first if the bar does not fit.

The bar stays centred in the space right of the app sidebar (today's `sidebarRight` code). Move that measuring code into a hook, `components/ui/useSidebarRight.js`, because the top bars need it too (4.3).

### 4.2 Phone dock (V12)

File: Dock.

`Undo · Pen · Highlighter · Eraser · Lasso · ● · +` — seven 44 px buttons spread across the bar (`justify-between`), bar inset 12 px from each side, 64 px high, `rounded-[20px]`.

- **●** opens the tool options sheet (5.1). It is a 24 px colour dot with a thin ring, accessible name as the laptop pen chip.
- **+** (`aria-label="Add to page"`, `bg-pg-tray`) opens the + sheet (4.5). It replaces More.
- Redo stays on the three-finger tap (UX plan 3.1) and moves into the page menu (4.4). Undo stays on the bar.
- The pulsing stop button that appears on the bar while recording goes away; recording shows in the status area instead (4.6), so the bar never has eight buttons.

### 4.3 Top bars on laptops and tablets (V4, V6, V7, V8)

Files: `components/PageManager.js` (becomes the page bar), new `components/DocBar.js`, Container (lines 2438 to 2454), `components/BackgroundMusicPlayer.js`.

Two bars, same height (52 px), radius, border and shadow as the dock (`barShell`):

**Page bar, top-left** at `left: sidebarRight + 16px`, `top: calc(env(safe-area-inset-top) + 16px)`:

`‹ | [page name / "Page 2 of 3" ▾] | › | divider | +`

- The middle button shows the page name (15 px semibold, truncated) over "Page 2 of 3" (12 px, `text-pg-text2`, tabular), with a ▾. It opens the page sheet (`PageSheet.js`) as today. Remove the blue page number and the mono font (V6).
- Add page is a plain icon button (V8). Its accessible name stays "Add page".
- Duplicate, Clear and Delete leave this bar and go into the page menu (below).

**Document bar, top-right** at `right: 16px`, same top:

`[✓ Saved] | [100% ▾] | [Send to Notes] [⋯]`

- **Save status** (moved from `PageManager.js`, the `SaveStatus` component): "Saved" in `text-pg-text2` with a tick; "Saving…" after 800 ms as today; on failure a `bg-pg-danger-tint text-pg-danger` chip with a Retry button (32 px fine, 44 px coarse) and `role="alert"`. Ctrl+S flashes the word "Saved" in `text-pg-ink` for a moment; no green anywhere (V4).
- **Zoom** button: `aria-label="Zoom"`, `title` starting "Zoom (", the percentage as its text (tabular). It opens the existing zoom menu (Zoom to 100%, Fit to content, Zoom in, Zoom out) below it, right-aligned. Keyboard shortcuts unchanged.
- **Send to Notes**: a quiet button with icon and label on laptops, icon only on tablets.
- **⋯ Page menu** (`aria-label="Page"`, `title` starting "Page:"): a popover below, right-aligned, containing in order: Writing mode (`Switch`); Background (`Segmented`: Dots, Grid, Lines, Plain; disabled while Writing mode is on, as today); Move page (only when folded out of the dock); divider; Export with PNG, SVG and PDF as three small secondary buttons in one row; Focus music; Preferences; divider; Duplicate page; Clear page (`text-pg-danger`, broom icon, replaces `LuEraser` so it no longer matches the Eraser tool); Delete page (`text-pg-danger`, only with more than one page). Clear and Delete keep their undo notices.
- **Focus music:** while music plays, the player's pause button (today fixed at the top right, where this bar now sits) renders inside the document bar, left of the save status. Give `BackgroundMusicPlayer` an `onPlayingChange` callback and move the pause button into `DocBar`.

**Fit on tablets:** if the two top bars would meet (measure both, like the dock's fold), the document bar first drops the Send to Notes label, then the "Saved" word (the tick stays, with the word as its accessible name).

### 4.4 Phone top bar and page menu (V7, V12)

Files: `components/PageManager.js`, `components/DocBar.js`, Container.

**One bar**, inset 12 px from both sides, 56 px high:

`‹ | [page name / "Page 2 of 3 · Saved" ▾] | › | divider | + | ⋯`

- The middle button fills the remaining width, centred. Its second line carries the save status ("Saved", "Saving…").
- When saving fails, the failure shows as a persistent notice in the status area with a 44 px Retry button (4.6), because a button cannot sit inside the page-name button.
- **⋯** opens the page menu as a sheet titled "This page" (artboard 7). Order: Writing mode (with "Reads your writing as you go" under it) and its switch; Background (segmented); Zoom row (−, the percentage, +, Fit, all 44 px); divider; Redo; Send to Notes ›; Export › (opens a small sheet with PNG, SVG, PDF); Focus music ›; Preferences ›; divider; Duplicate page; Clear page; Delete page (with more than one page). This replaces both today's phone "Page actions" menu in `PageManager.js` and the Page, View and Redo parts of the More sheet.

### 4.5 The + sheet: "Add to page" (V12)

File: Dock (or a new `components/dock/AddSheet.js` if the Dock grows too long).

A sheet titled "Add to page" (artboard 6):

- **Insert:** Picture, Screenshot, Shapes, Symbol, Equation (WPS order) as tiles in a five-column grid.
- **Blocks:** Graph, Text, Voice memo in the same grid (left-aligned). While recording, Voice memo reads "Stop recording".
- Tiles: 78 px high, `rounded-[14px] bg-pg-paper`, a 24 px icon in `text-pg-ink`, a 12 px label. All icons grey: remove the green Graph, purple Text and blue Send to Notes icons (V3).
- Each tile does what the matching More-sheet tile or Blocks row does today (Screenshot, Shapes, Symbol and Equation open their menus as sheets). Keep their accessible names ("Insert Picture", "Add Graph Block", "Add Text Block", "Record a voice memo").
- Remove the More sheet (`panel === 'more'`, lines 942 to 988) once the + sheet and the page menu hold everything it held.

### 4.6 Status area

File: Container (lines 2476 to 2517), `components/AIModelLoadingStatusPill.js`.

- Centre the status area in the canvas space (left = `sidebarRight`, right = 0), not in the window. Top stays 76 px (16 + 52 + 8 on laptops; 12 + 56 + 8 on phones).
- **Notice:** `bg-pg-ink text-pg-on-ink`, 14 px medium, 48 px high when it has an action, `rounded-[14px]`, action word in `text-pg-notice-action` (was sky-300). Pinch zoom readout: the same look, tabular numbers.
- **Model status pill:** a surface pill (`bg-pg-surface border-pg-line`, 13 px, tabular progress). Failure: `bg-pg-danger-tint text-pg-danger` with Retry. No blue spinners: spinners in `text-pg-text2`.
- **Recording** (all sizes): a surface pill with a red dot, "Recording 0:12" and a 44 px Stop button (`pointer-events-auto`). Replaces the pulsing phone dock button.
- **Save failed (phones):** a persistent notice "Couldn't save" with Retry, until a save succeeds.

---

## 5. Phase 2: panels

### 5.1 Pen, highlighter and eraser options (V10)

Files: Dock (`ToolOptions`, `PEN_TYPES`, `PEN_COLOURS`, `Swatch`), Container (pen state, lines 112 to 117).

**Pen type becomes a real setting.**

- New state in the Container: `penType` (`'ballpoint' | 'fountain' | 'pencil' | 'marker'`, default `'ballpoint'`) and `penWidths`, one width per type. Starting widths: Ballpoint **3** (today's default thickness, so first strokes look as they do now), Fountain 5, Pencil 3, Marker 10. Opacity comes from the type: 1, 1, 0.7, 0.85.
- `strokeWidth` and `strokeOpacity` become values worked out from `penType` and `penWidths`, so `WhiteboardCanvas.js` and the stroke shape do not change. The width slider changes the current type's width; it never turns the type off.
- Remember the colour, the type and the four widths on this device in `localStorage['netz_playground_pen']`, wrapped in try/catch like `netz_playground_read_mode`.

**Look (artboard 5):**

- Colour: one row of eight `SwatchButton`s: Black (graphite, first), Blue, Green, Purple, Pink, Amber, Cyan, and **More colours**. More colours opens a second row with Slate, White (for dark pictures) and Any colour (the existing native colour input). A custom colour shows in the More colours dot.
- Pen type: a `Segmented` control of four 64 px segments, each with a short stroke drawn in the current colour, width and opacity, and the type name (13 px).
- Width: the label, the value ("3 px", 15 px semibold, tabular), the slider (`accent-color` = `ink`; accessible name stays "Pen width"), and the preview stroke.
- Highlighter: its five colours and width, no pen type. Eraser: Erase (Whole stroke, Part of stroke) as a `Segmented` control, then Size (three buttons; the size rings in `text-pg-text2`, not rose).
- Laptop: popover above the pen chip, 340 px wide, title "Pen options" (or Highlighter / Eraser options). Phone: sheet titled "Pen", "Highlighter" or "Eraser".

### 5.2 Insert menus and the other dialogs (V11)

Files: `shapes/ShapeGallery.js`, `symbols/SymbolMenu.js`, `symbols/SymbolDialog.js`, `symbols/NumberDialog.js`, `equation/EquationMenu.js`, `equation/CommonEquationList.js`, `equation/InsertLatexDialog.js`, `screenshot/ScreenshotMenu.js`, `shapes/FormatShapePane.js`, `shapes/ShapeContextMenu.js`, `PageSheet.js`, `FixReadingDialog.js`, `InkToBlockConverterModal.js`, `UnsavedChangesModal.js`, `BackgroundMusicPlayer.js`.

All of them use the panel shell (0.4) and the shared parts (0.3):

- **Never change** a WPS item, its order, name, shortcut text or behaviour (`PLAYGROUND_INSERT_TOOLS_PLAN.md`). Only the look changes. Labels such as "Custom Symbols:" keep their exact text; only the grey bar behind it goes.
- Category tabs (Shapes, Equation's built-in lists) become `Tabs`: one row, never wrapping (V11).
- Hovered and chosen items: `bg-pg-tray`. Ticked items (Screenshot's mode): a graphite tick. Equation's left list: the chosen row `bg-pg-tray text-pg-ink` (was indigo); its "COMMON" style labels use the section-label style with their text unchanged.
- Shapes header: drop the tinted icon box; the subtitle 12 px `text-pg-text2`; Draw Freehand a secondary button.
- Buttons: Insert, Send to Notes, Save, Try again, Apply are main buttons; Cancel, Leave anyway secondary; destructive actions use `text-pg-danger`.
- Send to Notes: the chosen-block cards use `border-pg-line` with a `bg-pg-tray` chosen state and an indigo checkbox (`accent-color` accent); the type labels are 12 px grey.

### 5.3 Preferences

File: Dock (`PreferencesDialog`). One finger and Read my writing become `Segmented` controls; the help lines 12 px `text-pg-text2`.

---

## 6. Phase 3: on the page

### 6.0 Default ink (R1)

File: Container, line 112: `useState('#3B82F6')` → `'#18181B'` (or the remembered colour from 5.1). Nothing else changes for ink.

### 6.1 One selection look (V13)

Files: `components/WhiteboardCanvas.js` (`drawSelectionOverlay` near line 237; the lasso path near line 642; connector hints near line 615), `shapes/ShapeSelectionOverlay.js`, `blocks/SmartBlockWrapper.js`.

The rule: **a 1.5 px `accent` outline, white square handles with a 1.5 px `accent` edge, the rotate handle as a white circle above the top edge on a short stem.**

- Lasso selection box: solid accent outline (was a dashed `#8B5CF6` box); its one corner handle a square. Draw no handles that do nothing. The loop while lassoing stays dashed, in accent. Colours from `pgColour()` (0.1), since a canvas cannot read CSS variables.
- Connector hints while drawing a line shape (line 615): accent instead of `#3B82F6`.
- Shapes: `ACCENT` (line 11) from `pgColour('accent')`; resize handles become squares with an accent edge (were round with a grey edge); the rotate handle a circle with an accent edge. Keep the yellow adjust handles and the pink smart guides: they follow Word and WPS.
- Blocks: selected = `outline outline-[1.5px] outline-pg-accent` on the frame, no `ring-2 ring-blue-500`, no shadow; the resize handle a square (its 44 px hit area stays). Being edited: a 1.5 px accent border. Add `data-selected` and `data-editing` attributes to the block wrapper so checks stop reading class names.

### 6.2 One context bar (V14)

Files: new `components/ui/ContextBar.js`, Container (the lasso toolbar, lines 2536 to 2587), `LiveMathPreviewOverlay.js`, `blocks/SmartBlockWrapper.js`, `shapes/ShapeFormatBar.js`.

`ContextBar` is one floating bar: `barShell`-like with `rounded-[14px]`, 44 px high with a mouse (52 px on touch, holding 44 px buttons), `data-context-bar`. It sits **above** the selection with an 8 px gap; if there is no room under the top bars and status area, below it; it is kept 12 px inside the screen and never covers the top bars or the dock.

- **Lassoed ink:** one bar. First the reading: the status ("Reading…", the reading in KaTeX with any "=" answer in `text-pg-accent`, or "Couldn't read this" with Type it), then **Turn into typed text** (`accent-tint`). After a divider: Convert to Shape (when the ink is convertible), Duplicate, Colour (the pen colour dot), Delete, and ⋯ (Fix, Read as maths or Read as text, Plot graph). `LiveMathPreviewOverlay` no longer draws a pill for the `selection_` cluster while the bar shows it. The reading part keeps `data-reading-pill`; the buttons keep today's accessible names ("Duplicate selection", "Apply the current pen colour to the selection", "Delete selection", "Convert to Shape").
- **A selected block (not being edited):** the type label as a drag handle ("Graph", with the move icon, 13 px), Edit, a divider, then Delete at the far end (kept apart, as UX step 1.1 asked). The bar is drawn in screen space beside the block wrapper, **not inside the scaled element**, so it keeps its size at every zoom. The header row inside the block goes away, so the content gets the whole card. Touch behaviour stays: tap selects, a second tap edits, a 350 ms press drags.
- **A block being edited:** the header inside the card stays (it belongs to the editor): 44 px high, label 13 px semibold, Delete, divider, Maths actions (equations), and **Done** as a main button.
- **Shapes:** `ShapeFormatBar` keeps its buttons and its placement code, and takes the context-bar look (height, radius, shadow, dividers, `text-pg-text2` icons, active `bg-pg-tray`).

### 6.3 Reading pills (V2, V14)

File: `LiveMathPreviewOverlay.js`. Placement (`placePills`) does not change.

- `bg-pg-surface border-pg-line rounded-xl shadow-pg-bar`, 40 px high (44 px buttons on touch). Reading 15 px in KaTeX; "=" answers `text-pg-accent font-semibold` (was mono blue).
- Turn into typed text: `accent-tint` (was solid blue). ⋯ quiet.
- "Reading…": a `text-pg-text2` spinner (was blue). Couldn't read: `text-pg-danger`. Kept as a drawing: `text-pg-text2` (was emerald). Getting the reader ready: `text-pg-text2` (was blue).

### 6.4 Blocks at rest (V2)

Files: `blocks/SmartBlockWrapper.js`, then the block bodies `TheoryBlock.js`, `GraphBlock.js`, `EquationBlock.js`, `AudioMemoBlock.js`, `ImageBlock.js`, `SketchBlock.js`, `AIActionButton.js`, `equation/EquationRibbon.js`, `BlockLinkRenderer.js`.

- At rest: `bg-pg-surface border border-pg-line rounded-xl`, no shadow, no blur (was `bg-white/70 backdrop-blur-md shadow-sm`); hover darkens the border. Ruled-line blocks in Writing mode stay transparent until hover.
- Inside the bodies, chrome (toolbars, buttons, inputs, focus rings, chips) moves to the tokens. **Content colours stay**: graph series colours, plotted lines, the equation itself.
- Focus rings everywhere: `focus-visible:ring-2 ring-pg-accent` (was blue-500).

### 6.5 Page background (V15)

Files: `components/CanvasGridBackground.js` (lines 31 to 32), Container (the canvas background colour).

- Dots `rgba(0,0,0,0.09)` (was 0.15); lines and grid `rgba(0,0,0,0.06)` (was 0.08). Dark: dots 0.10, lines 0.07 of white.
- The page behind the ink becomes `paper` (`#F6F6F3`; dark `#141415`).
- Export (`utils/pageSvg.js`, `utils/exportEngine.js`) keeps its own background. Do not change it.

### 6.6 The empty page (V16)

File: Container.

When the current page has no strokes, shapes or blocks and nothing is being drawn, show two centred lines in the canvas space: "Write anything." (18 px semibold, `text-pg-text2`) and "End a sum with = and the answer appears." (15 px, `text-pg-text2`). The second line is left out while Read my writing is Off. The text is `pointer-events-none`, so it never blocks drawing. It goes away with the first stroke and comes back only if the page is emptied again (Clear page). (The board said "never returns on that page"; tying it to the page being empty is simpler and does the same in normal use.)

---

## 7. Phase 4: sweep

### 7.1 Colours (V1, V3)

Replace every remaining chrome use of `blue-*`, `indigo-*`, `purple-*`, `sky-*`, `emerald-*` and `rose-*` with tokens. Today's counts of blue, indigo, purple and sky uses by file: Dock 18, TheoryBlock 16, ShapeFormatBar 12, GraphBlock 12, ScreenshotEditor 9, SmartBlockWrapper 8, EquationRibbon 7, and 1 to 5 in 24 more files.

Leave alone (content, or a reference app's look): `PEN_COLOURS`, `HIGHLIGHTER_COLOURS`, graph series colours, `utils/equationToGraph.js`, `utils/strokeSmoother.js`, `utils/smartBlockStore.js`, `utils/pageSvg.js`, `utils/shapes/officeColors.js` and the WPS shape presets, the pink smart guides, the yellow adjust handles, and `HandwritingCollector.js` (the /Playground/collect page is not part of this round).

### 7.2 Text sizes and fonts (V5)

- No text below 12 px in the Playground's chrome. Today's `text-[9px]`, `text-[10px]` and `text-[11px]` uses: FormatShapePane 8, GraphBlock 8, ScreenshotMenu 5, EquationRibbon 5, AIActionButton 4, and 1 to 3 in 14 more files. Shape-preview captions inside galleries may stay at 12 px.
- `font-mono` stays only where people type code (LaTeX fields). Everywhere else: DM Sans with `tabular-nums` for numbers.
- Use the four sizes (`pg-cap`, `pg-label`, `pg-body`, `pg-title`) instead of `text-xs`, `text-sm` and pixel sizes.

### 7.3 Dark mode

Every class added in this round uses tokens that have dark values (0.1). After the sweep, open every bar, menu, sheet, block and selection in dark mode and fix anything that still assumes white: hard-coded `#FFFFFF` fills in SVG handles become `pgColour('surface')`, and so on.

---

## 8. Things to watch while building

- **Portals and the font.** Anything rendered with `createPortal` needs `PG_FONT` on its root (0.2), or it shows Poppins.
- **Tailwind class names must be whole strings** (`bg-pg-ink`, never `` `bg-pg-${x}` ``), or the build drops them.
- **Canvas and SVG colours** come from `components/ui/tokens.js`, not CSS variables. Keep it in step with `playground.css`.
- **Offline.** Check that the self-hosted DM Sans files under `/_next/static/media/` are in the service worker's precache, so the Playground keeps its font offline (the offline cache was measured at 7.4 MB; this adds roughly 50 KB).
- **Do not change** the model files, the recognition code, WPS menu content, or any behaviour from the UX round that this plan does not name.

---

## 9. Checks, run together at the end

Run these only after every step in sections 3 to 7 is built.

**Existing checks (handoff section 4), all must still pass:** lint (no new warnings), every `node test_*.mjs`, `node benchmark_recognition.mjs --self-test`, `node test_feature_parity.mjs` (6/6), `npm run build`, `node run-all.mjs` against the production build, `screens.mjs`, `touch-blocks.mjs`, `ux-fixes.mjs`. The two suites that already failed before this round (insert-equations, insert-shapes-format: see the UX plan, section 9) are judged against their old results.

**Update the browser checks first** (`tests/browser/`):

| What | Change |
|---|---|
| Class-name checks | `blocks.mjs:10`, `workspace.mjs:35`, `touch-blocks.mjs:71, 87, 150` read `border-blue-500` / `ring-2 ring-blue-500`: read `data-editing` / `data-selected` instead (6.1). `insert-shapes.mjs:83` and `insert-shapes-format.mjs:65` read `bg-purple-500` on Lasso: read `aria-pressed="true"`. |
| `lib.mjs` `MOVED` | `@page` opens the ⋯ "Page" button in the top bar on every screen size; `@blocks` opens Blocks (laptop, tablet) or "Add to page" (phone); `@pageActions` becomes `@page`; add Delete page and Duplicate page under `@page`. |
| `lib.mjs` helpers | `withToolOptions` clicks the pen chip (title starts "Pen options", or Highlighter / Eraser options). `zoomLabel` reads the Zoom button in the document bar, and on phones a `data-zoom-level` attribute on the Playground root (add it), because the zoom row is inside a closed menu. |
| Default ink | `lasso.mjs:99` expects an untouched stroke to be `#3B82F6`: expect `#18181B`, or set the colour in the check. |
| Pen widths | `pen.mjs:74` expects Ballpoint at 2 px: expect 3 px (5.1). |

**New check, `tests/browser/visual.mjs`**, at laptop 1366 x 768 and 1280 x 800 with a mouse, tablet 768 x 1024, phone 390 x 844 and phone landscape 844 x 390 with touch, each in light and dark:

| Check | Pass when |
|---|---|
| One active look | Each tool in turn: its button's computed background is the `ink` token; no other tool is filled. |
| No old accents | No visible chrome element (the bars, open menus and sheets, context bars, pills) has a computed colour, background or border equal to blue-500, blue-600, indigo-500, purple-500 or `#8B5CF6`. |
| Font and size | The dock, both top bars, an open popover and an open phone sheet compute a `font-family` that starts with DM Sans; no visible chrome text is under 12 px. |
| Layout | Laptop: the page bar starts 16 px right of the sidebar, the document bar ends 16 px from the right edge, the dock is centred in the canvas space and shows 14 controls (plus two split arrows), with no zoom or Page buttons. Phone: the top bar and the dock both start and end 12 px from the edges. Nothing overlaps among the top bars, the status area and the dock; nothing is off screen. |
| Context bar | A lasso selection with a reading shows exactly one `[data-context-bar]` and no separate reading pill. A selected block's bar sits above the block, outside its frame, the same size at 50% and 200% zoom, and below the top bars. |
| Selection look | The lasso box, a shape's frame and a block's outline use the `accent` colour (pixel sample, launched with `--disable-gpu --disable-accelerated-2d-canvas`). |
| Pen type | First open: Ballpoint is pressed. Moving the slider keeps it pressed. Each type remembers its own width; the choice survives a reload. |
| Empty page | The two lines show on a new page, go with the first stroke, and come back after Clear page. They never take a press. |
| Contrast | `text2` on `surface`, notice text on `ink`, `accent-on-tint` on `accent-tint`, in light and dark: at least 4.5:1. |

**`screens.mjs`:** 0 controls under 44 px on coarse pointers and under 24 px on fine pointers (the 40 px dock buttons pass), 0 buttons without a name, 0 off screen, with the + sheet, the page menu, the pen options and every Insert menu open.

**On real devices (handoff B10):** the phone top bar under a notch (safe area), the sheets above the home indicator, the font after going offline, and two- and three-finger taps still working with the new bars.

When all of this passes, update `PLAYGROUND_HANDOFF.md` sections 5 and 6 with what was measured, as its definition of done asks.

### 9a. Every finding and where it is fixed

| Finding | Step | Finding | Step |
|---|---|---|---|
| V1 | 0.3, 4.1, 7.1 | V9 | 4.1, 4.3 |
| V2 | 0.1, 6.0, 6.1, 6.3, 6.4 | V10 | 5.1 |
| V3 | 4.5, 7.1 | V11 | 0.4, 5.2 |
| V4 | 4.3 | V12 | 4.2, 4.4, 4.5 |
| V5 | 0.2, 7.2 | V13 | 6.1 |
| V6 | 4.3 | V14 | 6.2, 6.3 |
| V7 | 4.3, 4.4 | V15 | 6.5 |
| V8 | 4.3 | V16 | 6.6 |

---

## 10. Progress

| Step | State | Notes |
|---|---|---|
| Board and decisions R1 to R4 | Approved 2026-10-17 | Recommended answers |
| 0.1 to 0.5 | Done 2026-10-17 | `playground.css`, `components/ui/tokens.js`, `utils/fonts.js`, `components/ui/parts.js`, `components/ui/useSidebarRight.js`; Tailwind names in `tailwind.config.js` |
| 4.1 to 4.6 | Done 2026-10-17 | New `DocBar.js`, `PageMenu.js`; `PageManager.js` and `PlaygroundDock.js` rewritten |
| 5.1 to 5.3 | Done 2026-10-17 | `utils/penTypes.js`; pen options built with the dock |
| 6.0 to 6.6 | Done 2026-10-17 | New `components/ui/ContextBar.js` |
| 7.1 to 7.3 | Done 2026-10-17 | |
| Section 9 checks | Done 2026-10-17 | Results at the end of this section |

### Differences from the plan, and what was found while building

- **Pen options (5.1) were built together with the dock (4.1)**, because the dock was rewritten anyway.
- **Export on phones** is the same inline row of PNG, SVG and PDF buttons as on laptops, not a second sheet: one tap fewer.
- **The phone page menu also holds Redo, Move page, Duplicate, Clear and Delete page**: it replaces the old phone "Page actions" menu as well as the More sheet's Page and View parts.
- **Writing mode still closes the page menu when switched**, as before, so the next press writes on the page (and the browser checks that draw right after it keep working).
- **A block's bar stays inside the block's element**, scaled back by 1 / zoom so it keeps one size, instead of a separate element in screen space. This keeps the "a press outside the block deselects it" rule and the browser checks that look inside `[data-block-id]` working. As with the old header, it also shows on hover with a mouse.
- **Recording** shows in the status area on every screen ("Recording 0:12 · Stop"); on laptops the Blocks button also shows a red dot.
- **Slate and White** sit behind More colours, in a second row with Any colour, so one row of 8 fits a phone.
- **Category tabs** (Shapes, Common Equations) follow the list as it scrolls, so the tab of the category in view is the chosen one.
- **`text-sm` (14 px)** was left where it was: it meets the 12 px rule. Only `text-[9px]` to `text-[11px]` were raised, and `font-mono` was kept where people read or type code (LaTeX fields and their fallbacks).
- **Other old colours found and replaced**: the gradient "Maths actions" and sketch buttons (now a soft indigo), the rose eraser ring on the canvas (now grey), the orange ring of a chosen colour in the shape colour picker (graphite), the blue crop outline in the screenshot editor (selection colour), warning amber (now the failure red).
- **Offline:** the two DM Sans files are in the service worker's precache (`public/sw.js`), so the font works offline.
- **Not changed:** `HandwritingCollector.js` (/Playground/collect), export colours, ink and graph colours, the WPS shape presets, the pink smart guides and yellow adjust handles.

### Blocks round (2026-10-17, asked for after the build: "no tests")

The owner found the Equation, Text, Voice memo and Graph blocks heavy, clunky and too grey. Built without running any check (lint only), at the owner's request.

**Why they were slow:**

- Every pan or zoom re-rendered the inside of every block: the blocks were not memoized, and some handlers the page gave them (`handlePlotGraph`, an unused `onDeleteBlock` on voice memos) were new on every render.
- Each Graph block ran a Chart.js canvas (legend, tooltips, 250 ms animations), blurry when the page was zoomed.
- Text blocks parsed their markdown and drew their maths (react-katex) again on every render.

**What changed:**

- Equation, Text, Voice memo, Graph and Picture blocks are `React.memo`; the page passes them stable handlers (`useStableCallback` in the Container). Block frames get `contain: layout style`.
- **Graph:** Chart.js is gone from the Playground. The plot is SVG (`components/blocks/GraphBlock.js`): curves recomputed only when an equation or the range changes, lines that keep their width at any zoom, round-number axes, a hover readout with a mouse. Editing: range as a segmented control (±2, ±5, ±10, ±20), "y =" field, four curve colours, quick-equation chips, curves listed with show / hide / remove. A graph being edited grows to fit its tools.
- **Equation:** at rest only the formula, centred, 17 px; Edit and **Plot** are in the block's bar (new `actions` prop on `SmartBlockWrapper`), so nothing covers the maths. Editing keeps the ribbon and MathLive, with a teal preview strip holding Plot Graph.
- **Text:** 15 px text (was 12 px), proper heading sizes, amber bullets, numbers and task boxes, quotes on an amber tint; the rendered text is cached until the text changes; maths via the cached `KatexView`. A single click no longer opens the editor: as with every block, a click selects, a double-click (or Edit, or a second tap) edits. Word suggestions load the first time a Text block is edited.
- **Voice memo:** one compact row: a rose play button, name over a progress track, time, back 10 s, speed. New memos are 360 x 104 (were 360 x 180); old ones keep their size.
- **A little colour** (tokens `--pg-eq`, `--pg-note`, `--pg-plot`, `--pg-voice` and their tints in `playground.css`, Tailwind `pg-eq` etc.): each block's edge in its type colour at 25% (50% on hover), a coloured type badge in its bar and editor header (`components/blocks/blockStyle.js`), and one main control in that colour (play button, list markers, quick-curve chips, the equation preview). Selection stays indigo.

**Checks updated afterwards (2026-10-17):** `insert-equations.mjs` uses the bar's Edit (`button[title="Edit Block"]`); `blocks.mjs` looks for `svg[data-graph-plot] path` instead of a canvas. No check opened a Text block with one click. `visual.mjs` gained a blocks section (12 checks): the formula alone at rest, Plot in the bar adding an SVG graph (no canvas), the hover readout, the type colours, a click selecting a Text block without opening it, the one-row voice memo, and **no DOM change inside any block while the page pans** (a MutationObserver over 15 wheel pans: 0 changes).

### Check results (production build, `next start -p 3211`, 2026-10-17)

| Check | Result |
|---|---|
| Lint | 0 errors, 0 warnings |
| `npm run build` | Succeeds (the first try hit a Windows `lstat 'C:\'` error before compiling; the retry built cleanly). Only warning: the existing 28 MB WASM file is not precached |
| Logic tests | All pass; `test_equations.mjs` 13/14 is the chemistry case that failed before this work |
| `benchmark_recognition.mjs --self-test`, `test_feature_parity.mjs` | OK, 6/6; model files untouched |
| `visual.mjs` (new) | 88/88 |
| `run-all.mjs` (17 suites) | undo 30, touch 20, eraser 13, lasso 21, export 16, pen 12, blocks 20, workspace 49, render 14, insert-shapes 54, insert-shapes-arrange 35, insert-symbols 35, insert-screenshot 38, ux-fixes 45, visual 88: all pass |
| Failing, as before this work | insert-equations 32/35 (ribbon list, Common Equations list, "editor fetched") and insert-shapes-format 40/41 (phone format bar count): the checks and the code disagree from the Insert-tools round |
| `screens.mjs` | Phone, phone landscape, tablet: 0 controls under 44 px, 0 off screen, every panel fits. Laptop: smallest 26 px (mouse minimum 24) |
| `touch-blocks.mjs` | 13/13 |

**Found and fixed while checking:** the Shapes gallery's Draw Freehand button was forced to 36 px on touch screens (now 44); the tab-row arrows are no longer rendered on touch screens (they counted as 0 px buttons); test helpers updated for the new layout (`lib.mjs`: page menu, + sheet, pen chip, Send to Notes button, the "Blocks, recording" name; Google's third-party frame message ignored like its other ad and analytics messages); `pen.mjs` expects each pen type to keep its own width and graphite ink; `workspace.mjs` waits for a large pasted photo instead of a fixed 2.5 s (it takes 2.6 to 3.3 s on this machine, with the paste code unchanged).

**Which build:** the full `run-all.mjs` ran on one build; after the Draw Freehand fix (one class) the app was rebuilt and touch, insert-shapes, ux-fixes, visual, screens and touch-blocks were run again on it. The other suites were not rerun on that last build.

**Timing-sensitive checks:** `touch.mjs`'s palm-guard checks and `ux-fixes.mjs`'s two-finger tap each failed once while the machine was busy and passed on every rerun (touch 20/20, ux-fixes 45/45 twice). They depend on 250 to 900 ms windows.

**Not checked:** real phones, tablets and pens (handoff B10); dark mode by eye.
