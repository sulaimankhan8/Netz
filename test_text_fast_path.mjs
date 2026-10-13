import fs from 'fs';
import path from 'path';
import * as ort from 'onnxruntime-web';
import { modelManager } from './src/app/(Primary.pages)/Playground/utils/recognition/modelManager.js';
import { recognizeInkCluster } from './src/app/(Primary.pages)/Playground/utils/recognition/recognitionPipeline.js';

/**
 * Notes-mode text fast path: when the router is confident the ink is ordinary writing,
 * the (slow) maths recogniser must not be called; in every other situation it must be.
 *
 * The router is replaced by a stub so its verdict can be set exactly. The text and maths
 * models are the real shipped ones, with the maths session wrapped to count its calls.
 */

ort.env.logLevel = 'error';
ort.env.wasm.numThreads = 1;
const dir = path.resolve('public/models');
const json = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const session = (name) =>
  ort.InferenceSession.create(fs.readFileSync(path.join(dir, name)), { executionProviders: ['wasm'], graphOptimizationLevel: 'basic' });

const [realHtr, realHmer] = await Promise.all([session('netz_htr.onnx'), session('netz_hmer.onnx')]);

let mathCalls = 0;
const countingHmer = { run: async (feeds) => { mathCalls++; return realHmer.run(feeds); } };

// Router stub: logits [L, 0, 0, 0, 0, 0] give P(TEXT) = e^L / (e^L + 5)
const routerSaying = (textProb) => {
  const L = Math.log((textProb * 5) / (1 - textProb));
  return { run: async () => ({ logits: { data: Float32Array.from([L, 0, 0, 0, 0, 0]) } }) };
};

// Text model stub that reads nothing (every frame is the CTC blank)
const blankHtr = {
  run: async ({ strokes }) => {
    const steps = Math.ceil(strokes.dims[1] / 2);
    const data = new Float32Array(steps * 78);
    for (let t = 0; t < steps; t++) data[t * 78] = 10;
    return { logits: { data, dims: [1, steps, 78] } };
  },
};

modelManager.metadata = { router: json('netz_router_meta.json'), htr: json('netz_htr_meta.json'), hmer: json('netz_hmer_meta.json') };
modelManager.vocabs = { htr: json('netz_htr_vocab.json'), hmer: json('netz_hmer_vocab.json') };

// Ink: the text model's parity fixture, repeated along one line
const fixture = json('netz_htr_feature_test.json').cases[0].strokes;
function makeInk(copies) {
  const strokes = [];
  for (let c = 0; c < copies; c++) {
    fixture.forEach((s, i) => {
      strokes.push({ id: `c${c}_s${i}`, points: s.map(([x, y, t]) => ({ x: x + c * 60, y, timestamp: c * 1000 + t })) });
    });
  }
  return strokes;
}
const fourStrokes = makeInk(2);
const twoStrokes = makeInk(1);

async function run({ textProb, mode, options, strokes = fourStrokes, htr = realHtr }) {
  modelManager.sessions = { router: routerSaying(textProb), htr, hmer: countingHmer };
  mathCalls = 0;
  const log = console.log;
  console.log = () => {};
  try {
    const result = await recognizeInkCluster(strokes, strokes.map((s) => s.id), null, mode, options);
    return { result, mathCalls };
  } finally {
    console.log = log;
  }
}

let failed = 0;
let checks = 0;
function expect(name, condition, detail = '') {
  checks++;
  if (!condition) {
    failed++;
    console.error(`FAIL  ${name} ${detail}`);
  }
}

// 1. The fast path itself
let r = await run({ textProb: 0.99, mode: 'notes' });
expect('notes + confident text: maths recogniser not called', r.mathCalls === 0, `(called ${r.mathCalls} times)`);
expect('notes + confident text: read as text', r.result.type === 'TEXT', `(got ${r.result.type})`);
expect('notes + confident text: result says maths was skipped', r.result.routing.mathsSkipped === true);
expect('notes + confident text: converts to a text block', r.result.action === 'convert_text' && r.result.shouldConvert === true);
expect('notes + confident text: no maths time spent', r.result.timings.hmerMs === 0);

// 2. Whiteboard mode is unaffected
r = await run({ textProb: 0.99, mode: 'normal' });
expect('whiteboard mode: maths recogniser still called', r.mathCalls > 0);
expect('whiteboard mode: nothing reported as skipped', r.result.routing.mathsSkipped === false);

// 3. An "=" gesture always gets maths
r = await run({ textProb: 0.99, mode: 'notes', options: { alwaysRunMath: true } });
expect('notes + "=" gesture: maths recogniser called', r.mathCalls > 0);
expect('notes + "=" gesture: nothing reported as skipped', r.result.routing.mathsSkipped === false);

// 4. "Read as maths" wins even though the router says text
r = await run({ textProb: 0.99, mode: 'notes', options: { preferType: 'MATH' } });
expect('read as maths: maths recogniser called', r.mathCalls > 0);
expect('read as maths: maths reading wins', r.result.type === 'MATH', `(got ${r.result.type})`);
expect('read as maths: converts to an equation block', r.result.action === 'convert_equation');

// 5. Notes mode strictly avoids math model even for short strokes or unsure router
r = await run({ textProb: 0.99, mode: 'notes', strokes: twoStrokes });
expect('notes + 2 strokes: maths recogniser not called', r.mathCalls === 0);

r = await run({ textProb: 0.6, mode: 'notes' });
expect('notes + router unsure (0.60): maths recogniser strictly not called', r.mathCalls === 0);

r = await run({ textProb: 0.84, mode: 'notes' });
expect('notes + router (0.84): maths recogniser strictly not called', r.mathCalls === 0);

// 6. Whiteboard mode evaluates both experts
r = await run({ textProb: 0.6, mode: 'normal' });
expect('whiteboard + router unsure (0.60): maths recogniser called', r.mathCalls > 0);

r = await run({ textProb: 0.86, mode: 'normal' });
expect('whiteboard mode: maths recogniser evaluated for multi-hypothesis', r.mathCalls > 0);

if (failed > 0) {
  console.error(`\n ${failed}/${checks} text fast path checks FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${checks}/${checks} text fast path checks passed!`);
