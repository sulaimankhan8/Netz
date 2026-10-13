/**
 * NETZ Handwriting Recognition Benchmark (Stage 0 of PLAYGROUND_AND_HANDWRITING_IMPROVEMENT_PLAN.md)
 *
 * Runs the shipped ONNX models over handwriting samples collected at /Playground/collect
 * and reports error rates and timings, so every later change can be judged against a baseline.
 *
 * Usage:
 *   node benchmark_recognition.mjs samples.jsonl               # baseline report
 *   node benchmark_recognition.mjs samples.jsonl --out base.json   # also save the numbers
 *   node benchmark_recognition.mjs samples.jsonl --google      # add Google's result as a reference ceiling
 *   node benchmark_recognition.mjs samples.jsonl --skip-pipeline   # model-only numbers (faster)
 *   node benchmark_recognition.mjs --self-test                 # check the script runs (numbers are meaningless)
 *
 * Sample format (one JSON object per line):
 *   { "text": "ground truth", "label": "TEXT" | "NUMBER" | "MATH", "strokes": [[{ "x", "y", "t" }, ...], ...],
 *     "pointerType": "pen" | "touch" | "mouse", "category": "word" | "phrase" | "line" | ... }
 * For MATH samples "text" is the LaTeX ground truth.
 *
 * What is measured:
 *   - Text model alone   (netz_htr.onnx, greedy CTC)      -> character and word error rate
 *   - Text by line       (same model, each written line read separately) -> the gain from line splitting
 *   - Maths model alone  (netz_hmer.onnx, greedy decode)  -> exact-expression rate and token error rate
 *   - Whole pipeline     (recognizeInkCluster, as the app runs it) -> was the right kind chosen, and final error
 *
 * --google sends the sample strokes to Google's handwriting endpoint from THIS machine only.
 * It is a developer reference and is never part of the app.
 */

import fs from 'fs';
import path from 'path';
import * as ort from 'onnxruntime-web';
import { strokesToArray, extractFeatures } from './src/app/(Primary.pages)/Playground/utils/recognition/canonicalFeatures.js';
import { decodeHTRGreedy } from './src/app/(Primary.pages)/Playground/utils/recognition/htrDecoder.js';
import { decodeHMERAutoregressive } from './src/app/(Primary.pages)/Playground/utils/recognition/hmerDecoder.js';
import { segmentStrokesIntoLines } from './src/app/(Primary.pages)/Playground/utils/recognition/lineSegmenter.js';
import { modelManager } from './src/app/(Primary.pages)/Playground/utils/recognition/modelManager.js';
import { recognizeInkCluster } from './src/app/(Primary.pages)/Playground/utils/recognition/recognitionPipeline.js';

const MODELS_DIR = path.resolve('public/models');
const TOKEN_RE = /\\[A-Za-z]+|\\.|\d|[A-Za-z]|\S/g; // identical to tokenize_latex() in train_hmer.ipynb

// ---------------------------------------------------------------- arguments
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const samplesPath = args.find((a) => !a.startsWith('--') && a !== option('--out') && a !== option('--limit'));
const selfTest = flag('--self-test');
const useGoogle = flag('--google');
const skipPipeline = flag('--skip-pipeline');
const outPath = option('--out');
const limit = option('--limit') ? parseInt(option('--limit'), 10) : 0;

if (!selfTest && !samplesPath) {
  console.error('Usage: node benchmark_recognition.mjs <samples.jsonl> [--google] [--skip-pipeline] [--limit N] [--out file.json]');
  console.error('       node benchmark_recognition.mjs --self-test');
  process.exit(1);
}

// ---------------------------------------------------------------- helpers
function editDistance(a, b) {
  if (a.length < b.length) [a, b] = [b, a];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur.push(Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)));
    }
    prev = cur;
  }
  return prev[b.length];
}

const normText = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const words = (s) => normText(s).split(' ').filter(Boolean);
const tokenizeLatex = (s) => String(s || '').match(TOKEN_RE) || [];

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}
const mean = (values) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0);
const ms = (v) => Math.round(v) + ' ms';

/** Converts a collected sample into the stroke objects the app's pipeline expects. */
function toAppStrokes(sample) {
  return (sample.strokes || [])
    .map((stroke, idx) => {
      const points = (stroke || []).map((pt) =>
        Array.isArray(pt) ? { x: pt[0], y: pt[1], timestamp: pt[2] } : { x: pt.x, y: pt.y, timestamp: pt.t ?? pt.timestamp }
      );
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      return { id: `s_${idx}`, points, bbox: { minX, minY, maxX, maxY } };
    })
    .filter((s) => s.points.length > 0);
}

async function quiet(fn) {
  const original = console.log;
  console.log = () => {};
  try {
    return await fn();
  } finally {
    console.log = original;
  }
}

/** Developer-only reference: Google's handwriting endpoint. Never called from the app. */
async function recognizeWithGoogle(strokes) {
  const ink = strokes.map((s) => {
    const t0 = s.points[0].timestamp || 0;
    return [
      s.points.map((p) => Math.round(p.x)),
      s.points.map((p) => Math.round(p.y)),
      s.points.map((p, i) => Math.round((p.timestamp ?? i * 16) - t0)),
    ];
  });
  const res = await fetch('https://www.google.com/inputtools/request?ime=handwriting&app=mobilesearch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input_type: 0,
      requests: [{ language: 'en', writing_guide: { writing_area_width: 2000, writing_area_height: 1000 }, ink, pre_context: '', max_num_results: 1, max_completions: 0 }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.[0] === 'SUCCESS' ? data[1]?.[0]?.[1]?.[0] || '' : '';
}

// ---------------------------------------------------------------- load samples
let samples;
if (selfTest) {
  const fixture = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, 'netz_htr_feature_test.json'), 'utf8'));
  const strokes = fixture.cases[0].strokes;
  samples = [
    { text: 'self test', label: 'TEXT', category: 'self-test', pointerType: 'fixture', strokes },
    { text: 'x', label: 'MATH', category: 'self-test', pointerType: 'fixture', strokes },
  ];
} else {
  samples = fs
    .readFileSync(samplesPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  if (limit > 0) samples = samples.slice(0, limit);
}
if (samples.length === 0) {
  console.error('No samples found.');
  process.exit(1);
}

// ---------------------------------------------------------------- load models (from disk, as shipped)
ort.env.logLevel = 'error';
ort.env.wasm.numThreads = 1;

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(MODELS_DIR, name), 'utf8'));
const createSession = (name) =>
  ort.InferenceSession.create(fs.readFileSync(path.join(MODELS_DIR, name)), { executionProviders: ['wasm'], graphOptimizationLevel: 'basic' });

const loadStart = performance.now();
const [routerSession, htrSession, hmerSession] = await Promise.all([
  createSession('netz_router.onnx'),
  createSession('netz_htr.onnx'),
  createSession('netz_hmer.onnx'),
]);
const htrMeta = readJson('netz_htr_meta.json');
const htrVocab = readJson('netz_htr_vocab.json');
const hmerMeta = readJson('netz_hmer_meta.json');
const hmerVocab = readJson('netz_hmer_vocab.json');

// Hand the sessions to the app's model manager so recognizeInkCluster() runs exactly as in the browser
modelManager.sessions = { router: routerSession, htr: htrSession, hmer: hmerSession };
modelManager.metadata = { router: readJson('netz_router_meta.json'), htr: htrMeta, hmer: hmerMeta };
modelManager.vocabs = { htr: htrVocab, hmer: hmerVocab };

console.log(`Loaded 3 models in ${ms(performance.now() - loadStart)} | ${samples.length} samples${selfTest ? ' (SELF-TEST: numbers are meaningless)' : ''}`);

// ---------------------------------------------------------------- run
const rows = [];
for (let i = 0; i < samples.length; i++) {
  const sample = samples[i];
  const label = (sample.label || 'TEXT').toUpperCase();
  const strokes = toAppStrokes(sample);
  if (strokes.length === 0) continue;

  const row = {
    label,
    category: sample.category || 'uncategorised',
    pointerType: sample.pointerType || 'unknown',
    truth: label === 'MATH' ? String(sample.text || '') : normText(sample.text),
    points: strokes.reduce((n, s) => n + s.points.length, 0),
  };
  const rawRows = strokesToArray(strokes);

  if (label === 'MATH') {
    const t0 = performance.now();
    const feats = extractFeatures(rawRows, hmerMeta.max_len, hmerMeta.scale_mode);
    const decoded = await quiet(() => decodeHMERAutoregressive(hmerSession, feats, feats.length / 8, hmerVocab, 120));
    row.mathMs = performance.now() - t0;
    row.mathPred = decoded.latex;
    const refTokens = tokenizeLatex(row.truth);
    const predTokens = tokenizeLatex(decoded.latex);
    row.mathTokenErrors = editDistance(predTokens, refTokens);
    row.mathRefTokens = refTokens.length;
  } else {
    const t0 = performance.now();
    const feats = extractFeatures(rawRows, htrMeta.max_len, htrMeta.scale_mode);
    const out = await htrSession.run({ strokes: new ort.Tensor('float32', feats, [1, feats.length / 8, 8]) });
    const decoded = decodeHTRGreedy(out.logits.data, out.logits.dims[1], out.logits.dims[2], htrVocab);
    row.textMs = performance.now() - t0;
    row.textPred = normText(decoded.text);
    row.textCharErrors = editDistance(row.textPred, row.truth);
    row.textWordErrors = editDistance(words(row.textPred), words(row.truth));

    // Same model, but each written line read on its own (what the app does for multi-line ink)
    const lines = segmentStrokesIntoLines(strokes);
    row.lineCount = lines.length;
    if (lines.length > 1) {
      const lineTexts = [];
      for (const lineStrokes of lines) {
        const lineFeats = extractFeatures(strokesToArray(lineStrokes), htrMeta.max_len, htrMeta.scale_mode);
        const lineOut = await htrSession.run({ strokes: new ort.Tensor('float32', lineFeats, [1, lineFeats.length / 8, 8]) });
        lineTexts.push(decodeHTRGreedy(lineOut.logits.data, lineOut.logits.dims[1], lineOut.logits.dims[2], htrVocab).text);
      }
      row.textByLinePred = normText(lineTexts.join(' '));
    } else {
      row.textByLinePred = row.textPred;
    }
    row.textByLineCharErrors = editDistance(row.textByLinePred, row.truth);
    row.textByLineWordErrors = editDistance(words(row.textByLinePred), words(row.truth));

    if (useGoogle) {
      try {
        row.googlePred = normText(await recognizeWithGoogle(strokes));
        row.googleCharErrors = editDistance(row.googlePred, row.truth);
        row.googleWordErrors = editDistance(words(row.googlePred), words(row.truth));
      } catch (err) {
        row.googleError = err.message;
      }
    }
  }

  if (!skipPipeline) {
    const t0 = performance.now();
    const result = await quiet(() => recognizeInkCluster(strokes, strokes.map((s) => s.id), null, 'notes'));
    row.pipelineMs = performance.now() - t0;
    row.pipelineType = result.type;
    row.pipelinePred = result.value;
    row.pipelineMathsSkipped = Boolean(result.routing && result.routing.mathsSkipped);
    row.routerTextProb = result.routing ? result.routing.textProb : null;
    if (label === 'MATH') {
      row.pipelineKindCorrect = result.type === 'MATH';
    } else {
      row.pipelineKindCorrect = label === 'NUMBER' ? result.type !== 'OBJECT' : result.type === 'TEXT';
      row.pipelineCharErrors = editDistance(normText(result.value), row.truth);
    }
  }

  rows.push(row);
  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${samples.length}`);
}

// ---------------------------------------------------------------- report
function summarise(group) {
  const text = group.filter((r) => r.label !== 'MATH');
  const math = group.filter((r) => r.label === 'MATH');
  const chars = text.reduce((n, r) => n + r.truth.length, 0);
  const wordCount = text.reduce((n, r) => n + words(r.truth).length, 0);
  const google = text.filter((r) => r.googlePred !== undefined);
  const piped = group.filter((r) => r.pipelineKindCorrect !== undefined);
  const pipedText = text.filter((r) => r.pipelineCharErrors !== undefined);
  return {
    samples: group.length,
    text: {
      samples: text.length,
      charErrorRate: chars ? text.reduce((n, r) => n + r.textCharErrors, 0) / chars : null,
      wordErrorRate: wordCount ? text.reduce((n, r) => n + r.textWordErrors, 0) / wordCount : null,
      meanMs: mean(text.map((r) => r.textMs)),
      p95Ms: percentile(text.map((r) => r.textMs), 95),
      multiLineSamples: text.filter((r) => r.lineCount > 1).length,
      byLineCharErrorRate: chars ? text.reduce((n, r) => n + r.textByLineCharErrors, 0) / chars : null,
      byLineWordErrorRate: wordCount ? text.reduce((n, r) => n + r.textByLineWordErrors, 0) / wordCount : null,
    },
    maths: {
      samples: math.length,
      exactRate: math.length ? math.filter((r) => r.mathTokenErrors === 0).length / math.length : null,
      tokenErrorRate: math.length ? math.reduce((n, r) => n + r.mathTokenErrors, 0) / Math.max(1, math.reduce((n, r) => n + r.mathRefTokens, 0)) : null,
      meanMs: mean(math.map((r) => r.mathMs)),
      p95Ms: percentile(math.map((r) => r.mathMs), 95),
    },
    google: google.length
      ? {
          samples: google.length,
          charErrorRate: google.reduce((n, r) => n + r.googleCharErrors, 0) / Math.max(1, google.reduce((n, r) => n + r.truth.length, 0)),
          wordErrorRate: google.reduce((n, r) => n + r.googleWordErrors, 0) / Math.max(1, google.reduce((n, r) => n + words(r.truth).length, 0)),
        }
      : null,
    pipeline: piped.length
      ? {
          samples: piped.length,
          rightKindRate: piped.filter((r) => r.pipelineKindCorrect).length / piped.length,
          // Notes-mode text fast path: how often maths was skipped, and how often that was a mistake
          mathsSkipped: piped.filter((r) => r.pipelineMathsSkipped).length,
          mathsSkippedWrongly: piped.filter((r) => r.pipelineMathsSkipped && r.label === 'MATH').length,
          textCharErrorRate: pipedText.length ? pipedText.reduce((n, r) => n + r.pipelineCharErrors, 0) / Math.max(1, pipedText.reduce((n, r) => n + r.truth.length, 0)) : null,
          meanMs: mean(piped.map((r) => r.pipelineMs)),
          p95Ms: percentile(piped.map((r) => r.pipelineMs), 95),
        }
      : null,
  };
}

const rate = (v) => (v === null || v === undefined ? '   n/a' : (100 * v).toFixed(2) + '%');

function printSummary(title, s) {
  console.log(`\n=== ${title} (${s.samples} samples) ===`);
  if (s.text.samples) {
    console.log(`  Text model     ${String(s.text.samples).padStart(4)} samples | char error ${rate(s.text.charErrorRate)} | word error ${rate(s.text.wordErrorRate)} | ${ms(s.text.meanMs)} mean, ${ms(s.text.p95Ms)} p95`);
  }
  if (s.text.multiLineSamples) {
    console.log(`  Text by line   ${String(s.text.samples).padStart(4)} samples | char error ${rate(s.text.byLineCharErrorRate)} | word error ${rate(s.text.byLineWordErrorRate)} | ${s.text.multiLineSamples} samples had more than one line`);
  }
  if (s.google) {
    console.log(`  Google (ref) ${String(s.google.samples).padStart(4)} samples | char error ${rate(s.google.charErrorRate)} | word error ${rate(s.google.wordErrorRate)}`);
  }
  if (s.maths.samples) {
    console.log(`  Maths model    ${String(s.maths.samples).padStart(4)} samples | exact ${rate(s.maths.exactRate)} | token error ${rate(s.maths.tokenErrorRate)} | ${ms(s.maths.meanMs)} mean, ${ms(s.maths.p95Ms)} p95`);
  }
  if (s.pipeline) {
    console.log(`  Whole pipeline ${String(s.pipeline.samples).padStart(4)} samples | right kind chosen ${rate(s.pipeline.rightKindRate)} | text char error ${rate(s.pipeline.textCharErrorRate)} | ${ms(s.pipeline.meanMs)} mean, ${ms(s.pipeline.p95Ms)} p95`);
    console.log(`  Text fast path      maths skipped on ${s.pipeline.mathsSkipped} samples, ${s.pipeline.mathsSkippedWrongly} of them were maths`);
  }
}

const groupBy = (key) => {
  const groups = {};
  for (const r of rows) (groups[r[key]] ||= []).push(r);
  return groups;
};

const report = { samples: rows.length, overall: summarise(rows), byPointerType: {}, byCategory: {} };
printSummary('Overall', report.overall);
for (const [name, group] of Object.entries(groupBy('pointerType'))) {
  report.byPointerType[name] = summarise(group);
  printSummary(`Input: ${name}`, report.byPointerType[name]);
}
for (const [name, group] of Object.entries(groupBy('category'))) {
  report.byCategory[name] = summarise(group);
  printSummary(`Category: ${name}`, report.byCategory[name]);
}

const worst = rows
  .filter((r) => r.textCharErrors !== undefined && r.truth.length > 0)
  .sort((a, b) => b.textCharErrors / b.truth.length - a.textCharErrors / a.truth.length)
  .slice(0, 8);
if (worst.length && !selfTest) {
  console.log('\n=== Worst text samples ===');
  for (const r of worst) console.log(`  truth: "${r.truth}"\n   read: "${r.textPred}"${r.googlePred !== undefined ? `\n google: "${r.googlePred}"` : ''}`);
}

console.log('\nTimings are single-threaded WASM on this machine, not an iPad. Use the timing button on /Playground/collect for device numbers.');

if (outPath) {
  fs.writeFileSync(outPath, JSON.stringify({ createdAt: new Date().toISOString(), source: samplesPath || 'self-test', ...report, rows }, null, 2));
  console.log(`Saved ${outPath}`);
}
if (selfTest) console.log('\n SELF-TEST OK: models loaded and every stage ran.');
