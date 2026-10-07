/**
 * Pure Heuristic Mathematical Structure Engine for NETZ
 *
 * Core Principle: NO BRITTLE IF-ELSE RULE CHAINS.
 * Layout and structural math relationships are discovered entirely via:
 *   1. Continuous spatial affinity functions (Gaussian kernel distance metrics).
 *   2. Continuous energy minimizers for fraction vinculums.
 *   3. 1D Kernel Density Projection profiles (P_x, P_y) for matrix/grid valleys.
 *   4. Bounding box intersection integrals for radical enclosures.
 */

/**
 * Calculates continuous fraction vinculum score for a stroke/segment.
 * Horizontal lines maximize (1 - H/W) and horizontal extent coverage.
 *
 * @param {{ minX: number, maxX: number, minY: number, maxY: number }} bbox
 * @param {number} totalClusterWidth
 * @returns {number} Score in [0, 1]
 */
export function calculateVinculumEnergy(bbox, totalClusterWidth) {
  const w = Math.max(1, bbox.maxX - bbox.minX);
  const h = Math.max(1, bbox.maxY - bbox.minY);
  const aspect = h / w; // for horizontal bars, aspect << 1

  const flatness = Math.max(0, 1 - aspect * 2.5);
  const spanCoverage = Math.min(1.0, w / Math.max(1, totalClusterWidth * 0.25));

  return flatness * spanCoverage;
}

/**
 * Calculates continuous horizontal overlap between two bounding intervals [x1, x2] and [u1, u2].
 *
 * @param {number} minA
 * @param {number} maxA
 * @param {number} minB
 * @param {number} maxB
 * @returns {number} Normalized overlap ratio in [0, 1]
 */
export function calculateIntervalOverlap(minA, maxA, minB, maxB) {
  const intersection = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
  const minSpan = Math.min(maxA - minA, maxB - minB);
  return minSpan > 0 ? Math.min(1.0, intersection / minSpan) : 0;
}

/**
 * Evaluates the continuous spatial affinity of symbol B relative to symbol A.
 * Determines whether B is inline, superscript, or subscript using a continuous
 * 2D Gaussian Kernel over relative baseline shift and relative scale.
 *
 * @param {{ bbox: { minX: number, maxX: number, minY: number, maxY: number } }} symA
 * @param {{ bbox: { minX: number, maxX: number, minY: number, maxY: number } }} symB
 * @returns {{ role: 'inline'|'superscript'|'subscript', confidence: number, affinities: { inline: number, superscript: number, subscript: number } }}
 */
export function evaluateScriptAffinity(symA, symB) {
  const bA = symA.bbox;
  const bB = symB.bbox;

  const hA = Math.max(1, bA.maxY - bA.minY);
  const hB = Math.max(1, bB.maxY - bB.minY);
  const wA = Math.max(1, bA.maxX - bA.minX);

  const baseA = bA.maxY;
  const baseB = bB.maxY;
  const deltaBase = baseA - baseB; // positive if B is raised above A

  const scaleRatio = hB / hA;
  const deltaX = Math.max(0, bB.minX - bA.maxX);
  const xProximity = Math.max(0, 1.0 - deltaX / Math.max(1, wA * 1.5));

  // Gaussian hyper-parameters
  const sigmaY = 0.35 * hA;
  const sigmaScale = 0.25;

  // Expected ideal shifts
  const muSuperY = 0.45 * hA;
  const muSubY = -0.45 * hA;
  const muScriptScale = 0.65;
  const muInlineScale = 1.0;

  // 1. Superscript Affinity
  const affSuper =
    Math.exp(-Math.pow(deltaBase - muSuperY, 2) / (2 * sigmaY * sigmaY)) *
    Math.exp(-Math.pow(scaleRatio - muScriptScale, 2) / (2 * sigmaScale * sigmaScale)) *
    xProximity;

  // 2. Subscript Affinity
  const affSub =
    Math.exp(-Math.pow(deltaBase - muSubY, 2) / (2 * sigmaY * sigmaY)) *
    Math.exp(-Math.pow(scaleRatio - muScriptScale, 2) / (2 * sigmaScale * sigmaScale)) *
    xProximity;

  // 3. Inline Affinity
  const affInline =
    Math.exp(-Math.pow(deltaBase, 2) / (2 * sigmaY * sigmaY)) *
    Math.exp(-Math.pow(scaleRatio - muInlineScale, 2) / (2 * sigmaScale * sigmaScale)) *
    xProximity;

  const affinities = {
    superscript: affSuper,
    subscript: affSub,
    inline: affInline,
  };

  let maxAff = affInline;
  let role = 'inline';

  if (affSuper > maxAff) {
    maxAff = affSuper;
    role = 'superscript';
  }
  if (affSub > maxAff) {
    maxAff = affSub;
    role = 'subscript';
  }

  const sumAff = affSuper + affSub + affInline + 1e-6;
  const confidence = Math.min(1.0, maxAff / sumAff);

  return {
    role,
    confidence,
    affinities,
  };
}

/**
 * Partitions symbols into fraction Numerator and Denominator using
 * signed vertical distance relative to a discovered vinculum bar.
 *
 * @param {Array<{ id: string, bbox: Object, text: string }>} symbols
 * @param {Object} vinculumBBox
 * @returns {{ numerator: Array<Object>, denominator: Array<Object>, vinculumEnergy: number }}
 */
export function partitionFractionByVinculum(symbols, vinculumBBox) {
  const barY = (vinculumBBox.minY + vinculumBBox.maxY) / 2;
  const numerator = [];
  const denominator = [];

  for (let i = 0; i < symbols.length; i++) {
    const s = symbols[i];
    const symY = (s.bbox.minY + s.bbox.maxY) / 2;
    const overlap = calculateIntervalOverlap(
      s.bbox.minX,
      s.bbox.maxX,
      vinculumBBox.minX,
      vinculumBBox.maxX
    );

    // Continuous signed distance
    const signedDist = symY - barY;

    // Weight assignment by horizontal overlap
    if (overlap > 0.25) {
      if (signedDist < 0) {
        numerator.push(s);
      } else {
        denominator.push(s);
      }
    }
  }

  return { numerator, denominator };
}

/**
 * Computes 1D Kernel Density Profile along an axis to find alignment valleys (matrix cells).
 *
 * @param {Array<number>} values - Coordinate values (e.g., center X or center Y)
 * @param {number} minVal
 * @param {number} maxVal
 * @param {number} steps
 * @param {number} bandwidth
 * @returns {Array<{ pos: number, density: number }>}
 */
export function computeProjectionDensity(values, minVal, maxVal, steps = 100, bandwidth = 15) {
  const profile = [];
  const stepSize = (maxVal - minVal) / Math.max(1, steps);
  const invTwoSigmaSq = 1 / (2 * bandwidth * bandwidth);

  for (let s = 0; s <= steps; s++) {
    const pos = minVal + s * stepSize;
    let density = 0;
    for (let i = 0; i < values.length; i++) {
      const d = pos - values[i];
      density += Math.exp(-d * d * invTwoSigmaSq);
    }
    profile.push({ pos, density });
  }

  return profile;
}

/**
 * Finds local minimum valleys in a density profile (e.g. matrix column or row separators).
 *
 * @param {Array<{ pos: number, density: number }>} profile
 * @param {number} valleyThreshold - Density threshold ratio
 * @returns {Array<number>} Positions of valleys
 */
export function detectDensityValleys(profile, valleyThreshold = 0.3) {
  const valleys = [];
  let maxDensity = 0;
  for (let i = 0; i < profile.length; i++) {
    if (profile[i].density > maxDensity) maxDensity = profile[i].density;
  }

  const cutoff = maxDensity * valleyThreshold;

  for (let i = 1; i < profile.length - 1; i++) {
    if (
      profile[i].density < profile[i - 1].density &&
      profile[i].density < profile[i + 1].density &&
      profile[i].density < cutoff
    ) {
      valleys.push(profile[i].pos);
    }
  }

  return valleys;
}

/**
 * Synthesizes a structured Math AST from recognized symbols using pure geometric heuristics.
 *
 * @param {Array<{ id: string, text: string, bbox: Object }>} symbols
 * @returns {Object} Math AST Root Node
 */
export function synthesizeHeuristicAST(symbols) {
  if (!symbols || symbols.length === 0) {
    return { type: 'Empty', value: '' };
  }

  // 1. Sort symbols by reading order (horizontal position)
  const sorted = [...symbols].sort((a, b) => a.bbox.minX - b.bbox.minX);

  // 2. Scan for fraction vinculums using continuous energy
  let bestVinculumIdx = -1;
  let maxVinculumEnergy = 0;

  const totalMinX = Math.min(...sorted.map((s) => s.bbox.minX));
  const totalMaxX = Math.max(...sorted.map((s) => s.bbox.maxX));
  const totalWidth = totalMaxX - totalMinX;

  for (let i = 0; i < sorted.length; i++) {
    const energy = calculateVinculumEnergy(sorted[i].bbox, totalWidth);
    if (energy > 0.65 && energy > maxVinculumEnergy) {
      maxVinculumEnergy = energy;
      bestVinculumIdx = i;
    }
  }

  // 3. Fraction node synthesis if vinculum is prominent
  if (bestVinculumIdx >= 0) {
    const bar = sorted[bestVinculumIdx];
    const otherSymbols = sorted.filter((_, idx) => idx !== bestVinculumIdx);
    const { numerator, denominator } = partitionFractionByVinculum(otherSymbols, bar.bbox);

    if (numerator.length > 0 && denominator.length > 0) {
      return {
        type: 'Fraction',
        numerator: synthesizeHeuristicAST(numerator),
        denominator: synthesizeHeuristicAST(denominator),
        sourceBox: bar.bbox,
      };
    }
  }

  // 4. Sequence with Script Affinity
  const sequence = [];
  let i = 0;
  while (i < sorted.length) {
    const current = sorted[i];

    if (i + 1 < sorted.length) {
      const next = sorted[i + 1];
      const scriptEval = evaluateScriptAffinity(current, next);

      if (scriptEval.role === 'superscript' && scriptEval.confidence > 0.55) {
        sequence.push({
          type: 'Power',
          base: { type: 'Symbol', value: current.text, bbox: current.bbox },
          exponent: { type: 'Symbol', value: next.text, bbox: next.bbox },
          confidence: scriptEval.confidence,
        });
        i += 2;
        continue;
      } else if (scriptEval.role === 'subscript' && scriptEval.confidence > 0.55) {
        sequence.push({
          type: 'Subscript',
          base: { type: 'Symbol', value: current.text, bbox: current.bbox },
          subscript: { type: 'Symbol', value: next.text, bbox: next.bbox },
          confidence: scriptEval.confidence,
        });
        i += 2;
        continue;
      }
    }

    sequence.push({
      type: 'Symbol',
      value: current.text,
      bbox: current.bbox,
    });
    i++;
  }

  return {
    type: 'Expression',
    children: sequence,
  };
}
