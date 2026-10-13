import { segmentStrokesIntoLines } from './src/app/(Primary.pages)/Playground/utils/recognition/lineSegmenter.js';

/**
 * Synthetic handwriting layouts for the line segmenter.
 * Each generated stroke carries the line it was written for, so the result can be checked exactly.
 * These test the geometry only; real accuracy is measured by benchmark_recognition.mjs on real ink.
 */

// Small seeded PRNG so every run sees the same layouts
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let strokeCounter = 0;
function makeStroke(line, minX, minY, maxX, maxY, t) {
  strokeCounter++;
  return {
    id: `s${strokeCounter}`,
    line,
    bbox: { minX, minY, maxX, maxY },
    points: [
      { x: minX, y: minY, timestamp: t },
      { x: maxX, y: maxY, timestamp: t + 80 },
    ],
  };
}

/**
 * Writes one line of text-like strokes.
 * @param {Object} o - { line, baseline, xHeight, startX, words, cursive, slope, rand, clock, delayed }
 *   slope   : rise of the baseline per pixel of x (negative = climbing up the page)
 *   delayed : i-dots and t-crosses are returned separately, to be written after everything else
 */
function writeLine(o) {
  const { line, xHeight: xh, rand } = o;
  const strokes = [];
  const delayedStrokes = [];
  let x = o.startX;
  const baseAt = (px) => o.baseline + (o.slope || 0) * (px - o.startX);

  for (let w = 0; w < o.words; w++) {
    const letters = 2 + Math.floor(rand() * 6);
    if (o.cursive) {
      // One connected stroke per word, spanning ascenders and sometimes descenders
      const width = letters * xh * 0.75;
      const base = baseAt(x + width / 2);
      const top = base - xh * (1.6 + rand() * 0.5);
      const bottom = base + (rand() < 0.5 ? xh * 0.7 : 0);
      strokes.push(makeStroke(line, x, top, x + width, bottom, o.clock.t += 400));
      x += width;
    } else {
      for (let k = 0; k < letters; k++) {
        const width = xh * (0.55 + rand() * 0.35);
        const base = baseAt(x + width / 2);
        const kind = rand();
        let top = base - xh;
        let bottom = base;
        if (kind < 0.3) top = base - xh * 2; // ascender: b d h k l t
        else if (kind < 0.45) bottom = base + xh * 0.8; // descender: g p q y
        strokes.push(makeStroke(line, x, top, x + width, bottom, o.clock.t += 150));

        if (rand() < 0.15) {
          // i-dot above the letter
          const dot = makeStroke(line, x + width * 0.4, base - xh * 1.6, x + width * 0.55, base - xh * 1.45, 0);
          (o.delayed ? delayedStrokes : strokes).push(dot);
          if (!o.delayed) dot.points.forEach((p) => (p.timestamp = o.clock.t += 60));
        } else if (kind < 0.3 && rand() < 0.3) {
          // t-cross: a flat dash at x-height
          const cross = makeStroke(line, x - 1, base - xh * 1.05, x + width + 1, base - xh * 0.95, 0);
          (o.delayed ? delayedStrokes : strokes).push(cross);
          if (!o.delayed) cross.points.forEach((p) => (p.timestamp = o.clock.t += 60));
        }
        x += width + xh * 0.12;
      }
      if (rand() < 0.3) {
        // comma or full stop on the baseline
        const base = baseAt(x);
        strokes.push(makeStroke(line, x, base - xh * 0.1, x + xh * 0.15, base + xh * 0.25, o.clock.t += 100));
      }
    }
    x += xh * 0.9; // word space
  }
  return { strokes, delayedStrokes };
}

function page({ lines, xHeight, pitch, seed, cursive = false, slope = 0, delayed = false, order = null, words = 5 }) {
  const rand = mulberry32(seed);
  const clock = { t: 1000 };
  const all = [];
  const late = [];
  const sequence = order || Array.from({ length: lines }, (_, i) => i);
  for (const line of sequence) {
    const { strokes, delayedStrokes } = writeLine({
      line, baseline: 100 + line * pitch, xHeight, startX: 40 + rand() * 10, words, cursive, slope, rand, clock, delayed,
    });
    all.push(...strokes);
    late.push(...delayedStrokes);
  }
  for (const s of late) {
    s.points.forEach((p) => (p.timestamp = clock.t += 70));
    all.push(s);
  }
  return all;
}

/** Checks line count, exact membership and top-to-bottom order. */
function check(name, strokes, expectedLines) {
  const result = segmentStrokesIntoLines(strokes);
  const problems = [];
  if (result.length !== expectedLines) problems.push(`expected ${expectedLines} lines, got ${result.length}`);
  let total = 0;
  let wrong = 0;
  result.forEach((lineStrokes, idx) => {
    total += lineStrokes.length;
    for (const s of lineStrokes) if (s.line !== idx) wrong++;
    for (let i = 1; i < lineStrokes.length; i++) {
      if (strokes.indexOf(lineStrokes[i]) < strokes.indexOf(lineStrokes[i - 1])) {
        problems.push(`line ${idx} lost writing order`);
        break;
      }
    }
  });
  if (total !== strokes.length) problems.push(`returned ${total} strokes, given ${strokes.length}`);
  if (wrong > 0) problems.push(`${wrong}/${strokes.length} strokes on the wrong line`);
  if (problems.length) {
    console.error(`FAIL  ${name}: ${problems.join('; ')}`);
    return false;
  }
  return true;
}

const results = [];
const run = (name, strokes, expected) => results.push(check(name, strokes, expected));

// Single lines must come back untouched
for (let seed = 1; seed <= 5; seed++) run(`one print line (seed ${seed})`, page({ lines: 1, xHeight: 11, pitch: 32, seed }), 1);
run('one cursive line', page({ lines: 1, xHeight: 11, pitch: 32, seed: 7, cursive: true }), 1);
run('one short word', page({ lines: 1, xHeight: 11, pitch: 32, seed: 9, words: 1 }), 1);

// Ruled notebook paper: 32 px pitch, as in Notes mode
for (let seed = 11; seed <= 20; seed++) {
  run(`two print lines on 32 px ruling (seed ${seed})`, page({ lines: 2, xHeight: 10, pitch: 32, seed }), 2);
  run(`three print lines on 32 px ruling (seed ${seed})`, page({ lines: 3, xHeight: 10, pitch: 32, seed }), 3);
  run(`five print lines on 32 px ruling (seed ${seed})`, page({ lines: 5, xHeight: 10, pitch: 32, seed }), 5);
  run(`three cursive lines (seed ${seed})`, page({ lines: 3, xHeight: 10, pitch: 32, seed, cursive: true }), 3);
}

// Tall writing that nearly fills the ruling
for (let seed = 21; seed <= 25; seed++) run(`tight lines, x-height 12 on 32 px (seed ${seed})`, page({ lines: 3, xHeight: 12, pitch: 32, seed }), 3);

// Dots and crosses added after the whole paragraph was written
for (let seed = 31; seed <= 35; seed++) run(`delayed dots and crosses (seed ${seed})`, page({ lines: 3, xHeight: 10, pitch: 32, seed, delayed: true }), 3);

// Lines that drift up or down the page
for (let seed = 41; seed <= 45; seed++) {
  run(`one line sloping down (seed ${seed})`, page({ lines: 1, xHeight: 10, pitch: 32, seed, slope: 0.06, words: 8 }), 1);
  run(`three lines sloping up (seed ${seed})`, page({ lines: 3, xHeight: 10, pitch: 34, seed, slope: -0.05, words: 6 }), 3);
}

// Scale: large whiteboard writing behaves like small writing
for (let seed = 51; seed <= 53; seed++) run(`large writing, x-height 30 (seed ${seed})`, page({ lines: 3, xHeight: 30, pitch: 96, seed }), 3);

// Lines written out of order still come back top to bottom
run('bottom line written first', page({ lines: 3, xHeight: 10, pitch: 32, seed: 61, order: [2, 0, 1] }), 3);

// Degenerate input
const dots = [makeStroke(0, 10, 10, 12, 12, 1), makeStroke(0, 20, 10, 22, 12, 2), makeStroke(0, 30, 10, 32, 12, 3)];
run('only dots', dots, 1);
results.push(segmentStrokesIntoLines([]).length === 0);
results.push(segmentStrokesIntoLines([dots[0]]).length === 1);

const failed = results.filter((ok) => !ok).length;
if (failed > 0) {
  console.error(`\n ${failed}/${results.length} line-segmentation cases FAILED`);
  process.exit(1);
}
console.log(`\n SUCCESS: All ${results.length}/${results.length} line-segmentation cases passed!`);
