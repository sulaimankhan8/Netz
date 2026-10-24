# Notes: handwriting mode, full export + insert, and tables

Written 2026-10-24. Feasibility research, feasibility plan and implementation plan for three owner requests:

1. **Handwriting mode** — a notes mode where the text handwriting model reads what you write, not only equations that end in "=".
2. **Export everything + insert** — export keeps typed content as typed and handwriting as handwriting; a file someone gives you can be inserted into your notes, and you can keep writing between its parts.
3. **Tables.**

Nothing is built yet. The maths model stays frozen (no change to `netz_hmer.onnx` or its notebook).

> **Owner answers (2026-10-24):** D1 — export a Playground board **into an asset store inside Notes Studio** (the Notes page), saved with its preview, then insert it into notes. D2 — **ask** (tap to convert). D3 — NETZ file is **Pro**. D4 — tables in **both** Notes and Playground. D5 — save **everything**, in a new **Training data** folder. Sections C, D and the decisions table below are updated to match.

## Status (2026-10-25): built

Steps B0 to 6 are built. Step 7 (next round) is not started.

| Step | Where | Checked by |
|---|---|---|
| B0 safe pictures, import checks | `Notes/utils/importSafety.js`, `InkSketchBlock.js` | `test_netz_file.mjs` |
| 1 `.netz` file | `src/app/utils/netzFile.js` | `test_netz_file.mjs`, `tests/browser/notes-studio.mjs` |
| 2 full exports | `Notes/utils/noteExport.js` (Markdown, HTML, LaTeX .zip, .netz), `latexNote.js`; Playground HTML, LaTeX .zip with the handwriting, .netz (`PlaygroundCanvasContainer.js`, `pageHtml.js`, `latexPage.js`); ZIP writer `src/app/utils/zip.js` | `test_tables.mjs`, checked in the browser |
| 2b Assets library | `Notes/utils/assetStore.js`, `assetCore.js`, `assetCloud.js`, `pdfView.js`, `boardRender.js`; `AssetLibrary.js`, `AssetBlock.js`, `AssetViewer.js`; server `api/notes/assets`, migration `20261024000000_note_assets.sql`; Playground Page menu **Save to Notes Studio** | `test_asset_store.mjs`, `notes-studio.mjs` |
| 3 Insert from file | Notes: Add block / `/` **From file**, notes list **Open a .netz file**; Playground: Page menu **Insert from file** (new pages or onto this page) | `notes-studio.mjs` |
| 4 Writing mode reads each line | `PlaygroundCanvasContainer.js` (`lineReaderRef`), Training data `TrainingDataPanel.js` | `notes-studio.mjs`, `test_text_fast_path.mjs` |
| 5–6 tables | `src/app/utils/tableCore.js`, `src/app/components/table/TableEditor.js`, Notes Table block, Playground `blocks/TableBlock.js`, Insert → **Table** (`table/TableMenu.js`) | `test_tables.mjs`, `notes-studio.mjs` |

Not verified yet: the cloud copy of the library (needs the migration run in Supabase, owner to-do C2) and anything on a real phone, tablet or stylus. Differences from the plan: old sketch blocks keep their picture inside the note (moving them out would empty them on published pages); a board's typed text is not yet searchable from the notes list.

---

## Part A — What exists today (research)

### A1. Notes mode (called "Writing mode" in the menu)

Lives in the Playground canvas, not the Notes page.

| Piece | Where | What it does today |
|---|---|---|
| Switch | `Playground/components/PageMenu.js` (Writing mode toggle) | Lined paper, sets "Read my writing" to *live* |
| Live reading | `PlaygroundCanvasContainer.js` ~line 800 | **In Writing mode, live reading stops unless the ink contains an "=" gesture.** So plain words are never read as you write. This is the problem you described. |
| Lasso reading | `PlaygroundCanvasContainer.js` `handleSelectionCompleted` | Lasso some ink → it is read. In Writing mode the maths model is skipped and only the text model runs. |
| Pipeline | `utils/recognition/recognitionPipeline.js` | Router → text model (`netz_htr.onnx`, 7.4 MB) and/or maths model (`netz_hmer.onnx`, 28.4 MB). In Writing mode, TEXT → typed text block snapped to the lines, MATH → equation block, drawing → kept as ink. |
| Line splitter | `utils/recognition/lineSegmenter.js` | Already splits ink into lines; used by the text model. |

So the text model is already wired in and fast (about 0.18 s for a paragraph, measured in `PLAYGROUND_HANDOFF.md`). It is only switched off for live writing by one rule.

**The real limit is accuracy, not plumbing.** The handoff file lists the text model as the weak one, and its next training is blocked on handwriting collected in the app (`/Playground/collect`). It is also trained on IAM-OnDB, which is non-commercial (open item in `NETZ_OWNER_TODO.md`).

### A2. Export

| Export | File | Handwriting kept? | Other gaps |
|---|---|---|---|
| Notes → PDF | `Notes/utils/pdfExport.js` | Yes (screenshot of the page) | Not editable afterwards |
| Notes → Markdown | `Notes/utils/noteStorage.js` `exportNoteAsMarkdown` | **No — sketches dropped** | Also drops Heading 3 and Quiz blocks; Heading 1 is written as `##` |
| Notes → LaTeX | `Notes/utils/latexNote.js` | **No** — a comment says "export as PDF to keep them" | — |
| Playground → PNG / PDF / SVG | `Playground/utils/exportEngine.js` | Yes (as a picture) | Typed text becomes a picture too, not text |
| Playground → LaTeX | `Playground/utils/latexPage.js` | **No** — only counts the strokes in a comment | — |
| Any "NETZ file" you can open again | — | **Does not exist** | Notes "import" works only by share key, not by file |

Two more facts that shape the plan:

- **Notes sketch blocks store a flattened PNG**, not the pen strokes. Once saved, the handwriting cannot be read or edited as ink again. The Playground keeps real strokes per page.
- **Security issue found:** `InkSketchBlock.js` line 329 puts any sketch whose content starts with `<svg` straight into the page as HTML (`dangerouslySetInnerHTML`). Today only share-key import, sync or sample data can put raw SVG there, so the risk is small. **Once people can insert files from others, a crafted file could run script in the app.** This must be fixed before file import ships (step B0).

### A3. Tables

No table exists anywhere: not in Notes blocks (`Notes/utils/blockTypes.js`), not in Playground blocks (`Playground/components/blocks/`), not in the Insert menu. `latexNote.js` already writes `longtable` for solver steps, so LaTeX table export has a pattern to copy.

---

## Part B — Feasibility

| Feature | Can it be built? | Effort | Main risk |
|---|---|---|---|
| 1. Handwriting mode (live text reading) | **Yes, high.** All parts exist; it is a change in when and how the text model is called, plus UI. | Medium | Text model accuracy on real handwriting. Mitigated by never deleting ink until you accept, and showing alternatives. Accuracy only really improves after the next text model is trained on in-app data. |
| 2a. Export everything (typed + handwriting) | **Yes, high.** | Small–Medium | Markdown cannot hold images inside one file; needs either images inline as data, a single HTML file, or a ZIP. |
| 2b. NETZ file (save / open / insert) | **Yes, high.** Notes and pages are already JSON. | Medium | Safety of files from other people (fix B0, validate everything, size limits). Old files must keep opening after format changes (version number in the file). |
| 2c. Keep Notes sketches as strokes (so inserted handwriting stays editable ink) | **Yes, medium.** | Medium | Old notes have PNG only; they stay as pictures. |
| 2d. Notes Studio asset library (boards with previews, images, files; insert into notes) | **Yes, high.** IndexedDB, same pattern as `imageStore.js`; preview from `renderView`. | Medium | Boards are large (~0.5–0.8 MB gzipped per full page): stored as two blobs in Supabase Storage, not inside the 4 MB notes sync. Needs the first file-storage setup in the app. |
| 3a. Table block in Notes | **Yes, high.** | Medium | Typing in cells on a phone; wide tables on a 390 px screen (scroll inside the block). |
| 3b. Table block in Playground (Insert → Table) | **Yes, high.** | Medium | Fitting cell editing into the existing block wrapper and zoom. |
| 3c. Write by hand inside a table cell | **Yes, medium.** Reuse the text model per cell. | Medium | Same accuracy limit as feature 1. |
| 3d. Draw a grid by hand → becomes a table | **Possible, low–medium.** Needs new line/grid detection (shape recogniser finds single lines, not grids). | Large | Many false detections. Recommend later, not now. |

**Verdict:** all three are feasible. Build 1, 2a, 2b, 3a, 3b now; 2c and 3c next; 3d later.

---

## Part C — Feasibility plan (what each feature will be)

### C1. Handwriting mode

A new choice inside Writing mode: **Read my writing: Off · When I lasso · As I write (new)**.

With **As I write**:

1. You write on the lined paper. When you stop for about 1 s **or** move down to a new line, the finished line is read by the **text model only** (fast, 7.4 MB).
2. A small pill appears at the end of the line with the reading. Tap = convert to typed text on the same line; long-press = see other readings or edit before converting. The ink stays until you accept.
3. Nothing converts by itself (D2: ask). Every line waits for your tap. Undo after converting puts the ink back.
4. Maths in the same notes: "=" still runs the maths model as today. If the router thinks a line is maths, the pill offers **Read as maths** instead of running the 28 MB model by itself.
5. Drawings (router says OBJECT) are never converted.
6. Every line that is read is saved (D5) in a new **Training data** folder: the strokes, what the model read, the other readings, and what you finally accepted or typed instead. It lives on the device, is visible in Notes Studio, and exports as JSONL in the same format as `/Playground/collect`, so `benchmark_recognition.mjs` and the next text-model training can use it. Nothing leaves the device unless the owner later adds an upload with the user's consent.

### C2. Export everything and insert

**Main path (D1): Save to Notes Studio.** The Playground Export menu gets **Save to Notes Studio** at the top.

- It saves the whole board (every page: strokes, typed blocks, shapes, images) into a new **Assets** library in Notes Studio, with a preview picture, title, page count and date.
- **The Assets library holds every kind of file, not only boards** (owner, 2026-10-24): boards, images (photos, screenshots, banner pictures), and files (PDF, Word, slides, any other document). One place, one storage, one way to insert into notes.
- The library shows a grid of preview cards with filter chips **All · Boards · Images · Files** and a search box. A card can be renamed, deleted, downloaded, **inserted into a note**, and (boards only) opened back in the Playground fully editable.
- Things get into the library by: Save to Notes Studio (Playground), **Upload** in the library (file picker; drag-and-drop on laptops; camera/photos on phones), and automatically when an image is added to a note, so it can be reused in other notes.
- Inserted into a note, the board becomes a **Board** block: shows the preview, typed text inside it is searchable, and "Open in Playground" edits the original. You can add notes above, below and between boards.
- Saving the same board again updates its asset (keeps one card), with "Save as new" for a copy.
- The **Training data** folder (D5) appears in the same sidebar section, next to Assets.

**Export menu (Notes page and Playground) gets the same set:**

| Format | Typed content | Handwriting | Opens again in NETZ? |
|---|---|---|---|
| **NETZ file (`.netz`)** — new, **Pro** (D3) | as typed | as real pen strokes | **Yes, fully editable** |
| PDF | as page | as page | No |
| Markdown | as text / `$$maths$$` / tables | **as images** (new) | No |
| HTML (single file, new) | as text, maths rendered | as SVG images | No |
| LaTeX | as LaTeX | **as images via `\includegraphics`** in a ZIP (new) | No |

**Insert:** a new **Insert → From file** (Notes page: in Add block and the / menu; Playground: in the Insert menu and Page menu).

- Notes page: the file's blocks are added **where your cursor is**, as normal blocks. You can add blocks between them, edit them, delete them. A small "Inserted from *file name*, 24 Oct" divider marks where they came from (can be removed).
- Playground: choose **As new page(s)** or **Onto this page** (placed below your content, all items moved together, then normal). Strokes stay strokes, so you can write between, erase, lasso and read them.
- Opening a `.netz` file from the start screen creates a new note/document, same as share-key import does now.

### C3. Tables

- **Notes page:** a **Table** block in Add block, the phone sheet and the / menu. Starts 3 × 3 with a header row. Each cell is text that can hold `$maths$`. Add/remove rows and columns from a small bar; on phones the table scrolls sideways inside its block, the page does not.
- **Playground:** **Insert → Table** with the WPS-style grid picker (hover/tap to pick rows × columns, up to 8 × 10) and an **Insert Table…** dialog for exact numbers, matching the WPS menu like the other Insert tools. The table is a movable, resizable block.
- **Exports:** Markdown pipe table, LaTeX `tabular`, PDF/PNG as drawn, `.netz` as data.
- **Later:** write by hand inside a cell (read by the text model into that cell); draw a grid by hand to make a table.

---

## Part D — Implementation plan

Order is chosen so each step is useful on its own. Per the project rules: build all steps first, then run every test together at the end; nothing on side branches.

### Step B0 — Close the SVG hole (do first, small)

- `Notes/components/InkSketchBlock.js`: stop using `dangerouslySetInnerHTML` for SVG. Render SVG through `<img src="data:image/svg+xml,…">` (images cannot run script).
- Add one shared `sanitizeImportedNote()` helper (new `Notes/utils/importSafety.js`) used by share-key import, cloud sync and file import: allow only known block types, only `data:image/png|jpeg|webp|svg+xml` URLs, cap string lengths and total size.

### Step 1 — NETZ file format (`.netz`)

New `src/app/utils/netzFile.js` (shared by Notes and Playground):

```
{ "netz": 1,                      // format version
  "kind": "note" | "document",
  "createdWith": "<app version>",
  "note":     { title, subtitle, tags, blocks: [...] },        // kind = note
  "document": { title, pages: [{ strokes, blocks, shapes }] }  // kind = document
}
```

- `writeNetzFile(item)` → Blob download; `readNetzFile(file)` → validate (version, schema, size ≤ 10 MB, sanitize) → object, or a clear error message.
- Strokes keep their points, colour, width and tool so they come back as real ink.
- Tests: `test_netz_file.mjs` — round trip note and document, reject bad / oversized / script-carrying files, old version still opens.

### Step 2 — Full exports

- `Notes/utils/noteStorage.js` → move Markdown export into new `Notes/utils/noteExport.js`; fix Heading 1/2/3 levels; add Quiz (question + options); add sketches as `![sketch](data:image/png;base64,…)`; add tables (after step 5).
- New HTML export (one self-contained file, KaTeX CSS inlined) for Notes; Playground HTML export built from `pageSvg.js` for ink + text blocks as real text, in reading order (`latexPage.js` already sorts blocks this way).
- LaTeX (both): sketches/ink written as PNG files next to the `.tex` inside a ZIP, referenced with `\includegraphics`. Needs a small ZIP writer: add `fflate` (≈8 kB) or write a tiny store-only ZIP (no compression) in `src/app/utils/zip.js`.
- Export menus: `Notes/components/NoteShareModal.js` and `Playground/components/PageMenu.js` get **NETZ file · PDF · Markdown · HTML · LaTeX**. NETZ file is Pro (D3), shown locked with the same notice as SVG/LaTeX today.
- Tests: extend `tests/browser/notes-export.mjs` and `tests/browser/exports.mjs` — a note with every block type exports with nothing missing.

### Step 2b — Notes Studio asset library (D1)

- **One record shape for every kind** of asset:

  | kind | Main blob | Preview blob | Inserted into a note as |
  |---|---|---|---|
  | `board` | `board.json.gz` (editable board, below) | `preview.webp` of page 1 | **Board** block |
  | `image` | the image (resized to max 2400 px, kept as JPEG/PNG/WebP) | `preview.webp`, 600 px | Image block (the existing sketch/image display) |
  | `file` | the file as uploaded (PDF, DOCX, PPTX, XLSX, TXT, ZIP…) | PDF: page 1 rendered to `preview.webp`; others: a type icon, no blob | **File** block: icon or preview, name, size, Open/Download |

  Allowed types are checked by both file extension and the file's first bytes; HTML and script files are refused, and SVG is only shown through `<img>` (step B0). Files open in a new tab from a signed download link, never inside the note's page.
- **Existing images move in:** banner images (`imageStore.js`, IndexedDB `NETZ_NOTES_IMAGES`) and sketch/image blocks that hold a data URL are copied into the library the first time Notes Studio opens after the update; notes then keep only the asset id. This also shrinks notes that are near the 5 MB localStorage limit. The old database is deleted only after every copy succeeds.
- **How a board is stored (owner question 2026-10-24: "snapshot → blob → base64 → server"):** each asset is **two blobs**, not one picture:
  1. **Preview blob** — snapshot of page 1 from `renderView` (`exportEngine.js`), `canvas.toBlob('image/webp', 0.8)`, about 600 px wide, roughly 20–80 KB. Used for the card and the Board block.
  2. **Board blob** — the editable board (`{ netz: 1, kind: 'document', pages: [{ strokes, blocks, shapes }] }`) as JSON, gzipped in the browser with `CompressionStream('gzip')` (built into browsers, no library). Measured size of saved ink is about 110 characters per point, so a full page (~30,000 points) is ~3.3 MB of JSON, roughly 0.5–0.8 MB gzipped.
  - A picture alone cannot be opened back as ink, so the board blob is what makes "Open in Playground" and handwriting reading work.
  - **Base64 only where a string is required** (a `.netz` file, the Board block's small preview copy inside the note). Everywhere else keep real blobs: base64 makes data 33% bigger and would push boards past the 4 MB limit of the notes sync request (`api/notes/sync`).
- New `Notes/utils/assetStore.js`: IndexedDB database `NETZ_NOTES_ASSETS` (same pattern as `imageStore.js`; IndexedDB stores blobs directly) with two stores: `assets` (`{ id, kind: 'board' | 'image' | 'file', title, mime, mainBlob, previewBlob, bytes, pageCount?, width?, height?, sourceDocId?, usedInNoteIds, createdAt, updatedAt, cloudPath, syncState }`) and `training` (see step 4). Deleting an asset that a note still uses asks first and names those notes.
- **Where it lives (no separate server needed):** NETZ runs as Next.js API routes on Vercel, with the existing Supabase project (Mumbai, free plan) for the database and sign-in. That project also includes **Supabase Storage** (free plan: about 1 GB of files), so boards go there.
  - **Vercel limit:** a Vercel API route accepts at most about 4.5 MB per request, so board files must **not** pass through our API. The API route only checks the user and their storage limit, then returns a short-lived **signed upload URL**; the browser uploads the blob straight to Supabase Storage. Downloads work the same way with signed download URLs.
  - Options not chosen: storing the blob inside the Postgres database (eats the 500 MB free database quickly) and Vercel Blob (a second storage account and bill to manage).
  - If NETZ later moves to its own server (`NETZ_VPS_DEPLOYMENT_LIGHTSAIL.md`), only `assetStore.js`'s upload/download functions change; the two-blob format stays.
- **To the server:** signed-in users' assets upload to a private Supabase Storage bucket `note-assets` at `<userId>/<assetId>/main.<ext>` and `<userId>/<assetId>/preview.webp` (for a board, `main` is `board.json.gz`; sent as the files themselves, not base64 in JSON). The bucket and its access rules are created by the same migration, run once in the Supabase SQL editor like the earlier four (added to `NETZ_OWNER_TODO.md` when built). A new table `note_assets` (migration `20261024000000_note_assets.sql`) holds the metadata and paths, with row-level security so each user sees only their own. New routes `api/notes/assets` (list, create → signed upload URL, delete). The note itself only stores the asset id, so notes sync stays small. Offline: saved locally first, uploaded when back online (same pattern as `notesCloud.js`).
- Limits: 10 MB per board, 15 MB per image (same as banners today), 25 MB per file, and a per-user total (e.g. 200 MB free / more for Pro — owner to decide), checked on the server.
- Playground `PageMenu.js` Export: **Save to Notes Studio**. Preview = page 1 rendered with `renderView` from `exportEngine.js` at small size. Same `sourceDocId` → update, "Save as new" → copy. Short toast with "Open in Notes".
- `Notes/components/NoteSidebar.js`: new **Assets** entry opening `Notes/components/AssetLibrary.js` (preview grid, All/Boards/Images/Files chips, search, Upload, storage used bar), and the **Training data** folder. Phone: a tab in the sidebar sheet, Upload offers camera/photos/files. Card menu: Rename · Insert into note · Download · Open in Playground (boards) · Delete (with undo toast).
- Note editor: Add block and the / menu get **From Assets**, which opens the library as a picker; choosing a card inserts the matching block at the cursor. New `Notes/components/FileBlock.js` for files.
- **How an inserted asset looks in a note** (owner, 2026-10-24): every Board, Image and File block shows its **preview** inline, with a size switch **Large** (full note width) or **Card** (small card with title, kind and size). Tapping the preview opens a full-screen viewer: images zoom, PDFs scroll through their pages, boards swipe through their pages, with "Open in Playground" for boards and Download for files. The same asset can be in many notes; renaming or updating it in the library updates every note that uses it. Published notes (`PublicNoteView.js`) show the same previews.
- New block type `board` in `blockTypes.js` + `Notes/components/BoardBlock.js`: shows the preview, title, page count, "Open in Playground". It points to the asset id and keeps a copy of the preview, so the note still shows something if the asset is deleted. Exports: PDF/Markdown/HTML as the preview image (plus the typed text of the board); `.netz` carries the full board.
- Open in Playground: loads the asset's pages as a document (same loader the Playground session uses in `smartBlockStore.js`).
- Tests: `tests/browser/notes-assets.mjs` — draw on a board, save to Notes Studio, see the card, insert into a note, write a paragraph after it, open it back in the Playground and see the same strokes; upload an image and a PDF, insert both, filter by kind; an old note with a banner and a data-URL sketch is moved into the library and still shows both; a `.html` upload is refused. Node test `test_asset_store.mjs` for type checks, limits and the move of old images.

### Step 3 — Insert from file

- Notes: `NoteEditor.js` + `SlashCommandMenu.js` + `blockTypes.js` — new action **Insert from file**; inserts sanitized blocks at the cursor with new block ids, plus an "Inserted from…" divider block (new small block type `divider`, also useful by itself).
- Notes sidebar: **Open NETZ file** next to the existing share-key import (`NoteSidebar.js`, `importNoteByKey` neighbour in `noteStorage.js`).
- Playground: `PageMenu.js` / Insert menu — **Insert from file → As new pages / Onto this page**. "Onto this page" offsets everything below the current content and selects it so it can be moved. Uses existing `ADD_BLOCK` and stroke APIs; one undo step.
- A Notes note can be inserted into the Playground (typed blocks → text/equation blocks) and a Playground page into Notes (ink → sketch block, typed → text/formula blocks).
- Tests: `tests/browser/notes-insert.mjs` (insert, then add a block between inserted blocks, then export again) and a Playground case in `pages.mjs`.

### Step 4 — Handwriting mode (live text reading)

- `PlaygroundCanvasContainer.js` ~line 800: replace the "only if '=' gesture" rule with a read-option check: in **As I write**, take the line just finished (use `lineSegmenter.js` + the 32 px ruling) and call `processClusterOCR(line, { mode: 'notes' })` only for that line, not the whole page. Lines already read are remembered so they are not read twice.
- Trigger: 1 s pen idle **or** a stroke starting on a lower ruled line. Keep the existing pass counter so stale results are dropped.
- `PageMenu.js`: Read my writing gets the third option. No auto-type setting (D2).
- `LiveMathPreviewOverlay.js` / pills: tap to convert, long-press for alternatives (already returned as `alternatives`), **Read as maths** chip when `routing.mathProb` is high.
- `handleConvertClusterToBlock`: already snaps to lines; keep ink in undo so "Undo" restores it.
- Training data (D5): every read line → the `training` store from step 2b: `{ strokes, readText, alternatives, routing, acceptedText, edited: bool, converted: bool, device, pointerType, createdAt }`, recorded when the line is read and updated when you accept or edit. The **Training data** folder in Notes Studio lists samples with a small ink preview, a count, **Export JSONL** (same fields as `HandwritingCollector.js` so `benchmark_recognition.mjs` reads it) and **Clear**. On the device only; a size cap (e.g. 20 MB, oldest dropped first) keeps phones safe.
- Model loading: text model only; maths model still loads only on "=" or Read as maths (keeps phones light, per B9 in the handoff).
- Tests: extend `test_text_fast_path.mjs` (live line path never calls the maths model without "=") and a browser test `tests/browser/writing-live.mjs` with touch input (write two lines → two pills → convert → undo).

Steps 5 and 6 are built together (D4: both), sharing one data shape and one cell editor.

### Step 5 — Table block (Notes page)

- `blockTypes.js`: add `{ id: 'table', type: 'table', name: 'Table', hint: 'Rows and columns', Icon: LuTable }`.
- New `Notes/components/TableBlock.js`. Data: `content: { rows: [["", ""], …], header: true, align: ["left", …] }`. Cells are plain inputs; a cell with `$…$` shows KaTeX when not being edited. Toolbar: + row, + column, delete row/column, header on/off. 44 px touch targets; sideways scroll inside the block on phones.
- Wire into `NoteBlockItem.js`, `PublicNoteView.js` (published notes), `latexNote.js` (`tabular`), Markdown/HTML export, `noteStorage.js` block counting, cloud sync (content is JSON, fits current sync).
- Tests: `tests/browser/notes.mjs` table case on phone and laptop sizes; `screens.mjs` for fit.

### Step 6 — Table block (Playground)

- New `Playground/components/blocks/TableBlock.js` inside `SmartBlockWrapper.js` (move, resize, delete like other blocks).
- Insert menu: **Table** with WPS-style grid picker + **Insert Table…** dialog (rows, columns). Phone: Insert row in More Tools sheet opens a rows/columns sheet.
- Same data shape as the Notes table so insert/export between Notes and Playground needs no conversion.
- Exports: `pageSvg.js` / `exportEngine.js` draw it; `latexPage.js` writes `tabular`.
- Tests: `tests/browser/insert-table.mjs` (insert 3 × 4, type in cells by touch, export PNG and LaTeX).

### Step 7 — Next round (after the above)

- **2c Sketch strokes in Notes:** `InkSketchBlock.js` saves `strokes` alongside the PNG preview, so inserted/exported handwriting stays editable ink and can be read by the text model.
- **3c Handwriting in table cells:** write in a cell → text model → cell text.
- **3d Hand-drawn grid → table:** research spike only.
- **Upload of training data** to NETZ, only with the user's consent and a privacy-policy line (owner task).

### Step 8 — Test everything together

Run the node tests (`test_*.mjs`, especially `test_feature_parity.mjs` so the shared feature extractor is unchanged) and the browser harness (`tests/browser/run-all.mjs`), on phone, tablet and laptop sizes with touch and pen.

---

## Owner decisions

All answered by the owner on 2026-10-24.

| # | Question | Answer |
|---|---|---|
| D1 | What did "export as Gmail" mean? | Export a board into an **asset store in Notes Studio**, saved with its preview, to insert into notes (step 2b). |
| D2 | Convert lines automatically, or ask? | **Ask** — tap to convert, no auto-type. |
| D3 | NETZ file free or Pro? | **Pro.** |
| D4 | Tables in Notes or Playground first? | **Both** together. |
| D5 | Save handwriting as training data? | **Everything is saved**, in a new **Training data** folder (on the device, JSONL export). |

Still open for later: uploading training data to NETZ (needs user consent and a privacy-policy line); per-user storage limit for assets (free vs Pro).

## Known limits

- Live reading is only as good as the current text model. Ink is never removed without your tap, so a bad reading costs nothing.
- Nothing has been tried on a real phone or stylus yet (same as the rest of the Playground).
- Old Notes sketches are PNG only and will stay pictures.
