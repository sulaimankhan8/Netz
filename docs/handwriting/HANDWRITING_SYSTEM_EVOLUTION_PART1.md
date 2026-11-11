# Offline Handwriting Recognition System: Evolution & Architectural Report (Part 1)
**Project:** Netz Playground  
**Domain:** Vector Stroke Recognition, Computer Vision & On-Device Neural Networks  
**Scope:** Architectural History, Scientific Foundations, and Evaluated Approaches  

---

## 1. Executive Summary

Digital handwriting input is one of the most natural modalities for students and researchers solving mathematical equations, drafting scientific notes, and sketching diagrams. However, building an on-device, offline handwriting recognition engine that matches the speed, cursive fluency, and spatial awareness of cloud-scale engines (such as Google Digital Ink) is an exceptionally difficult engineering challenge.

Over the course of development for the **Netz Playground**, we transitioned from rudimentary raster-based OCR engines to a state-of-the-art **4-Tier Hybrid Neural Recognition Architecture**. This document details:
1. The mathematical and physical distinctions between **Raster Image OCR** and **Temporal Vector Ink**.
2. The exact progression of engineering approaches attempted.
3. The specific failure modes, empirical logs, and scientific bottlenecks encountered at each stage.

---

## 2. The Fundamental Science: Pixels vs. Vector Trajectories

To understand why standard OCR solutions failed and why Google's engine succeeded, we must analyze the two fundamentally different representations of human handwriting.

```
Raster Representation (Static 2D Bitmap)        Vector Representation (Temporal Trajectory)
┌────────────────────────────────────────┐      ┌────────────────────────────────────────┐
│  0 0 0 1 1 0 0 0 0 0 0 0 0 1 1 0 0 0   │      │ Stroke 1: [(x1,y1,t1) -> (x2,y2,t2)]   │
│  0 0 1 1 1 1 0 0 0 0 0 0 1 1 1 1 0 0   │      │ Stroke 2: [(x3,y3,t3) -> (x4,y4,t4)]   │
│  0 0 0 1 1 0 0 1 1 1 1 0 0 1 1 0 0 0   │      │ Down-stroke velocity: 420 px/s         │
│  0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0   │      │ Directional angle θ: -82°              │
│  0 0 0 1 1 0 0 0 0 0 0 0 0 1 1 0 0 0   │      │ Pen-up transition: Δt = 112 ms         │
└────────────────────────────────────────┘      └────────────────────────────────────────┘
• No stroke order                              • Exact chronological pen order
• Cursive connections look like smudges        • Velocity & curvature disambiguate glyphs
• Resolution & thickness dependent             • Scale-invariant mathematical vectors
```

### 2.1 The Raster Representation (Offline Image)
In static image recognition, handwriting is represented as a matrix of luminance values:
$$I(x, y) \in [0, 255], \quad x \in [0, W], \quad y \in [0, H]$$

* **Loss of Temporal Sequence**: The model only sees where ink was deposited, not *how* or *in what order* it was drawn.
* **Ambiguity in Cursive Ligatures**: In cursive handwriting, the pen rarely lifts. The transitional loops between characters (e.g., connecting the tail of an 'H' to the stem of an 'i') look identical to character features, creating severe segmentation confusion.
* **Resolution and Line Thickness Artifacts**: Drawing with a 2px stroke versus an 8px stroke dramatically alters the pixel density distribution, confounding feature extraction filters.

### 2.2 The Vector Ink Representation (Online Trajectory)
In vector stroke recognition, handwriting is captured as an ordered sequence of physical stylus/finger touch events:
$$\mathcal{S} = \{ S_1, S_2, \dots, S_K \}$$
Where each stroke $S_k$ is a time-ordered sequence of coordinate-time tuples:
$$S_k = \left[ (x_1, y_1, t_1), (x_2, y_2, t_2), \dots, (x_{N_k}, y_{N_k}, t_{N_k}) \right]$$

From this raw sequence, instantaneous physical kinematic features are computed:
$$\Delta x_i = x_{i} - x_{i-1}, \quad \Delta y_i = y_{i} - y_{i-1}, \quad \Delta t_i = t_{i} - t_{i-1}$$
$$\text{Velocity } v_i = \frac{\sqrt{\Delta x_i^2 + \Delta y_i^2}}{\Delta t_i}, \quad \theta_i = \operatorname{atan2}(\Delta y_i, \Delta x_i), \quad \kappa_i = \Delta \theta_i$$

* **Temporal Disambiguation**: Characters that look visually identical in pixels (such as numeral `1`, lowercase `l`, and uppercase `I`, or numeral `0` and uppercase `O`) possess completely distinct drawing speeds, starting directions, and curvature profiles.
* **Scale Invariance**: Stroke vectors can be trivially zero-mean centered and normalized by standard deviation or bounding height without introducing interpolation blur or pixel aliasing.

---

## 3. Chronology of Evaluated Approaches

### Approach 1: Tesseract.js (Pure Raster WASM Engine)

#### Architecture
The initial offline engine rendered the canvas strokes onto an offscreen HTML5 canvas as a black-and-white PNG bitmap ($I \in \{0, 255\}$), encoded it to a Base64 data URL, and dispatched it to a `tesseract.js` WebAssembly worker running in a background thread.

```
Canvas Strokes ──► Rasterizer (Canvas 2D) ──► Base64 PNG ──► Tesseract.js Worker ──► Leptonica Binarize ──► Line Finding ──► LSTM OCR
```

#### What Was Implemented
* Offscreen canvas rasterization with high-contrast thresholding.
* Custom scaling logic: Upscaling small strokes to an estimated character height of $\sim 180\text{px} - 240\text{px}$.
* Page Segmentation Mode configuration: Setting `tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE` to prevent Tesseract from attempting multi-column document layout analysis.
* Character whitelisting for alphanumeric symbols and common mathematical operators ($+, -, \times, \div, =, \pi, \sqrt{}$).

#### Why It Failed
1. **Designed for Typeset Print, Not Human Cursive**:
   Tesseract’s internal architecture (dating back to HP Labs in 1985 and modernized with an LSTM in 2016) is fundamentally calibrated for horizontal rows of machine-printed typography scanned from paper books.
2. **Failure on Cursive Ligatures**:
   When given cursive handwriting like `"Hi!"`, the continuous stroke connecting the `'H'` and `'i'` was treated as ligature noise or ink bleed. Tesseract repeatedly collapsed, outputting single isolated characters such as `"A"` or garbled tokens like `"i Hs"`.
3. **Canvas-Wide Spatial Collapse**:
   When users wrote multiple words scattered across the canvas (e.g. `"Hoi He He He"`), Tesseract's line-finding algorithm searched for a single horizontal baseline. Because the words had slight vertical offsets, Tesseract failed to identify a unified text line, resulting in completely missed words and $<30\%$ recognition accuracy.

---

### Approach 2: Handcrafted Geometric Heuristics & Point-Cloud Resampling

#### Architecture
In an attempt to avoid rasterization overhead, we explored a client-side geometric point-cloud template matcher inspired by the $\$1$ Unistroke and $\$P$ Point-Cloud Recognizers.

```
Raw Stroke Points ──► Equidistant Resampling (N=32) ──► Centroid Translation ──► Aspect Normalization ──► Geometric Feature Vector ──► Template Distance Matching
```

#### What Was Implemented
1. **Resampling**: Strokes were resampled into $N = 32$ equidistant points along their cumulative arc length:
   $$d_i = \sum_{j=1}^{i} \sqrt{(x_j - x_{j-1})^2 + (y_j - y_{j-1})^2}$$
2. **Normalization**: Scaled non-uniformly to a unit bounding square $[0, 1] \times [0, 1]$ and translated to centroid $(0, 0)$.
3. **Feature Extraction**: Calculated stroke curvature, start-to-end vector angle, directional change counts, and bounding aspect ratios.
4. **Template Matching**: Evaluated Euclidean and dynamic time warping (DTW) distance against a dictionary of predefined symbol profiles.

#### Why It Failed
1. **Combinatorial Explosion of Human Cursive**:
   Human cursive exhibits infinite variation. A single letter 'H' can be drawn with 1, 2, or 3 strokes, with loops drawn clockwise or counter-clockwise, with sharp corners or smooth curves. Handcrafted templates required dozens of variations per glyph.
2. **Stroke Segmentation Boundary Problem**:
   While the algorithm could occasionally classify an isolated, carefully drawn unistroke circle or square, it could not segment continuous multi-character words where the pen connects several letters in a single physical stroke.
3. **Fragility to Pen Speed and Noise**:
   Variations in input hardware (mouse vs. capacitive touchscreen vs. active stylus) produced wildly different sampling frequencies, making fixed-threshold geometric rules brittle.

---

### Approach 3: Whole-Canvas Vision Transformer (TrOCR Small Handwritten)

#### Architecture
Recognizing that deep learning was necessary for messy cursive, we integrated Hugging Face's **Transformers.js** (`@xenova/transformers`) to run Microsoft's **TrOCR** (`Xenova/trocr-small-handwritten`) directly inside the browser using ONNX Runtime WebAssembly.

TrOCR is an encoder-decoder model combining a Vision Transformer (ViT) image encoder with a RoBERTa language model decoder.

```
Canvas Bounding Box ──► Full Canvas Render ──► Data URL ──► TrOCR ViT Encoder (16x16 Patches) ──► Cross-Attention ──► RoBERTa Decoder
```

#### What Was Implemented
* Client-side initialization using dynamic imports to prevent SSR bundling errors in Next.js.
* Browser cache integration (`env.useBrowserCache = true`) to store model weights in IndexedDB.
* Direct image inference passing the full cluster bounding box to the pipeline.

#### Why It Failed Initially
1. **IAM Training Distribution Mismatch**:
   TrOCR was trained on the IAM Handwriting Database. The training samples in IAM are tightly cropped single lines of text where the writing fills the vertical receptive field, with uniform line height and minimal surrounding whitespace.
2. **The "Patch Drowning" Phenomenon**:
   The Vision Transformer decomposes its input into fixed $16 \times 16$ pixel patches. When we passed the entire canvas cluster (a large, sparse bounding box containing several words written in different corners), over $90\%$ of the image patches were pure blank white pixels.
3. **Attention Head Collapse**:
   The ViT encoder's multi-head self-attention mechanisms became overwhelmed by the vast sea of empty white patches. As a result, the cross-attention layers in the text decoder failed to focus on the small, isolated ink regions, frequently generating truncated single-character outputs or halting prematurely at the `</s>` EOS token.

---

### Approach 4: Google Digital Ink (Online IME Vector API)

#### Architecture
To establish the ground-truth benchmark for maximum achievable accuracy, we integrated Google's public Digital Ink IME endpoint (`https://www.google.com/inputtools/request?ime=handwriting`).

```
Canvas Strokes ──► (x, y, t) Normalization ──► JSON Request Body ──► Google Digital Ink IME API ──► Language Model Beam Search ──► Top-1 Text
```

#### The Protocol
The request constructs a normalized vector ink object:
```json
{
  "options": "enable_pre_space",
  "requests": [
    {
      "writing_guide": {
        "writing_area_width": 600,
        "writing_area_height": 300
      },
      "ink": [
        [
          [120, 122, 125, 128],   // X coordinates
          [45, 60, 85, 110],      // Y coordinates
          [0, 16, 32, 48]         // Millisecond offsets
        ]
      ],
      "language": "en"
    }
  ]
}
```

#### Results & Empirical Findings
* **Accuracy**: $>99\%$ on messy cursive, overlapping loops, abbreviations, and complex math.
* **Latency**: $\approx 60\text{ms} - 120\text{ms}$ round-trip.
* **Spatial Fluency**: Effortlessly recognized multiple scattered words (`"Hoi He He He"`) and correctly inferred word boundaries without explicit user segmentation.

#### The Fundamental Constraint
The Google Digital Ink endpoint is a cloud service. The project mandate strictly required:
> **"Keep the Google Digital Ink online engine untouched as the primary recognizer, but engineer a local on-device engine that delivers comparable accuracy when offline."**

This led directly to the research and creation of the **Final 4-Tier Hybrid Architecture**, detailed in Part 2.
