# NETZ handwriting/maths recognition: training data, pretrained models and licences

Checked 2026-11-03. Read-only on project files. Not legal advice.

## Q1. Which training data and pretrained models do the NETZ models actually use? (local evidence)

### Takeaway
NETZ ships three in-house ONNX models trained **from scratch** in its own Kaggle notebooks. No pretrained weights and no third-party model come from GitHub or Hugging Face. The text model (`netz_htr.onnx`) was trained on **IAM-OnDB**. The maths model (`netz_hmer.onnx`) was trained on the human-written part of **Google MathWriting**, with **CROHME** InkML accepted if attached. The router (`netz_router.onnx`) was trained on both. The only "GitHub repo" link to the data is that MathWriting's README lives in the Apache-2.0 `google-research` GitHub repo. That repo's code licence does **not** cover the data. In the docs, DeepWriting and BRUSH are planned, not shipped.

### Cited findings (file evidence)
- **Shipped runtime models.** `Netz/public/models/` holds `netz_router.onnx` (407 KB), `netz_htr.onnx` (7.4 MB) and `netz_hmer.onnx` (28.4 MB), plus vocab, meta and feature-test JSON files, all dated 5 Oct 2026. `src/app/(Primary.pages)/Playground/utils/recognition/modelManager.js` lines 26–31 load exactly these three files. There is no README or LICENSE next to them. The ONNX headers show producer `pytorch 2.11.0`.
- **Old third-party OCR removed.** `src/app/(Primary.pages)/Playground/utils/localOCRService.js` lines 9–10 say "Legacy Tesseract.js (removed …)" and "Legacy TrOCR Vision Transformer (removed 150MB third-party model download)". Neither tesseract nor transformers is in `package.json`. The only ML runtime there is `onnxruntime-web ^1.30.0`.
- **Training notebooks.** There is only one copy of each, in `C:\Users\Sulaiman\Desktop\netz1\Netz\files (1)\` (`train_htr.ipynb`, `train_hmer.ipynb`, `train_router.ipynb`, dated 5 Oct 2026). None of them contains a `github.com` URL, `from_pretrained`, `torch.hub` or `timm`. Each defines its own architecture (`OnlineStrokeHTR`, `StrokeTransformerHMER`, `TemporalStrokeRouter`) with plain `torch.nn`.
  - **`train_htr.ipynb` (text).** It says "Real IAM-OnDB strokes only. No synthetic data". It also says "IAM-OnDB cannot be auto-downloaded (licence). … register free at fki.tic.heia-fr.ch … upload them as a *private* Kaggle dataset". Its meta file `netz_htr_meta.json` reports test CER 0.045 and WER 0.1748.
  - **`train_hmer.ipynb` (maths).** It says "Real online handwritten math only (Google **MathWriting** or **CROHME**) … The MathWriting `synthetic/` and `symbols/` folders are **excluded** on purpose". The download URL is `https://storage.googleapis.com/mathwriting_data/mathwriting-2024.tgz`. Its meta file reports test ExpRate 0.536.
  - **`train_router.ipynb` (router).** It names "`iam-ondb` (TEXT) **and** `mathwriting` (NUMBER/MATH)" as inputs. The source of its OBJECT class was not traced.
- **The project docs agree.**
  - `NETZ_OWNER_TODO.md` lines 23–27: "the shipped text model was trained on IAM-OnDB and the maths model on MathWriting, and both datasets say non-commercial".
  - `PLAYGROUND_HANDOFF.md` line 289: "Is the app commercial? Yes (owner, 2026-10-21)".
  - `PLAYGROUND_DUAL_MODE_ANALYSIS_AND_FEASIBILITY.md` line 255: the maths model was trained on MathWriting and CROHME.
- **Planned retraining, not shipped.** `HTR_FROM_SCRATCH_PLAN.md` lines 18–19 plan to use DeepWriting (`https://files.ait.ethz.ch/projects/deepwriting/deepwriting_dataset.zip`) and BRUSH (link in `github.com/brownvc/decoupled-style-descriptors`). The planned notebook `train_htr_v003.ipynb` does not exist yet.
- **Conflict in the docs.** `HTR_FROM_SCRATCH_PLAN.md` line 7 says "NETZ counts as an educational, non-commercial app for dataset licences, so non-commercial datasets are allowed". That contradicts the owner's 21 Oct decision that NETZ is commercial, and the paid and ad-supported plan.
- **MathWriting's GitHub home.** Its README is in `google-research/google-research` and says: "The code in this repository is released under the Apache 2 license", and separately: "The data is licensed by Google LLC under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license". — [GitHub google-research/mathwriting](https://github.com/google-research/google-research/tree/master/mathwriting)

### Inferences
- The owner's "trained on a GitHub repo database, free to use" most likely mixes up a repo's code licence with its data licence. For MathWriting the code is Apache 2.0 but the data is CC BY-NC-SA 4.0. For DeepWriting the repo is MIT but the data is CC BY-NC-SA 4.0 and extends IAM-OnDB. In both cases "free" means free of charge for research, not free for commercial use.
- Because the weights were trained from scratch, no third-party *model* licence applies. The only licences in question are the training-data licences.

### Gaps
- No training log or run record shows whether CROHME was actually attached when the shipped HMER model was trained, or only MathWriting. The notebook supports both.
- The training data for the router's OBJECT class was not traced.

## Q2. What licences cover each dataset or repo?

### Takeaway
Every dataset used or planned so far is non-commercial: IAM-OnDB, MathWriting (all of it, including the synthetic part, which ships in the same archive under one licence), CROHME, DeepWriting and BRUSH. HME100K's terms could not be verified.

### Cited findings
- **IAM-OnDB.** "may be used for non-commercial research purpose only". It is "freely available for non-commercial research purposes", with registration required. The FKI site refused connections during this check (ECONNREFUSED), so this wording comes from search snippets of the official pages. — [FKI IAM-OnDB](https://fki.tic.heia-fr.ch/databases/iam-on-line-handwriting-database); [FKI download page](https://fki.tic.heia-fr.ch/databases/download-the-iam-on-line-handwriting-database)
- **MathWriting.**
  - Data: CC BY-NC-SA 4.0. Code: Apache 2.0. The README offers one 2.9 GB `.tgz` (plus a 1.5 MB excerpt) under that single data licence. No separate, more permissive licence for the `synthetic/` part was found. — [GitHub google-research/mathwriting](https://github.com/google-research/google-research/tree/master/mathwriting)
  - What CC "NonCommercial" means: "not primarily intended for or directed towards commercial advantage or monetary compensation". — [CC BY-NC-SA 4.0 legal code](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en)
- **DeepWriting.**
  - The dataset is "under CC BY-NC-SA 4.0 license with additional conditions and terms". Users must also "fill IAMOnDB's registration form … since our dataset extends IAMOnDB". — [ETH AIT DeepWriting project page](https://ait.ethz.ch/deepwriting)
  - The code repo is labelled "MIT license", but the README sends readers to the project page for the dataset licence. — [GitHub emreaksan/deepwriting](https://github.com/emreaksan/deepwriting)
  - This is the exact case of an MIT-licensed repo with non-commercial data.
- **BRUSH.** "The BRUSH dataset may only be used for non-commercial research purposes. Anyone wanting to use it for other purposes should contact Prof. James Tompkin". The code is under the "Brown Computer Science Department Copyright Notice, which does not allow commercial use". — [GitHub brownvc/decoupled-style-descriptors](https://github.com/brownvc/decoupled-style-descriptors)
- **CROHME.** The official data page says it is "freely available only for research purpose without any commercial use". It describes a Creative Commons licence for academic and research use, without naming the exact variant (search summary of the page). — [CROHME data, ISI Kolkata](https://www.isical.ac.in/~crohme/CROHME_data.html)
- **HME100K.** No licence statement was found in search. — (no source)

### Inferences
- The ShareAlike term in MathWriting and DeepWriting adds a second problem. Even if a use counted as non-commercial, adapted material would have to be shared under the same licence. Whether trained weights count as "adapted material" is legally unsettled (inference).
- Charging money (Pro tier) and showing ads both make NETZ "directed towards commercial advantage or monetary compensation" under the CC definition. That holds even though NETZ is educational (inference from the definition).

### Gaps
- The full IAM-OnDB licence text could not be read because the site was down.
- The extra conditions in DeepWriting's licence PDF were not read.
- HME100K's terms were not verified. Im2LaTeX was not checked: it is rendered images, not strokes, so it does not fit NETZ's stroke models.

## Q3. Verdict for each component, and what would make it safe

### Takeaway
None of the three shipped models is cleared for a paid or ad-supported product. All of them were trained on non-commercial data. The safe routes are written commercial permission, or retraining on data that allows commercial use (CC BY, CC0, NETZ's own consented data, or synthetic strokes NETZ makes itself).

### Verdict per component
| Component | Training data | Commercial use |
|---|---|---|
| `netz_htr.onnx` (text) | IAM-OnDB | **Not allowed** (non-commercial research only) |
| `netz_hmer.onnx` (maths, frozen) | MathWriting human part (+ CROHME if attached) | **Not allowed** (CC BY-NC-SA 4.0; CROHME research only) |
| `netz_router.onnx` | IAM-OnDB + MathWriting | **Not allowed** (inherits both) |
| Planned DeepWriting retrain | DeepWriting (= IAM-OnDB + 94 writers) | **Not allowed** (CC BY-NC-SA 4.0 + IAM-OnDB terms) |
| Planned BRUSH retrain | BRUSH | **Not allowed** (non-commercial; ask Prof. Tompkin) |
| MathWriting synthetic part | Same archive and licence | **Not allowed**: it does not solve the problem |
| Runtime code (onnxruntime-web, own decoders) | — | Allowed (own code plus permissive library) |

### Cited findings for commercially usable alternatives
- **UJI Pen Characters v2** is licensed "Creative Commons Attribution 4.0 International (CC BY 4.0)". It has 11,640 samples from 60 writers covering 97 characters (letters, digits, punctuation, €). These are isolated characters only, not lines. — [UCI UJI Pen Characters v2](https://archive.ics.uci.edu/dataset/177/uji+pen+characters+version+2)
- **Online Handwritten Assamese Characters** is CC BY 4.0. It is not useful for English or maths. — [UCI](https://archive.ics.uci.edu/dataset/208/online+handwritten+assamese+characters+dataset)
- **Google Quick, Draw!** is "made available by Google, Inc. under the Creative Commons Attribution 4.0 International license". It contains stroke sketches, a possible commercial-safe source for the router's OBJECT class. — [GitHub googlecreativelab/quickdraw-dataset](https://github.com/googlecreativelab/quickdraw-dataset)

### Inferences (paths to safety)
1. **Ask for written commercial permission.** MathWriting is owned by Google LLC. IAM-OnDB is held by FKI (Bern / HEIA-FR). DeepWriting is from ETH AIT and also needs IAM-OnDB's consent. BRUSH is from Prof. James Tompkin at Brown. This is the only route that keeps the frozen maths model unchanged.
2. **Retrain on NETZ's own consented handwriting.** The Writing-mode lines and `/Playground/collect` are a start, but this needs consent wording and a `/Privacy` update (`NETZ_OWNER_TODO.md` "Training data upload") and brings DPDP duties.
3. **Synthesise strokes NETZ owns.** Render LaTeX or text into ink using CC BY or CC0 character data such as UJI, or self-drawn glyph strokes, with augmentation. The labels can come from NETZ's own question bank. MathWriting's synthetic part cannot be used for this.
4. **Use CC BY stroke data as a supplement.** UJI (characters) and Quick, Draw! (objects) both need attribution in a THIRD_PARTY_NOTICES file.
5. **Interim option: keep recognition out of the paid features.** This is the option the earlier readiness report suggested. The ads and Pro tier still make the whole app commercial, so this lowers the risk but does not remove it (inference).
6. **The maths model is frozen by owner rule.** Any retraining of `netz_hmer.onnx` needs the owner's explicit approval.

### Gaps
- No large, commercially licensed English online-handwriting *line* dataset or online *maths* dataset was found in this pass.
- Whether trained weights legally count as derived from the training data is unsettled. Get legal advice.
