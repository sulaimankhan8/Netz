/**
 * Office Preset Shape Evaluator
 *
 * Turns an Office preset shape (presetShapes.generated.js) at a given size into drawable
 * geometry: SVG path data, the yellow adjustment handles, connection points and the text
 * rectangle. The formulas, path commands and handle rules are those of the Office Open XML
 * standard (ECMA-376 Part 1, DrawingML shape guides), so shapes match Word and WPS Office.
 *
 * Coordinates are the shape's own: (0, 0) is the top-left of its box, (w, h) the bottom-right,
 * before any rotation or flip. Angles in the formulas are in 60000ths of a degree.
 *
 * Pure functions with no browser dependencies, so they can be tested with Node.
 */

import { PRESET_SHAPES } from './presetShapes.generated.js';

const ANGLE = Math.PI / 10800000; // one formula angle unit (1/60000 degree) in radians
const TWO_PI = Math.PI * 2;
const UNLIMITED = 2000000000; // handle limits of +-2147483647 mean "anywhere"
const UNLIMITED_RANGE = 1000000; // how far such a handle is searched: ten times the shape's size

export function getPresetDefinition(name) {
  return PRESET_SHAPES[name] || null;
}

export function presetNames() {
  return Object.keys(PRESET_SHAPES);
}

function builtIns(w, h) {
  const ss = Math.min(w, h);
  return {
    l: 0, t: 0, r: w, b: h, w, h, hc: w / 2, vc: h / 2, ss, ls: Math.max(w, h),
    wd2: w / 2, wd3: w / 3, wd4: w / 4, wd5: w / 5, wd6: w / 6, wd8: w / 8, wd10: w / 10, wd12: w / 12, wd32: w / 32,
    hd2: h / 2, hd3: h / 3, hd4: h / 4, hd5: h / 5, hd6: h / 6, hd8: h / 8, hd10: h / 10, hd12: h / 12, hd32: h / 32,
    ssd2: ss / 2, ssd4: ss / 4, ssd6: ss / 6, ssd8: ss / 8, ssd16: ss / 16, ssd32: ss / 32,
    // cd3 is not in the standard's list but curvedLeftArrow uses it (a connection angle): a third of a circle
    cd2: 10800000, cd3: 7200000, cd4: 5400000, cd8: 2700000,
    '3cd4': 16200000, '3cd8': 8100000, '5cd8': 13500000, '7cd8': 18900000,
  };
}

function value(vars, a) {
  if (typeof a === 'number') return a;
  const v = vars[a];
  if (v === undefined) throw new Error(`unknown name "${a}"`);
  return v;
}

function applyFormula(vars, op, args) {
  const x = args.length > 0 ? value(vars, args[0]) : 0;
  const y = args.length > 1 ? value(vars, args[1]) : 0;
  const z = args.length > 2 ? value(vars, args[2]) : 0;
  switch (op) {
    case '*/': return z === 0 ? 0 : (x * y) / z;
    case '+-': return x + y - z;
    case '+/': return z === 0 ? 0 : (x + y) / z;
    case '?:': return x > 0 ? y : z;
    case 'abs': return Math.abs(x);
    case 'at2': return Math.atan2(y, x) / ANGLE;
    case 'cat2': return x * Math.cos(Math.atan2(z, y));
    case 'cos': return x * Math.cos(y * ANGLE);
    case 'max': return Math.max(x, y);
    case 'min': return Math.min(x, y);
    case 'mod': return Math.sqrt(x * x + y * y + z * z);
    case 'pin': return y < x ? x : y > z ? z : y;
    case 'sat2': return x * Math.sin(Math.atan2(z, y));
    case 'sin': return x * Math.sin(y * ANGLE);
    case 'sqrt': return Math.sqrt(Math.max(0, x));
    case 'tan': return x * Math.tan(y * ANGLE);
    case 'val': return x;
    default: throw new Error(`unknown operator "${op}"`);
  }
}

/** The preset's adjustment values, with any the shape overrides. */
export function adjustValues(name, adj = {}) {
  const def = PRESET_SHAPES[name];
  const out = {};
  if (!def || !def.av) return out;
  const vars = builtIns(100, 100);
  for (const [key, op, ...args] of def.av) {
    out[key] = adj[key] !== undefined ? adj[key] : applyFormula(vars, op, args);
    vars[key] = out[key];
  }
  return out;
}

/** Keeps only the adjustment values that differ from the preset's defaults (what a shape stores). */
export function compactAdjust(name, adj = {}) {
  const defaults = adjustValues(name);
  const out = {};
  for (const key of Object.keys(adj)) {
    if (defaults[key] !== undefined && Math.round(adj[key]) !== Math.round(defaults[key])) out[key] = Math.round(adj[key]);
  }
  return out;
}

/** All guide values for the preset at this size. */
export function evaluateGuides(def, w, h, adj = {}) {
  const vars = builtIns(w, h);
  if (def.av) {
    for (const [key, op, ...args] of def.av) vars[key] = adj[key] !== undefined ? adj[key] : applyFormula(vars, op, args);
  }
  if (def.gd) {
    for (const [key, op, ...args] of def.gd) vars[key] = applyFormula(vars, op, args);
  }
  return vars;
}

// ── Paths ─────────────────────────────────────────────────────────────────────

/**
 * An Office arc starts at the current point, which lies on an ellipse (radii wR, hR) at the
 * angle stAng as seen from the ellipse's centre, and sweeps swAng (positive is clockwise on
 * screen). Angles are converted to the ellipse's own parameter so the arc can be drawn exactly.
 */
function arcFrom(cur, wR, hR, stAng, swAng) {
  const t0 = Math.atan2(wR * Math.sin(stAng), hR * Math.cos(stAng));
  const cx = cur.x - wR * Math.cos(t0);
  const cy = cur.y - hR * Math.sin(t0);
  let dt = 0;
  if (Math.abs(swAng) >= TWO_PI - 1e-9) {
    dt = Math.sign(swAng) * TWO_PI;
  } else if (swAng !== 0) {
    const end = stAng + swAng;
    dt = Math.atan2(wR * Math.sin(end), hR * Math.cos(end)) - t0;
    if (swAng > 0 && dt < 0) dt += TWO_PI;
    if (swAng < 0 && dt > 0) dt -= TWO_PI;
  }
  const t1 = t0 + dt;
  return { cx, cy, t0, dt, x: cx + wR * Math.cos(t1), y: cy + hR * Math.sin(t1) };
}

function buildSegments(path, vars, w, h) {
  const sx = path.w ? w / path.w : 1;
  const sy = path.h ? h / path.h : 1;
  const segs = [];
  let cur = { x: 0, y: 0 };
  let start = cur;
  const pt = (a, b) => ({ x: value(vars, a), y: value(vars, b) });

  for (const c of path.cmds) {
    switch (c[0]) {
      case 'M':
        cur = pt(c[1], c[2]);
        start = cur;
        segs.push({ t: 'M', x: cur.x * sx, y: cur.y * sy });
        break;
      case 'L':
        cur = pt(c[1], c[2]);
        segs.push({ t: 'L', x: cur.x * sx, y: cur.y * sy });
        break;
      case 'A': {
        const wR = value(vars, c[1]);
        const hR = value(vars, c[2]);
        const arc = arcFrom(cur, wR, hR, value(vars, c[3]) * ANGLE, value(vars, c[4]) * ANGLE);
        cur = { x: arc.x, y: arc.y };
        if (Math.abs(wR) < 1e-9 || Math.abs(hR) < 1e-9 || arc.dt === 0) {
          segs.push({ t: 'L', x: cur.x * sx, y: cur.y * sy });
        } else {
          segs.push({ t: 'A', rx: wR * sx, ry: hR * sy, cx: arc.cx * sx, cy: arc.cy * sy, t0: arc.t0, dt: arc.dt, x: cur.x * sx, y: cur.y * sy });
        }
        break;
      }
      case 'Q': {
        const c1 = pt(c[1], c[2]);
        cur = pt(c[3], c[4]);
        segs.push({ t: 'Q', x1: c1.x * sx, y1: c1.y * sy, x: cur.x * sx, y: cur.y * sy });
        break;
      }
      case 'C': {
        const c1 = pt(c[1], c[2]);
        const c2 = pt(c[3], c[4]);
        cur = pt(c[5], c[6]);
        segs.push({ t: 'C', x1: c1.x * sx, y1: c1.y * sy, x2: c2.x * sx, y2: c2.y * sy, x: cur.x * sx, y: cur.y * sy });
        break;
      }
      case 'Z':
        segs.push({ t: 'Z' });
        cur = start;
        break;
      default:
        throw new Error(`unknown path command "${c[0]}"`);
    }
  }
  return segs;
}

const round = (n) => {
  const r = Math.round(n * 100) / 100;
  return r === 0 ? 0 : r; // never "-0"
};

function arcPoint(seg, t) {
  return { x: seg.cx + seg.rx * Math.cos(t), y: seg.cy + seg.ry * Math.sin(t) };
}

/** SVG path data for a list of segments. */
export function segmentsToPathData(segs) {
  let d = '';
  for (const s of segs) {
    switch (s.t) {
      case 'M': d += `M${round(s.x)} ${round(s.y)}`; break;
      case 'L': d += `L${round(s.x)} ${round(s.y)}`; break;
      case 'Q': d += `Q${round(s.x1)} ${round(s.y1)} ${round(s.x)} ${round(s.y)}`; break;
      case 'C': d += `C${round(s.x1)} ${round(s.y1)} ${round(s.x2)} ${round(s.y2)} ${round(s.x)} ${round(s.y)}`; break;
      case 'Z': d += 'Z'; break;
      case 'A': {
        const rx = round(Math.abs(s.rx));
        const ry = round(Math.abs(s.ry));
        // On screen (y down) a growing parameter turns clockwise when both radii have the same sign
        const sweep = (s.dt > 0) === (s.rx * s.ry > 0) ? 1 : 0;
        if (Math.abs(s.dt) > Math.PI * 1.999) {
          // A full ellipse cannot be one SVG arc: draw it as two halves
          const mid = arcPoint(s, s.t0 + s.dt / 2);
          d += `A${rx} ${ry} 0 0 ${sweep} ${round(mid.x)} ${round(mid.y)}A${rx} ${ry} 0 0 ${sweep} ${round(s.x)} ${round(s.y)}`;
        } else {
          d += `A${rx} ${ry} 0 ${Math.abs(s.dt) > Math.PI ? 1 : 0} ${sweep} ${round(s.x)} ${round(s.y)}`;
        }
        break;
      }
      default:
        break;
    }
  }
  return d;
}

/**
 * The segments as straight-line runs (arcs and curves sampled finely), for hit tests and bounds.
 * @returns {Array<{ pts: Array<{ x: number, y: number }>, closed: boolean }>}
 */
export function flattenSegments(segs) {
  const runs = [];
  let run = null;
  let cur = { x: 0, y: 0 };
  const begin = (p) => {
    run = { pts: [p], closed: false };
    runs.push(run);
  };
  for (const s of segs) {
    if (s.t === 'M') {
      cur = { x: s.x, y: s.y };
      begin(cur);
      continue;
    }
    if (s.t === 'Z') {
      if (run) {
        run.closed = true;
        cur = run.pts[0];
        run = null;
      }
      continue;
    }
    if (!run) begin(cur);
    if (s.t === 'L') {
      run.pts.push({ x: s.x, y: s.y });
    } else if (s.t === 'A') {
      const steps = Math.max(2, Math.ceil(Math.abs(s.dt) / (Math.PI / 24)));
      for (let i = 1; i <= steps; i++) run.pts.push(arcPoint(s, s.t0 + (s.dt * i) / steps));
    } else if (s.t === 'Q') {
      for (let i = 1; i <= 12; i++) {
        const t = i / 12, u = 1 - t;
        run.pts.push({ x: u * u * cur.x + 2 * u * t * s.x1 + t * t * s.x, y: u * u * cur.y + 2 * u * t * s.y1 + t * t * s.y });
      }
    } else if (s.t === 'C') {
      for (let i = 1; i <= 16; i++) {
        const t = i / 16, u = 1 - t;
        run.pts.push({
          x: u * u * u * cur.x + 3 * u * u * t * s.x1 + 3 * u * t * t * s.x2 + t * t * t * s.x,
          y: u * u * u * cur.y + 3 * u * u * t * s.y1 + 3 * u * t * t * s.y2 + t * t * t * s.y,
        });
      }
    }
    cur = { x: s.x, y: s.y };
  }
  return runs;
}

function unit(dx, dy) {
  const len = Math.hypot(dx, dy);
  return len > 1e-9 ? { dx: dx / len, dy: dy / len } : null;
}

/**
 * Where an open path starts and ends, with the direction pointing out of the line at each end:
 * where arrowheads go. Null for a path that has no open run.
 */
export function pathEnds(segs) {
  if (!segs.length || segs[0].t !== 'M' || segs.some((s) => s.t === 'Z')) return null;
  const first = segs[0];
  const second = segs[1];
  const last = segs[segs.length - 1];
  if (!second) return null;
  const before = segs.length > 2 ? segs[segs.length - 2] : first;

  const towards = (s, from) => {
    if (s.t === 'Q') return { x: s.x1, y: s.y1 };
    if (s.t === 'C') return { x: s.x1, y: s.y1 };
    if (s.t === 'A') {
      const dir = Math.sign(s.dt);
      return { x: from.x - s.rx * Math.sin(s.t0) * dir, y: from.y + s.ry * Math.cos(s.t0) * dir };
    }
    return { x: s.x, y: s.y };
  };
  const awayFrom = (s, prevEnd) => {
    if (s.t === 'Q') return { x: s.x1, y: s.y1 };
    if (s.t === 'C') return { x: s.x2, y: s.y2 };
    if (s.t === 'A') {
      const dir = Math.sign(s.dt);
      const t1 = s.t0 + s.dt;
      return { x: s.x + s.rx * Math.sin(t1) * dir, y: s.y - s.ry * Math.cos(t1) * dir };
    }
    return { x: prevEnd.x, y: prevEnd.y };
  };

  const startNext = towards(second, first);
  const startDir = unit(first.x - startNext.x, first.y - startNext.y);
  const endPrev = awayFrom(last, before);
  const endDir = unit(last.x - endPrev.x, last.y - endPrev.y);
  if (!startDir || !endDir) return null;
  return {
    start: { x: first.x, y: first.y, ...startDir },
    end: { x: last.x, y: last.y, ...endDir },
  };
}

/**
 * Pulls the ends of an open path back along the line (so a thick line does not poke out from
 * under an arrowhead). Returns new segments; the input is not changed.
 */
export function shortenPath(segs, startBy, endBy) {
  const out = segs.map((s) => ({ ...s }));
  const ends = pathEnds(out);
  if (!ends) return out;
  if (startBy > 0) {
    out[0].x -= ends.start.dx * startBy;
    out[0].y -= ends.start.dy * startBy;
  }
  if (endBy > 0) {
    const last = out[out.length - 1];
    if (last.t === 'A') {
      const radius = (Math.abs(last.rx) + Math.abs(last.ry)) / 2 || 1;
      last.dt -= Math.sign(last.dt) * Math.min(Math.abs(last.dt) * 0.9, endBy / radius);
      const p = arcPoint(last, last.t0 + last.dt);
      last.x = p.x;
      last.y = p.y;
    } else {
      last.x -= ends.end.dx * endBy;
      last.y -= ends.end.dy * endBy;
    }
  }
  return out;
}

/**
 * Geometry of a preset shape at a size.
 *
 * @param {string} name - Office preset name, for example 'roundRect'
 * @param {number} w
 * @param {number} h
 * @param {Object} [adj] - Adjustment values that differ from the preset's defaults
 * @returns {{
 *   paths: Array<{ d: string, segs: Array, fill: string, stroke: boolean }>,
 *   textRect: { l: number, t: number, r: number, b: number },
 *   handles: Array<{ x: number, y: number, kind: 'xy' | 'polar' }>,
 *   connections: Array<{ x: number, y: number, angle: number }>,
 * }}
 */
export function evaluatePreset(name, w, h, adj = {}) {
  const def = PRESET_SHAPES[name];
  if (!def) throw new Error(`unknown shape "${name}"`);
  const vars = evaluateGuides(def, w, h, adj);

  const paths = (def.paths || []).map((p) => {
    const segs = buildSegments(p, vars, w, h);
    return { d: segmentsToPathData(segs), segs, fill: p.fill || 'norm', stroke: p.stroke !== false };
  });

  const textRect = def.rect
    ? { l: value(vars, def.rect[0]), t: value(vars, def.rect[1]), r: value(vars, def.rect[2]), b: value(vars, def.rect[3]) }
    : { l: 0, t: 0, r: w, b: h };

  const handles = (def.ah || []).map((a) => ({ x: value(vars, a.x), y: value(vars, a.y), kind: a.t }));
  const connections = (def.cxn || []).map(([ang, x, y]) => ({ x: value(vars, x), y: value(vars, y), angle: value(vars, ang) / 60000 }));

  return { paths, textRect, handles, connections };
}

/** Box around all of a geometry's paths (shape coordinates), or null when it draws nothing. */
export function geometryBounds(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of geometry.paths) {
    for (const run of flattenSegments(p.segs)) {
      for (const q of run.pts) {
        if (q.x < minX) minX = q.x;
        if (q.y < minY) minY = q.y;
        if (q.x > maxX) maxX = q.x;
        if (q.y > maxY) maxY = q.y;
      }
    }
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

// ── Adjustment handles ────────────────────────────────────────────────────────

function handleLimits(vars, ref, lo, hi, current) {
  let min = lo === undefined ? -UNLIMITED : value(vars, lo);
  let max = hi === undefined ? UNLIMITED : value(vars, hi);
  if (min > max) [min, max] = [max, min];
  if (min <= -UNLIMITED) min = Math.min(current, 0) - UNLIMITED_RANGE;
  if (max >= UNLIMITED) max = Math.max(current, 0) + UNLIMITED_RANGE;
  return { ref, min, max };
}

/**
 * New adjustment values after a yellow handle is dragged to a point (shape coordinates).
 * The formulas run only one way (value to position), so the value that brings the handle
 * closest to the point is searched for, within the handle's own limits.
 *
 * @returns {Object} All of the shape's adjustment values (compact them before storing)
 */
export function solveAdjustHandle(name, w, h, adj, index, target) {
  const def = PRESET_SHAPES[name];
  const handle = def && def.ah && def.ah[index];
  const current = adjustValues(name, adj);
  if (!handle) return current;

  const vars = evaluateGuides(def, w, h, current);
  const refs = handle.t === 'polar'
    ? [[handle.ga, handle.minA, handle.maxA], [handle.gr, handle.minR, handle.maxR]]
    : [[handle.gx, handle.minX, handle.maxX], [handle.gy, handle.minY, handle.maxY]];
  const active = refs.filter(([ref]) => ref && current[ref] !== undefined).map(([ref, lo, hi]) => handleLimits(vars, ref, lo, hi, current[ref]));
  if (active.length === 0) return current;

  const values = { ...current };
  const distance = () => {
    const g = evaluateGuides(def, w, h, values);
    return Math.hypot(value(g, handle.x) - target.x, value(g, handle.y) - target.y);
  };

  const rounds = active.length > 1 ? 4 : 1;
  for (let r = 0; r < rounds; r++) {
    for (const { ref, min, max } of active) {
      // Coarse scan of the whole range, then a fine search around the best sample
      const samples = 96;
      const step = (max - min) / samples;
      let best = values[ref];
      let bestErr = distance();
      for (let i = 0; i <= samples; i++) {
        values[ref] = min + step * i;
        const e = distance();
        if (e < bestErr) {
          bestErr = e;
          best = values[ref];
        }
      }
      let lo = Math.max(min, best - step);
      let hi = Math.min(max, best + step);
      for (let i = 0; i < 40 && hi - lo > 0.5; i++) {
        const m1 = lo + (hi - lo) / 3;
        const m2 = hi - (hi - lo) / 3;
        values[ref] = m1;
        const e1 = distance();
        values[ref] = m2;
        const e2 = distance();
        if (e1 <= e2) hi = m2;
        else lo = m1;
      }
      values[ref] = (lo + hi) / 2;
      if (distance() > bestErr) values[ref] = best;
      values[ref] = Math.round(Math.min(max, Math.max(min, values[ref])));
    }
  }
  return values;
}
