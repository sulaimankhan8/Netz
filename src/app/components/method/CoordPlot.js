// A small coordinate plane: points, segments and full lines, scaled to fit. Used by the Coordinate Geometry page.
import { sig } from '@/app/utils/numberFormat';

const SIZE = 320;

/** 1, 2 or 5 × 10ⁿ: a tidy grid spacing for a range. */
function niceStep(range) {
  const raw = range / 8;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) || p * 10;
}

export default function CoordPlot({ points = [], segments = [], lines = [] }) {
  const xs = [0, ...points.map((p) => p.x)], ys = [0, ...points.map((p) => p.y)];
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  if (!points.length) [x0, x1, y0, y1] = [-5, 5, -5, 5];
  const span = Math.max(x1 - x0, y1 - y0, 2) * 1.3;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  [x0, x1, y0, y1] = [cx - span / 2, cx + span / 2, cy - span / 2, cy + span / 2];
  const X = (x) => ((x - x0) / span) * SIZE;
  const Y = (y) => SIZE - ((y - y0) / span) * SIZE;
  const step = niceStep(span);
  const ticks = (lo, hi) => { const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(Math.round(v / step) * step); return out; };

  // A full line clipped to the box: ax + by + c = 0
  const clip = ({ a, b, c }) => {
    if (Math.abs(b) > 1e-12) return [[x0, (-c - a * x0) / b], [x1, (-c - a * x1) / b]];
    if (Math.abs(a) > 1e-12) return [[-c / a, y0], [-c / a, y1]];
    return null;
  };
  const colors = ['#2B4570', '#D55E64'];

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Graph of the points and lines" className="w-full max-w-[360px] h-auto text-black dark:text-white rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900">
      {ticks(x0, x1).map((v) => <line key={`gx${v}`} x1={X(v)} y1="0" x2={X(v)} y2={SIZE} stroke="currentColor" strokeOpacity={v === 0 ? 0.7 : 0.1} strokeWidth={v === 0 ? 1.5 : 1} />)}
      {ticks(y0, y1).map((v) => <line key={`gy${v}`} x1="0" y1={Y(v)} x2={SIZE} y2={Y(v)} stroke="currentColor" strokeOpacity={v === 0 ? 0.7 : 0.1} strokeWidth={v === 0 ? 1.5 : 1} />)}
      {ticks(x0, x1).filter((v) => v !== 0).map((v) => <text key={`tx${v}`} x={X(v)} y={Math.min(SIZE - 4, Math.max(12, Y(0) + 12))} fontSize="9" textAnchor="middle" fill="currentColor" opacity="0.6" fontFamily="ui-monospace, monospace">{sig(v, 3)}</text>)}
      {ticks(y0, y1).filter((v) => v !== 0).map((v) => <text key={`ty${v}`} x={Math.min(SIZE - 4, Math.max(4, X(0) + 4))} y={Y(v) - 3} fontSize="9" fill="currentColor" opacity="0.6" fontFamily="ui-monospace, monospace">{sig(v, 3)}</text>)}
      {lines.map((l, i) => {
        const seg = clip(l);
        return seg && <line key={`l${i}`} x1={X(seg[0][0])} y1={Y(seg[0][1])} x2={X(seg[1][0])} y2={Y(seg[1][1])} stroke={colors[i % 2]} strokeWidth="2" className={i % 2 ? '' : 'dark:stroke-sky-400'} />;
      })}
      {segments.map(([p, q], i) => <line key={`s${i}`} x1={X(p.x)} y1={Y(p.y)} x2={X(q.x)} y2={Y(q.y)} stroke="#C2632A" strokeWidth="2.5" />)}
      {points.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={X(p.x)} cy={Y(p.y)} r="5" fill="#FFE600" stroke="black" strokeWidth="1.5" />
          <text x={X(p.x) + 8} y={Y(p.y) - 8} fontSize="11" fontWeight="700" fill="currentColor" fontFamily="ui-monospace, monospace">{p.label}({sig(p.x, 4)}, {sig(p.y, 4)})</text>
        </g>
      ))}
    </svg>
  );
}
