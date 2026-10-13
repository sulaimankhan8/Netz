# NETZ Playground and Handwriting Recognition: Improvement Plan

> **For current status and next steps, read `PLAYGROUND_HANDOFF.md`.** The status tables below stop before the last two rounds of work (eraser, lasso, export, pen, blocks by touch, saving, drawing speed), and the device target has widened from iPad to every phone, tablet and laptop, touch first. This document remains the reference for the background analysis and the handwriting-model plan (section 7).
>
> **Revision 4, 13 October 2026.** Rewritten around the current state of the work. Earlier revisions were analysis first; this one is status first.
> **Scope:** `src/app/(Primary.pages)/Playground/`, the models in `public/models/`, and the notebooks in `files (1)/`.
> **Nothing is committed yet.** All changes described as done are in the working tree.

---

## 1. Where things stand

| Area | State |
| :--- | :--- |
| Quick wins (`=` answers, 138 MB download) | Done and checked in a browser |
| Recognition pipeline fixes that need no data | Done |
| Recognition accuracy work | **Blocked** until handwriting samples are collected on an iPad |
| New text model | **Blocked** on the same samples |
| Canvas foundations (undo, input, sharp ink, zoom) | Done and checked in a browser |
| Dock tools | Shapes, graph conversion and Sync fixed; most other tools still open |
| Speed (worker, saving, rendering) | Not started, except a Notes-mode shortcut that skips the slow maths pass on plain text |
| Maths model | Untouched, by decision |

Four serious bugs in the original code were found and fixed along the way: adding a page erased the previous page, a tap drew nothing in Chrome, nothing but ink was saved on a first visit, and ordinary fingertips were rejected as palms.

**What "checked in a browser" means here.** The app is driven in headless desktop Chrome with synthetic mouse input, and with finger and pen input emulated through Chrome's developer protocol. Nothing has been tried on a real touchscreen, stylus or iPad.

---

## 2. Fixed points

Five things are settled. The rest of the plan is built around them.

### 2.1 The maths model is not touched

No change to `public/models/netz_hmer.onnx`, its vocab and meta files, `files (1)/train_hmer.ipynb`, the 8-column feature extraction it depends on (`canonicalFeatures.js`, which must keep passing `test_feature_parity.mjs`), or its decoding loop.

Allowed, because it happens around the model and not to it: running it in a Web Worker, calling it less often, fixing what the app does with its output, and sending it cleaner input.

Every pipeline change so far was compared against the committed code on the same inputs. The winning kind, the scores and every maths reading were identical in all runs (section 8).

### 2.2 Target: iPad with Apple Pencil, Apple Notes as the bar

The primary user writes notes on an iPad with an Apple Pencil. Mouse and laptop still work. On iPad every browser runs on Safari's engine, which matters in these ways:

| Fact about Safari on iPad | Consequence for NETZ | Status |
| :--- | :--- | :--- |
| No browser handwriting API, and the Google endpoint is gone. | The three NETZ models are the only recogniser. Text accuracy matters more. | verified |
| Apple Pencil reports pressure and tilt. | Both are available for natural ink. Neither is used yet. | open |
| `getCoalescedEvents()` was missing in Safari as of iPadOS 17; move events arrive at up to 240 Hz. | Point density is far above the training data's, which strengthens the case for resampling. | needs a device check |
| Safari records audio as MP4, not WebM. | The recorder labels every recording WebM. Recordings made on iPad may not play. | open, needs a device check |
| WebGPU ships in Safari 26 on iPadOS 26. | Possible speed-up. Whether ONNX Runtime's WebGPU backend works there is unconfirmed. | needs a device check |
| Storage is limited and tabs are closed under memory pressure. | The 138 MB precache was a larger risk on iPad. It is now 7.4 MB. | fixed |
| System Scribble converts Pencil handwriting to text in any text field. | Typed blocks get Apple-quality handwriting input for free. It does not help ink on the canvas. | needs a device check |

### 2.3 Every pointer draws

Decided 13 October 2026. Restricting drawing to the Pencil was rejected as too restrictive. NETZ behaves like a touchscreen laptop:

- Mouse, trackpad cursor, finger and pen all draw.
- Two fingers pan and pinch-zoom the page and never leave a mark.
- A touch is ignored only while a pen is writing or within 0.7 s of it lifting. A palm that lands before the pen has its stroke dropped when the pen arrives.
- "One finger moves the page" is an optional setting, off by default.

This is deliberately more permissive than Apple Notes.

### 2.4 The Google endpoint is out of the product

Removed from the app. No ink leaves the device. The only remaining copy is the `--google` option of `benchmark_recognition.mjs`, which a developer runs on their own machine to get a reference score.

### 2.5 IAM-OnDB is treated as unavailable

The text model was trained on IAM-OnDB. The official site refused connections, registration could not be completed, and no copy of the stroke data exists on Kaggle or Hugging Face. The notebook saved only the ONNX file, so the current text model cannot be fine-tuned.

- The shipped text model stays until a replacement beats it on real in-app handwriting.
- The replacement is trained on the BRUSH dataset plus handwriting collected in the app (section 7).

---

## 3. What happens next

### 3.1 Waiting on you

Accuracy work cannot be judged without real handwriting.

1. Run `npm run dev -- -H 0.0.0.0` and open `http://<PC-IP>:3000/Playground/collect` on the iPad.
2. Write the prompts with the Apple Pencil. There are 49: words, phrases, lines, paragraphs, numbers, mixed text and maths.
3. Tap **Export**, and **Copy report** in the device panel. Send both.

A few hundred samples from two or three people is enough to start. This unblocks everything marked "needs samples" below, and the device report settles the "needs a device check" items in section 2.2.

### 3.2 Unblocked now, in suggested order

| Order | Work | Why here |
| :-: | :--- | :--- |
| 1 | **Eraser:** its own size with a visible circle, and a partial mode that splits strokes | Today it removes whole strokes only, and its size follows the pen width |
| 2 | **Lasso:** move, resize, copy, recolour and delete what is selected | Today selection can only be sent to recognition |
| 3 | **Export:** the whole page drawn from stroke data, without toolbars; real vector SVG and multi-page PDF | Today it is a screenshot of the screen |
| 4 | **Pen and highlighter:** width from pressure, tilt shading, presets that differ, colour picker with black; highlighter beneath the ink with its own width | Needed for the Apple Notes feel |
| 5 | **Inference in a Web Worker** | Recognition still freezes the page whenever the maths model runs |
| 6 | **Saving and rendering speed** | Every stroke rewrites the whole session and redraws every stroke |
| 7 | **Blocks on pointer events, and ink above blocks** | Blocks are mouse-only, and you cannot draw on an image |
| 8 | **Remaining tools:** image, mic, graph view, equation input, Notes mode label, dock layout | See section 5 |

### 3.3 Needs samples first

- Whole-line scaling and resampling for the text model (1.3, 1.4)
- Dictionary decoding weights (1.5: the decoder itself can be built now)
- The rest of the text-or-maths decision, and the 0.85 fast-path threshold (1.6)
- The new text model (Stage 3)

---

## 4. Status of every planned item

### Stage 0. Measure first

| # | Item | Status |
| :-: | :--- | :--- |
| 0.1 | Collection page at `/Playground/collect`, with device report and on-device timing button | Built. Works in the browser check. Not yet opened on an iPad. |
| 0.2 | Benchmark script `benchmark_recognition.mjs` | Built. Runs end to end on placeholder strokes. No real numbers yet. |
| 0.3 | Baselines: current text model, Google as a reference ceiling | Needs samples |
| 0.4 | iPad device checklist | Needs the device report from 0.1 |
| 0.5 | Diagnostic experiments (single line against merged lines, resampling, scale) | Needs samples. The benchmark already reports "Text by line". |
| 0.6 | Per-stage timings on every recognition result | Done |
| 0.7 | Maths baseline, to prove later changes do not move it | Needs samples. Until then, old-against-new comparisons stand in (section 8). |

### Stage 1. Pipeline fixes: no retraining, no model changes

| # | Item | Status |
| :-: | :--- | :--- |
| 1.1 | Multi-line ink read line by line | Done for the text reading. The text-or-maths score still uses the whole-cluster pass, so no maths result can change. |
| 1.2 | Highlighter strokes kept out of recognition | Done. Snapped shapes are kept out too. |
| 1.3 | Scale text by the line's height, not the word's | Needs samples |
| 1.4 | Resample text strokes to the training point density | Needs samples |
| 1.5 | CTC beam search with a dictionary | Not started. Can be built now; its weights need samples. |
| 1.6 | Rework the text-or-maths decision | Part done: Notes-mode text fast path and a "∑ Maths" correction button. The rest needs samples. |
| 1.7 | `=` evaluation | Done. Checked in the browser: `1+1=` gives 2, `13+1=` gives 14. |
| 1.8 | Stop the 138 MB precache | Done: 142.7 MB down to 7.4 MB in a production build. |
| 1.9 | Stable cluster IDs; stale recognition passes discarded | Done |
| 1.10 | Remove the made-up structure tree; correct the "94%" label | Done |
| 1.11 | Remove the Google endpoint from the app | Done |
| 1.12 | `=` written apart from its expression still joins it; grouping distance scales with writing size | Done. Added after a browser check showed a `=` 50 px away was ignored. |

**The Notes-mode text fast path.** The maths model is not run when the router gives text a probability of 0.85 or more, the ink has at least 3 strokes, and it does not end in an `=` gesture. If the text model then reads nothing, maths is tried after all. Whiteboard mode is unchanged. Each use of "∑ Maths" is stored on the device as a router correction.

**Not yet known:** how often the fast path fires on real handwriting. On generated test shapes the real router never gave text more than 0.66, so the path was exercised only with a stubbed router. The 0.85 threshold may need lowering. The first benchmark run on real samples will show it.

### Stage 2. Speed: app-side only

| # | Item | Status |
| :-: | :--- | :--- |
| 2.1 | Move all inference to a Web Worker | Not started |
| 2.2 | Runtime settings: try WebGPU, raise graph optimisation, test multi-threaded WASM on `/Playground` only | Not started |
| 2.3 | Saving: debounce, one record per page, open the database once, drop the `localStorage` mirror, store audio and images as files | Not started. One related fix is done: first-visit sessions are now marked as loaded. |
| 2.4 | Rendering | Sharp ink on high-density screens is done. Viewport culling, cached ink bitmap, per-frame batching and incremental active stroke are not started. |
| 2.5 | Spatial index: remove single strokes without a rebuild; replace the fixed-bounds quadtree | Not started |
| 2.6 | Incremental clustering | Not started |
| 2.7 | React: one transform for pan and zoom; split the container into hooks | Not started |

### Stage 3. Text model: HTR-Baseline-003

Not started. Needs data. Design in section 7.

### Stage 4. Canvas and dock tools

**4A. Foundations**

| # | Item | Status |
| :-: | :--- | :--- |
| 4.1 | Undo and redo: strokes, erasing, blocks, converting ink, clearing a page; dock buttons; Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y | Done. History is per page and resets when another page is opened. |
| 4.2 | Objects on the canvas: shapes and images with handles; ink drawn above blocks | Not started. Shapes are tagged as shapes but are not yet movable objects. |
| 4.3 | Pointer events for blocks and the Sketch block | Not started. The pan tool now works with one finger. |
| 4.4 | Input: every pointer draws, two fingers navigate, pen-aware palm rejection, optional "finger moves the page" | Done |
| 4.5 | iPad Safari layout: dynamic viewport height, safe areas, no page zoom or long-press callout over the canvas | Not started |
| 4.6 | Low-latency ink: draw only the newest segment, use predicted points | Not started |
| 4.7 | Keyboard shortcuts and per-tool cursors | Undo and redo only |

**4B. Tool by tool:** see section 5.

**4C. The dock itself**

| Item | Status |
| :--- | :--- |
| Undo and redo buttons | Done |
| Group controls into draw, insert, mode, file; overflow on narrow screens | Not started |
| Accessibility labels and touch-friendly tooltips | Only on the controls added so far |
| Placement against the mobile navigation bar | Not started |

### Stage 5. Workflow and features

None started.

- Recognise in the background and keep the ink, giving search across handwriting and copy-as-text
- Convert in place, with a one-tap "restore ink" using the strokes already saved on each block
- Tap a word to see alternatives
- Inline answers that recompute when the expression is edited
- Multiple named notebooks
- Audio linked to ink
- Page templates, and import a PDF to annotate
- A first-run hint for the core gestures

---

## 5. Dock tools: fixed and still open

| Tool | Fixed so far | Still open |
| :--- | :--- | :--- |
| **Undo / Redo** | Added, with keyboard shortcuts | — |
| **Pen** | A tap now draws a dot; strokes start where the pen goes down | Pressure and tilt unused. Presets only change width. No black, no colour picker. No input stabilisation. |
| **Highlighter** | No longer corrupts recognition; scribbling with it no longer deletes the writing underneath | Drawn over the ink, dimming it. Width tied to pen width. No straight-line assist. |
| **Eraser** | Erases a shape anywhere along its edges; undoable; tooltip corrected | Whole strokes only. Size follows pen width. No size preview or eraser cursor. Every hit rebuilds the index. |
| **Lasso** | Leaves highlighter marks and shapes out of recognition | Cannot move, resize, copy, recolour or delete. Uses the lasso loop's box, not the ink's. Selected strokes are not highlighted. |
| **Shapes** | Rebuilt: line, triangle, rectangle, square, other four-sided shapes, five- and six-sided polygons, circle, ellipse. Sharp corners. Angle-based snapping. | No arrows. No live preview while drawing. No handles to edit a shape afterwards. No hold-to-snap from the pen. |
| **Pan** | Works with one finger. Two fingers pan and pinch in every tool. | No space-drag on desktop. |
| **Notes mode** | — | Button label is "Notes" in both states. Says live recognition but only reacts to `=`. Does not restore previous settings on exit. |
| **+ Eq** | `=` answers work; variables set in Equation blocks are used | Raw LaTeX in a plain text box. Opens with sample content. New blocks stack on the same spot. Variable scope is single letters only and never cleared. |
| **Graph** | `\log`, nested fractions and roots, and `\sin x` without brackets now plot. Editing a linked equation updates only its own curve. | Four fixed ranges. No pan or zoom in the plot. View not saved. Only `y = f(x)`. No roots or intersections marked. |
| **Theory** | — | Autocomplete downloads a 4 MB word list from GitHub at runtime. |
| **Mic** | — | Failure shown with a browser `alert()`. No timer or level. Labelled WebM even where the browser records MP4. Stored as base64. |
| **Image** | — | Fixed 360 × 280 box. No compression, crop or rotate. No drag-and-drop. Cannot be drawn on. |
| **Sync to Notes** | All blocks pre-selected. Graphs carried over as their equations. | Ink is not transferred. Icon suggests layers. |
| **Export** | — | Screenshot of the screen, toolbars included. "SVG" is not vector. No options. |
| **Settings** | "Finger: Draws / Moves page" added | One wide panel that does not wrap on narrow screens. |
| **Zoom** | Anchored at the cursor and at the screen centre. Reset keeps the position. Pinch zoom. | No "fit to content". |
| **Sketch block** | — | No button on the dock, so it cannot be added. Mouse-only. Wrong coordinates under zoom. |

**Correction.** An earlier revision said pressing Sync with nothing ticked created an empty note. That was wrong: the button is disabled until something is ticked. The real defect was that nothing was pre-selected.

---

## 6. Defect register

| Defect | Status |
| :--- | :--- |
| `=` evaluation failed on multi-digit numbers and any LaTeX | Fixed |
| Service worker precached about 138 MB on every first visit | Fixed |
| Adding a page erased the page before it | Fixed. Found in the browser. |
| The first point of every stroke was dropped in Chrome, so a tap drew nothing | Fixed. Found in the browser. |
| On a first visit the session was never marked as loaded, so only ink was saved | Fixed. Found in the browser. |
| Any touch reported wider than 25 px was rejected as a palm | Fixed |
| A highlighter scribble was treated as a scratch-out and deleted writing | Fixed |
| A `=` more than 48 px from its expression was ignored; grouping distance was fixed regardless of writing size | Fixed. Found in the browser. |
| Alternative readings were computed but never reached the Soft Editor | Fixed |
| A slow recognition pass could overwrite a newer one | Fixed |
| Cluster IDs changed on every pass, losing the selection | Fixed |
| Loading message claimed "94%"; the model's own metadata says 53.6% | Fixed |
| The structure tree paired the i-th LaTeX character with the i-th stroke | Removed |
| The Google endpoint sent ink off the device | Removed |
| Ink was blurry on high-density screens | Fixed |
| Zoom slid content away; reset also reset the position | Fixed |
| Shape tool turned triangles into rectangles and rounded off corners | Fixed |
| `\log(x)` became `log10*(x)`; nested fractions were left as raw LaTeX | Fixed |
| Editing a linked equation replaced every curve on the graph | Fixed |
| Sync dialog opened with nothing selected | Fixed |
| Several written lines merge into one cluster | Mitigated: text is read line by line. The cluster itself is still one. |
| The "confidence" shown can exceed 100% (111% seen) because the score includes a bonus | Open. It is a score, not a probability, and should not be shown as a percentage. |
| Spatial index is a quadtree with fixed bounds of ±10,000 px | Open |
| Audio and images stored as base64 in session state and mirrored to `localStorage` | Open |
| Four copies of the ONNX runtime in `public/onnx` and in git (83 MB); the build bundles the `jsep` one | Open. Confirm in a browser which file loads before deleting any. |
| Dead code: `SemanticLassoModal` never opened, `preloadOCREngine` empty, `sourceStrokes` saved but never restorable | Open |
| No undo | Fixed |

---

## 7. Text recognition: why it underperforms, and the plan

### 7.1 Causes

The text model scores 4.5% character error on its own test set, which is respectable for its training data. The gap in the app comes from elsewhere.

| # | Cause | Status |
| :-: | :--- | :--- |
| 1 | Several lines were passed as one sequence; the model only ever saw single lines | Fixed for the text reading (1.1) |
| 2 | Highlighter strokes were mixed into the ink | Fixed (1.2) |
| 3 | Scale depends on which letters are present: a word with no tall letters arrives up to twice the expected size | Open (1.3), hypothesis |
| 4 | Point density differs by device; the features are per-sample values | Open (1.4), hypothesis |
| 5 | Absolute x is a feature, so the model partly learns position in the line | Open (Stage 3) |
| 6 | Digits and most punctuation are rare in the training labels | Open (Stage 3) |
| 7 | Greedy decoding with no dictionary or language model, although the app already loads a 370k-word list for autocomplete | Open (1.5) |
| 8 | The text-or-maths choice favours maths: a flat bonus, and any one- or two-stroke cluster is pushed towards maths | Part done (1.6) |
| 9 | The training data has 221 writers from one whiteboard device | Open (Stage 3) |

### 7.2 Honest expectation

"Google Ink level" has to be measured: error rate on real in-app handwriting, against Google's result on the same set.

- Stages 1 and 2 should bring in-app accuracy close to the model's 4.5% figure and cut word error through dictionary decoding.
- Stage 3 can plausibly get within a small margin of Google on clear English handwriting.
- Matching Google on any writer, style or language is not realistic from public data, and this plan does not promise it.

### 7.3 Stage 3: HTR-Baseline-003

A new revision of `train_htr.ipynb` in the style of the existing notebooks, trained from scratch on data that can be obtained today. `train_hmer.ipynb` is not opened.

**It keeps the notebooks' design:**

| Design rule | How 003 keeps it |
| :--- | :--- |
| 8-column feature contract, identical everywhere | The input stays 8 columns from the same shared `extract_features`. |
| A model may ignore columns internally | 003 masks absolute x, `dt` and `speed` inside the model, as the router masks timing. |
| Parity test vectors | Resampling is a step on the raw ink before `extract_features`, with its own test vector, switched on by a field in `netz_htr_meta.json`. The maths meta has no such field. |
| Hard landing, real data only | Default stays real-only. |
| Automatic download where the licence allows | BRUSH is fetched automatically, as the maths notebook fetches MathWriting. |
| Composed data is opt-in | Word and phrase crops from real sentences sit behind flags that are off by default. |
| Honest evaluation | Split by writer. The in-app set is a second test and decides whether 003 ships. |
| ONNX verified against PyTorch | Unchanged. |
| New in 003 | The PyTorch checkpoint is saved, so later models can be fine-tuned. |

**What changes:** resampling to equal spacing along each stroke; a robust line height for scaling; training on words and phrases cut exactly using BRUSH's per-point character labels; stronger augmentation; a model of roughly 4 to 6M parameters in the same conv, BiGRU and CTC family.

**Where the data comes from:**

| Source | What it is | Access | Constraint |
| :--- | :--- | :--- | :--- |
| **BRUSH** (Brown University) | 27,649 handwritten sentences from 170 writers, written with styluses against a baseline. Per-point character labels. | One 567 MB zip on Google Drive, linked from the project's GitHub page. No login. | Non-commercial research only. No timestamps. Python pickle files. |
| **In-app collection** | Handwriting from real NETZ users on real iPads, through the page built for Stage 0. | Built. | Needs consent wording and somewhere to send the data. The only source NETZ fully owns. |
| **User corrections** | Already captured on-device, in the format the notebooks read. | Needs an opt-in export button. | Small volume at first. |
| **DeepWriting** (ETH Zürich) | About 85,000 words from 294 writers. | Not confirmed. | Custom non-commercial licence. |
| **IAM-OnDB** | The current model's training set. | Unavailable. | Add back if it returns. |
| **Synthetic generators** | Would fill gaps in digits and punctuation. | — | Against the hard-landing rule. Not planned unless you decide otherwise. |

**Decoding:** prefix beam search with a character language model and a dictionary bonus, trained on open text plus the app's own subjects.

**Proposed targets on the in-app set:** character error 5% or lower; word error 12% or lower with the language model; within about 1.5 times Google's error; under 300 ms per line on an iPad.

**Router:** left as it is. Retrain only if real samples show routing errors are a large share of failures.

---

## 8. Measured results

| Measurement | Result |
| :--- | :--- |
| Precache of files from `public/`, production build | 142.7 MB before, 7.4 MB after |
| Recognition of a 67-stroke paragraph, both models, this PC | 33.8 s (maths 33.6 s, text 0.18 s) |
| Same paragraph through the Notes-mode fast path | 0.18 s, read as 4 lines |
| Six short lines, both models | about 3.5 s (text 13 ms, maths 3.4 s) |
| Old pipeline against new, first comparison | Identical kind, scores and maths reading in 36 of 36 runs |
| Old pipeline against new, after the fast path | Identical in 40 of 40 runs (20 Whiteboard, 20 Notes) |
| Line splitter on synthetic layouts | Exact when lines are at least about 2.5 letter-heights apart; degrades for tighter printed writing |

Timings are single-threaded WASM on a desktop PC, not an iPad. The comparison inputs are generated shapes, not handwriting: they show the edits changed nothing they should not, and say nothing about accuracy.

**Behaviour change to know about.** The old `=` code evaluated any expression containing `x` as if `x` were 1. The new code returns no answer when a variable is undefined, and uses values set in Equation blocks when they exist.

---

## 9. How the work is checked

**Test scripts in the project root**, run with `node <file>`:

| Script | Covers | Checks |
| :--- | :--- | :-: |
| `test_feature_parity.mjs` | Feature extraction matches the training notebooks (existed before) | 6 |
| `test_latex_evaluator.mjs` | `=` evaluation | 36 |
| `test_line_segmenter.mjs` | Splitting ink into written lines | 74 |
| `test_text_fast_path.mjs` | When the maths model is and is not called | 18 |
| `test_cluster_equals.mjs` | Grouping, `=` attachment, highlighter exclusion | 13 |
| `test_canvas_helpers.mjs` | Undo history, zoom maths, graph conversion, linked curves | 62 |
| `test_shape_recognizer.mjs` | Shape snapping on wobbly synthetic shapes | 206 |

**Browser checks** in headless Chrome: 30 for undo, pages, reload and zoom; 20 for finger, two-finger and pen input; plus shapes, tap-for-a-dot, `=` answers, Sync to Notes and a general smoke run. These scripts live in a temporary folder outside the project, because they need a browser-driving package the project does not depend on. They can be moved into the project if you want to keep them.

**Also run each round:** lint on the Playground folder (three warnings, all in code that predates this work) and a production build.

---

## 10. Risks

| Risk | Detail |
| :--- | :--- |
| **No real-device testing yet** | Everything touch- and pen-related is emulated. The first iPad session may surface problems the emulation cannot. |
| **Dataset licences** | IAM-OnDB and BRUSH are for non-commercial research only. MathWriting's paper links a non-commercial licence; its own licence file should be checked. This conflicts with ads and paid tiers. Handwriting collected in the app is the only training data NETZ would own outright. |
| **BRUSH alone may not beat the current model** | Its test score cannot be compared with the current 4.5%. Only the in-app set can decide. |
| **Fast-path threshold untested on real writing** | If 0.85 is too strict, paragraphs stay slow. If too loose, maths is read as text until corrected. |
| **Palm guard** | A two-finger pinch within 0.7 s of a pen stroke is ignored, because it cannot be told from a palm. May feel long on a real device. |
| **Cross-origin isolation** | Needed for multi-threaded WASM. May break AdSense and Analytics. |
| **Object layer (4.2)** | Changes how the canvas stores content. Saved sessions will need a migration. |
| **Uncommitted work** | About 35 files are modified or new. A commit on a branch would protect it. |

---

## 11. Decisions

**Settled**

| Decision | Outcome |
| :--- | :--- |
| Maths model | Frozen |
| Target device | iPad with Apple Pencil; Apple Notes as the bar |
| Who may draw | Every pointer. No pencil-only rule. |
| Google endpoint | Removed from the app; kept in the test script |
| IAM-OnDB | Treated as unavailable; BRUSH and in-app collection replace it |
| Slow maths pass on plain text | Skipped in Notes mode when the router is confident, with a "∑ Maths" correction |

**Still open**

1. **Commercial use.** BRUSH is non-commercial only. To earn money from a model trained on it, either Brown grants permission or the model is trained on handwriting collected in the app.
2. **Synthetic data.** Excluded, following the notebooks' rule, unless you say otherwise.
3. **Collecting handwriting from users.** Needs a consent screen and somewhere to send the data. NETZ has no backend, so a first version could export a file the volunteer sends in.
4. **Committing.** Whether to commit the work so far on a branch.

---

## 12. Progress log

**12 October 2026**

- Plan written; maths model frozen; iPad target set; Google endpoint and IAM-OnDB decisions made.
- `=` evaluation fixed. Precache cut from 142.7 MB to 7.4 MB.
- Collection page and benchmark script built. Per-stage timings added.
- Google endpoint removed. Highlighter kept out of recognition. Stable cluster IDs. Made-up structure tree and "94%" label removed. Multi-line text read line by line. Soft Editor given its alternatives.

**13 October 2026**

- Notes-mode text fast path and "∑ Maths" button.
- Browser checks set up in headless Chrome.
- Four bugs in the original code found and fixed: page loss when adding a page, taps drawing nothing, nothing but ink saved on a first visit, `=` ignored when written apart.
- Undo and redo. Sharp ink on high-density screens. Anchored zoom.
- Shape tool rebuilt. Graph conversion fixed. Linked curves preserved. Sync to Notes pre-selects.
- Input: every pointer draws, two fingers navigate, pen-aware palm rejection, optional "finger moves the page". Fingertips no longer rejected as palms.
- Plan rewritten as revision 4.

**Side effect to know about.** Running the dev server made Next.js 16 write `AGENTS.md` and `CLAUDE.md` into the project root. It re-creates them on every `next dev`; `agentRules: false` in `next.config.js` stops it.

---

## 13. References

- Google's published online handwriting system: [Fast Multi-language LSTM-based Online Handwriting Recognition](https://arxiv.org/abs/1902.10525v1)
- [IAM On-Line Handwriting Database](https://fki.tic.heia-fr.ch/databases/iam-on-line-handwriting-database) (writer count and licence)
- [MathWriting dataset paper](https://arxiv.org/abs/2404.10690v2)
- [BRUSH dataset: project page with download link, format and licence](https://github.com/brownvc/decoupled-style-descriptors)
- [DeepWriting paper](https://arxiv.org/pdf/1801.08379)
- [Kaggle "IamOnDB Handwriting Dataset"](https://www.kaggle.com/datasets/teykaicong/iamondb-handwriting-dataset) (the scanned-image database, not the stroke data)
- [Apple Developer Forums: Apple Pencil input rate and `getCoalescedEvents` in Safari](https://developer.apple.com/forums/thread/689375)
- [WebKit: MediaRecorder API](https://webkit.org/blog/11353/mediarecorder-api/) (Safari records MP4)
- [WebGPU in iOS 26](https://appdevelopermagazine.com/webgpu-in-ios-26/amp/)
- [Chrome: Handwriting Recognition API](https://developer.chrome.com/docs/web-platform/handwriting-recognition)
- [ONNX Runtime Web: env flags and session options](https://ONNXRuntime.ai/docs/tutorials/web/env-flags-and-session-options.html)
- [ONNX Runtime Web: performance diagnosis](https://onnxruntime.ai/docs/tutorials/web/performance-diagnosis.html)
