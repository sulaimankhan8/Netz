// The region of a double integral, shaded, with its boundary curves and one sample strip drawn the way
// textbooks do (a vertical strip for dy dx, a horizontal one for dx dy). Also used for polar regions.
import { sig } from '@/app/utils/numberFormat';

const W = 320, H = 320;

function niceStep(range) {
  const raw = range / 6;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) || p * 10;
}

/**
 * polygon: [[x, y], …] the region's outline (closed automatically).
 * strip: optional { dir: 'vertical' | 'horizontal', at, from, to } (a vertical strip at x = at from y = from to y = to).
 * labels: optional [{ x, y, text }] for boundary curves; points: optional [{ x, y, text }].
 * Equal scales on both axes, so circles look round.
 */
export default function RegionSketch({ polygon, strip = null, labels = [], points = [], title = 'The region of integration' }) {
  const all = [...polygon, ...points.map((p) => [p.x, p.y]), [0, 0]];
  let [x0, x1] = [Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0]))];
  let [y0, y1] = [Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[1]))];
  const span = Math.max(x1 - x0, y1 - y0, 1) * 1.25;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  [x0, x1, y0, y1] = [cx - span / 2, cx + span / 2, cy - span / 2, cy + span / 2];
  const X = (x) => ((x - x0) / span) * W;
  const Y = (y) => H - ((y - y0) / span) * H;
  const step = niceStep(span);
  const ticks = (lo, hi) => { const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v / step) * step); return out; };
  const outline = polygon.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  let stripRect = null;
  if (strip) {
    const w = span / 40;
    stripRect = strip.dir === 'vertical'
      ? { x: X(strip.at - w / 2), y: Y(Math.max(strip.from, strip.to)), width: X(strip.at + w / 2) - X(strip.at - w / 2), height: Math.abs(Y(strip.from) - Y(strip.to)) }
      : { x: X(Math.min(strip.from, strip.to)), y: Y(strip.at + w / 2), width: Math.abs(X(strip.to) - X(strip.from)), height: Y(strip.at - w / 2) - Y(strip.at + w / 2) };
  }
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="w-full max-w-[360px] h-auto rounded-xl border-2 border-black/20 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white">
        {ticks(x0, x1).map((t) => <line key={`gx${t}`} x1={X(t)} x2={X(t)} y1="0" y2={H} stroke="currentColor" strokeOpacity={t === 0 ? 0.5 : 0.08} />)}
        {ticks(y0, y1).map((t) => <line key={`gy${t}`} y1={Y(t)} y2={Y(t)} x1="0" x2={W} stroke="currentColor" strokeOpacity={t === 0 ? 0.5 : 0.08} />)}
        {ticks(x0, x1).filter((t) => t !== 0).map((t) => <text key={`tx${t}`} x={X(t)} y={Math.min(H - 4, Math.max(12, Y(0) + 12))} fontSize="9" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{sig(t, 3)}</text>)}
        {ticks(y0, y1).filter((t) => t !== 0).map((t) => <text key={`ty${t}`} x={Math.min(W - 4, Math.max(4, X(0) + 4))} y={Y(t) + 3} fontSize="9" fill="currentColor" fillOpacity="0.6">{sig(t, 3)}</text>)}
        <polygon points={outline} fill="#3B6FC2" fillOpacity="0.22" stroke="#2B4570" strokeWidth="2.2" strokeLinejoin="round" className="dark:stroke-sky-400" />
        {stripRect && <rect {...stripRect} fill="#D9692A" fillOpacity="0.75" stroke="#D9692A" />}
        {labels.map((l, i) => (
          <text key={`l${i}`} x={Math.min(W - 4, Math.max(4, X(l.x)))} y={Math.min(H - 4, Math.max(12, Y(l.y)))} fontSize="11" fontWeight="700" fill="currentColor" textAnchor={X(l.x) > W * 0.7 ? 'end' : 'start'}>{l.text}</text>
        ))}
        {points.map((p, i) => (
          <g key={`p${i}`}>
            <circle cx={X(p.x)} cy={Y(p.y)} r="3.5" fill="currentColor" />
            {p.text && <text x={Math.min(W - 4, X(p.x) + 6)} y={Math.max(12, Y(p.y) - 6)} fontSize="10" fill="currentColor" textAnchor={X(p.x) > W * 0.75 ? 'end' : 'start'}>{p.text}</text>}
          </g>
        ))}
      </svg>
      <figcaption className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[360px]">
        {title}.{strip ? ` The orange ${strip.dir} strip shows the inner integral: it runs ${strip.dir === 'vertical' ? 'from the lower curve to the upper one (y first)' : 'from the left curve to the right one (x first)'}, then the strips are added ${strip.dir === 'vertical' ? 'from left to right' : 'from bottom to top'}.` : ''}
      </figcaption>
    </figure>
  );
}
