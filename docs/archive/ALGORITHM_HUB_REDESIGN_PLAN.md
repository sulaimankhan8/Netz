# Algorithm Hub + method pages redesign

> **Reverted 2026-10-22 at the owner's request** ("revert, it's so bad"). The hub, the 34 method pages, the layout, `alg.css`, `AlgorithmNavigation`, the tour text and the calculator headings are back as they were before commit `8407317`. `components/algorithms/` (MethodShell, catalog, progress, methods.css), `scripts/am-codemod.mjs` and `tests/browser/algorithms.mjs` were removed; they are in git history. Code and LaTeX export moved into each calculator's Export dropdown (`EditorialExportButton`).

Board: https://claude.ai/artifact/DPGCSuveZMdy5WGfHLCZJX (audit H1–H14, flow, hub laptop/phone, method page laptop, method phone Learn/Solve).
Owner said "let's build it" on 2026-10-20 without answering Q1–Q6, so the board is built as drawn:

| Q | Decision (as drawn) |
|---|---|
| Q1 hub quick solver | Removed. Every card opens the method page; "Solve" opens it on the Solve tab (`?mode=solve`). One solver per method. |
| Q2 unit list | The hub catalog's units (Unit 4 = linear systems + ODEs, Unit 5 = curve fitting + tests). One list: `components/algorithms/catalog.js`. URLs and folders unchanged. |
| Q3 Learn / Solve | Tabs in the top bar. Solve = the existing calculator, unchanged inside. |
| Q4 step reveal | Worked example opens one step at a time, "Show all" reveals the rest and is remembered on the device. |
| Q5 continue + done | On the device (`localStorage['netz.methods']`): last method + step, and a tick when all steps are shown or a solve succeeds. |
| Q6 34 pages | All pages use one shell (`components/algorithms/MethodShell.js`). |

## Rules
- No maths, worked-example numbers or calculator logic change. Page content is moved, not retyped (codemod `scripts/am-codemod.mjs`).
- Calculators (~10,000 lines, editorial classes) get the new look from a scoped stylesheet (`.am-root` in `components/algorithms/methods.css`) that maps the editorial utility classes to `--am-*` tokens (same values as `--pg-*` / `--ld-*`). No calculator file is edited.
- Nothing outside `/Algorithems` and the method routes changes look. `EditorialSidebar` (app side nav) is untouched.
- Tours: `hub` and `gauss-seidel` targets updated to the new markup; landing cards still link `?tour=hub` and `?tour=true`.

## Files
- `components/algorithms/catalog.js` — units + 34 methods (route, name, short text, glyph, inputs).
- `components/algorithms/progress.js` — device progress.
- `components/algorithms/MethodShell.js` — top bar (← All methods, unit, Learn/Solve, prev/next, theme, ⋯), rail (on this page, in this unit), title, steps context, ad, next card.
- `components/algorithms/methods.css` — tokens, shell, hub and the editorial skin.
- `(Primary.pages)/Algorithems/page.js` — new hub.
- `(pages.algorithems)/layout.js` — metadata fixed, `alg.css` grey body removed.
- `components/AlgorithmNavigation.js` — list now derived from the catalog (kept for old imports).

## Built 2026-10-20
- All 34 pages moved by `scripts/am-codemod.mjs --write` (0 failures). Step counts per page are in its dry-run output; Gauss–Jordan and LU have no worked-example steps (Learn shows their formula content only).
- 32 calculator headings went from "ROOT FINDER LABORATORY" to "Root finder calculator" (text only).
- Landing tour card text for the hub updated ("run one right there" was no longer true).
- Old label chips (black/white) became quiet grey chips; the answer row in tables is a green tint.

## Checks
`tests/browser/algorithms.mjs` (hub, every method route loads with no errors, Learn/Solve, step reveal, phone) plus the existing landing, tours, notes and shell-phone suites to show other pages are unchanged; `npm run build`.
