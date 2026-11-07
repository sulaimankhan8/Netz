// Level curves of z = f(x, y) (marching squares), with critical points marked. Used instead of a 3D surface:
// light, readable on phones, and what textbooks draw (plan decision D6). Blue curves are below the middle
// value, orange above; the darker the curve, the further from the middle.
import { sig } from '@/app/utils/numberFormat';

const W = 320, H = 320;

/** 1, 2 or 5 × 10ⁿ: a tidy grid spacing for a range. */
function niceStep(range) {
  const raw = range / 6;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) || p * 10;
}

/** Contour segments for one level on a grid of values. */
function segmentsFor(grid, xs, ys, level) {
  const out = [];
  const lerp = (a, b, va, vb) => a + ((level - va) / (vb - va)) * (b - a);
  for (let j = 0; j < ys.length - 1; j++) {
    for (let i = 0; i < xs.length - 1; i++) {
      const v = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
      if (v.some((t) => !Number.isFinite(t))) continue;
      const [x0, x1, y0, y1] = [xs[i], xs[i + 1], ys[j], ys[j + 1]];
      // Edge crossings: bottom, right, top, left
      const pts = [];
      if ((v[0] < level) !== (v[1] < level)) pts.push([lerp(x0, x1, v[0], v[1]), y0]);
      if ((v[1] < level) !== (v[2] < level)) pts.push([x1, lerp(y0, y1, v[1], v[2])]);
      if ((v[2] < level) !== (v[3] < level)) pts.push([lerp(x1, x0, v[2], v[3]), y1]);
      if ((v[3] < level) !== (v[0] < level)) pts.push([x0, lerp(y1, y0, v[3], v[0])]);
      if (pts.length === 2) out.push(pts);
      else if (pts.length === 4) { out.push([pts[0], pts[1]]); out.push([pts[2], pts[3]]); }
    }
  }
  return out;
}

const KIND = {
  min: { label: 'minimum', shape: 'circle', color: '#2B8A3E' },
  max: { label: 'maximum', shape: 'triangle', color: '#C2410C' },
  saddle: { label: 'saddle point', shape: 'cross', color: '#7C3AED' },
  point: { label: 'point', shape: 'circle', color: '#2B4570' },
  unknown: { label: 'test fails', shape: 'square', color: '#6B7280' },
};

/**
 * f(x, y) → number; view { x0, x1, y0, y1 }; points [{ x, y, kind: 'min' | 'max' | 'saddle' | 'point' | 'unknown', label }].
 * curve: optional constraint g(x, y) = 0 drawn as a thick dashed line (for Lagrange multipliers).
 */
export default function ContourPlot({ f, view, points = [], levels = 10, curve = null, title = 'Level curves' }) {
  const { x0, x1, y0, y1 } = view;
  const N = 64;
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + ((x1 - x0) * i) / N);
  const ys = Array.from({ length: N + 1 }, (_, j) => y0 + ((y1 - y0) * j) / N);
  const grid = ys.map((y) => xs.map((x) => { try { const z = f(x, y); return Number.isFinite(z) ? z : NaN; } catch { return NaN; } }));
  const vals = grid.flat().filter(Number.isFinite).sort((a, b) => a - b);
  const X = (x) => ((x - x0) / (x1 - x0)) * W;
  const Y = (y) => H - ((y - y0) / (y1 - y0)) * H;
  let lines = [];
  if (vals.length > 10) {
    // Levels at quantiles, so the curves spread evenly even when f grows fast
    const q = (p) => vals[Math.min(vals.length - 1, Math.floor(p * (vals.length - 1)))];
    const lv = Array.from({ length: levels }, (_, k) => q((k + 0.5) / levels)).filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > 1e-9);
    const mid = q(0.5);
    lines = lv.map((level, k) => {
      const segs = segmentsFor(grid, xs, ys, level);
      const d = segs.map(([[ax, ay], [bx, by]]) => `M${X(ax).toFixed(1)} ${Y(ay).toFixed(1)}L${X(bx).toFixed(1)} ${Y(by).toFixed(1)}`).join('');
      const far = Math.abs(k - (lv.length - 1) / 2) / Math.max(1, (lv.length - 1) / 2);
      return { d, level, high: level > mid, opacity: 0.35 + 0.65 * far };
    });
  }
  let curvePath = '';
  if (curve) {
    const cg = ys.map((y) => xs.map((x) => { try { const z = curve(x, y); return Number.isFinite(z) ? z : NaN; } catch { return NaN; } }));
    curvePath = segmentsFor(cg, xs, ys, 0).map(([[ax, ay], [bx, by]]) => `M${X(ax).toFixed(1)} ${Y(ay).toFixed(1)}L${X(bx).toFixed(1)} ${Y(by).toFixed(1)}`).join('');
  }
  const stepX = niceStep(x1 - x0), stepY = niceStep(y1 - y0);
  const ticks = (lo, hi, step) => { const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v / step) * step); return out; };
  const kinds = [...new Set(points.map((p) => p.kind || 'point'))];

  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}${points.length ? `, with ${points.length} marked point${points.length > 1 ? 's' : ''}` : ''}`} className="w-full max-w-[360px] h-auto rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white">
        <defs><clipPath id="contour-box"><rect x="0" y="0" width={W} height={H} /></clipPath></defs>
        {ticks(x0, x1, stepX).map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1="0" y2={H} stroke="currentColor" strokeOpacity={t === 0 ? 0.45 : 0.08} />)}
        {ticks(y0, y1, stepY).map((t) => <line key={`gy${t}`} y1={Y(t)} y2={Y(t)} x1="0" x2={W} stroke="currentColor" strokeOpacity={t === 0 ? 0.45 : 0.08} />)}
        {ticks(x0, x1, stepX).filter((t) => t !== 0).map((t) => <text key={`tx${t}`} x={X(t)} y={Math.min(H - 4, Math.max(12, Y(0) + 12))} fontSize="9" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{sig(t, 3)}</text>)}
        {ticks(y0, y1, stepY).filter((t) => t !== 0).map((t) => <text key={`ty${t}`} x={Math.min(W - 4, Math.max(4, X(0) + 4))} y={Y(t) + 3} fontSize="9" fill="currentColor" fillOpacity="0.6">{sig(t, 3)}</text>)}
        <g clipPath="url(#contour-box)">
          {lines.map((l) => <path key={l.level} d={l.d} fill="none" stroke={l.high ? '#D9692A' : '#3B6FC2'} strokeOpacity={l.opacity} strokeWidth="1.6" />)}
          {curvePath && <path d={curvePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 4" />}
          {points.map((p, i) => {
            const k = KIND[p.kind || 'point'];
            const cx = X(p.x), cy = Y(p.y);
            return (
              <g key={i}>
                {k.shape === 'circle' && <circle cx={cx} cy={cy} r="5.5" fill={k.color} stroke="white" strokeWidth="1.5" />}
                {k.shape === 'square' && <rect x={cx - 5} y={cy - 5} width="10" height="10" fill={k.color} stroke="white" strokeWidth="1.5" />}
                {k.shape === 'triangle' && <polygon points={`${cx},${cy - 7} ${cx - 6.5},${cy + 5} ${cx + 6.5},${cy + 5}`} fill={k.color} stroke="white" strokeWidth="1.5" />}
                {k.shape === 'cross' && <path d={`M${cx - 6} ${cy - 6}L${cx + 6} ${cy + 6}M${cx + 6} ${cy - 6}L${cx - 6} ${cy + 6}`} stroke={k.color} strokeWidth="3.5" strokeLinecap="round" />}
                {p.label && <text x={Math.min(W - 4, cx + 8)} y={Math.max(12, cy - 8)} fontSize="10" fontWeight="700" fill="currentColor" textAnchor={cx > W - 70 ? 'end' : 'start'}>{p.label}</text>}
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[360px] space-y-1">
        <p>{title}: <span className="text-[#3B6FC2] font-bold">blue</span> curves are lower values, <span className="text-[#D9692A] font-bold">orange</span> higher; darker means further from the middle.{curve ? ' The dashed curve is the constraint.' : ''}</p>
        {kinds.length > 0 && <p>{kinds.map((k) => `${{ circle: '●', triangle: '▲', cross: '✕', square: '■' }[KIND[k].shape]} ${KIND[k].label}`).join(' · ')}</p>}
      </figcaption>
    </figure>
  );
}
