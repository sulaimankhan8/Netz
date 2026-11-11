# NETZ Notes Feature - Technical Architecture & Specification

## 1. Overview & Vision

The **NETZ Notes Workspace** is an interactive, block-based note-taking environment designed specifically for engineering and mathematics students. It combines Notion-style document editing with real-time **LaTeX math rendering**, **interactive calculator widgets**, **tags/filtering**, and **public/private note sharing via unique access keys**.

---

## 2. Technical Architecture & Tech Stack

```
   [NETZ Notes Component Architecture]
                  │
   ┌──────────────┼──────────────┬──────────────┐
   ▼              ▼              ▼              ▼
[Block Canvas]  [Storage]     [Share Key]    [Search Engine]
   │ (KaTeX)      │ (PWA)        │ (NETZ-XXXX)  │ (Tags & Keywords)
   ▼              ▼              ▼              ▼
LaTeX Preview   IndexedDB     Access Key     Instant Search
 & Widgets     & LocalStorage   Sharing       & Tag Filters
```

### Stack Components:
* **UI & Styling**: Next.js 16 App Router (Client Components), Tailwind CSS, Lucide / React Icons.
* **Math Rendering**: KaTeX (`katex`, `react-katex`) for crisp mathematical formula rendering ($\int_{a}^{b} f(x) dx$).
* **Storage & Persistence**: Local-First PWA architecture using `localStorage` and `IndexedDB` for instant offline availability and 0 server latency.
* **Math Computation**: Integrated `evaluateMath.js` (MathJS engine) for live widget solving inside notes.

---

## 3. Data Schema & Document Structure

Each note is represented as a structured JSON object:

```typescript
export interface NoteDocument {
  id: string;             // Unique UUID / timestamp identifier
  title: string;          // Note title (e.g. "Unit 1: Numerical Methods Notes")
  subtitle?: string;       // Subtitle / description
  tags: string[];         // Category tags (e.g. ["Numerical Methods", "Newton Raphson", "Unit 1"])
  createdAt: string;      // ISO timestamp string
  updatedAt: string;      // ISO timestamp string
  isPublic: boolean;      // Public / Private toggle
  accessKey: string;      // Unique 8-character key (e.g. "NETZ-8X42")
  author: string;         // Author name or "Anonymous Student"
  blocks: NoteBlock[];    // Array of block items
}

export type BlockType = 
  | 'heading1' 
  | 'heading2' 
  | 'paragraph' 
  | 'math' 
  | 'callout' 
  | 'widget'
  | 'quiz'
  | 'ink';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;         // Text, LaTeX formula, or description
  caption?: string;        // Used for Ink / figure sketches
  widgetConfig?: {         // Configuration for embedded interactive solvers (34 algorithms)
    algorithmId: string;   // e.g. 'newton-raphson', 'gauss-elimination', 'runge-kutta-4'
    params: Record<string, any>;
  };
  quizConfig?: {           // Configuration for interactive self-test quizzes
    question: string;
    mode: 'mcq' | 'numeric';
    options?: string[];
    correctOptionIndex?: number;
    correctNumericValue?: number;
    tolerance?: number;
    explanation?: string;
  };
}
```

---

## 4. Feature & UI Breakdown

### A. Document Navigator & Collapsible Sidebar
* **Create Note Button**: Instant creation of blank structured notes with default starter templates.
* **Live Search Bar**: Instant real-time filtering by note title, subtitle, block text content, or specific tags.
* **Tag Pills Filter**: Quick clickable filters (e.g. `#Unit1`, `#NumericalMethods`, `#LinearAlgebra`).
* **Tab Switcher**: Toggle between **All Notes**, **Private Notes**, and **Public Notes**.
* **Clean Single-Rail Navigation**: Dedicated 12-width collapsed rail strip with single `>>` expand button and responsive collapse controls, eliminating redundant toggles.
* **Pinned Notes**: Thumbtack pinning to keep critical study sheets pinned to the top of the sidebar.

### B. Block Editor Canvas & Slash Commands
* **Slash Command Popover (`/`)**: Type `/` in any block to trigger a quick-insert palette for headings, formulas, callouts, solvers, sketches, and quizzes.
* **Dynamic Block Controls**:
  * **H1 / H2 Headings**: Section titles.
  * **Text Paragraphs**: Rich text body.
  * **LaTeX Math Blocks**: Live KaTeX rendering of complex math equations and matrices.
  * **Callout Cards**: Highlighted exam tips, caution notes, and theorem callouts.
  * **Embedded Math Widgets (34 Algorithms)**: Full numerical engine embedded directly in notes covering Units 1–5 (Roots, Interpolation, Calculus, Linear Systems, Differential Equations).
  * **Interactive QuizBlock**: MCQ (2–6 options) and numeric tolerance self-tests ($|x - x_0| \le \text{tol}$) with KaTeX derivations, instant feedback, and author/solve mode toggling.
  * **Handwritten Ink Canvas**: Interactive HTML5 drawing pad with pen, eraser, color palette, stroke sizing, image/SVG upload, Whiteboard queue import, and PNG download.

### C. Academic PDF Export & Sharing
* **High-DPI Academic PDF Exporter**: $2\times$ retina multi-page A4 export using `html2canvas` and `jspdf` with clean typography, page splits, and zero watermarks.
* **Public/Private Access Keys**: Unique 8-character keys (e.g. `NETZ-YJWM`) for 1-click sharing and importing.
* **Community Notes Feed**: Integrated feed tab in the Share Modal with curated public engineering notes across Units 1–5, allowing 1-click "Clone to Workspace".

---

## 5. File Structure for Notes Feature

```
src/app/(Primary.pages)/Notes/
├── page.js                     # Main Notes Workspace Container & Layout
├── components/
│   ├── NoteSidebar.js          # Collapsible Document Navigator, Search & Tag Filter
│   ├── NoteEditor.js           # Block Canvas, Title/Tag Toolbar & PDF Export Action
│   ├── NoteBlockItem.js        # Universal Block Wrapper & Drag/Action Handlers
│   ├── NoteShareModal.js       # Access Key Generator & Community Notes Feed
│   ├── EmbeddedMathWidget.js   # Interactive solver widget embedded in note
│   ├── AlgorithmPickerModal.js # 34-algorithm picker modal categorized by Unit 1-5
│   ├── SlashCommandMenu.js     # Notion-style slash command palette
│   ├── QuizBlock.js            # Interactive MCQ & Numeric quiz widget with KaTeX
│   └── InkSketchBlock.js       # HTML5 Canvas stylus drawing & whiteboard bridge
└── utils/
    ├── noteStorage.js          # LocalStorage CRUD operations & default notes
    ├── sampleNotes.js          # Pre-built educational study templates with quizzes
    ├── algorithmRegistry.js    # Comprehensive registry & solvers for all 34 algorithms
    └── pdfExport.js            # High-resolution multi-page A4 PDF export generator
```
