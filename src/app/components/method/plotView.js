// A graph window for y = f(x) on [x0, x1]: y from the middle 90% of sampled values (so a pole
// does not squash the picture), always including the x-axis. Extra functions widen the y-range.
export function plotView(fns, x0, x1) {
  const ys = [];
  for (const f of fns.filter(Boolean)) {
    for (let k = 0; k <= 120; k++) { const y = f(x0 + (k / 120) * (x1 - x0)); if (Number.isFinite(y)) ys.push(y); }
  }
  if (ys.length < 5) return { x0, x1, y0: -5, y1: 5 };
  ys.sort((a, b) => a - b);
  let y0 = ys[Math.floor(ys.length * 0.05)], y1 = ys[Math.ceil(ys.length * 0.95) - 1];
  if (y1 - y0 < 1) { y0 -= 1; y1 += 1; }
  return { x0, x1, y0: Math.min(y0, 0), y1: Math.max(y1, 0) };
}

/** A window around the interesting x-values (points, limits), with a margin. */
export function around(xs, fallback = [-4, 4]) {
  const finite = xs.filter(Number.isFinite);
  if (!finite.length) return fallback;
  let lo = Math.min(...finite), hi = Math.max(...finite);
  const pad = Math.max((hi - lo) * 0.35, 1.5);
  lo -= pad; hi += pad;
  return [lo, hi];
}

/** A window around scattered data points (x, y), with a margin on every side. */
export function dataView(points) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const px = (x1 - x0) * 0.15 || 1, py = (y1 - y0) * 0.15 || 1;
  return { x0: x0 - px, x1: x1 + px, y0: y0 - py, y1: y1 + py };
}
