# NETZ Text Handwriting Model: From-Scratch Plan (v2)

**Goal:** a new, much faster `netz_htr.onnx`, trained on public stroke datasets, with no handwriting collection needed.

**Fixed decisions (owner, 2026-10-25)**
- No in-app collection. Training uses public online-handwriting datasets only.
- NETZ counts as an educational, non-commercial app for dataset licences, so non-commercial datasets are allowed.
- Speed comes first: the model must run in a few milliseconds per line.
- The maths model (`netz_hmer.*`), the router model and `canonicalFeatures.js` stay as they are.
- Training runs on a free Kaggle GPU. The owner runs the notebook (and quantizes, if wanted); Claude writes all the code.

---

## 1. Data: two public datasets, both checked and downloadable on 2026-10-25

| Dataset | Lines | Writers | Download | Format | Timing data |
|---|---|---|---|---|---|
| **DeepWriting** (ETH Zürich): IAM-OnDB cleaned, plus 94 extra writers | 34,577 train + 705 val | 294 | Direct zip, 52 MB: `https://files.ait.ethz.ch/projects/deepwriting/deepwriting_dataset.zip` | `.npz`: `strokes` (dx, dy, pen-up), `texts`, `subject_labels` (writer) | No |
| **BRUSH** (Brown University), refined version | 27,649 | 170 | Google Drive, 567 MB (link in `github.com/brownvc/decoupled-style-descriptors`) | One pickle per sample: sentence, (x, y, end-of-stroke) points | Implied only (10 ms resampling) |
| **Total** | **≈ 62,000** | **464** | | | |

- **IAM-OnDB itself isn't needed.** DeepWriting already contains its strokes, cleaned. Its site still refuses connections anyway.
- **DeepWriting checked locally:** about 261 points and 30 characters per line on average (max 489 points). Its alphabet is `a–z A–Z 0–9 ' . , - ( ) /`. BRUSH adds more punctuation.
- **BRUSH pickles can run code when loaded.** Load them only inside the Kaggle notebook, never on the dev PC.

**Splits, by writer (no writer appears in two splits):**
- Test: 30 DeepWriting writers + 15 BRUSH writers, fixed by a seeded list stored in the notebook.
- Validation: 5% of the remaining writers.
- Train: everyone else.

## 2. New feature format, `htr_v2` (no timing)

Neither dataset has reliable timestamps, so the new model uses shape only. This also makes it independent of the device's touch sample rate (60 Hz phone vs 240 Hz pencil).

Pipeline, identical in Python and JavaScript:
1. Join strokes; record stroke start and end.
2. **Normalize height:** scale so the 5th–95th percentile y-range equals 1.0.
3. **Resample at equal spacing:** one point every 0.05 line-heights along the pen path. This sets T no matter how fast or how many raw points were drawn, and is the main speed fix.
4. **Make it smoother:** 3-point moving average.
5. **8 features per point:**

| # | Feature | Meaning |
|---|---|---|
| 0 | `x` | x minus the line's starting x (height units) |
| 1 | `y` | y minus the line's median y |
| 2 | `dx` | step in x |
| 3 | `dy` | step in y |
| 4 | `cos` | direction of travel, cosine |
| 5 | `sin` | direction of travel, sine |
| 6 | `stroke_start` | 1 at a stroke's first point |
| 7 | `stroke_end` | 1 at a stroke's last point |

- New JS file: `utils/recognition/htrFeaturesV2.js`. The Python copy goes in the notebook.
- **Parity test:** the notebook writes `netz_htr_v2_feature_test.json`; a new `test_htr_features_v2.mjs` must match it within 1e-4.
- `netz_htr_meta.json` gets `"feature_version": "htr_v2"`. `modelManager.js` picks the extractor from that field, so the old model still works until the files are swapped.

## 3. Model: `NetzHTR-Fast`, fully convolutional (no RNN)

The current model is a 3-layer BiGRU (7.4 MB). RNNs run one time-step after another, which is slow in the browser. A convolution-only CTC model (the same idea as QuartzNet in speech recognition) runs all positions at once.

```
Input  [1, T, 8]
Conv1d 8 → 192, k=5, stride 2, BatchNorm, GELU                      (T/2)
10 × separable blocks:
     depthwise Conv1d k=9 → pointwise 192 → 192, BatchNorm, GELU, residual, dropout 0.1
     block 3 has stride 2                                           (T/4)
Conv1d 192 → 256, k=1, GELU
Conv1d 256 → 78, k=1  → log-softmax                                  (CTC, blank = 0)
Output [1, T/4, 78]
```

- About 0.5M parameters: about 2 MB in fp32, about 0.6 MB in int8.
- Receptive field: about 360 input points, roughly 10 characters of context.
- A typical line (30 characters, about 600 resampled points) gives 150 output frames, well above CTC's minimum of about 60.
- Same 77-character vocab and the same `strokes` → `logits` names as today, so `htrDecoder.js` still works.

## 4. Training notebook `train_htr_v003.ipynb` (Claude writes it)

Sections, in the same style as `train_htr.ipynb` (hard stop if a dataset is missing):

1. Setup + config
2. Load DeepWriting (`.npz`: undo its normalization with the stored mean and std, then cumulative sum → absolute points)
3. Load BRUSH (pickles → points + stroke ends)
4. Clean text to the vocab; drop lines with out-of-vocab characters or under 3 characters
5. Writer splits (seeded, saved to `splits.json`)
6. `htr_v2` features + parity test vector export
7. Augmentation (training only, random each pass):
   - slant ±15°
   - scale 0.85–1.15
   - x-stretch 0.85–1.15
   - rotation ±3°
   - point jitter 0.5% of height
   - resample spacing 0.04–0.06
   - random baseline drift
8. Model + parameter count
9. Training:

| Setting | Value |
|---|---|
| Loss | CTC (`zero_infinity=True`) |
| Optimizer | AdamW, lr 2e-3, weight decay 1e-2 |
| Schedule | OneCycle, 5% warm-up |
| Batch | 64, grouped by length |
| Epochs | up to 120; early stop after 15 with no improvement in validation character error |
| Other | mixed precision (AMP), gradient clip 5.0 |
| Expected time | about 1.5–3 hours on a T4 |

10. Test-set results: character error and word error, overall and per dataset
11. Export:
    - `netz_htr_v003.pt` (full checkpoint; keep it for later fine-tuning)
    - `netz_htr.onnx`: opset 17, dynamic T, checked against PyTorch with largest difference under 1e-4
    - `netz_htr_vocab.json`, `netz_htr_meta.json`
    - `netz_htr_v2_feature_test.json`
    - Speed check: onnxruntime CPU, one thread, T = 600, reported in the meta file

**Optional quantization (owner):** `onnxruntime.quantization.quantize_static` with QDQ format and about 500 training lines for calibration. Expect 2–3× faster and a 4× smaller file. Re-run the gate in section 6 afterwards.

## 5. App changes (Claude)

| File | Change |
|---|---|
| `utils/recognition/htrFeaturesV2.js` | New: resample + 8 shape features |
| `test_htr_features_v2.mjs` | New: parity test against the notebook's vectors |
| `utils/recognition/modelManager.js` | Choose the extractor from `meta.feature_version` |
| `utils/recognition/htrDecoder.js` | Add `decodeHTRBeam()`: CTC prefix beam search, width 8, with a word-list bonus. Greedy stays as the fallback |
| `public/models/netz_htr_words.json` | New: about 50k English words (SCOWL) + about 2k NETZ terms (algorithms, numerical methods, CS words), about 150 KB gzipped |
| `scripts/htr_gate.mjs` | New: speed and accuracy comparison of old vs new model |

Beam search can ship first. It also improves the current model.

## 6. Ship gate (`scripts/htr_gate.mjs`, run on this PC)

Runs on the 45 held-out test writers, exported by the notebook as `htr_test_set.jsonl`.

| Check | Target |
|---|---|
| Speed, this PC, one wasm thread, 30-character line | ≤ 5 ms (current model: 21–44 ms) |
| Speed, mid-range phone | ≤ 30 ms |
| Character error, greedy | ≤ 7% |
| Word error, with beam search | ≤ 18% |
| Model file | ≤ 3 MB fp32 |

The current model's speed on this PC (measured 2026-10-25): 7.4 MB, 12.9 ms at T=128, 21.3 ms at T=256, 43.5 ms at T=512, 81.6 ms at T=1024.

If accuracy misses the target, raise the width to 256 channels and 12 blocks (still about 1M parameters and under 10 ms), then retrain. If speed misses it, cut to 8 blocks.

---

## Order

| # | Work | Who |
|---|---|---|
| 1 | `htrFeaturesV2.js` + parity test + `modelManager` switch | Claude |
| 2 | Beam search + word list (ships with the current model) | Claude |
| 3 | `train_htr_v003.ipynb` | Claude |
| 4 | Upload DeepWriting + BRUSH as a private Kaggle dataset, run the notebook | Owner |
| 5 | Copy the 4 output files into `public/models/` | Owner |
| 6 | `htr_gate.mjs`, run it, report | Claude |
