/**
 * NETZ Recognition Pipeline Engine
 *
 * Coordinates the full recognition lifecycle:
 *   1. Feature Extraction (canonical 8D features)
 *   2. Router Model (TEXT, NUMBER, MATH, OBJECT)
 *   3. Specialised Model Dispatch:
 *        - TEXT / NUMBER -> netz_htr.onnx (CTC Greedy Decode)
 *        - MATH / MIXED  -> netz_hmer.onnx (Autoregressive Decoder)
 *   4. Pure Heuristic Structure Engine (Zero if-else layout analysis)
 *   5. Semantic Validator & Continuous Candidate Generator
 *   6. Production RecognitionResult Contract
 */

import * as ort from 'onnxruntime-web';
import { modelManager } from './modelManager.js';
import { extractFeatures, strokesToArray } from './canonicalFeatures.js';
import { decodeHTRGreedy } from './htrDecoder.js';
import { decodeHMERAutoregressive } from './hmerDecoder.js';
import { synthesizeHeuristicAST, calculateVinculumEnergy } from './heuristicStructureEngine.js';
import { validateLatexSyntax, evaluateSemanticCoherence } from './semanticValidator.js';
import { generateRankedCandidates } from './candidateEngine.js';

/**
 * Standard Recognition Result Contract per Section 47 of Master Blueprint.
 *
 * @typedef {Object} RecognitionResult
 * @property {string} id
 * @property {'TEXT'|'NUMBER'|'MATH'|'OBJECT'|'MIXED'} type
 * @property {string} value
 * @property {Object} ast
 * @property {{ recognition: number, structure: number, semantic: number, overall: number }} confidence
 * @property {Array<{ value: string, type: string, score: number, description: string }>} alternatives
 * @property {Array<string>} sourceStrokeIds
 * @property {{ minX: number, maxX: number, minY: number, maxY: number }} bbox
 * @property {string} modelVersion
 * @property {number} processingTimeMs
 */

const ROUTER_CLASSES = ['TEXT', 'NUMBER', 'MATH', 'MIXED', 'OBJECT', 'UNKNOWN'];

/**
 * Computes softmax over a 1D array of logits.
 *
 * @param {Float32Array|Array<number>} logits
 * @returns {Array<number>}
 */
function softmax(logits) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }
  let sum = 0;
  const probs = new Array(logits.length);
  for (let i = 0; i < logits.length; i++) {
    const exp = Math.exp(logits[i] - max);
    probs[i] = exp;
    sum += exp;
  }
  const invSum = sum > 0 ? 1 / sum : 1;
  for (let i = 0; i < logits.length; i++) {
    probs[i] *= invSum;
  }
  return probs;
}

/**
 * Executes full recognition pipeline on a cluster of raw strokes.
 *
 * @param {Array<Object>} strokes - Array of stroke objects with .points
 * @param {Array<string>} [strokeIds=[]] - Source stroke IDs
 * @param {Object} [bbox={ minX: 0, maxX: 100, minY: 0, maxY: 100 }] - Bounding box
 * @param {'normal'|'notes'} [mode='normal'] - Canvas operating mode
 * @returns {Promise<RecognitionResult>}
 */
export async function recognizeInkCluster(strokes, strokeIds = [], bbox = null, mode = 'normal') {
  const startTime = performance.now();
  const rawRows = strokesToArray(strokes);

  if (rawRows.length === 0) {
    return {
      id: `rec_${Date.now()}`,
      type: 'TEXT',
      value: '',
      ast: { type: 'Empty' },
      confidence: { recognition: 0, structure: 0, semantic: 0, overall: 0 },
      alternatives: [],
      sourceStrokeIds: strokeIds,
      bbox: bbox || { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      modelVersion: '1.0.0',
      processingTimeMs: 0,
      mode,
      shouldConvert: false,
      action: 'none',
    };
  }

  // Calculate cluster bounding box if missing
  let clusterBBox = bbox;
  if (!clusterBBox) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < rawRows.length; i++) {
      const x = rawRows[i][0];
      const y = rawRows[i][1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    clusterBBox = { minX, maxX, minY, maxY };
  }

  // 1. ROUTER INFERENCE
  let routerSession;
  try {
    routerSession = await modelManager.loadRouter();
  } catch (err) {
    console.warn('[RecognitionPipeline] Router model load failed:', err);
  }

  let routerPredictedType = 'MATH';
  let routerConfidence = 0.8;
  let routerProbs = [0.1, 0.4, 0.4, 0.0, 0.1, 0.0]; // Default prior: [TEXT, NUMBER, MATH, MIXED, OBJECT, UNKNOWN]
  const routerMeta = modelManager.metadata.router;
  const routerMaxLen = routerMeta ? routerMeta.max_len : 256;
  const routerScaleMode = routerMeta ? routerMeta.scale_mode : 'max';

  if (routerSession) {
    const routerFeats = extractFeatures(rawRows, routerMaxLen, routerScaleMode);
    const routerSeqLen = routerFeats.length / 8;
    const routerTensor = new ort.Tensor('float32', routerFeats, [1, routerSeqLen, 8]);

    const routerOut = await routerSession.run({ strokes: routerTensor });
    const logits = routerOut.logits.data; // [1, 6]
    routerProbs = softmax(logits);

    // Active classes: TEXT, NUMBER, MATH, OBJECT
    let bestClassIdx = 2; // MATH default
    let maxProb = -Infinity;
    const activeIndices = [0, 1, 2, 4]; // TEXT, NUMBER, MATH, OBJECT

    for (let k = 0; k < activeIndices.length; k++) {
      const idx = activeIndices[k];
      if (routerProbs[idx] > maxProb) {
        maxProb = routerProbs[idx];
        bestClassIdx = idx;
      }
    }

    routerPredictedType = ROUTER_CLASSES[bestClassIdx] || 'MATH';
    routerConfidence = Math.min(1.0, Math.max(0.1, maxProb));
  }

  // 2. CONTINUOUS MULTI-HYPOTHESIS EXPERT INFERENCE (NO IF-ELSE GUARD RAILS)
  // Both HMER (math/symbolic) and HTR (text/transcription) hypotheses are evaluated
  // and scored continuously via Bayesian prior (router), model likelihood, and continuous geometric energy.

  const hypotheses = [];

  // Continuous geometric energy: vinculum horizontal energy + aspect ratio
  const clusterWidth = Math.max(1, clusterBBox.maxX - clusterBBox.minX);
  let maxVinculumEnergy = 0;
  for (let s = 0; s < strokes.length; s++) {
    if (strokes[s].bbox) {
      const vE = calculateVinculumEnergy(strokes[s].bbox, clusterWidth);
      if (vE > maxVinculumEnergy) maxVinculumEnergy = vE;
    }
  }

  // Hypothesis A: HMER (Mathematical Expression)
  try {
    const hmerSession = await modelManager.loadHMER();
    const hmerMeta = modelManager.metadata.hmer;
    const hmerVocab = modelManager.vocabs.hmer || [];
    const hmerMaxLen = hmerMeta ? hmerMeta.max_len : 512;
    const hmerScaleMode = hmerMeta ? hmerMeta.scale_mode : 'max';

    const hmerFeats = extractFeatures(rawRows, hmerMaxLen, hmerScaleMode);
    const hmerSeqLen = hmerFeats.length / 8;

    const decoded = await decodeHMERAutoregressive(
      hmerSession,
      hmerFeats,
      hmerSeqLen,
      hmerVocab,
      120
    );

    if (decoded && decoded.latex) {
      const semE = evaluateSemanticCoherence(decoded.latex, 'MATH');
      const hasMathSyntax = /[\\^_{}+=><\-]/.test(decoded.latex);

      // Continuous composite prior: P(MATH) + P(NUMBER) from router + vinculum energy
      // On short clusters (<= 2 strokes) or when explicit math syntax is found, avoid sequence router text bias
      const effectiveRouterMath = (strokes.length <= 2 || hasMathSyntax)
        ? Math.max(routerProbs[1] + routerProbs[2], 0.5)
        : (routerProbs[1] + routerProbs[2]);

      const mathPrior = Math.max(0.05, effectiveRouterMath * 0.7 + maxVinculumEnergy * 0.3);
      const syntaxBonus = hasMathSyntax ? 0.25 : 0;
      const totalScore = mathPrior * 0.3 + decoded.confidence * 0.4 + semE * 0.3 + syntaxBonus;

      let ast = null;
      try {
        ast = synthesizeHeuristicAST(
          strokes.map((s, idx) => ({
            id: s.id || `s_${idx}`,
            text: decoded.latex[idx] || '',
            bbox: s.bbox || clusterBBox,
          }))
        );
      } catch {
        ast = { type: 'Expression', latex: decoded.latex };
      }

      hypotheses.push({
        type: 'MATH',
        value: decoded.latex,
        confidence: decoded.confidence,
        semanticScore: semE,
        prior: mathPrior,
        score: totalScore,
        ast,
      });
    }
  } catch (hmerErr) {
    console.warn('[RecognitionPipeline] HMER evaluation notice:', hmerErr);
  }

  // Hypothesis B: HTR (Natural Language Text)
  try {
    const htrSession = await modelManager.loadHTR();
    const htrMeta = modelManager.metadata.htr;
    const htrVocab = modelManager.vocabs.htr || [];
    const htrMaxLen = htrMeta ? htrMeta.max_len : 1024;
    const htrScaleMode = htrMeta ? htrMeta.scale_mode : 'height';

    const htrFeats = extractFeatures(rawRows, htrMaxLen, htrScaleMode);
    const htrSeqLen = htrFeats.length / 8;
    const htrTensor = new ort.Tensor('float32', htrFeats, [1, htrSeqLen, 8]);

    const htrOut = await htrSession.run({ strokes: htrTensor });
    const logitsTensor = htrOut.logits;
    const timeSteps = logitsTensor.dims[1];
    const numClasses = logitsTensor.dims[2];

    const decoded = decodeHTRGreedy(logitsTensor.data, timeSteps, numClasses, htrVocab);
    if (decoded && decoded.text) {
      const semE = evaluateSemanticCoherence(decoded.text, 'TEXT');
      const textPrior = Math.max(0.05, routerProbs[0]);
      const totalScore = textPrior * 0.3 + decoded.confidence * 0.4 + semE * 0.3;

      hypotheses.push({
        type: 'TEXT',
        value: decoded.text,
        confidence: decoded.confidence,
        semanticScore: semE,
        prior: textPrior,
        score: totalScore,
        ast: { type: 'Text', value: decoded.text },
      });
    }
  } catch (htrErr) {
    console.warn('[RecognitionPipeline] HTR evaluation notice:', htrErr);
  }

  // Hypothesis C: Continuous Object / Drawing representation
  const objectPrior = routerProbs[4] || 0.05;
  hypotheses.push({
    type: 'OBJECT',
    value: 'Drawing',
    confidence: objectPrior,
    semanticScore: 0.5,
    prior: objectPrior,
    score: objectPrior * 0.8,
    ast: { type: 'Object', label: 'Drawing' },
  });

  // Sort hypotheses continuously by composite score (Maximum Likelihood Hypothesis)
  hypotheses.sort((a, b) => b.score - a.score);

  const winning = hypotheses[0] || {
    type: 'MATH',
    value: '',
    confidence: 0.5,
    semanticScore: 0.5,
    score: 0.5,
    ast: null,
  };

  const recognizedValue = winning.value;
  const chosenType = winning.type;
  const modelConfidence = winning.confidence;
  const rawAst = winning.ast;
  const semCoherence = winning.semanticScore;
  const overallConfidence = winning.score;

  // 3. CANDIDATE GENERATION (Continuous Ranking)
  const rankedCandidates = generateRankedCandidates({
    primaryValue: recognizedValue,
    primaryType: chosenType,
    confidence: {
      recognition: modelConfidence,
      structure: rawAst ? 0.9 : 0.6,
      semantic: semCoherence,
    },
    alternatives: hypotheses.slice(1).map((h) => ({
      value: h.value,
      type: h.type,
      confidence: h.score,
    })),
  });

  const structConfidence = rawAst ? 0.9 : 0.6;
  const processingTimeMs = Math.round(performance.now() - startTime);

  // Dual-Mode Clean Routing Decision Matrix per Section 2 of Master Specification
  let shouldConvert = true;
  let action = 'convert_equation';

  if (mode === 'normal') {
    // Normal Mode (Whiteboard Canvas):
    // - TEXT -> Do not convert (remain raw handwritten ink)
    // - OBJECT -> Do not convert to block (snap shape / fit curve / keep ink)
    // - MATH / NUMBER / MIXED -> Convert to interactive equation block / graph
    if (chosenType === 'TEXT') {
      shouldConvert = false;
      action = 'keep_ink';
    } else if (chosenType === 'OBJECT') {
      shouldConvert = false;
      action = 'snap_shape';
    } else {
      shouldConvert = true;
      action = 'convert_equation';
    }
  } else {
    // Notes Mode (Academic Lined Notebook):
    // - TEXT -> Convert to printed notes snapped to 32px guidelines
    // - OBJECT -> Strictly preserved as raw ink diagram (NEVER converted)
    // - MATH / NUMBER / MIXED -> Convert to inline equation block
    if (chosenType === 'OBJECT') {
      shouldConvert = false;
      action = 'keep_diagram';
    } else if (chosenType === 'TEXT') {
      shouldConvert = true;
      action = 'convert_text';
    } else {
      shouldConvert = true;
      action = 'convert_equation';
    }
  }

  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: chosenType,
    value: recognizedValue,
    ast: rawAst,
    confidence: {
      recognition: Number(modelConfidence.toFixed(3)),
      structure: Number(structConfidence.toFixed(3)),
      semantic: Number(semCoherence.toFixed(3)),
      overall: Number(overallConfidence.toFixed(3)),
    },
    alternatives: rankedCandidates,
    sourceStrokeIds: strokeIds,
    bbox: clusterBBox,
    modelVersion: '1.0.0',
    processingTimeMs,
    mode,
    shouldConvert,
    action,
  };
}
