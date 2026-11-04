// A small coordinate plane: points, segments and full lines, scaled to fit. Used by the Coordinate Geometry page.
import { sig } from '@/app/utils/numberFormat';

const SIZE = 320;

/** 1, 2 or 5 × 10ⁿ: a tidy grid spacing for a range. */
function niceStep(range) {
  const raw = range / 8;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) || p * 10;
}

/**
 * fn: optional y = f(x) drawn across the visible range (e.g. a parabola).
 * view: optional { x0, x1, y0, y1 } to fix the window instead of fitting it to the points.
 * shade: optional { a, b } to fill the area between fn and the x-axis from x = a to x = b (a definite integral).
 * fn2: optional second curve (dashed, orange), e.g. a Taylor polynomial or g(x); with shade, the area
 *      between fn and fn2 is filled instead of the area down to the x-axis.
 */
export default function CoordPlot({ points = [], segments = [], lines = [], fn = null, view = null, shade = null, fn2 = null }) {
  const xs = [0, ...points.map((p) => p.x)], ys = [0, ...points.map((p) => p.y)];
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  if (!points.length) [x0, x1, y0, y1] = [-5, 5, -5, 5];
  let spanX, spanY;
  if (view) {
    // A fixed window keeps its own x and y scales (a graph of f(x) needs that), with a 10% margin
    [x0, x1, y0, y1] = [view.x0, view.x1, view.y0, view.y1];
    const padY = (y1 - y0) * 0.1 || 1;
    [y0, y1] = [y0 - padY, y1 + padY];
    spanX = x1 - x0; spanY = y1 - y0;
  } else {
    // Points and lines: equal scales on both axes, so angles and distances look right
    const span = Math.max(x1 - x0, y1 - y0, 2) * 1.3;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    [x0, x1, y0, y1] = [cx - span / 2, cx + span / 2, cy - span / 2, cy + span / 2];
    spanX = span; spanY = span;
  }
  const X = (x) => ((x - x0) / spanX) * SIZE;
  const Y = (y) => SIZE - ((y - y0) / spanY) * SIZE;
  const stepX = niceStep(spanX), stepY = niceStep(spanY);
  const ticks = (lo, hi, step) => { const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(Math.round(v / step) * step); return out; };
  const span = spanY;

  // A full line clipped to the box: ax + by + c = 0
  const clip = ({ a, b, c }) => {
    if (Math.abs(b) > 1e-12) return [[x0, (-c - a * x0) / b], [x1, (-c - a * x1) / b]];
    if (Math.abs(a) > 1e-12) return [[-c / a, y0], [-c / a, y1]];
    return null;
  };
  const colors = ['#2B4570', '#D55E64'];

  // Sample the curve; break it where it leaves the box far above or below, so it doesn't draw across the plot
  const sample = (g) => {
    const out = [];
    if (!g) return out;
    let run = [];
    for (let k = 0; k <= 480; k++) {
      const x = x0 + (spanX * k) / 480;
      const yv = g(x);
      if (Number.isFinite(yv) && yv > y0 - span && yv < y1 + span) run.push(`${X(x).toFixed(1)},${Y(yv).toFixed(1)}`);
      else if (run.length) { out.push(run); run = []; }
    }
    if (run.length) out.push(run);
    return out;
  };
  const curve = sample(fn), curve2 = sample(fn2);

  // The shaded area: f from a to b, closed along the x-axis (pieces where f is undefined are skipped)
  let area = null;
  if (fn && shade && Number.isFinite(shade.a) && Number.isFinite(shade.b) && shade.a !== shade.b) {
    const lo = Math.min(shade.a, shade.b), hi = Math.max(shade.a, shade.b);
    const pts = [], low = [];
    const clampY = (yv) => Y(Math.max(y0 - span, Math.min(y1 + span, yv))).toFixed(1);
    for (let k = 0; k <= 240; k++) {
      const x = lo + ((hi - lo) * k) / 240;
      const yv = fn(x);
      if (!Number.isFinite(yv)) continue;
      pts.push(`${X(x).toFixed(1)},${clampY(yv)}`);
      if (fn2) { const g = fn2(x); if (Number.isFinite(g)) low.unshift(`${X(x).toFixed(1)},${clampY(g)}`); }
    }
    if (pts.length > 1 && fn2) area = `${pts.join(' ')} ${low.join(' ')}`;
    else if (pts.length > 1) area = `${X(lo).toFixed(1)},${Y(0).toFixed(1)} ${pts.join(' ')} ${X(hi).toFixed(1)},${Y(0).toFixed(1)}`;
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Graph of the points and lines" className="w-full max-w-[360px] h-auto text-black dark:text-white rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      {ticks(x0, x1, stepX).map((v) => <line key={`gx${v}`} x1={X(v)} y1="0" x2={X(v)} y2={SIZE} stroke="currentColor" strokeOpacity={v === 0 ? 0.7 : 0.1} strokeWidth={v === 0 ? 1.5 : 1} />)}
      {ticks(y0, y1, stepY).map((v) => <line key={`gy${v}`} x1="0" y1={Y(v)} x2={SIZE} y2={Y(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.7 : 0.1} strokeWidth={v === 0 ? 1.5 : 1} />)}
      {ticks(x0, x1, stepX).filter((v) => v !== 0).map((v) => <text key={`tx${v}`} x={X(v)} y={Math.min(SIZE - 4, Math.max(12, Y(0) + 12))} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.6" fontFamily="ui-monospace, monospace">{sig(v, 3)}</text>)}
      {ticks(y0, y1, stepY).filter((v) => v !== 0).map((v) => <text key={`ty${v}`} x={Math.min(SIZE - 4, Math.max(4, X(0) + 4))} y={Y(v) - 3} fontSize="9" fill="currentColor" opacity="0.6" fontFamily="ui-monospace, monospace">{sig(v, 3)}</text>)}
      {lines.map((l, i) => {
        const seg = clip(l);
        return seg && <line key={`l${i}`} x1={X(seg[0][0])} y1={Y(seg[0][1])} x2={X(seg[1][0])} y2={Y(seg[1][1])} stroke={colors[(i + (fn ? 1 : 0)) % 2]} strokeWidth="2" className={(i + (fn ? 1 : 0)) % 2 ? '' : 'dark:stroke-sky-400'} />;
      })}
      {area && <polygon points={area} fill="#3B6FC2" fillOpacity="0.22" stroke="none" clipPath="url(#coordplot-box)" className="dark:fill-[#4F80D4]" />}
      <defs><clipPath id="coordplot-box"><rect x="0" y="0" width={SIZE} height={SIZE} /></clipPath></defs>
      {curve.map((pts, i) => <polyline key={`c${i}`} points={pts.join(' ')} fill="none" stroke="#2B4570" strokeWidth="2.5" clipPath="url(#coordplot-box)" className="dark:stroke-sky-400" />)}
      {curve2.map((pts, i) => <polyline key={`d${i}`} points={pts.join(' ')} fill="none" stroke="#D9692A" strokeWidth="2.5" strokeDasharray="7 5" clipPath="url(#coordplot-box)" className="dark:stroke-[#DD7135]" />)}
      {segments.map(([p, q], i) => <line key={`s${i}`} x1={X(p.x)} y1={Y(p.y)} x2={X(q.x)} y2={Y(q.y)} stroke="#C2632A" strokeWidth="2.5" />)}
      {points.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="5" fill="#FFE600" stroke="black" strokeWidth="1.5" />
          {/* Labels near the right or top edge flip to the other side, so they are never cut off. label null = no text */}
          {p.label !== null && <text
            x={X(p.x) > SIZE * 0.62 ? X(p.x) - 8 : X(p.x) + 8}
            y={Y(p.y) < 16 ? Y(p.y) + 18 : Y(p.y) - 8}
            textAnchor={X(p.x) > SIZE * 0.62 ? 'end' : 'start'}
            fontSize="11" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, monospace"
          >{p.label}({sig(p.x, 4)}, {sig(p.y, 4)})</text>}
        </g>
      ))}
    </svg>
  );
}
