# NETZ — On-Device Neural Ink & Heuristic Architecture Implementation Plan

> **Document Status:** Production Technical Specification & Implementation Plan  
> **Target:** Client-Side On-Device Inference Pipeline, Neural Models Integration, and Pure Heuristic Mathematical Structure Engine (Zero Brittle If-Else Cascades)  
> **Source Artifacts:**  
> - Training Notebooks: `files (1)/train_router.ipynb`, `files (1)/train_htr.ipynb`, `files (1)/train_hmer.ipynb`  
> - Model Artifacts: `public/models/netz_router.onnx`, `public/models/netz_htr.onnx`, `public/models/netz_hmer.onnx` + Vocabs & Metas  
> - Reference Blueprint: NETZ Master Product, AI, Company & Execution Blueprint (v1.0)

---

## 1. Executive Summary & Core Paradigm

This implementation plan establishes the architecture to integrate the three trained ONNX models (`netz_router`, `netz_htr`, `netz_hmer`) directly into the Netz Playground web application using **ONNX Runtime Web (`onnxruntime-web`)** on a dedicated Web Worker thread.

### The Core Architectural Directive: Pure Heuristics, Zero Brittle If-Else Chains
Per strict system constraints: **No brittle, hard-coded `if-else` rule trees** (`if (char === '2' && y < -10) ...`).

Mathematical layout and ink interpretation will be governed by **continuous geometric and statistical heuristics**:
1. **Continuous Spatial Affinity Functions**: Gaussian spatial kernels and overlap integrals determining superscript/subscript attachment.
2. **Horizontal/Vertical Projection Profile Valleys**: Continuous density histograms identifying fraction vinculums, division bars, and matrix grid partitions.
3. **Bounding Box Envelopment Metrics**: Ratios of convex hull and axis-aligned bounding box (AABB) intersection over union (IoU) for radical roots and grouping enclosures.
4. **Energy Minimization & AST Graph Parsing**: Structural parsing modeled as Minimum Spanning Tree / Delaunay graph optimization weighted by geometric affinity scores, verified against grammar trees (Math.js / KaTeX AST).

---

## 2. System Architecture Flow

```text
               USER DIGITAL INK (PointerEvents / Stylus)
                                │
                                ▼
         CANONICAL STROKE FEATURE EXTRACTOR (8D Normalized)
        [x, y, dx, dy, min(dt*10, 1), stroke_end, stroke_start, speed]
                                │
                                ▼
         RECOGNITION WEB WORKER (WebGPU / WASM SIMD Fallback)
                                │
                                ▼
                   MODEL 1: NETZ ROUTER (ONNX)
         [Logits -> Softmax over TEXT, NUMBER, MATH, OBJECT]
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
  ROUTE: TEXT / NUMBER                          ROUTE: MATH / MIXED
         │                                             │
         ▼                                             ▼
  MODEL 2: NETZ HTR (ONNX)                      MODEL 3: NETZ HMER (ONNX)
  [CTC Greedy / Beam Decode]                    [Autoregressive SOS->EOS]
         │                                             │
         └──────────────────────┬──────────────────────┘
                                │
                                ▼
        DETERMINISTIC HEURISTIC STRUCTURE ENGINE (Pure Math)
    • Baseline & Midline Estimation via Continuous Median Regression
    • Vinculum Detection via Projection Profiles & Aspect Ratio
    • Spatial Affinity Kernel: S_super(A, B), S_sub(A, B), S_frac(A, B)
    • Radical Enclosure Metric: Area(Intersection) / Area(Radical_Hull)
    • Matrix Grid Partitioning via Histogram Valleys
                                │
                                ▼
             CANDIDATE ENGINE & SEMANTIC VALIDATOR
    • Multi-hypothesis Continuous Scoring
    • MathAST Parser & Grammar Validation (No Hardcoded Fallbacks)
                                │
                                ▼
                 RECOGNITION RESULT CONTRACT
   { id, type, value, ast, confidence, alternatives, sourceStrokeIds, bbox }
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
  CONFIDENT (Score >= Tau)                 AMBIGUOUS / UNCERTAIN
         │                                             │
         ▼                                             ▼
  LIVE PREVIEW PILL / CONVERT              SOFT EDITOR & SEMANTIC LASSO
  (EquationBlock / SmartBlock)             (User Selection & Correction Flywheel)
```

---

## 3. Inventory of Model Assets & Specifications

From `Netz/public/models/` and `Netz/files (1)/`:

| Model | File Name | Size | Input Tensor | Output Tensor | Vocab / Classes | Target Metric |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Router** | `netz_router.onnx` | ~407 KB | `strokes`: `[B, T, 8]` | `logits`: `[B, 6]` | `['TEXT', 'NUMBER', 'MATH', 'MIXED', 'OBJECT', 'UNKNOWN']` (Active: TEXT, NUMBER, MATH, OBJECT) | Macro-F1: 0.759, Acc: 97.3% |
| **HTR** | `netz_htr.onnx` | ~7.38 MB | `strokes`: `[B, T, 8]` | `logits`: `[B, T, 78]` | `netz_htr_vocab.json` (77 chars, index 0 = CTC Blank) | CER: 4.5%, WER: 17.5% |
| **HMER** | `netz_hmer.onnx` | ~28.4 MB | `strokes`: `[B, T, 8]`, `tgt_tokens`: `[B, L]` | `logits`: `[B, L, 232]` | `netz_hmer_vocab.json` (232 LaTeX tokens: pad=0, sos=1, eos=2, unk=3) | ExpRate: 53.6%, Token Error: 8.1% |

### Canonical 8D Feature Vector Representation
All three models consume identical feature vectors per stroke point:
$$\mathbf{f}_i = [x_n, y_n, \Delta x, \Delta y, \min(10 \cdot \Delta t, 1.0), \text{stroke\_end}, \text{stroke\_start}, \min(\text{speed} / 5.0, 1.0)]$$

- **Normalization Modes**:
  - `scale_mode = 'max'`: Divided by $\max(W, H, 10^{-6})$ (Router, HMER).
  - `scale_mode = 'height'`: Divided by $\max(H, 0.03 \cdot W, 10^{-6})$ (HTR text lines).
- **Subsampling & Interpolation**: When total point count $N > \text{max\_len}$, points are deterministically subsampled:
  $$\text{idx}_k = \left\lfloor \frac{k \cdot (N - 1)}{\text{max\_len} - 1} + 0.5 \right\rfloor$$
- **Verification Harness**: Validated against `netz_*_feature_test.json` to ensure zero drift between Python training and Web Worker runtime.

---

## 4. Pure Heuristic Mathematical Structure Engine (No If-Else)

Rather than rigid rules, all spatial layout determinations are calculated using **continuous geometric scoring functions**:

### 4.1 Horizontal Vinculum (Fraction Bar) Heuristic
A stroke $s$ is evaluated as a candidate fraction vinculum using a continuous vinculum energy metric:
$$E_{\text{vinculum}}(s) = \left(1 - \frac{H_s}{W_s}\right) \cdot \exp\left(-\frac{|\theta_s|^2}{2 \sigma_\theta^2}\right) \cdot \frac{W_s}{\text{Span}_X(\mathcal{C})}$$
Where:
- $H_s, W_s$ are stroke height and width (horizontal lines have $H_s \ll W_s$).
- $\theta_s$ is stroke principal angle variance from horizontal ($0^\circ$).
- $\text{Span}_X(\mathcal{C})$ is the cluster's horizontal width.

Given a vinculum line $V$, all remaining symbols $k$ are partitioned into Numerator $\mathcal{N}$ and Denominator $\mathcal{D}$ using continuous signed vertical distance from the vinculum line:
$$d_{\text{rel}}(k, V) = \frac{Y_{\text{center}}(k) - Y_V}{H_k}$$
- $\mathcal{N} = \{k \mid d_{\text{rel}}(k, V) < -\epsilon \text{ and } \text{Overlap}_X(k, V) > 0.4\}$
- $\mathcal{D} = \{k \mid d_{\text{rel}}(k, V) > +\epsilon \text{ and } \text{Overlap}_X(k, V) > 0.4\}$

### 4.2 Superscript & Subscript Continuous Affinity Kernel
For any two horizontally neighboring symbol bounding boxes $A$ and $B$, their relative spatial affinity for exponentiation or index subscription is modeled by a 2D Gaussian Kernel over relative scale and relative vertical baseline shift:

$$\text{Affinity}_{\text{super}}(A, B) = \exp\left( -\frac{(y_{\text{base}}(A) - y_{\text{base}}(B) - \mu_{\text{super}} \cdot h_A)^2}{2 \sigma_y^2} \right) \cdot \exp\left( -\frac{(s_B/s_A - \mu_{\text{scale}})^2}{2 \sigma_s^2} \right) \cdot \max\left(0, 1 - \frac{\Delta x_{AB}}{w_A}\right)$$

Where:
- $\mu_{\text{super}} \approx 0.45$ (expected superscript baseline rise ratio).
- $\mu_{\text{scale}} \approx 0.65$ (expected script scale reduction ratio).
- $\Delta x_{AB}$ is horizontal proximity between $A$'s right edge and $B$'s left edge.

The script role is selected by the maximum continuous affinity:
$$\arg\max_{R \in \{\text{Inline}, \text{Superscript}, \text{Subscript}\}} [\text{Affinity}_R(A, B)]$$

### 4.3 Radical (Square Root) Envelopment Heuristic
A radical $\sqrt{\phantom{x}}$ is detected by:
1. An initial hook-and-down stroke followed by a top horizontal vinculum bar.
2. The argument containment is scored by horizontal overlap and vertical containment within the radical bounding envelope:
   $$\text{Score}_{\text{rad\_arg}}(k, \text{Rad}) = \frac{\text{Area}(\text{Box}_k \cap \text{Rad}_{\text{interior}})}{\text{Area}(\text{Box}_k)}$$
All symbols with $\text{Score}_{\text{rad\_arg}} > 0.6$ are assigned to the radicand subtree.

### 4.4 Matrix & Multi-Line Alignment via Projection Histograms
Grid layouts are extracted by calculating the 1D continuous horizontal and vertical point projection profiles:
$$P_X(x) = \sum_{p \in \text{Points}} \exp\left(-\frac{(x - p_x)^2}{2\sigma^2}\right), \quad P_Y(y) = \sum_{p \in \text{Points}} \exp\left(-\frac{(y - p_y)^2}{2\sigma^2}\right)$$
- The valleys (local minima with near-zero density) in $P_X$ define column boundaries.
- The valleys in $P_Y$ define row boundaries.
- Continuous spatial clustering maps symbols to cell coordinates $(r, c)$ without arbitrary thresholds.

---

## 5. Detailed Implementation Blueprint & File Architecture

```text
Netz/src/app/
├── (Primary.pages)/Playground/
│   ├── components/
│   │   ├── LiveMathPreviewOverlay.js      <-- [Enhanced] Confidence indicators & Soft Editor trigger
│   │   ├── SoftEditorModal.js             <-- [NEW] Interactive candidate correction & AST tree inspector
│   │   ├── SemanticLassoModal.js          <-- [NEW] "What is this?" semantic re-tagger
│   │   ├── PlaygroundCanvasContainer.js   <-- [Updated] Recognition pipeline wiring
│   │   └── WhiteboardCanvas.js            <-- [Updated] Canonical stroke caching & ID tracking
│   │
│   └── utils/
│       ├── recognition/
│       │   ├── canonicalFeatures.js       <-- [NEW] 8D feature extraction + test parity harness
│       │   ├── recognitionWorker.js       <-- [NEW] Dedicated Web Worker (ONNX Runtime Web WebGPU/WASM)
│       │   ├── modelManager.js            <-- [NEW] Lazy loader, CacheStorage cache, ONNX sessions
│       │   ├── htrDecoder.js              <-- [NEW] CTC Greedy / Beam search over netz_htr_vocab
│       │   ├── hmerDecoder.js             <-- [NEW] Autoregressive greedy/beam decoder over netz_hmer_vocab
│       │   ├── heuristicStructureEngine.js<-- [NEW] Continuous math layout heuristics (no if-else)
│       │   ├── candidateEngine.js         <-- [NEW] Continuous scoring multi-hypothesis generator
│       │   ├── semanticValidator.js       <-- [NEW] MathAST / KaTeX syntax validation
│       │   └── telemetryStore.js          <-- [NEW] Local IndexedDB corrections & stroke dataset capture
│       │
│       ├── handwritingOCR.js              <-- [Refactored] Routes to recognitionWorker pipeline
│       └── localOCRService.js             <-- [Retained/Fallback] Legacy fallback bridge
```

---

## 6. Phase-by-Phase Execution Plan

### Phase 1: Feature Extractor & Numerical Parity Validation (Days 1–3)
- **File**: `src/app/(Primary.pages)/Playground/utils/recognition/canonicalFeatures.js`
- **Objective**: Implement `extractCanonicalFeatures(strokes, maxLen, scaleMode)` matching `train_router.ipynb` and `train_htr.ipynb`.
- **Validation**: Implement automated unit test comparing outputs against `public/models/netz_router_feature_test.json`, `netz_htr_feature_test.json`, and `netz_hmer_feature_test.json` to ensure max difference $< 10^{-4}$.

### Phase 2: Web Worker & ONNX Runtime Web Pipeline (Days 4–7)
- **Dependencies**: Add `onnxruntime-web` to `package.json`.
- **Files**:
  - `src/app/(Primary.pages)/Playground/utils/recognition/recognitionWorker.js`
  - `src/app/(Primary.pages)/Playground/utils/recognition/modelManager.js`
- **Execution Providers**:
  - Preferred: `webgpu` (with float32 tensor allocation and GPU IO binding where available).
  - Fallback: `wasm` (with SIMD enabled and multithreading where SharedArrayBuffer is active).
- **Asset Caching**: Use the `Cache` API (`caches.open('netz-models-v1')`) to store `netz_*.onnx` and avoid repeated multi-megabyte downloads.

### Phase 3: Model Inference & Decoding Pipeline (Days 8–11)
- **Router Execution**:
  - Run `netz_router.onnx`.
  - Apply softmax over active classes (`TEXT`, `NUMBER`, `MATH`, `OBJECT`).
  - Compute routing decision with entropy-based confidence.
- **HTR Execution** (`htrDecoder.js`):
  - Run `netz_htr.onnx`.
  - Greedy CTC decode: collapse duplicate consecutive characters, skip CTC blank (`index === 0`).
  - Map indices to `netz_htr_vocab.json`.
- **HMER Execution** (`hmerDecoder.js`):
  - Autoregressive inference on `netz_hmer.onnx` (`strokes` + `tgt_tokens`).
  - Initialize with `[sos]`, run step-by-step autoregression until `[eos]` or `max_tgt = 160`.
  - Map indices to `netz_hmer_vocab.json` tokens, assembling verified LaTeX strings.

### Phase 4: Pure Heuristic Structure Engine & Semantic Validator (Days 12–16)
- **Files**:
  - `src/app/(Primary.pages)/Playground/utils/recognition/heuristicStructureEngine.js`
  - `src/app/(Primary.pages)/Playground/utils/recognition/candidateEngine.js`
  - `src/app/(Primary.pages)/Playground/utils/recognition/semanticValidator.js`
- **Implementation**:
  - Continuous vinculum detection and fraction partitioning.
  - Superscript/subscript continuous Gaussian affinity kernels.
  - Radical root convex envelopment calculation.
  - Matrix column/row histogram valley segmentation.
  - MathAST syntax check: Parse generated LaTeX with `mathjs` and `katex`. Discard malformed syntax without throwing; assign syntax coherence score $C_{\text{syntax}} \in [0, 1]$.

### Phase 5: Soft Editor, Semantic Lasso & Interactive UI (Days 17–20)
- **Files**:
  - `src/app/(Primary.pages)/Playground/components/SoftEditorModal.js`
  - `src/app/(Primary.pages)/Playground/components/SemanticLassoModal.js`
  - `src/app/(Primary.pages)/Playground/components/LiveMathPreviewOverlay.js`
- **Features**:
  - Floating pill displays overall confidence: High (green), Medium (amber), Low (red).
  - Clicking an ambiguous result opens the Soft Editor showing top-3 alternatives and structured component breakdown (e.g. Numerator vs Denominator).
  - Lasso selection provides explicit semantic tagging (`TEXT`, `NUMBER`, `MATH`, `EQUATION`, `OBJECT`) to bypass ambiguity immediately.
  - Converted `EquationBlock`s permanently retain `sourceStrokeIds` so original raw handwriting can always be restored.

### Phase 6: Local Correction Dataset & Privacy Flywheel (Days 21–24)
- **File**: `src/app/(Primary.pages)/Playground/utils/recognition/telemetryStore.js`
- **Storage**: IndexedDB store `netz_corrections`.
- **Record Schema**:
  ```json
  {
    "id": "corr_1710000000_abc",
    "timestamp": 1710000000,
    "modelVersions": { "router": "v1", "htr": "v1", "hmer": "v1" },
    "strokes": [[{"x": 10, "y": 20, "t": 100}, "..."]],
    "predictedValue": "x2",
    "predictedAst": "...",
    "userCorrectedValue": "x^2",
    "userAssignedType": "MATH",
    "confidenceScores": { "recognition": 0.54, "structure": 0.42 }
  }
  ```
- **Privacy Policy**: 100% on-device by default. Opt-in export for model fine-tuning.

---

## 7. Acceptance Criteria & Quality Gates

1. **Parity Check**: `canonicalFeatures.js` achieves $100\%$ numerical match against `netz_*_feature_test.json` within $10^{-4}$ tolerance.
2. **Main Thread Protection**: Canvas drawing maintains 60–120 FPS; all ONNX inference and decoding executes asynchronously in Web Worker without freezing UI.
3. **No If-Else Structure Logic**: Zero hardcoded character-to-coordinate switch statements; mathematical layout is determined exclusively via continuous spatial affinity metrics, projection profiles, and AST verification.
4. **Offline Capability**: After first load, disconnection of internet allows 100% functional recognition, drawing, soft-editing, and conversion via PWA Service Worker and Cache Storage.
5. **Canonical Ink Safety**: Converting ink to an equation and restoring it returns identical stroke coordinates and timestamps.
