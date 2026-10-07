import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  strokesToArray,
  extractFeatures,
  FEATURE_DIM
} from './src/app/(Primary.pages)/Playground/utils/recognition/canonicalFeatures.js';

const testFiles = [
  'public/models/netz_router_feature_test.json',
  'public/models/netz_htr_feature_test.json',
  'public/models/netz_hmer_feature_test.json'
];

let totalPassed = 0;
let totalCases = 0;

for (const relPath of testFiles) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${relPath}`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const maxLen = data.max_len;
  const scaleMode = data.scale_mode;
  const tolerance = data.tolerance || 1e-4;
  const cases = data.cases || [];

  console.log(`\nTesting ${relPath} (${cases.length} cases, maxLen=${maxLen}, scaleMode=${scaleMode}, tol=${tolerance})...`);

  for (let c = 0; c < cases.length; c++) {
    totalCases++;
    const testCase = cases[c];
    const rawStrokes = testCase.strokes;
    const expected = testCase.features;

    const arr = strokesToArray(rawStrokes);
    const actualFlat = extractFeatures(arr, maxLen, scaleMode);

    const actualRows = [];
    const numPoints = actualFlat.length / FEATURE_DIM;
    for (let i = 0; i < numPoints; i++) {
      const row = [];
      for (let j = 0; j < FEATURE_DIM; j++) {
        row.push(actualFlat[i * FEATURE_DIM + j]);
      }
      actualRows.push(row);
    }

    if (actualRows.length !== expected.length) {
      console.error(`Case ${c} length mismatch: got ${actualRows.length}, expected ${expected.length}`);
      process.exit(1);
    }

    let maxDiff = 0;
    for (let i = 0; i < expected.length; i++) {
      for (let j = 0; j < FEATURE_DIM; j++) {
        const diff = Math.abs(actualRows[i][j] - expected[i][j]);
        if (diff > maxDiff) maxDiff = diff;
      }
    }

    if (maxDiff > tolerance) {
      console.error(`Case ${c} failed tolerance: maxDiff=${maxDiff} > tol=${tolerance}`);
      console.error('Actual row 0:', actualRows[0]);
      console.error('Expected row 0:', expected[0]);
      process.exit(1);
    } else {
      totalPassed++;
    }
  }
}

console.log(`\n SUCCESS: All ${totalPassed}/${totalCases} feature test cases matched within tolerance!`);
