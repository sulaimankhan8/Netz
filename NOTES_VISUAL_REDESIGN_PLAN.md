# NETZ Notes: visual redesign plan

Written 2026-10-17. **Status: approved 2026-10-17.** Built from the board "Netz Notes Redesign" (https://claude.ai/artifact/SBZ7tFZ2jhaFE5JDpF6rST): artboard 1 is the audit (findings N1 to N20), 2 the design system, 3 the blocks, 4 the laptop screen, 5 Share and the solver picker, 6 to 10 the phone screens.

This round changes **how Notes looks and where its controls live**. Every feature stays (the audit's "Kept exactly" list). The owner's answers to the behaviour questions:

| # | Question | Answer |
|---|---|---|
| Q1 | Undo after deleting a note or a block | **Yes** |
| Q2 | Honest save status (Saved / Couldn't save) instead of fixed "Saved" | **Yes** |
| Q3 | Escape closes Share and the solver picker; focus stays inside | **Yes** |
| Q4 | Share text saying keys only work on this device | **Not now**: comes with the backend. The current promise stays; only the wrong "8-digit" wording is fixed. |
| Q5 | LaTeX field only while a formula is being edited | **Yes** |
| Q6 | Tag chips in the editor | **Left to me: chips**, saving the same `tags` array |
| Q7 | One Export menu (PDF, Markdown) | **Yes** |

Not changed (owner not asked, or outside Notes): the community sample notes' author names; the app shell (`src/app/components/layout.js`, `NavBar.js`).

Rules: the project is not in git, so every file is copied to the session scratchpad before it changes. Build every step, then run all checks together (section 6). Paths are under `src/app/(Primary.pages)/Notes/` unless they say otherwise.

---

## 1. Foundations

- **Tokens** `notes.css` (imported from a new `layout.js`): `--nt-*` colours as RGB channels on `:root` and `html.dark`, the same values as the Playground's `--pg-*` plus `ok`, and one colour and tint per block type (math teal, callout amber, solver blue, quiz violet, sketch pink). `.nt-force-light` resets them to light values (the PDF copy). Shadows `--nt-shadow-bar`, `--nt-shadow-menu`.
- **Tailwind** `tailwind.config.js`: `colors.nt.*`, `boxShadow.nt-bar / nt-menu`, `fontFamily.nt` and `nt-mono`. Names only.
- **Font** `utils/fonts.js`: DM Sans (`--nt-font-sans`) and DM Mono (`--nt-font-mono`) with `next/font/google`; `NT_FONT` on the page root and on dialog roots.
- **Shared parts** `components/ui.js`: button classes (main, secondary, quiet, destructive, icon), `TOUCH`, `Segmented`, `Switch`, `Menu` (a popover on laptops, a bottom sheet on phones, Escape, outside press, arrow keys), `Modal` (centred dialog or phone sheet; Escape, focus kept inside and returned), `Notice` (dark pill with an action, for Undo), `useIsPhone`, `useCoarsePointer`.
- **Block types** `utils/blockTypes.js`: one list with id, name, hint, icon and colour classes, used by the Add block bar, the phone sheet, the / menu and block labels. Names: Text, Heading 1, Heading 2, Heading 3, Formula, Callout, Solver, Quiz, Sketch.

## 2. Layout and the note list (N1, N3, N14, N15, N19)

- `page.js`: under 768 px show **one screen at a time**: the list, or the note with a back button. 768 px and wider: list beside the note, as today. Remove the stacking `flex-col`. The phone opens on the list, or on the note when `?open=` or `?key=` names one.
- `NoteSidebar.js`: 300 px; title row "Notes" + count + hide-list button; search with the New note button beside it; All / Private / Public as a Segmented; tag chips in one scrolling row; Pinned and Notes sections; each row: two-line title, one-line snippet, one line of details (privacy, date, blocks), and a **⋯ button always visible** opening Pin / Unpin and Delete. The collapsed rail goes; when the list is hidden on a laptop the note's top bar shows a list button.
- Delete note → removed at once and a Notice "Note deleted · Undo" for 6 s (Q1). Undo puts it back where it was.
- Empty list and empty note: calm text with one New note button; the loading screen is a quiet skeleton.

## 3. Note editor (N7, N8, N16)

- Top bar 56 px: (phone) back; privacy chip (green Public / grey Private); the key (laptop only); save status from storage: "Saved" or "Couldn't save" in danger colour (Q2; `saveNotes` now reports failure); Share; **Export ▾** menu with PDF and Markdown (Q7). On phones Share is an icon and Export lives in the ⋯ menu with the key.
- The note sits on a white sheet on the paper colour on laptops (max 800 px, 64 px inside, text lines up to 680 px); edge to edge on phones.
- Title 36/44 (phone 28/34), subtitle 17/26, tag chips with "+ Add tag" (Enter or comma adds, × removes; Backspace in an empty field removes the last) (Q6), words and reading time as a caption.
- Add block: laptop shows the nine types as a grid at the end of the note; phones show a floating "Add block" button that opens a sheet with the nine types.

## 4. Blocks (N2, N9 to N12, N17, N18, N20)

- `NoteBlockItem.js`: the four floating buttons become a **grip** (opens Add block below, Move up, Move down, Delete block) and a **+** in the left margin. Laptop: shown on hover and while the block has focus. Touch: shown on the block you are in, 44 px; on phones the grip sits at the block's top right. Delete block → Notice with Undo (Q1).
- Text 16/26; Heading 1 28/36, Heading 2 22/30, Heading 3 18/26 (ink, no indigo).
- Formula: at rest only the KaTeX formula on a teal tint; click or tap (or Enter on it) to edit: LaTeX field plus live preview and Done (Q5). A new formula block opens in edit mode.
- Callout: amber tint, 15/24 text.
- Solver, Quiz, Sketch: one card shell (line border, 16 px corners, no shadow, no hover glow); header with a 28 px tile, type name in its colour, title, tools on the right.
- Solver: Open page and Change algorithm as icon buttons; labels in sentence case ("First guess x₀"); fields 44 px; "Calculate" the one main button; result on `ok` tint; table with tabular numbers.
- Quiz: options as 56 px cards; after Check a tick or cross and "Your answer" / "Correct answer" in words; Edit / Preview; editing uses the same fields with 44 px targets.
- Sketch: Pen / Eraser segmented, six 36 px colour dots (44 on touch), three sizes as dots, Clear in danger; pad says "Draw here with a finger, pen or mouse"; Save sketch (main), Upload image, From Playground, Cancel.
- `SlashCommandMenu.js`: the nine types from `blockTypes.js` with their icons; tinted highlight, no tick; same keys.

## 5. Dialogs (N13)

- `NoteShareModal.js` in `Modal`: "This note" / "Community" Segmented; visibility as a Switch row; key with Copy key (main) and link with Copy link; Import with a key. Community: search, unit Tabs, cards with Clone. "8-digit key" wording removed. Escape closes (Q3).
- `AlgorithmPickerModal.js` in `Modal`: "Add a solver"; search; unit pills with counts; cards are the buttons. Escape closes (Q3).
- `pdfExport.js`: the copy gets `nt-force-light` so a dark-mode export prints dark text on white.

## 6. Checks, run together at the end

- `npx eslint` on the changed files; `npm run build` (only while no dev server uses `.next`).
- New `tests/browser/notes.mjs` against `next start -p 3211`: phone 390 × 844 opens on the list and the note fills the screen after a tap, back returns; no horizontal scroll inside the Notes page; coarse-pointer buttons ≥ 44 px; ⋯ menu pins and deletes, Undo restores; block grip menu moves and deletes, Undo restores; formula shows no LaTeX field until clicked; Escape closes Share and the picker; Export menu has PDF and Markdown; tag chips add and remove; dark mode has no slate colours; laptop 1440 × 900 shows list and note side by side.
- Screenshots at phone, tablet and laptop sizes, light and dark, compared with the board.

## 7. Progress

**Built 2026-10-18, all of sections 1 to 5.** Backup of the files before the change: session scratchpad `backup-notes-before-redesign/` (Notes folder and `tailwind.config.js`).

New files: `layout.js`, `notes.css`, `utils/fonts.js`, `utils/blockTypes.js`, `components/ui.js`, `tests/browser/notes.mjs`. Rewritten looks: every component in `components/`. Logic kept: storage, solvers, quiz scoring, sketch drawing, sharing, cloning, import by key, PDF and Markdown export.

Differences from the plan, and things found while building:

- Text, headings and callouts are now growing text boxes. Before, a long paragraph or callout was cut to one line (visible in the sample note); headings could not show a long title on a phone.
- The block's Enter key no longer adds a block while the / menu is open (it used to do both).
- On phones the grip of a Solver, Quiz or Sketch sits in the card's own header, so it never covers the card's tools; text blocks show it at their top right.
- The Add block sheet on phones adds at the end of the note, like the laptop grid (as before).
- The list's snippet no longer shows LaTeX source from formula blocks.
- Sketch pad and figure stay white in dark mode, so dark strokes stay visible.
- Community notes still show their author names (not asked).

Checks (production build, `next start -p 3211`):

- `npm run build`: passes; the only warning is the existing 28 MB ONNX runtime file not being precached.
- `npx eslint` on Notes: 0 errors, 3 warnings that were there before (two hook dependencies, one `<img>`).
- `tests/browser/notes.mjs`: **43/44**. Every Notes check passes on laptop (1440 × 900, incl. dark mode), phone (390 × 844, touch) and tablet (820 × 1180, touch).
- The one failure was outside Notes: the app shell's phone `NavBar` sat beside every page, so a 390 px phone laid pages out up to 558 px wide.
- Screenshots: `tests/browser/shots/notes-*.png`.

### Export and links checked (2026-10-18)

New `tests/browser/notes-export.mjs` (8/8): PDF in light and dark mode, Markdown, `?open=` (laptop and phone), `?key=` import. Looking at the PDF page found four print faults, fixed in `utils/pdfExport.js`:

- Text boxes printed as one clipped line (long titles, paragraphs, callouts, solver values). The printed copy now shows each text box as plain text with the same look, taking the typed value from the page.
- All text was drawn a few pixels low, clipping line bottoms and putting KaTeX fraction lines through the numerator. Cause: html2canvas finds baselines with an `<img>` in the live page, and Tailwind's preflight makes images `display:block`. Images are `inline-block` for the moment of the capture only.
- Quiz answers disappeared (the export hides every button, and the redesign made answers buttons). Answer buttons carry `data-print="keep"`.
- The copy printed in Segoe UI: it now carries the Notes font classes.

After the fixes: `notes.mjs` 46/46, `shell-phone.mjs` all pages OK, `npm run build` passes (one attempt failed on a Windows file-read error inside `node_modules`, errno -4094, and passed on retry).

### App shell phone nav (2026-10-18, asked for by the owner)

- `src/app/components/layout.js`: on phones the shell is a column and the `NavBar` sits **above** the page (it was a flex sibling to the right of it, full page height). The shell publishes the bar's measured height as `--app-nav-h` (0 without a bar). Desktop is unchanged.
- `src/app/components/NavBar.js`: `data-app-nav`, `relative z-30 shrink-0`; the menu button draws its own 44 px yellow icon button (LuMenu / LuX, aria-label, aria-expanded). Its old `.menuToggle2` look lives in `styles/sidebar.css`, which only the unused `Sidenav.js` imports, so on phones the button had no size and the menu could not be opened. Menu items unchanged.
- Notes sizes itself to `100dvh - var(--app-nav-h)`, so it fills the screen under the bar without scrolling as a page.
- Backup: scratchpad `backup-shell-before-navfix/`.
- Checks on the production build: new `tests/browser/shell-phone.mjs` — `/`, `/Notes`, `/Algorithems`, `/bisection-method`, `/newton-forward`, `/Setting`, `/Profile` all lay out at 390 px (were 393 to 558), bar on top, menu button 44 × 44 opens the four links; `/Playground` unchanged (no bar). `notes.mjs` 46/46 with the real bar (no hiding).
