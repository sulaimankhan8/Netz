# NETZ Playground: Dual-Mode Technical & Functional Specification
## Normal Mode (Whiteboard Canvas) vs. Notes Mode (Structured Notebook)

> **Document Type:** Product Feature & Technical Architecture Specification  
> **Target Module:** `src/app/(Primary.pages)/Playground/`  
> **Source Files:** [`PlaygroundCanvasContainer.js`](file:///c:/Users/Sulaiman/Desktop/netz1/Netz/src/app/(Primary.pages)/Playground/components/PlaygroundCanvasContainer.js), [`PlaygroundDock.js`](file:///c:/Users/Sulaiman/Desktop/netz1/Netz/src/app/(Primary.pages)/Playground/components/PlaygroundDock.js), [`WhiteboardCanvas.js`](file:///c:/Users/Sulaiman/Desktop/netz1/Netz/src/app/(Primary.pages)/Playground/components/WhiteboardCanvas.js), [`PageManager.js`](file:///c:/Users/Sulaiman/Desktop/netz1/Netz/src/app/(Primary.pages)/Playground/components/PageManager.js), [`InkToBlockConverterModal.js`](file:///c:/Users/Sulaiman/Desktop/netz1/Netz/src/app/(Primary.pages)/Playground/components/InkToBlockConverterModal.js)  
> **Version:** 1.0.0  

---

## 1. Executive Summary

The **NETZ Smart Whiteboard & Calculator Playground** provides a dual-modality workspace designed to accommodate two fundamentally distinct cognitive workflows:

1. **Normal Mode (Whiteboard Canvas)**: An unconstrained, infinite 2D spatial canvas engineered for free-form brainstorming, geometric construction, dynamic mathematical function plotting, curve-fitting ideation, and flexible diagramming.
2. **Notes Mode (Structured Digital Notebook)**: A lined, structured academic notebook experience optimized for sequential lecture note-taking, step-by-step mathematical derivations, continuous real-time handwriting recognition (Apple Math Notes parity), multi-page study organization, and seamless export to the Notion-style `/Notes` workspace.

Users can toggle seamlessly between both modes at any time using the **Notes Toggle** (`FiBookOpen`) on the floating dock toolbar without losing canvas state, active strokes, or generated blocks.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                NETZ PLAYGROUND DUAL-MODE ENGINE                        │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│         NORMAL MODE (WHITEBOARD)          │           NOTES MODE (NOTEBOOK)            │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Infinite 2D spatial plane               │ • Ruled lined paper layout (`lines`)       │
│ • User-selected grid (dots/grid/none)     │ • Automatic continuous Live OCR enabled    │
│ • Selection-based OCR (on-demand lasso)   │ • Real-time KaTeX preview pills above ink  │
│ • Spatial Smart Block linking (Béziers)   │ • Step-by-step derivation structure        │
│ • Geometric shape snapping & sketch CAS   │ • Multi-page lecture organization          │
│ • Freehand curve fitting & plotting       │ • Direct 1-click sync to `/Notes` workspace│
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Mode 1: Normal Mode (Whiteboard Canvas)

### 2.1 Core Purpose & Philosophy
**Normal Mode** is an infinite scratchpad designed for open-ended mathematical discovery. It strips away rigid page boundaries and rule lines, giving students and researchers full freedom to explore problems spatially—placing equations next to coordinate graphs, drawing geometric figures, connecting conceptual blocks with arrows, and performing ad-hoc derivations without formatting constraints.

### 2.2 Visual Environment & Canvas Setup
* **Canvas Dimensions**: Infinite 2D viewport with hardware-accelerated pan and zoom capabilities ($25\%$ to $300\%+$ zoom range with a 1-click $100\%$ reset trigger).
* **Grid Background**: Completely customizable by the user via the Dock Settings panel:
  * `dots`: Subtle isometric dotted matrix for architectural and geometric alignment.
  * `grid`: Standard Cartesian grid for coordinate drawing and math graphing.
  * `lines`: Optional standard lined spacing.
  * `none`: Clean, distraction-free blank white/dark canvas.
* **Navigation**: Infinite pan tool (`pan` mode), middle-mouse drag panning, and two-finger touchpad/stylus panning.

### 2.3 Handwriting & Recognition Mechanics
* **Default OCR Mode**: `selection` (`ocrMode = 'selection'`).
* **Non-Intrusive Workflow**: To keep the canvas clean while sketching diagrams or rough scratch calculations, live OCR preview tags are **not** continuously displayed over every written word by default.
* **On-Demand Recognition**:
  * **Lasso Selection Tool (`lasso`)**: Circling or selecting handwritten ink triggers the `SemanticLassoModal`, allowing users to classify the ink as `MATH`, `NUMBER`, `TEXT`, or `OBJECT`.
  * **Interactive Hypotheses Resolver (`SoftEditorModal`)**: If handwriting is ambiguous, users can inspect top candidate interpretations, adjust the assigned semantic type, or correct tokens directly.
  * **Manual Live OCR Toggle**: Available in dock settings if the user temporarily desires continuous feedback.

### 2.4 Features & Tool Suite Provided
1. **Full Inking Arsenal**:
   * **Stylus & Ink Pen (`pen`)**: Smooth Catmull-Rom spline ink with 7-color palette (Black, Blue, Purple, Emerald, Amber, Rose, White) and variable stroke widths (Fine, Medium, Broad).
   * **Pen Presets**: Fine Pen ($2\text{px}$), Gel Pen ($4\text{px}$), Marker ($8\text{px}$), Calligraphy ($14\text{px}$).
   * **Highlighter (`highlighter`)**: Translucent layered highlighter ($16\text{px}$) for marking key results.
   * **Dual Eraser (`eraser`)**: Point/pixel eraser and whole-stroke vector eraser backed by an R-Tree spatial index for instant $O(\log N)$ hit-testing.
   * **Shape Snapping Engine (`shape`)**: Automatically detects rough freehand strokes and snaps them to perfect geometric primitives:
     * Circles and Ellipses
     * Rectangles and Squares
     * Straight Lines and Connecting Rays
2. **Interactive Smart Block Suite**:
   * **Equation Block (`EquationBlock`)**: Rich KaTeX-rendered formula block with live numerical solving (MathJS engine), symbolic manipulation, and step-by-step evaluation.
   * **Graph Block (`GraphBlock`)**: Dynamic 2D Cartesian coordinate plane with multi-function plotting ($f(x)$, trigonometric, polynomial), zoomable axes, and point inspection.
   * **Theory Block (`TheoryBlock`)**: Markdown notes block with rich text, bullet points, task checkboxes, and inline KaTeX expressions (`$...$`).
   * **Sketch-to-Equation Block (`SketchBlock`)**: Draw a freehand curve on a mini-canvas; the built-in `sketchShapeAnalyzer` analyzes curvature, intercepts, and trends, automatically fitting the curve to mathematical model families:
     * Linear ($y = mx + c$)
     * Quadratic ($y = ax^2 + bx + c$)
     * Cubic ($y = ax^3 + bx^2 + cx + d$)
     * Sinusoidal ($y = a\sin(bx + c) + d$)
     * Exponential ($y = a \cdot e^{bx}$)
     * Tapping *"Convert to Equation Block"* generates an editable, linked `EquationBlock`.
   * **Audio Memo Block (`AudioMemoBlock`)**: Pin localized voice recordings anywhere on the infinite canvas.
   * **Image Block (`ImageBlock`)**: Upload and position textbook diagrams, assignment screenshots, or lecture slides.
3. **Spatial Knowledge Graphing**:
   * **Bézier Path Connectors (`BlockLinkRenderer`)**: Dynamic SVG curves that visually link dependent blocks together (e.g., connecting a solved equation to its corresponding graph).
4. **Canvas Export Options**:
   * **PNG Image**: High-resolution raster export of the canvas content.
   * **SVG Vector**: Infinitely scalable vector export preserving stroke geometry.
   * **PDF Document**: Formatted PDF document export for assignment submissions.

---

## 3. Mode 2: Notes Mode (Structured Digital Notebook)

### 3.1 Core Purpose & Philosophy
**Notes Mode** transforms the Playground from an unconstrained infinite whiteboard into an **organized, lined digital notebook** reminiscent of Samsung Notes, GoodNotes, and Apple Notes. It is tailored for structured academic environments: following along with university lectures, writing sequential mathematical proofs, taking organized textbook notes, and preparing polished revision materials.

### 3.2 Visual Environment & Canvas Setup
* **Automated Lined Paper Grid**: Entering Notes Mode automatically overrides custom grid settings to lock the canvas to `lines` (ruled notebook paper format).
  * Consistent horizontal line spacing guides penmanship, ensuring clean, legible handwriting and straight equation baselines.
  * Preserves dark/light theme styling with appropriate subtle line contrast.
* **Structured Page Boundaries**: Focuses the user's spatial attention into structured vertical columns and pages rather than scattered unbounded scratching.

### 3.3 Handwriting & Recognition Mechanics
* **Locked Continuous Live OCR**:
  * `notesMode = true` automatically locks `showLiveOcr = true` and sets `ocrMode = 'live'`.
  * The manual toggle is hidden/streamlined because real-time recognition is a fundamental property of Notes Mode.
* **Real-Time KaTeX & Text Floating Preview Pills (`LiveMathPreviewOverlay`)**:
  * As the user writes with stylus or mouse, background stroke clustering groups strokes into words and mathematical terms.
  * Floating translucent preview pills appear directly above handwritten clusters in real time.
  * Features live KaTeX formula previews (`\int_0^\infty x dx`, fractions, exponents, square roots).
* **Instant Apple Math Notes Parity**:
  * Immediate evaluation of arithmetic and algebraic expressions as soon as `=` is written.
  * Tapping the live preview pill immediately converts the handwritten ink into a clean, permanent typed block, replacing messy handwriting with publication-ready typography.

### 3.4 Features & Tool Suite Provided
1. **Multi-Page Notebook Navigation (`PageManager`)**:
   * Floating top bar providing notebook-level document structure:
     * **Page Indexing**: Quickly switch between `Page 1`, `Page 2`, `Page 3`, etc.
     * **Add Page**: Appends a new lined page to the current notebook session.
     * **Duplicate Page**: Clones the active page along with all existing strokes, blocks, and links.
     * **Clear Page**: Instantly clears the current page's ink while retaining page order.
     * **Delete Page**: Removes redundant pages from the notebook stack.
     * **Manual & Auto-Save**: Real-time session persistence with visible saved state indicators.
2. **Synchronized Lecture Audio Recording**:
   * Integrated microphone control (`FiMic`) allows students to record lecture audio directly while handwriting lecture notes.
   * Audio recordings are saved as playback blocks within the current note session.
3. **1-Click Sync to Notion-Style Notes Workspace (`InkToBlockConverterModal`)**:
   * Tapping the **Sync to Notes Workspace** button (`FiLayers`) opens the conversion modal.
   * Automatically serializes all handwritten clusters, equation blocks, theory blocks, and graphs into a structured Notion-style note document.
   * Transcribes into standard note schemas stored in `localStorage` (`netz_notes` and `netz_notes_v2_data`):
     * Retains document hierarchy: Title, Subtitle, Tags (`['Playground', 'Math']`), Created/Updated timestamps.
     * Generates a unique secure `accessKey` (e.g. `NETZ-A8K2`).
     * Maps math formulas to native `math` blocks and textual explanations to `paragraph` blocks.
     * Immediately accessible inside the main NETZ `/Notes` application page for further study, rich editing, quiz generation, and academic PDF lab report export.
4. **Data Loss Prevention (`UnsavedChangesModal`)**:
   * Tracks stroke and block modifications across notebook pages.
   * Prompts the user before navigating away to ensure no lecture notes or proofs are lost.

---

## 4. Side-by-Side Comparison Matrix

| Feature / Dimension | Normal Mode (Whiteboard Canvas) | Notes Mode (Structured Digital Notebook) |
| :--- | :--- | :--- |
| **Primary Visual Theme** | Free-form infinite canvas | Lined academic notebook paper (`lines`) |
| **Grid Customization** | User choice: `dots`, `grid`, `lines`, `none` | **Enforced `lines`** for horizontal baseline guide |
| **OCR Recognition Mode** | `selection` (On-demand via Lasso or selection) | **`live` (Continuous auto-clustering on draw)** |
| **Live KaTeX Preview Overlay** | Off by default (Clean canvas, manual opt-in) | **Always Active** (Pill tags appear above handwriting) |
| **Primary Interaction Focus** | Spatial ideation, visual links, dynamic graphing | Linear lecture capture, derivations, study notes |
| **Apple Math Notes Live Solving** | Available via on-demand selection or toggle | **Instant & Continuous** across all written equations |
| **Multi-Page Management** | Available for multi-board organization | **Primary Structure** (Page 1, 2, 3... notebook flow) |
| **Smart Block Linking** | Heavy use of SVG Bézier links between blocks | Linear sequence of notes, formulas, and callouts |
| **Sketch-to-Equation CAS** | Full curve fitting (`sketchShapeAnalyzer`) | Secondary (Focus is on handwritten LaTeX) |
| **Shape Auto-Snapping** | Active for geometry and diagrams | Active for framing formulas, tables, and underlines |
| **Notes Workspace Sync** | Syncs spatial blocks to note documents | **Seamless 1-Click Pipeline** to Notion-style `/Notes` |
| **Export Capabilities** | PNG, SVG, PDF | PNG, SVG, PDF + Direct `/Notes` workspace import |

---

## 5. Technical Implementation & State Flow

### 5.1 Container State Mapping
Inside [`PlaygroundCanvasContainer.js`](file:///c:/Users/Sulaiman/Desktop/netz1/Netz/src/app/(Primary.pages)/Playground/components/PlaygroundCanvasContainer.js):

```javascript
// Notes Mode boolean switch
const [notesMode, setNotesMode] = useState(false);

// Background Grid reactive binding:
<CanvasGridBackground
  gridStyle={notesMode ? 'lines' : gridStyle}
  zoomLevel={zoomLevel}
  panOffset={panOffset}
  width={dimensions.width}
  height={dimensions.height}
/>

// Live OCR & Preview Overlay reactive binding:
<PlaygroundDock
  notesMode={notesMode}
  showLiveOcr={notesMode ? true : showLiveOcr}
  setShowLiveOcr={notesMode ? undefined : setShowLiveOcr}
  ocrMode={ocrMode}
  setOcrMode={setOcrMode}
  setNotesMode={(mode) => {
    setNotesMode(mode);
    if (mode) {
      // Auto-enable continuous Live OCR when entering Notes Mode
      setShowLiveOcr(true);
      setOcrMode('live');
    }
  }}
  ...
/>
```

### 5.2 Mode Switching Lifecycle
1. **Transition from Normal Mode $\rightarrow$ Notes Mode**:
   * The user clicks the **Notes** button in the dock.
   * `notesMode` becomes `true`.
   * `CanvasGridBackground` dynamically recalculates its rendering shader/canvas lines, presenting horizontal ruled notebook guidelines.
   * `showLiveOcr` is forced to `true` and `ocrMode` switches to `'live'`.
   * Any newly penned mathematical lines immediately display KaTeX floating preview pills above the ink.
2. **Transition from Notes Mode $\rightarrow$ Normal Mode**:
   * The user clicks the **Notes** button again.
   * `notesMode` returns to `false`.
   * The canvas grid reverts to the user's previous preference (`dots`, `grid`, or `none`).
   * The user regains manual control over `showLiveOcr` and `ocrMode`, returning to an uncluttered freehand whiteboard.

---

## 6. Recommended User Workflows

### Workflow A: The Classroom Lecture (Notes Mode)
1. **Open Playground** and activate **Notes Mode** via the dock.
2. The canvas displays lined paper. The student writes lecture titles and definitions using the **Pen** or **Calligraphy Pen**.
3. As the professor derives equations ($E = mc^2$, $\nabla \cdot \mathbf{B} = 0$), the student writes them down; **Live OCR** renders crisp KaTeX previews immediately.
4. Tapping a preview pill converts messy handwriting into clean, typed LaTeX blocks.
5. If the board fills up, the student taps **Add Page** in `PageManager` to transition to Page 2 without losing context.
6. At the conclusion of the lecture, the student taps **Sync to Notes Workspace**, transferring the entire multi-page lecture into `/Notes` for long-term revision, AI quiz generation, and PDF lab report export.

### Workflow B: The Engineering Problem Solver (Normal Mode)
1. **Open Playground** in **Normal Mode** with the **Grid** background enabled.
2. The engineer draws a freehand curve representing sensor response data using the **Pen**.
3. Using the **Sketch Tool**, the curve is recognized and classified by `sketchShapeAnalyzer` into an exponential decay model ($y = a \cdot e^{-bx}$).
4. The engineer converts the sketch into an **Equation Block**, defines constants, and attaches a linked **Graph Block** via an SVG Bézier connector.
5. Using the **Shape Tool**, the engineer draws circuit schematics with auto-snapped lines and rectangles.
6. The completed solution sheet is exported directly as a high-resolution vector **SVG** or submission-ready **PDF**.

---

## 7. Summary & Conclusion
The dual-mode design of NETZ Playground ensures that users never have to choose between a free-form spatial whiteboard and a structured note-taking application. **Normal Mode** delivers unmatched flexibility for open mathematical scratchwork and graph mapping, while **Notes Mode** provides the discipline, ruled formatting, real-time recognition, and notebook organization required for structured academic study.
