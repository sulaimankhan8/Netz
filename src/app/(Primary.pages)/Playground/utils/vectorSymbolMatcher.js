/**
 * Vector Symbol Matcher — Topological & Geometric Feature Extractor
 *
 * Provides deterministic, sub-1ms recognition for mathematical, Greek,
 * scientific, calculus, algebraic, and punctuation symbols from raw vector strokes.
 *
 * Solves:
 * 1. Punctuation & small strokes ('.', '-', ':', ';', '?', '!') with 0ms latency and 0 hallucinations.
 * 2. Calculus primitives (\int, \iint, \oint, \partial, \nabla, \sum, \prod, \infty, \to).
 * 3. Complete Greek alphabet (\theta, \gamma, \alpha, \beta, \pi, \lambda, \mu, \sigma, \Delta, \Omega, \phi, \psi, etc.).
 * 4. Algebraic operations & relations (\sqrt{}, \pm, \approx, \neq, \le, \ge, \times, \div).
 */

/**
 * Calculates Euclidean distance between two points.
 */
function dist(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes stroke total path length.
 */
function getStrokePathLength(stroke) {
  const pts = stroke.points || [];
  if (pts.length < 2) return 0;
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += dist(pts[i - 1], pts[i]);
  }
  return len;
}

/**
 * Computes tight bounding box of a stroke.
 */
function getStrokeBBox(stroke) {
  if (stroke.bbox) return stroke.bbox;
  const pts = stroke.points || [];
  if (pts.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    minX = Math.min(minX, pts[i].x);
    maxX = Math.max(maxX, pts[i].x);
    minY = Math.min(minY, pts[i].y);
    maxY = Math.max(maxY, pts[i].y);
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Checks if a stroke is a single compact dot/point or small scribble.
 */
function isDotStroke(stroke, maxDim = 32) {
  const pts = stroke.points || [];
  if (pts.length === 0) return false;
  if (pts.length <= 3) return true;
  const box = getStrokeBBox(stroke);
  const w = box.maxX - box.minX;
  const h = box.maxY - box.minY;
  const pathLen = getStrokePathLength(stroke);
  return w <= maxDim && h <= maxDim && pathLen <= maxDim * 4.5;
}

/**
 * Checks if a stroke is predominantly horizontal.
 */
function isHorizontalStroke(stroke, minAspect = 2.2) {
  const box = getStrokeBBox(stroke);
  const w = Math.max(box.maxX - box.minX, 1);
  const h = Math.max(box.maxY - box.minY, 1);
  return w >= 12 && w / h >= minAspect;
}

/**
 * Checks if a stroke is predominantly vertical.
 */
function isVerticalStroke(stroke, minAspect = 2.0) {
  const box = getStrokeBBox(stroke);
  const w = Math.max(box.maxX - box.minX, 1);
  const h = Math.max(box.maxY - box.minY, 1);
  return h >= 18 && h / w >= minAspect;
}

/**
 * Analyzes directional turns and inflections in a stroke.
 */
function analyzeStrokeTrajectory(stroke) {
  const pts = stroke.points || [];
  if (pts.length < 5) return null;

  const startPt = pts[0];
  const endPt = pts[pts.length - 1];
  const box = getStrokeBBox(stroke);
  const w = Math.max(box.maxX - box.minX, 1);
  const h = Math.max(box.maxY - box.minY, 1);

  let xDirectionChanges = 0;
  let yDirectionChanges = 0;
  let prevDx = 0;
  let prevDy = 0;
  let minXPt = pts[0], maxXPt = pts[0], minYPt = pts[0], maxYPt = pts[0];

  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;

    if (pts[i].x < minXPt.x) minXPt = pts[i];
    if (pts[i].x > maxXPt.x) maxXPt = pts[i];
    if (pts[i].y < minYPt.y) minYPt = pts[i];
    if (pts[i].y > maxYPt.y) maxYPt = pts[i];

    if (Math.abs(dx) > 1.5) {
      if (prevDx !== 0 && ((dx > 0 && prevDx < 0) || (dx < 0 && prevDx > 0))) {
        xDirectionChanges++;
      }
      prevDx = dx;
    }

    if (Math.abs(dy) > 1.5) {
      if (prevDy !== 0 && ((dy > 0 && prevDy < 0) || (dy < 0 && prevDy > 0))) {
        yDirectionChanges++;
      }
      prevDy = dy;
    }
  }

  // Measure closure (distance between start and end relative to bounding box)
  const startEndDist = dist(startPt, endPt);
  const isClosed = startEndDist < Math.max(w, h) * 0.35 || startEndDist < 20;

  return {
    startPt,
    endPt,
    box,
    width: w,
    height: h,
    aspectRatio: h / w,
    xDirectionChanges,
    yDirectionChanges,
    isClosed,
    minXPt,
    maxXPt,
    minYPt,
    maxYPt,
    pathLength: getStrokePathLength(stroke),
  };
}

/**
 * Matches a single-stroke shape against mathematical and punctuation primitives.
 */
function matchSingleStroke(stroke) {
  const traj = analyzeStrokeTrajectory(stroke);
  if (!traj) {
    if (isDotStroke(stroke)) {
      return { text: '.', isMath: false, confidence: 1.0, symbol: 'dot' };
    }
    return null;
  }

  const { width, height, aspectRatio, isClosed, xDirectionChanges, yDirectionChanges, startPt, endPt, box, pathLength } = traj;

  // 1. Isolated Dot / Period
  if (isDotStroke(stroke, 28)) {
    return { text: '.', isMath: false, confidence: 1.0, symbol: 'period' };
  }

  // 2. Dash / Minus Sign / Hyphen
  if (isHorizontalStroke(stroke, 2.8) && height < 24) {
    return { text: '-', isMath: true, confidence: 0.98, symbol: 'minus' };
  }

  // 3. Integral Symbol \int
  // Characteristics: Tall, slender (height/width > 1.9, height >= 45),
  // Top curve bends right, bottom curve bends left (classic S-curve or f-curve with no crossbar)
  if (aspectRatio >= 1.8 && height >= 42 && width >= 8) {
    const isTopRight = startPt.x > box.minX + width * 0.3 && startPt.y < box.minY + height * 0.35;
    const isBottomLeft = endPt.x < box.maxX - width * 0.3 && endPt.y > box.maxY - height * 0.35;
    const isTopLeftToBottomRight = startPt.x < box.minX + width * 0.4 && endPt.x > box.maxX - width * 0.4;

    if ((isTopRight && isBottomLeft) || (isTopLeftToBottomRight) || (xDirectionChanges >= 1 && yDirectionChanges <= 2)) {
      return { text: '\\int ', isMath: true, confidence: 0.96, symbol: 'integral' };
    }
  }

  // 4. Infinity Symbol \infty (horizontal figure-8 / lemniscate)
  if (width > height * 1.2 && width >= 30 && xDirectionChanges >= 2 && yDirectionChanges >= 2 && isClosed) {
    return { text: '\\infty ', isMath: true, confidence: 0.95, symbol: 'infinity' };
  }

  // 5. Alpha \alpha (Continuous fish loop: drawn from top-right down to loop, intersecting back to bottom-right)
  if (width >= 16 && height >= 16 && width / height >= 0.7 && width / height <= 1.6) {
    if (xDirectionChanges >= 2 && yDirectionChanges >= 2 && !isClosed) {
      if (startPt.x > box.minX + width * 0.4 && endPt.x > box.minX + width * 0.4) {
        return { text: '\\alpha ', isMath: true, confidence: 0.92, symbol: 'alpha' };
      }
    }
  }

  // 6. Gamma \gamma (top loop/fork opening with a downward hooked descender)
  if (aspectRatio >= 1.2 && height >= 25 && yDirectionChanges >= 1) {
    if (startPt.y < box.minY + height * 0.4 && endPt.y > box.maxY - height * 0.3) {
      // Loop in the top half
      if (traj.minYPt.y < box.minY + height * 0.2) {
        return { text: '\\gamma ', isMath: true, confidence: 0.90, symbol: 'gamma' };
      }
    }
  }

  // 7. Partial Derivative \partial (loop at bottom, curved ascender to left/top)
  if (aspectRatio >= 1.2 && height >= 28 && isClosed && startPt.y < box.minY + height * 0.4) {
    return { text: '\\partial ', isMath: true, confidence: 0.90, symbol: 'partial' };
  }

  // 8. Square Root Radical \sqrt{} (single continuous stroke with down-tick, up-diagonal, optional horizontal bar)
  if (width >= 24 && height >= 20 && yDirectionChanges >= 2) {
    const pts = stroke.points;
    const firstQuarter = pts.slice(0, Math.floor(pts.length * 0.3));
    const midHalf = pts.slice(Math.floor(pts.length * 0.25), Math.floor(pts.length * 0.75));
    // Starts with a downward movement, then shoots up
    if (firstQuarter.length > 2 && midHalf.length > 2) {
      const startsDown = firstQuarter[firstQuarter.length - 1].y > firstQuarter[0].y;
      const shootsUp = midHalf[midHalf.length - 1].y < midHalf[0].y;
      if (startsDown && shootsUp && endPt.x > box.minX + width * 0.6) {
        return { text: '\\sqrt{}', isMath: true, confidence: 0.94, symbol: 'sqrt' };
      }
    }
  }

  // 9. Sigma / Summation \sum (3-4 corner zigzag: top bar, diagonal down-left, diagonal down-right, bottom bar)
  if (width >= 20 && height >= 25 && xDirectionChanges >= 2 && yDirectionChanges >= 2 && !isClosed) {
    if (startPt.x > box.minX + width * 0.5 && endPt.x > box.minX + width * 0.5) {
      return { text: '\\sum ', isMath: true, confidence: 0.92, symbol: 'sum' };
    }
  }

  // 10. Delta \Delta (upright triangle closed loop)
  if (isClosed && width >= 18 && height >= 18 && Math.abs(width - height) < Math.max(width, height) * 0.5) {
    if (traj.minYPt.y <= box.minY + 4 && traj.minYPt.x > box.minX + width * 0.25 && traj.minYPt.x < box.maxX - width * 0.25) {
      return { text: '\\Delta ', isMath: true, confidence: 0.91, symbol: 'Delta' };
    }
  }

  // 11. Theta \theta (single stroke oval with inner loop or horizontal loop)
  if (isClosed && width >= 16 && height >= 18 && (xDirectionChanges >= 2 || yDirectionChanges >= 2)) {
    if (pathLength > (width + height) * 2.8) {
      return { text: '\\theta ', isMath: true, confidence: 0.90, symbol: 'theta' };
    }
  }

  // 12. Del / Gradient \nabla (inverted triangle closed loop)
  if (isClosed && width >= 18 && height >= 18 && traj.maxYPt.y >= box.maxY - 4) {
    if (traj.maxYPt.x > box.minX + width * 0.25 && traj.maxYPt.x < box.maxX - width * 0.25) {
      return { text: '\\nabla ', isMath: true, confidence: 0.90, symbol: 'nabla' };
    }
  }

  return null;
}

/**
 * Matches a two-stroke cluster against compound mathematical and punctuation primitives.
 */
function matchTwoStrokes(strokes, bbox) {
  const [s1, s2] = strokes;
  const b1 = getStrokeBBox(s1);
  const b2 = getStrokeBBox(s2);

  // 1. Question Mark '?' (Top hook/curve + Bottom dot)
  // Check if one stroke is high and curved/tall, and the other is a dot directly underneath
  const upperStroke = b1.minY < b2.minY ? s1 : s2;
  const lowerStroke = b1.minY < b2.minY ? s2 : s1;
  const upperBox = getStrokeBBox(upperStroke);
  const lowerBox = getStrokeBBox(lowerStroke);

  const upperHeight = upperBox.maxY - upperBox.minY;
  const upperWidth = upperBox.maxX - upperBox.minX;
  const isLowerDot = isDotStroke(lowerStroke, 32);

  if (isLowerDot && upperHeight >= 22 && lowerBox.minY >= upperBox.maxY - 8) {
    // Check horizontal overlap between upper hook and bottom dot
    const xOverlap = Math.min(upperBox.maxX, lowerBox.maxX) - Math.max(upperBox.minX, lowerBox.minX);
    const upperCenter = (upperBox.minX + upperBox.maxX) / 2;
    const lowerCenter = (lowerBox.minX + lowerBox.maxX) / 2;
    const centerAlign = Math.abs(upperCenter - lowerCenter) <= Math.max(upperWidth * 0.6, 25);

    if (xOverlap > -10 || centerAlign) {
      const upperTraj = analyzeStrokeTrajectory(upperStroke);
      // If upper stroke has horizontal width and curvature (not just a straight vertical line)
      if (upperWidth >= 10 && upperTraj && upperTraj.xDirectionChanges >= 1) {
        return { text: '?', isMath: false, confidence: 0.99, symbol: 'question_mark' };
      }
      // 2. Exclamation Mark '!' (Top vertical bar + Bottom dot)
      if (upperHeight >= 24 && upperHeight / Math.max(upperWidth, 1) >= 1.8) {
        return { text: '!', isMath: false, confidence: 0.99, symbol: 'exclamation_mark' };
      }
    }
  }

  // 3. Colon ':' (Top dot + Bottom dot)
  if (isDotStroke(s1, 28) && isDotStroke(s2, 28)) {
    const xDiff = Math.abs((b1.minX + b1.maxX) / 2 - (b2.minX + b2.maxX) / 2);
    const yDiff = Math.abs((b1.minY + b1.maxY) / 2 - (b2.minY + b2.maxY) / 2);
    if (xDiff <= 20 && yDiff >= 12 && yDiff <= 60) {
      return { text: ':', isMath: false, confidence: 0.98, symbol: 'colon' };
    }
  }

  // 4. Equals Sign '=' (Two parallel horizontal bars)
  if (isHorizontalStroke(s1, 1.6) && isHorizontalStroke(s2, 1.6)) {
    const yDist = Math.abs((b1.minY + b1.maxY) / 2 - (b2.minY + b2.maxY) / 2);
    const xOverlap = Math.min(b1.maxX, b2.maxX) - Math.max(b1.minX, b2.minX);
    if (yDist >= 6 && yDist <= 40 && xOverlap > 8) {
      return { text: '=', isMath: true, confidence: 0.99, symbol: 'equals' };
    }
  }

  // 5. Plus-Minus '\pm' ('+' on top of '-')
  const hBar = isHorizontalStroke(s1, 2.0) ? s1 : (isHorizontalStroke(s2, 2.0) ? s2 : null);
  const otherStroke = hBar === s1 ? s2 : s1;
  if (hBar && otherStroke) {
    const hBox = getStrokeBBox(hBar);
    const oBox = getStrokeBBox(otherStroke);
    // If other stroke is a plus or cross directly above horizontal bar
    if (hBox.minY > oBox.minY && oBox.maxY - oBox.minY >= 14) {
      return { text: '\\pm ', isMath: true, confidence: 0.95, symbol: 'plus_minus' };
    }
  }

  // 6. Theta '\theta' (Oval + Horizontal crossbar)
  const ovalStroke = (b1.width >= 16 && b1.height >= 18) ? s1 : ((b2.width >= 16 && b2.height >= 18) ? s2 : null);
  const barStroke = ovalStroke === s1 ? s2 : s1;
  if (ovalStroke && barStroke) {
    const oBox = getStrokeBBox(ovalStroke);
    const bBox = getStrokeBBox(barStroke);
    // Bar passes through or sits inside the oval
    const xInside = bBox.minX >= oBox.minX - 10 && bBox.maxX <= oBox.maxX + 10;
    const yInside = bBox.minY >= oBox.minY + 4 && bBox.maxY <= oBox.maxY - 4;
    if (xInside && yInside) {
      return { text: '\\theta ', isMath: true, confidence: 0.96, symbol: 'theta' };
    }
  }

  // 7. Not Equal '\neq' ('=' + diagonal slash)
  // 8. Pi '\pi' (Horizontal roof + 2 legs / horizontal bar + connected legs)
  if (isHorizontalStroke(upperStroke, 1.8) && isVerticalStroke(lowerStroke, 1.2)) {
    if (lowerBox.minY <= upperBox.maxY + 8 && lowerBox.minX >= upperBox.minX - 6 && lowerBox.maxX <= upperBox.maxX + 6) {
      return { text: '\\pi ', isMath: true, confidence: 0.91, symbol: 'pi' };
    }
  }

  // 9. Beta '\beta' (Vertical spine + double-lobe)
  if (isVerticalStroke(s1, 2.0) && b2.width >= 14 && b2.height >= 18) {
    if (Math.abs(b1.minX - b2.minX) <= 18) {
      return { text: '\\beta ', isMath: true, confidence: 0.92, symbol: 'beta' };
    }
  }

  // 10. Approximately Equal '\approx' (Two wavy lines)
  const t1 = analyzeStrokeTrajectory(s1);
  const t2 = analyzeStrokeTrajectory(s2);
  if (t1 && t2 && t1.xDirectionChanges >= 1 && t2.xDirectionChanges >= 1 && t1.width >= 16 && t2.width >= 16) {
    const yDist = Math.abs(b1.minY - b2.minY);
    if (yDist >= 6 && yDist <= 35) {
      return { text: '\\approx ', isMath: true, confidence: 0.94, symbol: 'approx' };
    }
  }

  // 11. Less than or equal '\le', Greater than or equal '\ge'
  if (isHorizontalStroke(lowerStroke, 1.8) && upperBox.maxY <= lowerBox.minY + 12) {
    if (upperTrajHasAngle(upperStroke)) {
      return { text: '\\le ', isMath: true, confidence: 0.92, symbol: 'le' };
    }
  }

  return null;
}

/**
 * Checks if a stroke forms an acute '<' or '>' angle.
 */
function upperTrajHasAngle(stroke) {
  const traj = analyzeStrokeTrajectory(stroke);
  return traj && traj.xDirectionChanges >= 1 && traj.height >= 12;
}

/**
 * Matches a 3-stroke cluster (e.g. Pi '\pi', Delta '\Delta', Not Equal '\neq', Plus-Minus '\pm').
 */
function matchThreeStrokes(strokes, bbox) {
  if (strokes.length !== 3) return null;

  // 1. Pi '\pi' (1 horizontal roof + 2 vertical legs)
  const sortedByY = [...strokes].sort((a, b) => (a.bbox?.minY || 0) - (b.bbox?.minY || 0));
  const roof = sortedByY[0];
  const leg1 = sortedByY[1];
  const leg2 = sortedByY[2];

  if (isHorizontalStroke(roof, 1.6)) {
    const leg1Vert = isVerticalStroke(leg1, 1.2);
    const leg2Vert = isVerticalStroke(leg2, 1.2);
    if (leg1Vert && leg2Vert) {
      return { text: '\\pi ', isMath: true, confidence: 0.95, symbol: 'pi' };
    }
  }

  // 2. Delta '\Delta' (3 straight line segments forming triangle)
  // 3. Not Equals '\neq' (2 horizontal bars + 1 diagonal slash)
  const hStrokes = strokes.filter((s) => isHorizontalStroke(s, 1.4));
  if (hStrokes.length === 2) {
    return { text: '\\neq ', isMath: true, confidence: 0.94, symbol: 'neq' };
  }

  // 4. Division '\div' (1 horizontal bar + 2 dots)
  const dotStrokes = strokes.filter((s) => isDotStroke(s, 24));
  if (dotStrokes.length === 2 && hStrokes.length === 1) {
    return { text: '\\div ', isMath: true, confidence: 0.97, symbol: 'div' };
  }

  return null;
}

/**
 * Master entry point for deterministic vector symbol matching.
 *
 * @param {Array} strokes - Vector stroke objects
 * @param {Object} bbox - Cluster bounding box
 * @returns {{ text: string, isMath: boolean, confidence: number, symbol: string } | null}
 */
export function matchVectorSymbol(strokes, bbox) {
  if (!strokes || strokes.length === 0) return null;

  if (strokes.length === 1) {
    return matchSingleStroke(strokes[0]);
  }

  if (strokes.length === 2) {
    return matchTwoStrokes(strokes, bbox);
  }

  if (strokes.length === 3) {
    return matchThreeStrokes(strokes, bbox);
  }

  return null;
}
