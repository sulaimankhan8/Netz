# NETZ — Offline Handwriting Recognition Upgrade Plan (Google Digital Ink Level)

> **Document Status**: Production Architecture & Engineering Specification  
> **Objective**: Upgrade the NETZ offline handwriting recognition engine from pixel-based OCR (Tesseract) to on-device **Vector Stroke Sequence AI (`onnxruntime-web`)** to achieve **~98% accuracy on messy cursive and mathematical notation**, running **100% offline with zero server calls**.

---

## 1. Problem Diagnosis & Architectural Shift

### Why the Current Offline Engine (Tesseract) Struggles with Cursive
| Parameter | Current Offline Engine (Tesseract WASM) | Target Engine (On-Device Vector AI) |
| :--- | :--- | :--- |
| **Input Format** | Static 2D raster bitmap (PNG image) | Temporal vector stroke trajectory $(x, y, \Delta t, \theta)$ |
| **Cursive Handling** | Slices pixels vertically; fails when cursive letters connect and overlap | Tracks pen movement direction and stroke sequence; ignores pixel bleeding |
| **Math Operators** | Confuses loops ($l$ vs $1$, $S$ vs $5$, $\alpha$ vs $a$) | Distinguishes symbols by stroke order and curvature ($< 2\%$ error) |
| **Inference Latency** | $300\text{ ms} - 800\text{ ms}$ | **$25\text{ ms} - 45\text{ ms}$ (Real-time)** |
| **Model Size** | $\sim 15\text{ MB}$ WASM + language traineddata | **$\sim 2.8\text{ MB}$ Quantized INT8 ONNX** |
| **Network Dependency** | Offline | **100% Offline (Cached in IndexedDB)** |

---

## 2. Core Architecture: On-Device Vector AI Pipeline

```
[User Writes on Canvas with Stylus / Finger]
                      │
                      ▼
   [Stroke Trajectory Capture & Smoothing]
     Points: [{ x, y, timestamp, pressure }]
                      │
                      ▼
   [Spatial Arc-Length Resampling & Normalization]
     - Resample to equidistant 5px steps
     - Compute: [Δx, Δy, Δt, cos θ, sin θ, pen_lift]
     - Scale bounding box to [-1, 1] range
                      │
                      ▼
   [WebWorker: strokeVectorWorker.js]
     - onnxruntime-web (WASM + SIMD)
     - Quantized BiGRU-CTC Vector Model (~2.8 MB)
     - Inference Latency: ~30ms
                      │
                      ▼
   [CTC Beam Search Decoder + Math Symbol Lexicon]
     - Token-to-Character mapping (Latin + Greek + Operators)
     - Mathematical syntax formatter (x2 -> x^2, sqrt -> \sqrt{})
                      │
                      ▼
   [LiveMathPreviewOverlay & Auto-Convert]
     - Displays KaTeX rendered pill beside stroke cluster
     - 1-Click "Convert to EquationBlock"
```

---

## 3. Detailed Component Specifications

### 3.1 Stroke Normalization & Feature Extraction (`strokePreprocessor.js`)
Raw screen strokes vary based on device resolution and user speed. The preprocessor standardizes strokes into an invariant 6-dimensional feature vector per point:

```javascript
// Each point represented as: [dx, dy, dt, cos_theta, sin_theta, pen_up_flag]
export function extractStrokeFeatures(rawStrokes, targetBBox) {
  // 1. Resample points along trajectory by arc length (inter-point distance = 5px)
  const resampled = resampleEquidistant(rawStrokes, 5.0);

  // 2. Normalize coordinates relative to bounding box height (preserves aspect ratio)
  const normalized = normalizeScale(resampled, targetBBox);

  // 3. Compute directional derivatives and angular velocities
  const featureVector = [];
  for (let i = 1; i < normalized.length; i++) {
    const pPrev = normalized[i - 1];
    const pCurr = normalized[i];
    const dx = pCurr.x - pPrev.x;
    const dy = pCurr.y - pPrev.y;
    const dt = Math.min((pCurr.t - pPrev.t) / 1000, 0.5); // Normalized time delta
    const angle = Math.atan2(dy, dx);
    const penLift = pCurr.isEndOfStroke ? 1.0 : 0.0;

    featureVector.push([dx, dy, dt, Math.cos(angle), Math.sin(angle), penLift]);
  }

  return Float32Array.from(featureVector.flat());
}
```

---

### 3.2 On-Device Vector ONNX Model (`strokeVectorWorker.js`)
* **Framework**: `onnxruntime-web` (WebAssembly execution with multi-threading and SIMD vector acceleration).
* **Model Architecture**:
  * Input: `[BatchSize, SequenceLength, 6]` (Feature tensor).
  * Backbone: 2-layer Bidirectional GRU (Hidden dimension: 128).
  * Output: Softmax distribution over 118 classes (ASCII letters, digits, Greek alphabet $\alpha, \beta, \gamma, \theta, \pi, \sigma$, and mathematical operators $+ , - , \times , \div , = , \int , \sum , \sqrt{} , \partial$).
* **Model Storage & Caching**:
  * Model file: `/public/models/stroke_recognizer_int8.onnx` ($\approx 2.8\text{ MB}$).
  * On initial app load, the service worker caches the `.onnx` binary in browser `CacheStorage` / `IndexedDB`.
  * Subsequent loads run **instantly from local disk without hitting the network**.

---

### 3.3 CTC Beam Search Decoder (`ctcDecoder.js`)
Translates the neural network's per-frame probability distribution into recognized character sequences:
* **Beam Search (Width = 5)**: Evaluates the top-5 likely transcription paths.
* **Math N-Gram Language Model**: Favors common mathematical sequences (e.g., $x^2$, $\sin(x)$, $\frac{d}{dx}$) over arbitrary random character combinations.
* **Blank Token Collapsing**: Removes duplicate CTC predictions and resolves pen-lift boundaries.

---

### 3.4 Math Syntax Post-Processor & LaTeX Formatter
Converts the raw recognized string into standard KaTeX notation:
* **Exponents & Indices**: `x2` $\rightarrow$ `x^2`, `x0` $\rightarrow$ `x_0`, `sin2x` $\rightarrow$ `\sin^2(x)`.
* **Fractions**: Auto-groups numerator and denominator separated by `/` into `\frac{a}{b}`.
* **Square Roots**: Normalizes `sqrt(expr)` into `\sqrt{expr}`.
* **Greek Symbols**: Replaces detected letter names (`alpha`, `theta`) with `\alpha`, `\theta`.

---

## 4. Multi-Tier Hybrid Fallback Architecture

To ensure 100% reliability under all scenarios, the recognition engine in `localOCRService.js` is structured into three tiers:

```
                          Incoming Recognition Request
                                       │
                    Is it a live drawn stroke cluster?
                                ├── YES ──► [Tier 1: Stroke Vector ONNX Engine]
                                │           - Latency: < 40ms
                                │           - Accuracy: ~98% (Messy cursive & math)
                                │           - 100% Offline (Local WASM)
                                │
                                └── NO (Camera photo / pasted textbook screenshot)
                                       │
                                       ▼
                                [Tier 2: Tesseract.js WASM Engine]
                                - Latency: ~500ms
                                - Optimized with PSM.RAW_LINE + Otsu Contrast
                                - 100% Offline
```

---

## 5. File-by-File Implementation Roadmap

| Step | Target File | Action |
| :---: | :--- | :--- |
| **1** | `package.json` | Install `onnxruntime-web` for browser WebAssembly AI inference. |
| **2** | `public/models/stroke_recognizer_int8.onnx` | Place the lightweight ($2.8\text{ MB}$) quantized on-device handwriting model. |
| **3** | `src/app/(Primary.pages)/Playground/utils/strokePreprocessor.js` | Implement equidistant arc-length resampling and 6D feature vector normalization. |
| **4** | `src/app/(Primary.pages)/Playground/utils/ctcDecoder.js` | Implement the CTC beam search decoder with math symbol vocab. |
| **5** | `src/app/utils/workers/strokeVectorWorker.js` | Create the dedicated Web Worker running `ort.InferenceSession` in background thread. |
| **6** | `src/app/(Primary.pages)/Playground/utils/localOCRService.js` | Upgrade `recognizeStrokes` to route vector strokes directly through Tier 1 ONNX engine. |
| **7** | `src/app/(Primary.pages)/Playground/components/LiveMathPreviewOverlay.js` | Verify floating preview latency drops from $800\text{ms}$ to $< 50\text{ms}$ with zero network activity. |

---

## 6. Verification & Quality Benchmark Protocol

1. **Messy Cursive Test**:
   * Write *"continuous function"* and *"differential equation"* in connected cursive with no inter-character pauses.
   * Target: $\ge 96\%$ word accuracy without letter misidentification.
2. **Mathematical Notation Test**:
   * Write: $y = x^2 - 4x + 3$, $\int_0^1 x dx$, $\sin(\theta) + \cos(\theta) = 1$.
   * Target: $100\%$ character accuracy and correct KaTeX formatting.
3. **Network Disconnection Test (Air-Gapped)**:
   * Turn off Wi-Fi completely (Airplane mode).
   * Draw on the canvas $\rightarrow$ verify recognition succeeds in $< 50\text{ ms}$ with zero network errors in console.
4. **Memory & Performance Benchmark**:
   * Verify memory footprint in Chrome Task Manager remains $< 35\text{ MB}$ additional RAM.
   * Verify main UI thread runs at a locked **$60\text{ FPS}$** during simultaneous drawing and recognition.
